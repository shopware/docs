const github = require("./github");

const COMMENT_HEADER = "## 📢 Developer Announcement Recommendation";

/**
 * Builds the markdown comment
 */
function buildComment(result) {

    if (!result.recommendation) {

        return `${COMMENT_HEADER}

**Recommendation:** ❌ No Announcement Recommended

No developer announcement signals were detected.

> This PR does not appear to introduce developer-facing changes that require a community announcement.
`;

    }

    return `${COMMENT_HEADER}

**Recommendation:** ✅ Recommend Announcement

### Detected Signals

${result.signals
    .map(signal => `- ✅ ${signal.name}`)
    .join("\n")}

> Review this PR and, if appropriate, apply the \`Announcement\` label.
`;

}

/**
 * Create or update analyzer comment
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

        await github.updateComment(
            existing.id,
            body
        );

        return;

    }

    console.log("Creating analyzer comment...");

    await github.createComment(
        prNumber,
        body
    );

}

module.exports = publish;
