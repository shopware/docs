import { readLines } from "https://deno.land/std@0.145.0/io/mod.ts";
import { walk } from "https://deno.land/std@0.145.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";

const formattingPromises = [];
for await (const entry of walk("./adr")) {
	if (entry.isDirectory) continue;
	if (entry.path.startsWith('adr/assets')) continue;
	if (path.basename(entry.path).startsWith('_')) continue;
	if (path.basename(entry.path) === 'README.md') continue;
	formattingPromises.push(formatADR(entry.path));
}

await Promise.allSettled(formattingPromises);

async function formatADR(filePath: string): Promise<void> {
	console.log('open:', filePath);
	const adrFile = await Deno.open(filePath, {write: true, read: true});

	let buffer = '';
	const encoder = new TextEncoder();

	let lineNumber = 0;
	for await (const line of readLines(adrFile)) {
		lineNumber++;
		buffer += line + '\n';
		if (lineNumber === 2) {
			buffer += '{% hint style="info" %}\n';
			buffer += 'This document represents an architecture decision record (ADR) and has been mirrored from the ADR section in our Shopware 6 repository.\n';
			buffer += `You can find the original version [here](${adrPathToGithubLink(filePath)})\n`;
			buffer += '{% endhint %}\n';
			buffer += '\n';
		}
	}
	await adrFile.truncate();
	await adrFile.seek(0, Deno.SeekMode.Start);
	await adrFile.write(encoder.encode(buffer));
	adrFile.close();
	console.log('close:', filePath);
}

function adrPathToGithubLink(adrPath: string): string {
	return `https://github.com/shopware/platform/blob/trunk/${adrPath}`
}
