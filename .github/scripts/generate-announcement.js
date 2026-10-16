const fs = require("fs");
const { execFileSync } = require("child_process");

// ======================================================
// Configuration
// ======================================================

const token = process.env.GITHUB_TOKEN;

const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
);

const owner = event.repository.owner.login;
const repo = event.repository.name;

// ======================================================
// GitHub API
// ======================================================

const API = `https://api.github.com/repos/${owner}/${repo}`;

const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
};

// ======================================================
// GitHub Helper
// ======================================================

async function githubGet(url) {

    const response = await fetch(url, {
        headers
    });

    if (!response.ok) {

        throw new Error(
            `GitHub GET failed (${response.status}) ${url}`
        );

    }

    return response.json();
}

// ======================================================
// Copilot Summarization
// ======================================================

function summarizePR(pr) {

    const changes = pr.files
        .map(file => {
            return `File: ${file.filename}
Status: ${file.status}
Changes:
${file.patch || "No patch available."}`;
        })
        .join("\n\n");

    const prompt = `
You are writing a weekly developer announcement for Shopware developers.

Analyze this merged documentation PR.

PR title:
${pr.title}

PR description:
${pr.body || "No description provided."}

Changed files:
${changes}

Write a concise, developer-focused summary.

Focus on:
- What changed
- What developers need to know
- Why the change matters to developers
- Any API, CLI, migration, compatibility, configuration, or workflow impact

Rules:
- Write 2-3 sentences only.
- Do not mention the PR number.
- Do not mention that you are an AI.
- Do not reproduce the PR checklist.
- Do not reproduce links or HTML comments.
- Do not simply repeat the PR description.
- Focus on the actual developer impact.
`;

    try {

        const summary = execFileSync(
            "copilot",
            [
                "-p",
                prompt,
                "-s",
                "--no-ask-user"
            ],
            {
                encoding: "utf8",
                maxBuffer: 1024 * 1024
            }
        );

        return summary.trim();

    } catch (error) {

        console.error(
            `Copilot summarization failed for PR #${pr.number}:`,
            error.message
        );

        // Fallback
        if (!pr.body || pr.body.trim() === "") {
            return pr.title;
        }

        const summaryMatch = pr.body.match(
            /## Summary\s*([\s\S]*?)(?=\n## |\n---|$)/i
        );

        if (summaryMatch) {
            return summaryMatch[1].trim();
        }

        return pr.body.split("\n")[0].trim();
    }
}

// ======================================================
// Main
// ======================================================

(async () => {

    console.log("==========================================");
    console.log("Weekly Announcement Generator");
    console.log("==========================================");

    //--------------------------------------------------
    // Last 7 days
    //--------------------------------------------------

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );

    //--------------------------------------------------
    // Search Announcement PRs
    //--------------------------------------------------

    const searchQuery = encodeURIComponent(
        `repo:${owner}/${repo} is:pr is:merged label:Announcement merged:>=${sevenDaysAgo.toISOString().split("T")[0]}`
    );

    const searchResult = await githubGet(
        `https://api.github.com/search/issues?q=${searchQuery}`
    );

    const announcementPRs = [];

    //--------------------------------------------------
    // Fetch complete PR details
    //--------------------------------------------------

    for (const item of searchResult.items) {

        const prNumber = item.number;

        const pr = await githubGet(
            `${API}/pulls/${prNumber}`
        );

        const files = await githubGet(
            `${API}/pulls/${prNumber}/files`
        );

        announcementPRs.push({

            number: pr.number,

            title: pr.title,

            body: pr.body || "",

            author: pr.user.login,

            merged_at: pr.merged_at,

            url: pr.html_url,

            files: files.map(file => ({
                filename: file.filename,
                status: file.status,
                patch: file.patch || ""
            }))

        });

    }

    //--------------------------------------------------
    // Build Weekly Announcement
    //--------------------------------------------------

    let markdown = "# Weekly Developer Announcement\n\n";

    for (const pr of announcementPRs) {

        console.log(
            `Generating AI summary for PR #${pr.number}...`
        );

        const summary = summarizePR(pr);

        markdown += `## ${pr.title}\n\n`;

        markdown += `${summary}\n\n`;

        markdown += "---\n\n";

    }

    //--------------------------------------------------
    // Print announcement
    //--------------------------------------------------

    console.log("");
    console.log(markdown);

    //--------------------------------------------------
    // Create downloadable file
    //--------------------------------------------------

    fs.writeFileSync(
        "announcement.md",
        markdown,
        "utf8"
    );

    console.log("");
    console.log("==========================================");
    console.log("Announcement file generated successfully");
    console.log("==========================================");
    console.log("File: announcement.md");

})();