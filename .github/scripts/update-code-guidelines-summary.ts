import { walkSync } from "https://deno.land/std@0.145.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";


interface CodeEntry { path: string }
interface CodeTopic extends CodeEntry { entries: CodeEntry[] }

const dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const codeHeading = /\[Core guidelines\]/;
const testHeading = /\[Test\]/;
const generalTopic = 'general';


const firstToUpper = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
const fixName = (s: string) => firstToUpper(s).replaceAll(/api/gi, 'API').replaceAll(/dal/gi, 'DAL');

const topicName = (entry: CodeEntry) => {
	const name = entry.path.split('/')[3] ?? generalTopic;
	return name.endsWith('.md') ? generalTopic : name;
}
const summaryItem = (depth: number, name: string, path: string) => `${' '.repeat(depth * 2)}* [${fixName(name)}](${path})\n`;

const codeTitle = (code: CodeEntry) => {
	return path.basename(code.path)
		.replace(dateRegex, '')
		.replace('.md', '')
		.replaceAll('-', ' ')
		.trim();
};

let Guidelines = new Map<string,CodeTopic>();
for (const entry of walkSync("./resources/guidelines/code/core", { includeDirs: false, includeFiles: true })) {
	if (path.basename(entry.path).startsWith('_')) continue;
	if (path.basename(entry.path) === 'README.md') continue;

	const code: CodeEntry = { path: entry.path };
	let topic = Guidelines.get(topicName(code));
	if (!!topic) {
		topic.entries.push(code);
		topic.entries.sort((a, b) =>  a.path.localeCompare(b.path));
		continue
	}
	const topicDir = topicName(entry) === generalTopic ? '' : '/' + topicName(entry);
	topic = {
		path: `resources/guidelines/code/core${topicDir}`,
		entries: [code]
	}
	Guidelines.set(topicName(code), topic);
}

let codeSummary = summaryItem(1, 'Core guidelines', 'resources/guidelines/code/core/README.md');

const names = Array.from(Guidelines.keys());
names.sort();

names.forEach((name) => {
	const topic = Guidelines.get(name);
	const depthDiff = names.length > 1 ? 1 : 0;
	if (depthDiff > 0) {
		codeSummary += summaryItem(2, topicName(topic), path.join(topic.path, 'README.md'));
	}
	for (const code of topic.entries) {
		codeSummary += summaryItem(2 + depthDiff, codeTitle(code), code.path);
	}
});

const filename = path.join(Deno.cwd(), "./SUMMARY.md");

const summary = {
	lines: <string[]> [],
	encoder: new TextEncoder(),
	addLine(line: string) { this.lines.push(line) },
	writeTo(writer: Deno.WriterSync) {
		for (let i = this.lines.length - 1; i > 0; i--) {
			const line = <string> this.lines.pop();
			if (line !== '') {
				this.lines.push(line);
				break;
			}
		}
		writer.writeSync(this.encoder.encode(this.lines.join('\n')));
		writer.writeSync(this.encoder.encode('\n'));
	}
};

const lines = Deno.readTextFileSync(filename).split('\n').values();

for (const line of lines) {
	if (codeHeading.test(line)) break;
	summary.addLine(line)
}

summary.addLine(codeSummary);

for (const line of lines) {
	if (testHeading.test(line)) {
		summary.addLine(line);
		break;
	}
}

for (const line of lines) summary.addLine(line);

const fileWriter = await Deno.open(filename, {truncate: true, write: true});
summary.writeTo(fileWriter);
