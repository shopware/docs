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
            `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`
        );

        const files = await githubGet(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`
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
    // Print collected data
    //--------------------------------------------------

    console.log("");

    console.log(markdown);
})();