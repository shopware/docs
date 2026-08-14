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

    console.log("");
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
    // Fetch merged PRs
    //--------------------------------------------------

    const pulls = await githubGet(
        `${API}/pulls?state=closed&per_page=100`
    );

    const announcementPRs = pulls.filter(pr => {

        if (!pr.merged_at)
            return false;

        const mergedDate = new Date(
            pr.merged_at
        );

        if (mergedDate < sevenDaysAgo)
            return false;

        return pr.labels.some(label =>
            label.name === "Announcement"
        );

    });

    //--------------------------------------------------
    // Output
    //--------------------------------------------------

    console.log("");

    console.log(
        `Found ${announcementPRs.length} announcement PR(s).`
    );

    console.log("");

    for (const pr of announcementPRs) {

        console.log("--------------------------------");

        console.log(`#${pr.number}`);

        console.log(pr.title);

        console.log(pr.html_url);

        console.log("");

    }

})();
