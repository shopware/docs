
const github = require("./github");

const COMMENT_HEADER = "## 📢 Developer Announcement Recommendation";

function formatFiles(signal) {
    if (!signal.matchingFiles || signal.matchingFiles.length === 0) {
        return "";
    }

    return `\n  - Matching files: ${signal.matchingFiles
        .map(file => `\`${file}\``)
        .join(", ")}`;
}

function buildComment(result) {
    const sections = [COMMENT_HEADER, ""];

    if (result.recommendation) {
        sections.push(
            "**Recommendation:** ✅ Recommend Announcement",
            "",
            "High-confidence developer-facing signals were detected."
        );
    } else if (result.manualReview) {
        sections.push(
            "**Recommendation:** ⚠️ Manual Review Required",
            "",
            "Some changed file paths match announcement categories, " +
            "but the PR title/body does not provide enough evidence " +
            "for an automatic recommendation."
        );
    } else {
        sections.push(
            "**Recommendation:** ❌ No Announcement Recommended",
            "",
            "No matching developer announcement signals were detected " +
            "by the current rules."
        );
    }

    if (result.signals.length > 0) {
        sections.push("", "### High-Confidence Signals", "");

        for (const signal of result.signals) {
            sections.push(
                `- ✅ **${signal.name}** — ${signal.description}` +
                formatFiles(signal)
            );
        }
    }

    if (result.reviewSignals.length > 0) {
        sections.push("", "### Signals Requiring Manual Review", "");

        for (const signal of result.reviewSignals) {
            sections.push(
                `- ⚠️ **${signal.name}** — ${signal.description}`,
                `  - ${signal.reason}` +
                formatFiles(signal)
            );
        }
    }

    if (result.recommendation) {
        if (result.labelError) {
            sections.push(
                "",
                `**Label status:** ⚠️ Could not apply \`Announcement\`.`,
                `Details: ${result.labelError}`
            );
        } else if (result.labelAdded) {
            sections.push(
                "",
                "**Label status:** 🏷️ Added the `Announcement` label automatically."
            );
        } else if (result.labelAlreadyPresent) {
            sections.push(
                "",
                "**Label status:** 🏷️ The `Announcement` label was already present."
            );
        }
    }

    sections.push(
        "",
        "> This recommendation is based on changed file paths and the PR " +
        "title/body. Review the actual changes before publishing a community announcement."
    );

    return sections.join("\n");
}

/**
 * Create or update the analyzer comment.
 */
async function publish(prNumber, result) {
    const body = buildComment(result);
    const comments = await github.getComments(prNumber);

    const existing = comments.find(comment =>
        comment.body &&
        comment.body.startsWith(COMMENT_HEADER)
    );

    if (existing) {
        console.log("Updating existing analyzer comment...");

        await github.updateComment(existing.id, body);
        return;
    }

    console.log("Creating analyzer comment...");

    await github.createComment(prNumber, body);
}

module.exports = publish;