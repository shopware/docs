// deno run --allow-read .github/scripts/broken-pageref.js

import { resolve, dirname, fromFileUrl } from "https://deno.land/std/path/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const rootDir = resolve(Deno.cwd());

async function findBrokenLinks() {
  const brokenLinks = [];

  for await (const entry of walk(rootDir, { exts: ['.md'], followSymlinks: true })) {
    if (entry.isFile) {
      const content = await Deno.readTextFile(entry.path);
      const matches = [...content.matchAll(/<PageRef page="([^"]+)"/g)];

      for (const match of matches) {
        let relativePath = match[1];

        if (relativePath.startsWith('http')) {
          continue
        }

        if (relativePath.includes('#')) {
          relativePath = relativePath.split('#')[0]
        }

        if (relativePath.endsWith('/')) {
          relativePath = `${relativePath}/index.md`
        }

        if (relativePath.endsWith('.html')) {
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

  return brokenLinks;
}

const brokenLinks = await findBrokenLinks();
if (brokenLinks.length) {
  console.log('Broken links found:');
  brokenLinks.forEach(link => {
    console.log(`File: ${link.file}`);
    console.log(`Relative Path: ${link.relativePath}`);
    console.log(`Resolved Path: ${link.resolvedPath}`);
    console.log('---');
  });
  Deno.exit(1)
}

console.log('No broken links found.');
Deno.exit(0)
