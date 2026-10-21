
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
// GitHub helper
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
// Copilot summary
// ======================================================

function summarizePR(pr) {
    const files = pr.files
        .map(file => {
            return [
                `File: ${file.filename}`,
                `Change type: ${file.status}`,
                file.patch || ""
            ].join("\n");
        })
        .join("\n\n")
        .slice(0, 12000);

    const prompt = `
Summarize this Shopware developer documentation PR for a weekly
developer announcement.

PR title: ${pr.title}
PR description: ${pr.body || "No description provided."}

Changed files and patches:
${files}

Requirements:
- Output exactly ONE concise sentence.
- Maximum 30 words.
- Explain the concrete change and why it matters to developers.
- Focus on new capabilities, changed behavior, configuration,
  compatibility, or actions developers need to take.
- Do not repeat the PR title.
- Do not include the PR number, author, headings, bullets,
  introductions, or commentary.
- Do not invent information not supported by the PR.
- Return only the sentence.
`;

    return execFileSync(
        "copilot",
        ["-p", prompt, "-s", "--no-ask-user"],
        {
            encoding: "utf8",
            maxBuffer: 1024 * 1024,
            timeout: 120000
        }
    ).trim();
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

    const prs = searchResult.items || [];

    if (prs.length === 0) {
        const message = "# Weekly Developer Announcement\n\nNo announcement-labelled PRs were merged in the last seven days.\n";

        fs.writeFileSync("announcement.md", message, "utf8");
        console.log("No matching PRs found.");
        console.log("announcement.md generated.");
        return;
    }

    const summaries = [];

    for (const item of prs) {
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
                `Copilot summary failed for PR #${item.number}: ${error.message}`
            );

            summary = (pr.body || pr.title)
                .split("\n")
                .map(line => line.trim())
                .find(line => line.length > 0 && !line.startsWith("#"))
                || pr.title;
        }

        summaries.push(
            `## [${pr.title}](${pr.html_url})\n\n${summary}`
        );
    }

    const markdown =
        "# Weekly Developer Announcement\n\n" +
        summaries.join("\n\n---\n\n") +
        "\n";

    fs.writeFileSync("announcement.md", markdown, "utf8");

    console.log("\n" + markdown);
    console.log("announcement.md generated.");
})().catch(error => {
    console.error("Weekly announcement generation failed:", error);
    process.exitCode = 1;
});