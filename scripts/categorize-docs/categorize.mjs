#!/usr/bin/env node
// Infers `product` and `lifecycle` frontmatter metadata for every doc page from its path AND content
// (title + headings), not just its directory. Path rules only decide the structural cases where the
// repo's own information architecture already encodes intent (e.g. concepts/, guides/hosting/);
// everything else is classified from the page's title/headings via keyword scoring.
// Usage:
//   node scripts/categorize-docs/categorize.mjs            # dry run, prints summary only
//   node scripts/categorize-docs/categorize.mjs --write    # writes metadata into frontmatter
//   node scripts/categorize-docs/categorize.mjs --list     # dry run, prints every file + assigned values + source

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const EXCLUDE_DIRS = new Set(['.git', 'node_modules', 'assets', 'snippets', '.venv-spellcheck', 'scripts']);

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const LIST = args.includes('--list');

// Auto-synced from shopware/shopware every 3h (see AGENTS.md) - any frontmatter written here would be
// silently overwritten by the next sync, so these are classified/reported but never written to.
const SYNCED_DIRS = [/^resources\/references\/adr\//, /^resources\/guidelines\/code\/core\//];

// Ordered rules, first match wins. Paths are POSIX-style, relative to repo root.
const PRODUCT_RULES = [
  [/composable-frontends\//, 'composable-frontends'],
  [/^products\/nexus\//, 'nexus'],
  [/^products\/(PaaS\/|saas\.md)/, 'hosting'],
  [/^products\/sales-agent\//, 'sales-agent'],
  [/^products\/digital-sales-rooms\//, 'digital-sales-rooms'],
  [/^products\/extensions\//, 'extensions'],
  [/^products\/tools\//, 'tools'],
  [/meteor-admin-sdk\.md$|meteor-components\.md$/, 'meteor'],
];
const DEFAULT_PRODUCT = 'shopware';

// Product names to look for in title/headings, used only to flag possible mismatches against the
// path-based product (advisory - never silently overrides the path result).
const PRODUCT_CONTENT_HINTS = [
  [/\bnexus\b/, 'nexus'],
  [/\bsales agent\b/, 'sales-agent'],
  [/\bdigital sales rooms?\b/, 'digital-sales-rooms'],
  [/\bmeteor\b/, 'meteor'],
  [/\bcomposable frontends?\b/, 'composable-frontends'],
  [/\b(paas|saas)\b/, 'hosting'],
];

// Structural rules: the repo's top-level IA already encodes lifecycle intent here, so content never
// overrides these.
const STRUCTURAL_LIFECYCLE_RULES = [
  [/^concepts\//, 'reference'],
  [/^resources\//, 'reference'],
  [/^guides\/installation\//, 'onboarding'],
  [/^guides\/hosting\//, 'deployment'],
  [/^guides\/upgrades-migrations\//, 'maintenance'],
];

// Content keyword rules, checked in priority order against title + headings text.
const LIFECYCLE_CONTENT_RULES = [
  [/upgrad|migrat|troubleshoot|deprecat|breaking change|debug|known issue/, 'maintenance'],
  [/deploy|production|release|go[- ]live/, 'deployment'],
  [/install|getting started|quick start|prerequisite|requirement|setup/, 'onboarding'],
  [/develop|build|creat|customi[sz]|test|design|implement|extend|integrat|configur/, 'implementation'],
];

// Fallback path-keyword rules, used only if content yielded nothing (e.g. thin/empty pages).
const LIFECYCLE_PATH_FALLBACK_RULES = [
  [/\/(installation|getting-started)(\/|\.md$)/, 'onboarding'],
  [/\/(best-practices|troubleshooting)(\/|\.md$)/, 'maintenance'],
  [/\/(customization|testing|configuration|integration)(\/|\.md$)/, 'implementation'],
  [/^guides\/development\//, 'implementation'],
  [/^guides\/plugins\//, 'implementation'],
  [/\/(concept|concepts|references)\//, 'reference'],
  [/\/guides\//, 'implementation'],
];
const DEFAULT_LIFECYCLE = 'reference';

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

// Pulls the frontmatter nav.title plus every markdown heading into one lowercase string used for
// keyword scoring - deliberately excludes body prose to avoid false positives from incidental links.
function extractSignalText(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const navTitle = fmMatch?.[1].match(/^\s*title:\s*(.+)$/m)?.[1] ?? '';
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;
  const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1]);
  return [navTitle, ...headings].join(' \n ').toLowerCase();
}

function classify(relPath, content) {
  const posixPath = relPath.split(sep).join('/');
  const product = PRODUCT_RULES.find(([re]) => re.test(posixPath))?.[1] ?? DEFAULT_PRODUCT;

  const signalText = extractSignalText(content);
  const productHint = PRODUCT_CONTENT_HINTS.find(([re]) => re.test(signalText))?.[1];
  const productMismatch = productHint && productHint !== product ? productHint : null;

  let lifecycle = STRUCTURAL_LIFECYCLE_RULES.find(([re]) => re.test(posixPath))?.[1];
  let source = lifecycle ? 'structural-path' : null;

  if (!lifecycle) {
    lifecycle = LIFECYCLE_CONTENT_RULES.find(([re]) => re.test(signalText))?.[1];
    source = lifecycle ? 'content' : null;
  }
  if (!lifecycle) {
    lifecycle = LIFECYCLE_PATH_FALLBACK_RULES.find(([re]) => re.test(posixPath))?.[1];
    source = lifecycle ? 'path-fallback' : null;
  }
  if (!lifecycle) {
    lifecycle = DEFAULT_LIFECYCLE;
    source = 'default';
  }

  return { product, lifecycle, source, productMismatch };
}

function upsertFrontmatter(content, product, lifecycle) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    // No frontmatter block: create a minimal one.
    return `---\nproduct: ${product}\nlifecycle: ${lifecycle}\n---\n\n${content}`;
  }
  let body = match[1];
  if (/^product:/m.test(body)) {
    body = body.replace(/^product:.*$/m, `product: ${product}`);
  } else {
    body += `\nproduct: ${product}`;
  }
  if (/^lifecycle:/m.test(body)) {
    body = body.replace(/^lifecycle:.*$/m, `lifecycle: ${lifecycle}`);
  } else {
    body += `\nlifecycle: ${lifecycle}`;
  }
  return content.slice(0, match.index) + `---\n${body}\n---\n` + content.slice(match[0].length);
}

const files = walk(ROOT.replace(/\/$/, ''));
const summary = {};
const results = [];

let skippedSynced = 0;
for (const file of files) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf8');
  const { product, lifecycle, source, productMismatch } = classify(rel, content);
  const synced = SYNCED_DIRS.some((re) => re.test(rel.split(sep).join('/')));
  results.push({ rel, product, lifecycle, source, productMismatch, synced });

  const key = `${product} / ${lifecycle}`;
  summary[key] = (summary[key] ?? 0) + 1;

  if (WRITE) {
    if (synced) {
      skippedSynced++;
      continue;
    }
    const updated = upsertFrontmatter(content, product, lifecycle);
    if (updated !== content) writeFileSync(file, updated, 'utf8');
  }
}

if (LIST) {
  for (const r of results.sort((a, b) => a.rel.localeCompare(b.rel))) {
    const mismatch = r.productMismatch ? ` [possible product: ${r.productMismatch}]` : '';
    const syncedTag = r.synced ? ' [synced - not written]' : '';
    console.log(`${r.product.padEnd(20)} ${r.lifecycle.padEnd(14)} ${r.source.padEnd(16)} ${r.rel}${mismatch}${syncedTag}`);
  }
}

const sourceCounts = results.reduce((acc, r) => ((acc[r.source] = (acc[r.source] ?? 0) + 1), acc), {});
console.log('\n--- Lifecycle classification source ---');
for (const [src, count] of Object.entries(sourceCounts).sort()) console.log(`${src.padEnd(18)} ${count}`);

const mismatches = results.filter((r) => r.productMismatch);
if (mismatches.length) {
  console.log(`\n--- Possible product mismatches (${mismatches.length}), review manually ---`);
  for (const r of mismatches) console.log(`${r.rel}  (path=${r.product}, content hints=${r.productMismatch})`);
}

console.log('\n--- Summary (product / lifecycle -> file count) ---');
for (const [key, count] of Object.entries(summary).sort()) {
  console.log(`${key.padEnd(40)} ${count}`);
}
console.log(`\nTotal files: ${files.length}`);
const syncedCount = results.filter((r) => r.synced).length;
console.log(`Synced files (excluded from --write, see AGENTS.md): ${syncedCount}`);
if (!WRITE) {
  console.log('Dry run only. Re-run with --write to persist frontmatter changes.');
} else {
  console.log(`Skipped writing ${skippedSynced} synced files.`);
}
