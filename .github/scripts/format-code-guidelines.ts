import { readLines } from "https://deno.land/std@0.145.0/io/mod.ts";
import { walk } from "https://deno.land/std@0.145.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";

const formattingPromises = [];
for await (const entry of walk("./resources/guidelines/code/core")) {
	if (entry.isDirectory) continue;
	if (path.basename(entry.path).startsWith('_')) continue;
	if (path.basename(entry.path) === 'README.md') continue;
	formattingPromises.push(formatCode(entry.path));
}

await Promise.allSettled(formattingPromises);

function addHint(buffer, filePath) {
	buffer += '\n';
	buffer += '{% hint style="info" %}\n';
	buffer += 'This document represents core guidelines and has been mirrored from the core in our Shopware 6 repository.\n';
	buffer += `You can find the original version [here](${codePathToGithubLink(filePath)})\n`;
	buffer += '{% endhint %}\n';

	return buffer;
}

async function formatCode(filePath: string): Promise<void> {
	const codeFile = await Deno.open(filePath, {write: true, read: true});

	let buffer = '';
	const encoder = new TextEncoder();

	let lineNumber = 0;
	let frontmatter = 0;
	let title;
	for await (const line of readLines(codeFile)) {
		lineNumber++;
		buffer += line + '\n';

		if (!title && frontmatter === 1 && line.startsWith('title:')) {
			title = line.substring('title: '.length);
		}

		// note: some --- ends with additional space
		if (!line.startsWith('---')) {
			continue;
		}

		frontmatter++;
		if (frontmatter !== 2) {
			continue;
		}

		if (title) {
			buffer += `\n# ${title}\n`;
		}

		buffer = addHint(buffer, filePath);
	}

	if (frontmatter < 2) {
		const prevBuffer = buffer;
		buffer = addHint("\n", filePath);
		buffer += "\n";
		buffer += prevBuffer;
	}

	await codeFile.truncate();
	await codeFile.seek(0, Deno.SeekMode.Start);
	await codeFile.write(encoder.encode(buffer));
	codeFile.close();
	console.log('[✔] ', filePath);
}

function codePathToGithubLink(codePath: string): string {
	const urlPath = codePath.replace('resources/guidelines/', '');
	return `https://github.com/shopware/platform/blob/trunk/${urlPath}`
}
