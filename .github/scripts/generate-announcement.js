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

    const searchQuery = encodeURIComponent(
      `repo:${owner}/${repo} is:pr is:merged label:Announcement merged:>=${sevenDaysAgo.toISOString().split("T")[0]}`
  );
  
  const result = await githubGet(
      `https://api.github.com/search/issues?q=${searchQuery}`
  );
  
  const announcementPRs = result.items;
    //--------------------------------------------------
    // Output
    //--------------------------------------------------

    //--------------------------------------------------
// Generate Markdown
//--------------------------------------------------

let markdown = `# Weekly Developer Announcement

Generated on ${new Date().toDateString()}

---

`;

for (const pr of announcementPRs) {

    markdown += `## ${pr.title}

**PR:** #${pr.number}

**Link:** ${pr.html_url}

**Summary**

${pr.body || "_No description provided._"}

---

`;

}

console.log(markdown);

fs.writeFileSync(
    "announcement.md",
    markdown
);

console.log("announcement.md generated.");

})();
