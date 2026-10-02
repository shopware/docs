// deno run --allow-read .github/scripts/broken-pageref.js

import { resolve, dirname } from "https://deno.land/std/path/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const rootDir = resolve(Deno.cwd());

function indexFormSuggestion(relativePath) {
  const segments = relativePath.split('/');
  const lastSegment = segments.pop();

  if (!['index', 'index.md', 'index.html'].includes(lastSegment)) {
    return null;
  }

  return segments.length ? `${segments.join('/')}/` : './';
}

async function findPageRefIssues() {
  const brokenLinks = [];
  const indexLinks = [];

  for await (const entry of walk(rootDir, { exts: ['.md'], followSymlinks: true })) {
    if (entry.isFile) {
      const content = await Deno.readTextFile(entry.path);
      const matches = [...content.matchAll(/<PageRef page="([^"]+)"/g)];

      for (const match of matches) {
        const page = match[1];

        if (page.startsWith('http')) {
          continue
        }

        const hashIndex = page.indexOf('#');
        const fragment = hashIndex === -1 ? '' : page.slice(hashIndex);
        let relativePath = hashIndex === -1 ? page : page.slice(0, hashIndex);

        const suggestion = indexFormSuggestion(relativePath);
        if (suggestion) {
          indexLinks.push({ file: entry.path, page, suggestion: `${suggestion}${fragment}` });
        }

        if (relativePath.endsWith('/')) {
          relativePath = `${relativePath}index.md`
        } else if (relativePath.endsWith('.html')) {
          relativePath = `${relativePath.substring(0, relativePath.length - '.html'.length)}.md`
        } else if (!relativePath.endsWith('.md')) {
          relativePath = `${relativePath}.md`
        }

        const resolvedPath = resolve(dirname(entry.path), relativePath);

        try {
          await Deno.stat(resolvedPath);
        } catch {
          brokenLinks.push({ file: entry.path, relativePath, resolvedPath });
        }
      }
    }
  }

  return { brokenLinks, indexLinks };
}

const { brokenLinks, indexLinks } = await findPageRefIssues();

if (brokenLinks.length) {
  console.log('Broken links found:');
  brokenLinks.forEach(link => {
    console.log(`File: ${link.file}`);
    console.log(`Relative Path: ${link.relativePath}`);
    console.log(`Resolved Path: ${link.resolvedPath}`);
    console.log('---');
  });
}

if (indexLinks.length) {
  console.log('PageRef links naming an index file found (use the directory form so the card resolves the target title):');
  indexLinks.forEach(link => {
    console.log(`File: ${link.file}`);
    console.log(`Found: <PageRef page="${link.page}" />`);
    console.log(`Use: <PageRef page="${link.suggestion}" />`);
    console.log('---');
  });
}

if (brokenLinks.length || indexLinks.length) {
  Deno.exit(1)
}

console.log('No broken links found.');
Deno.exit(0)
