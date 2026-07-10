const github = require("@actions/github");

const token = process.env.GITHUB_TOKEN;

const octokit = github.getOctokit(token);

const context = github.context;

const owner = context.repo.owner;
const repo = context.repo.repo;
const pull_number = context.payload.pull_request.number;

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

(async () => {

    let score = 0;

    const reasons = [];

    const categories = new Set();

    const pr =
        (await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number
        })).data;

    const title = pr.title.toLowerCase();

    console.log("Analyzing:", title);

    // ---------- TITLE ----------

    for (const [keyword, value] of Object.entries(RULES.keywords)) {

        if (title.includes(keyword)) {

            score += value;

            reasons.push(`+${value}: PR title contains "${keyword}"`);
        }
    }

    // ---------- FILES ----------

    const files =
        await octokit.paginate(
            octokit.rest.pulls.listFiles,
            {
                owner,
                repo,
                pull_number
            }
        );

    for (const file of files) {

        console.log(file.filename);

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

        // ---------- NEW HEADINGS ----------

        const headings =
            (patch.match(/\+\s*##\s/g) || []).length;

        if (headings) {

            score += headings * 2;

            reasons.push(`+${headings * 2}: ${headings} new headings`);
        }

        // ---------- CODE BLOCKS ----------

        const code =
            (patch.match(/\+\s*```/g) || []).length;

        if (code) {

            score += code;

            reasons.push(`+${code}: code examples`);
        }

        // ---------- API ----------

        if (/\+\s*(GET|POST|PUT|DELETE)\s+\/api/i.test(patch)) {

            score += 4;

            categories.add("API");

            reasons.push("+4: API endpoint documented");
        }

        // ---------- DEPRECATION ----------

        if (/deprecated/i.test(patch)) {

            score += 4;

            categories.add("Migration");

            reasons.push("+4: Deprecation");
        }

        // ---------- BREAKING ----------

        if (/breaking/i.test(patch)) {

            score += 5;

            categories.add("Migration");

            reasons.push("+5: Breaking change");
        }

    }

    let recommendation;

    if (score >= 10) {

        recommendation =
            "✅ Highly meaningful";

    } else if (score >= 6) {

        recommendation =
            "⚠️ Needs manual review";

    } else {

        recommendation =
            "❌ Probably not meaningful";
    }

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

    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: comment
    });

})();
