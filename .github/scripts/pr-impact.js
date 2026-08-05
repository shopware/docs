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
const pull_number = event.pull_request.number;

const API = `https://api.github.com/repos/${owner}/${repo}`;

const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
};

const RULES = {
    paths: [
        {
            pattern: /guides\/upgrade/,
            score: 5,
            reason: "Upgrade Guide",
            category: "Migration"
        },
        {
            pattern: /api/,
            score: 4,
            reason: "API Documentation",
            category: "API"
        },
        {
            pattern: /plugins/,
            score: 3,
            reason: "Plugin Development",
            category: "Plugins"
        },
        {
            pattern: /apps/,
            score: 3,
            reason: "App Development",
            category: "Apps"
        },
        {
            pattern: /framework/,
            score: 4,
            reason: "Framework",
            category: "Framework"
        },
        {
            pattern: /images/,
            score: -2,
            reason: "Images"
        }
    ],

    keywords: {
        migration: 5,
        upgrade: 5,
        deprecated: 4,
        breaking: 5,
        api: 4,
        sdk: 3,
        plugin: 3,
        tutorial: 3,
        security: 4,
        performance: 3,
        configuration: 3
    }
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

async function githubPost(url, body) {

    const response = await fetch(url, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `GitHub POST failed (${response.status})\n${text}`
        );
    }

    return response.json();
}

async function githubPatch(url, body) {

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            ...headers,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `GitHub PATCH failed (${response.status})\n${text}`
        );
    }

    return response.json();
}

// ======================================================
// Analyzer
// ======================================================

(async () => {

    console.log("=================================");
    console.log("Documentation Impact Analyzer");
    console.log("=================================");

    let score = 0;

    const reasons = [];

    const categories = new Set();

//-----------------------------------------------------
// PR
//-----------------------------------------------------

const pr = await githubGet(
    `${API}/pulls/${pull_number}`
);

// Skip draft pull requests
if (pr.draft) {
    console.log("=================================");
    console.log("Draft PR detected");
    console.log("Skipping analysis...");
    console.log("=================================");
    process.exit(0);
}

const title = pr.title.toLowerCase();

console.log("PR:", pr.title);

    //-----------------------------------------------------
    // Title
    //-----------------------------------------------------

    for (const [keyword, value] of Object.entries(RULES.keywords)) {

        if (title.includes(keyword)) {

            score += value;

            reasons.push(`+${value}: PR title contains "${keyword}"`);
        }

    }

    //-----------------------------------------------------
    // Files
    //-----------------------------------------------------

    const files = await githubGet(
        `${API}/pulls/${pull_number}/files`
    );

    console.log(`Found ${files.length} changed files`);

    for (const file of files) {

        console.log("Analyzing:", file.filename);

        //-------------------------------------------------
        // Path Rules
        //-------------------------------------------------

        for (const rule of RULES.paths) {

            if (rule.pattern.test(file.filename)) {

                score += rule.score;

                reasons.push(
                    `${rule.score > 0 ? "+" : ""}${rule.score}: ${rule.reason}`
                );

                if (rule.category)
                    categories.add(rule.category);

            }

        }

        const patch = file.patch || "";

        //-------------------------------------------------
        // New Headings
        //-------------------------------------------------

        const headings =
            (patch.match(/\+\s*##\s/g) || []).length;

        if (headings) {

            score += headings * 2;

            reasons.push(
                `+${headings * 2}: ${headings} new headings`
            );

        }

        //-------------------------------------------------
        // Code Blocks
        //-------------------------------------------------

        const code =
            (patch.match(/\+\s*```/g) || []).length;

        if (code) {

            score += code;

            reasons.push(
                `+${code}: Code examples`
            );

        }

        //-------------------------------------------------
        // API Endpoints
        //-------------------------------------------------

        if (/\+\s*(GET|POST|PUT|DELETE)\s+\/api/i.test(patch)) {

            score += 4;

            categories.add("API");

            reasons.push(
                "+4: API endpoint documented"
            );

        }

        //-------------------------------------------------
        // Deprecation
        //-------------------------------------------------

        if (/deprecated/i.test(patch)) {

            score += 4;

            categories.add("Migration");

            reasons.push(
                "+4: Deprecation"
            );

        }

        //-------------------------------------------------
        // Breaking
        //-------------------------------------------------

        if (/breaking/i.test(patch)) {

            score += 5;

            categories.add("Migration");

            reasons.push(
                "+5: Breaking change"
            );

        }

    }

    //-----------------------------------------------------
    // Recommendation
    //-----------------------------------------------------

    let recommendation;

    if (score >= 10) {

        recommendation = "✅ Highly meaningful";

    } else if (score >= 6) {

        recommendation = "⚠️ Needs manual review";

    } else {

        recommendation = "❌ Probably not meaningful";

    }

    //-----------------------------------------------------
    // Comment
    //-----------------------------------------------------

    const comment = `## 📊 Documentation Impact Analyzer

| Metric | Result |
|--------|--------|
| Score | **${score}** |
| Recommendation | **${recommendation}** |
| Categories | ${[...categories].join(", ") || "None"} |

### Reasons

${reasons.map(r => `- ${r}`).join("\n")}

---

> This score is automatically generated based on documentation impact heuristics.
`;

    const comments = await githubGet(
        `${API}/issues/${pull_number}/comments`
    );

    const existingComment = comments.find(
        item => item.body && item.body.startsWith("## 📊 Documentation Impact Analyzer")
    );

    if (existingComment) {

        await githubPatch(
            `${API}/issues/comments/${existingComment.id}`,
            {
                body: comment
            }
        );

    } else {

        await githubPost(
            `${API}/issues/${pull_number}/comments`,
            {
                body: comment
            }
        );

    }

    console.log("");
    console.log("=================================");
    console.log("Analysis Complete");
    console.log("=================================");
    console.log("Score:", score);
    console.log("Recommendation:", recommendation);

})();
