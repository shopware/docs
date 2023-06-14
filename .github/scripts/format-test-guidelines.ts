import { readLines } from "https://deno.land/std@0.145.0/io/mod.ts";
import { walk } from "https://deno.land/std@0.145.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";

const formattingPromises = [];
for await (const entry of walk("./resources/guidelines/testing")) {
	if (entry.isDirectory) continue;
	if (entry.path.startsWith('resources/guidelines/testing')) continue;
	if (path.basename(entry.path).startsWith('_')) continue;
	if (path.basename(entry.path) === 'README.md') continue;
	formattingPromises.push(formatADR(entry.path));
}

await Promise.allSettled(formattingPromises);

function addHint(buffer, filePath) {
	buffer += '\n';
	buffer += '{% hint style="info" %}\n';
	buffer += 'This document represents testing guidelines and has been mirrored from the core in our Shopware 6 repository.\n';
	buffer += `You can find the original version [here](${adrPathToGithubLink(filePath)})\n`;
	buffer += '{% endhint %}\n';

	return buffer;
}

async function formatADR(filePath: string): Promise<void> {
	const adrFile = await Deno.open(filePath, {write: true, read: true});

	let buffer = '';
	const encoder = new TextEncoder();

	let lineNumber = 0;
	let frontmatter = 0;
	let title;
	for await (const line of readLines(adrFile)) {
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

	await adrFile.truncate();
	await adrFile.seek(0, Deno.SeekMode.Start);
	await adrFile.write(encoder.encode(buffer));
	adrFile.close();
	console.log('[✔] ', filePath);
}

function testPathToGithubLink(testPath: string): string {
	const urlPath = testPath.replace('resources/references/', '');
	return `https://github.com/shopware/platform/blob/trunk/coding-guidelines/core/${urlPath}`
}
