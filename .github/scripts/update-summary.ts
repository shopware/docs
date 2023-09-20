import { walkSync } from "https://deno.land/std@0.145.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";


interface ADREntry { path: string }
interface ADRTopic extends ADREntry { entries: ADREntry[] }

const dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const adrHeading = /\[Architecture Reference\]/;
const appRefHeading = /\[App Reference\]/;
const generalTopic = 'general';


const firstToUpper = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
const fixName = (s: string) => firstToUpper(s).replaceAll(/api/gi, 'API').replaceAll(/dal/gi, 'DAL');

const topicName = (entry: ADREntry) => {
	const name = entry.path.split('/')[3] ?? generalTopic;
	return name.endsWith('.md') ? generalTopic : name;
}
const summaryItem = (depth: number, name: string, path: string) => `${' '.repeat(depth * 2)}* [${fixName(name)}](${path})\n`;

const adrTitle = (adr: ADREntry) => {
	return path.basename(adr.path)
	.replace(dateRegex, '')
	.replace('.md', '')
	.replaceAll('-', ' ')
	.trim();
};

let ADRs = new Map<string,ADRTopic>();
for (const entry of walkSync("./resources/references/adr", { includeDirs: false, includeFiles: true })) {
	if (entry.path.startsWith('resources/references/adr/assets')) continue;
	if (path.basename(entry.path).startsWith('_')) continue;
	if (path.basename(entry.path) === 'README.md') continue;

	const adr: ADREntry = { path: entry.path };
	let topic = ADRs.get(topicName(adr));
	if (!!topic) {
		topic.entries.push(adr);
		topic.entries.sort((a, b) =>  a.path.localeCompare(b.path));
		continue
	}
	const topicDir = topicName(entry) === generalTopic ? '' : '/' + topicName(entry);
	topic = {
		path: `resources/references/adr${topicDir}`,
		entries: [adr]
	}
	ADRs.set(topicName(adr), topic);
}

let adrSummary = summaryItem(1, 'Architecture Reference', 'resources/references/adr/index.md');

const names = Array.from(ADRs.keys());
names.sort();

names.forEach((name) => {
	const topic = ADRs.get(name);
	const depthDiff = names.length > 1 ? 1 : 0;
	if (depthDiff > 0) {
		adrSummary += summaryItem(2, topicName(topic), path.join(topic.path, 'index.md'));
	}
	for (const adr of topic.entries) {
		adrSummary += summaryItem(2 + depthDiff, adrTitle(adr), adr.path);
	}
});

const filename = path.join(Deno.cwd(), "./SUMMARY");

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
	if (adrHeading.test(line)) break;
	summary.addLine(line)
}

summary.addLine(adrSummary);

for (const line of lines) {
	if (appRefHeading.test(line)) {
		summary.addLine(line);
		break;
	}
}

for (const line of lines) summary.addLine(line);

const fileWriter = await Deno.open(filename, {truncate: true, write: true});
summary.writeTo(fileWriter);
