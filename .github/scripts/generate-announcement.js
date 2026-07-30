const fs = require("fs");

// ======================================================
// Configuration
// ======================================================

const token = process.env.GITHUB_TOKEN;

const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
);

const owner = event.repository.owner.login;
const repo = event.repository.name;

const API = `https://api.github.com/repos/${owner}/${repo}`;

const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
};

// ======================================================
// GitHub Helpers
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
// Main
// ======================================================

(async () => {

    console.log("=================================");
    console.log("Announcement Generator");
    console.log("=================================");

    const closedPRs = await githubGet(
        `${API}/pulls?state=closed&per_page=100`
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const announcementPRs = closedPRs.filter(pr => {

        // Ignore closed but not merged PRs
        if (!pr.merged_at) {
            return false;
        }

        // Only last 7 days
        const mergedDate = new Date(pr.merged_at);

        if (mergedDate < oneWeekAgo) {
            return false;
        }

        // Must have Announcement label
        return pr.labels.some(label => label.name === "Announcement");

    });

    console.log("");
    console.log(`Found ${announcementPRs.length} announcement PR(s)\n`);

    for (const pr of announcementPRs) {

        console.log("---------------------------------------");
        console.log(`PR #${pr.number}`);
        console.log(`Title   : ${pr.title}`);
        console.log(`Author  : ${pr.user.login}`);
        console.log(`Merged  : ${pr.merged_at}`);
        console.log(`URL     : ${pr.html_url}`);

        const details = await githubGet(
            `${API}/pulls/${pr.number}`
        );

        console.log("\nDescription:");
        console.log(details.body || "(No description)");

        const files = await githubGet(
            `${API}/pulls/${pr.number}/files`
        );

        console.log("\nChanged Files:");

        files.forEach(file => {
            console.log(` - ${file.filename}`);
        });

        console.log("");

    }

    console.log("=================================");
    console.log("Finished");
    console.log("=================================");

})();
