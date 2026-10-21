
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

// ======================================================
// Configuration
// ======================================================

const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("GITHUB_TOKEN is missing.");
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
// GitHub API
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
// Shopware documentation links
// ======================================================

function getDocUrl(filename) {
    let docPath = filename.replace(/\.md$/i, "");

    if (path.posix.basename(docPath) === "index") {
        docPath = path.posix.dirname(docPath);
    }

    return DOCS_BASE_URL + docPath + ".html";
}

function getTopicLabel(filename) {
    const basename = path.posix
        .basename(filename, ".md")
        .toLowerCase();

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
        !file.filename.split("/").some(part => part.startsWith("."))
    );

    if (markdownFiles.length === 0) {
        return [];
    }

    const title = pr.title.toLowerCase();

    // Prefer pages directly named in the PR title.
    const titleMatches = markdownFiles.filter(file => {
        const basename = path.posix
            .basename(file.filename, ".md")
            .toLowerCase();

        return basename.length > 3 && title.includes(basename);
    });

    if (titleMatches.length > 0) {
        return titleMatches.slice(0, 3);
    }

    // Prefer a newly added, task-oriented guide.
    const addedGuides = markdownFiles.filter(file =>
        file.status === "added" &&
        /\/guides\//i.test(file.filename)
    );

    if (addedGuides.length > 0) {
        return addedGuides.slice(0, 2);
    }

    // Otherwise, prefer guides and topic pages over FAQs
    // and general configuration references.
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
                `Status: ${file.status}`,
                file.patch || ""
            ].join("\n");
        })
        .join("\n\n")
        .slice(0, 12000);

    const prompt = `
You write short, reader-friendly announcements about changes
that matter to Shopware developers.

Pull request title:
${pr.title}

Pull request description:
${pr.body || "No description provided."}

Changed files and patches:
${changedFiles}

Write ONE sentence explaining the developer impact.

Style examples:

"Helps PaaS developers understand where profiling data appears
and how profiler settings affect application deployments."

"Lets developers process time-sensitive messages, such as order
emails, separately from long-running tasks, helping prevent
background work from delaying important operations."

Requirements:
- Aim for 20–28 words.
- Lead with what developers gain, can do, or need to know.
- Explain the practical benefit or problem solved.
- Use clear, natural language that developers can scan quickly.
- Include technical terms only when they help explain the impact.
- Do not describe the work as documentation being written,
  updated, added, clarified, or published.
- Do not say "the docs", "this guide", or "the documentation".
- Avoid listing file changes, implementation details, or every
  change in the PR.
- Do not repeat the PR title.
- Do not include a heading, bullet, PR number, or introduction.
- Do not invent benefits or functionality unsupported by the PR.
- Return only the sentence.
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

    const summary = output
        .replace(/```[\s\S]*?```/g, "")
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!summary) {
        throw new Error("Copilot returned an empty summary.");
    }

    return summary;
}

// ======================================================
// Fallback summaries
// ======================================================

function fallbackSummary(pr) {
    const title = pr.title.toLowerCase();

    if (
        title.includes("tideways") ||
        title.includes("blackfire")
    ) {
        return "Helps PaaS developers configure profilers correctly, find their profiling data, and understand when profiler changes require a new application image.";
    }

    if (
        title.includes("splitting queue") ||
        title.includes("message queue")
    ) {
        return "Lets developers separate long-running background jobs from time-sensitive messages, helping important tasks such as order emails avoid unnecessary delays.";
    }

    return "Introduces a developer-facing change that may affect how Shopware applications are configured or maintained.";
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

    // Fetch PR details and changed files.
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
            url: pr.html_url,
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

        output.push(
            `${index + 1}. ${topicLinks}: ${summary}`
        );
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