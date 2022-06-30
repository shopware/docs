import { Buffer } from "https://deno.land/std@0.145.0/io/mod.ts";
import { walk } from "https://deno.land/std@0.145.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";


interface ADREntry { path: string }
interface ADRTopic extends ADREntry { entries: ADREntry[] }

const dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const adrHeading = /\[Architecture Reference\]/;
const appRefHeading = /\[App Reference\]/;


const firstToUpper = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
const fixName = (s: string) => firstToUpper(s).replaceAll(/api/gi, 'API').replaceAll(/dal/gi, 'DAL');

const topicName = (entry: ADREntry) => entry.path.split('/')[1];
const summaryItem = (depth: number, name: string, path: string) => `${' '.repeat(depth * 2)}* [${fixName(name)}](${path})\n`;

const adrTitle = (adr: ADREntry) => {
	return path.basename(adr.path)
	.replace(dateRegex, '')
	.replace('.md', '')
	.replaceAll('-', ' ')
	.trim();
};

let ADRs = new Map<string,ADRTopic>();
for await (const entry of walk("./adr")) {
	if (entry.isDirectory) continue;
	if (entry.path.startsWith('adr/assets')) continue;
	if (path.basename(entry.path).startsWith('_')) continue;
	if (path.basename(entry.path) === 'README.md') continue;

	const adr: ADREntry = { path: entry.path };
	let topic = ADRs.get(topicName(adr));
	if (!!topic) {
		topic.entries.push(adr);
		continue
	}
	topic = {
		path: `adr/${topicName(entry)}`,
		entries: [adr]
	}
	ADRs.set(topicName(adr), topic);
}

let adrSummary = summaryItem(1, 'Architecture Reference', 'adr/README.md');

ADRs.forEach((topic) => {
	adrSummary += summaryItem(2, topicName(topic), path.join(topic.path, 'README.md'));
	for (const adr of topic.entries) {
		adrSummary += summaryItem(3, adrTitle(adr), adr.path);
	}
});

const filename = path.join(Deno.cwd(), "./SUMMARY.md");


const summary = {
	lines: <string[]> [], 
	encoder: new TextEncoder(),
	addLine(line: string) { this.lines.push(line) },
	writeTo(writer: Deno.Writer) { 
		for (let i = this.lines.length - 1; i > 0; i--) {
			const line = <string> this.lines.pop();
			if (line !== '') {
				this.lines.push(line);
				this.lines.push('\n');
				break;
			}
		}
		writer.writeSync(this.encoder.encode(this.lines.join('\n')));
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
