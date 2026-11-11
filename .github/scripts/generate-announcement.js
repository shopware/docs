
const fs = require("fs");
const { execFileSync } = require("child_process");

// ======================================================
// Configuration
// ======================================================

const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("GITHUB_TOKEN is missing.");
}

if (!process.env.GITHUB_EVENT_PATH) {
    throw new Error("GITHUB_EVENT_PATH is missing.");
}

const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
);

const owner = event.repository.owner.login;
const repo = event.repository.name;

const DOCS_BASE_URL = "https://developer.shopware.com/docs/";

const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
};

// ======================================================
// GitHub API helper
// ======================================================

async function githubGet(url) {
    const response = await fetch(url, { headers });

    if (!response.ok) {
        throw new Error(
            `GitHub API request failed (${response.status}): ${url}`
        );
    }

    return response.json();
}

// ======================================================
// Documentation topic links
// ======================================================

function getDocUrl(filename) {
    let docPath = filename.replace(/\.md$/i, "");

    if (pathBasename(docPath) === "index") {
        docPath = docPath.slice(
            0,
            docPath.lastIndexOf("/")
        ) || "";
    }

    return DOCS_BASE_URL + docPath + ".html";
}

function pathBasename(value) {
    return value.split("/").pop();
}

function getTopicLabel(filename) {
    const basename = pathBasename(
        filename.replace(/\.md$/i, "")
    ).toLowerCase();

    const labels = {
        tideways: "Tideways",
        blackfire: "Blackfire",
        "message-queues": "Split message queues",
        "application-yaml": "Application configuration",
        "k8s-meta": "PaaS configuration",
        faq: "PaaS FAQ"
    };

    if (labels[basename]) {
        return labels[basename];
    }

    return basename
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase());
}

function getRelevantDocFiles(pr) {
    const markdownFiles = pr.files.filter(file =>
        file.filename.endsWith(".md") &&
        !file.filename.split("/").some(part =>
            part.startsWith(".")
        )
    );

    if (markdownFiles.length === 0) {
        return [];
    }

    const title = pr.title.toLowerCase();

    // Prefer pages explicitly referenced by the PR title.
    const titleMatches = markdownFiles.filter(file => {
        const basename = pathBasename(
            file.filename.replace(/\.md$/i, "")
        ).toLowerCase();

        return basename.length > 3 && title.includes(basename);
    });

    if (titleMatches.length > 0) {
        return titleMatches.slice(0, 3);
    }

    // Prefer newly added guides for new capabilities.
    const addedGuides = markdownFiles.filter(file =>
        file.status === "added" &&
        /\/guides\//i.test(file.filename)
    );

    if (addedGuides.length > 0) {
        return addedGuides.slice(0, 2);
    }

    // Prefer specific topic pages over general FAQs.
    const topicFiles = markdownFiles.filter(file =>
        /\/(guides|monitoring|api|extensions|plugins)\//i.test(
            file.filename
        ) &&
        !/\/faq\.md$/i.test(file.filename)
    );

    if (topicFiles.length > 0) {
        return topicFiles.slice(0, 2);
    }

    return markdownFiles.slice(0, 1);
}

function createTopicLinks(pr) {
    const files = getRelevantDocFiles(pr);

    if (files.length === 0) {
        return `[Shopware developer documentation](${DOCS_BASE_URL})`;
    }

    return files
        .map(file =>
            `[${getTopicLabel(file.filename)}](${getDocUrl(file.filename)})`
        )
        .join(" and ");
}

// ======================================================
// Copilot summary
// ======================================================

function summarizePR(pr) {
    const changedFiles = pr.files
        .map(file => {
            return [
                `File: ${file.filename}`,
                `Change type: ${file.status}`,
                file.patch || ""
            ].join("\n");
        })
        .join("\n\n")
        .slice(0, 16000);

    const prompt = `
You write weekly developer announcements for Shopware developers.

Your job is to explain the practical impact of a change, not to
describe documentation work.

PR title:
${pr.title}

PR description:
${pr.body || "No description provided."}

Changed files and patches:
${changedFiles}

Write ONE concise, reader-friendly sentence.

STYLE EXAMPLES:

"Helps PaaS developers configure profilers correctly, understand
where Tideways data appears, and know when changing profiler
settings triggers a new image build."

"Lets PaaS developers process time-sensitive messages, such as
order emails, separately from long-running background tasks to
help prevent unnecessary delays."

"Allows extension developers to react to a new event and customize
their integrations without modifying core functionality."

WRITING RULES:

1. Aim for 20–30 words.
2. Lead with what developers gain, can do, or need to understand.
3. Explain why the change matters in practical terms.
4. Use natural language that developers can scan quickly.
5. Avoid unnecessary jargon and low-level implementation details.
6. Never say "the documentation", "the docs", "this guide",
   "the page was updated", or similar phrases.
7. Do not describe documentation work as the announcement.
8. Do not merely restate the PR title.
9. Mention a technical term only when it helps explain the impact.
10. Do not invent functionality, benefits, or requirements.
11. If the change has no clear developer impact, say so briefly
    rather than inventing a benefit.
12. Return only the sentence. No heading, bullet, or explanation.
`;

    const output = execFileSync(
        "copilot",
        ["-p", prompt, "-s", "--no-ask-user"],
        {
            encoding: "utf8",
            maxBuffer: 1024 * 1024,
            timeout: 120000
        }
    );

    const summary = cleanSummary(output);

    if (!summary) {
        throw new Error("Copilot returned an empty summary.");
    }

    return summary;
}

// ======================================================
// Summary cleanup
// ======================================================

function cleanSummary(text) {
    return text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanMarkdown(text) {
    return text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[*_~]/g, "")
        .replace(/^#+\s*/, "")
        .trim();
}

function firstSentence(text) {
    const cleaned = cleanMarkdown(text)
        .replace(/\s+/g, " ")
        .trim();

    if (!cleaned) {
        return "";
    }

    const match = cleaned.match(/^(.+?[.!?])(?:\s|$)/);

    return match ? match[1].trim() : cleaned;
}

// ======================================================
// Conservative fallback summary
// ======================================================

function isUsefulFallback(text) {
    if (!text || text.length < 35) {
        return false;
    }

    // Avoid fallback text that merely describes documentation work.
    if (
        /\b(documentation|docs|documentation page|guide was updated|pages were updated)\b/i
            .test(text)
    ) {
        return false;
    }

    return true;
}

function fallbackSummary(pr) {
    // First, look for a meaningful description in the PR body.
    const bodyParagraphs = (pr.body || "")
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(Boolean);

    for (const paragraph of bodyParagraphs) {
        if (
            /^#{1,6}\s/.test(paragraph) ||
            /^<!--/.test(paragraph) ||
            /^[-*]\s/.test(paragraph)
        ) {
            continue;
        }

        const sentence = firstSentence(paragraph);

        if (isUsefulFallback(sentence)) {
            return sentence;
        }
    }

    // If the PR body is insufficient, inspect added prose.
    const addedLines = pr.files.flatMap(file =>
        (file.patch || "")
            .split("\n")
            .filter(line =>
                line.startsWith("+") &&
                !line.startsWith("+++") &&
                !line.startsWith("+#") &&
                !line.startsWith("+```") &&
                !line.startsWith("+:::") &&
                !line.startsWith("+|")
            )
            .map(line => line.slice(1).trim())
    );

    for (const line of addedLines) {
        if (
            !line ||
            line.startsWith("#") ||
            line.startsWith("- ") ||
            line.startsWith("* ") ||
            line.startsWith(":::") ||
            line.startsWith("http")
        ) {
            continue;
        }

        const sentence = firstSentence(line);

        if (isUsefulFallback(sentence)) {
            return sentence;
        }
    }

    // Never invent a developer benefit when the evidence is insufficient.
    return null;
}

// ======================================================
// Main
// ======================================================

(async () => {
    console.log("Generating weekly developer announcement...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const date = sevenDaysAgo.toISOString().split("T")[0];

    const query = encodeURIComponent(
        `repo:${owner}/${repo} is:pr is:merged label:Announcement merged:>=${date}`
    );

    const searchResult = await githubGet(
        `https://api.github.com/search/issues?q=${query}&per_page=100`
    );

    const items = searchResult.items || [];
    const prs = [];

    // Fetch complete PR details and changed files.
    for (const item of items) {
        console.log(`Fetching PR #${item.number}...`);

        const pr = await githubGet(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${item.number}`
        );

        const files = await githubGet(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${item.number}/files?per_page=100`
        );

        prs.push({
            number: pr.number,
            title: pr.title,
            body: pr.body || "",
            merged_at: pr.merged_at,
            files: files.map(file => ({
                filename: file.filename,
                status: file.status,
                patch: file.patch || ""
            }))
        });
    }

    // Oldest merged PR first.
    prs.sort(
        (a, b) => new Date(a.merged_at) - new Date(b.merged_at)
    );

    const output = [
        "# Weekly Developer Announcement",
        ""
    ];

    if (prs.length === 0) {
        output.push(
            "No announcement-labelled PRs were merged in the last seven days."
        );
    }

    for (let index = 0; index < prs.length; index++) {
        const pr = prs[index];

        console.log(`Summarizing PR #${pr.number}...`);

        let summary;

        try {
            summary = summarizePR(pr);
        } catch (error) {
            console.error(
                `Copilot failed for PR #${pr.number}: ${error.message}`
            );

            summary = fallbackSummary(pr);
        }

        const topicLinks = createTopicLinks(pr);

        if (summary) {
            output.push(
                `${index + 1}. ${topicLinks}: ${summary}`
            );
        } else {
            output.push(
                `${index + 1}. ${topicLinks}: **Needs review:** The developer impact could not be summarized reliably. Please review this change before publishing.`
            );
        }

        output.push("");
    }

    const markdown = output.join("\n").trim() + "\n";

    fs.writeFileSync("announcement.md", markdown, "utf8");

    console.log("\n" + markdown);
    console.log("announcement.md generated.");
})().catch(error => {
    console.error("Weekly announcement generation failed:", error);
    process.exitCode = 1;
});