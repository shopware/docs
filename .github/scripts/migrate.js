// use this script as ~/.deno/bin/deno run --allow-read --allow-write .github/scripts/migrate.js

import * as fs from "node:fs";
import MarkdownIt from "npm:markdown-it";
import yaml from "npm:yaml";

const markdown = fs.readFileSync('./SUMMARY.md', 'utf-8');
const md = new MarkdownIt();
const ast = md.parse(markdown);

let leveled = {};
let lastLevel = 0;
let indexes = [0];
let singleLevel = [];
let isHeading = false;

const flush = (singleLevel, leveled, indexes) => {
    if (singleLevel.length) {
        if (!leveled[indexes.join('-')]) {
            leveled[indexes.join('-')] = [];
        }
        leveled[indexes.join('-')] = [
            ...leveled[indexes.join('-')],
            ...singleLevel
        ];
        singleLevel = [];
    }

    return [leveled, singleLevel]
}

for (let i = 0; i < ast.length; i++) {
    const node = ast[i];

    // skip heading
    if (node.type === 'heading_open') {
        isHeading = true;
        continue;
    } else if (node.type === 'heading_close') {
        isHeading = false;
        continue;
    } else if (isHeading) {
        continue;
    }

    // skip irelevant nodes
    if (['paragraph_close', 'paragraph_open', 'list_item_open', 'list_item_close'].includes(node.type)) {
        continue;
    }

    if (node.type === 'bullet_list_open') {
        // save items
        [leveled, singleLevel] = flush(singleLevel, leveled, indexes)
        // reset level
        lastLevel = 0;
        // update indexes
        indexes.push(lastLevel);
    }

    if (node.content?.startsWith('[') && node.content?.endsWith(')')) {
        singleLevel.push(node.content);
    }

    if (node.type === 'bullet_list_close') {
        lastLevel--;
        // save items
        [leveled, singleLevel] = flush(singleLevel, leveled, indexes)
        // remove last index
        indexes = indexes.slice(0, indexes.length - 1);
        // increase new last index
        indexes[indexes.length - 1]++;
    }
}

// update frontmatter
const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
Object.keys(leveled)
    .forEach(key => {
//        let split = key.split('-');
        leveled[key].forEach((mdLink, i) => {
//            console.log(`${' '.repeat((split.length - 2) * 2)} ${value}`)
            const match = markdownLinkRegex.exec(mdLink);
            const title = match[1];
            const link = match[2];

            if (link.startsWith('http://') || link.startsWith('https://')) {
                console.log(`External: ${link}`);
                return;
            }
            const file = `./${link}${link.endsWith('/') ? 'index' : ''}.md`;

            if (['./README.md', './SUMMARY.md'].includes(file)) {
                console.log(`Skip: ${file}`);
                return;
            }

            let fullContent;
            try {
                fullContent = `${fs.readFileSync(file)}`;
            } catch (e) {
                console.error(e);
                return;
            }

            let frontmatter, content;
            if (fullContent.startsWith('---')) {
                const split = fullContent.split('---');
                frontmatter = yaml.parse(split[1]);
                content = split.slice(2).join('---');
            } else {
                frontmatter = {};
                content = fullContent;
            }

            if (!frontmatter.nav) {
                frontmatter.nav = {};
            }

            frontmatter.nav.title = title
                .replace('\\(', '(')
                .replace('\\)', ')');
            frontmatter.nav.position = (i + 1) * 10;

            fs.writeFileSync(file, `---\n${yaml.stringify(frontmatter)}\n---\n\n${content.trimStart()}`);
        })
    });
