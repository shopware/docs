const fs = require("fs");
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
// Formatting helpers
// ======================================================

function getShortTitle(title) {
    let shortTitle = title
        .replace(/^(docs|feat|fix|chore|refactor):\s*/i, "")
        .trim();

    // Remove documentation-specific wording.
    shortTitle = shortTitle
        .replace(/^update\s+/i, "")
        .replace(/\s+pages to current behaviour$/i, "")
        .replace(/\s+pages to current behavior$/i, "");

    // Make common title patterns more readable.
    if (/^add splitting queue to paas$/i.test(shortTitle)) {
        return "Split message queues";
    }

    shortTitle = shortTitle.charAt(0).toUpperCase() +
        shortTitle.slice(1);

    return shortTitle;
}

function cleanSummary(text) {
    return text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .split(/\s+/)
        .slice(0, 35)
        .join(" ")
        .replace(/[.!?]+$/, "") + ".";
}

function fallbackSummary(pr) {
    const description = (pr.body || "")
        .split("\n")
        .map(line => line.trim())
        .find(line =>
            line.length > 0 &&
            !line.startsWith("#") &&
            !line.startsWith("<!--") &&
            !line.startsWith("- ")
        );

    return cleanSummary(description || pr.title);
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
Write one concise sentence for a Shopware developer announcement.

PR title: ${pr.title}

PR description:
${pr.body || "No description provided."}

Changed files:
${changedFiles}

Requirements:
- Maximum 35 words.
- Explain the concrete change and why it matters to developers.
- Focus on new capabilities, behavior, configuration, compatibility,
  or actions developers need to take.
- Do not repeat the PR title.
- Do not include a heading, bullet, PR number, or introduction.
- Do not invent details.
- Return only the summary sentence.
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

    if (!summary || summary === ".") {
        throw new Error("Copilot returned an empty summary.");
    }

    return summary;
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

    const items = (searchResult.items || []).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const output = [
        "# Weekly Developer Announcement",
        ""
    ];

    if (items.length === 0) {
        output.push(
            "No announcement-labelled PRs were merged in the last seven days."
        );
    }

    for (let index = 0; index < items.length; index++) {
        const item = items[index];

        console.log(`Summarizing PR #${item.number}...`);

        const pr = await githubGet(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${item.number}`
        );

        const files = await githubGet(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${item.number}/files?per_page=100`
        );

        const prData = {
            title: pr.title,
            body: pr.body || "",
            files: files.map(file => ({
                filename: file.filename,
                status: file.status,
                patch: file.patch || ""
            }))
        };

        let summary;

        try {
            summary = summarizePR(prData);
        } catch (error) {
            console.error(
                `Copilot failed for PR #${item.number}: ${error.message}`
            );

            summary = fallbackSummary(prData);
        }

        const title = getShortTitle(pr.title);

        output.push(
            `${index + 1}. [PR #${pr.number} — ${title}](${pr.html_url}): ${summary}`
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