
const github = require("./github");
const detect = require("./detector");
const publish = require("./reporter");

async function main() {
    console.log("");
    console.log("==========================================");
    console.log("Developer Announcement Recommender");
    console.log("==========================================");

    const prNumber = github.event.pull_request?.number;

    if (!prNumber) {
        throw new Error(
            "No pull request number found in the GitHub event."
        );
    }

    // --------------------------------------------------
    // Get Pull Request
    // --------------------------------------------------

    const pr = await github.getPullRequest(prNumber);

    if (pr.draft) {
        console.log("Draft PR detected.");
        console.log("Skipping analysis.");
        return;
    }

    // --------------------------------------------------
    // Get Changed Files
    // --------------------------------------------------

    const files = await github.getFiles(prNumber);

    console.log(`Analyzing PR #${prNumber}`);
    console.log(`Title: ${pr.title}`);
    console.log(`Files changed: ${files.length}`);

    // --------------------------------------------------
    // Run Announcement Detector
    // --------------------------------------------------

    const result = detect(pr, files);

    console.log("");

    if (result.recommendation) {
        console.log("Recommendation: Recommend Announcement");
    } else if (result.manualReview) {
        console.log("Recommendation: Manual Review Required");
    } else {
        console.log("Recommendation: No Announcement Recommended");
    }

    if (result.signals.length > 0) {
        console.log("");
        console.log("High-confidence signals:");

        result.signals.forEach(signal => {
            console.log(` - ${signal.name}`);
        });
    }

    if (result.reviewSignals.length > 0) {
        console.log("");
        console.log("Signals requiring manual review:");

        result.reviewSignals.forEach(signal => {
            console.log(` - ${signal.name}`);
            console.log(`   Reason: ${signal.reason}`);
        });
    }

    // --------------------------------------------------
    // Automatically Apply Announcement Label
    // Only for high-confidence recommendations
    // --------------------------------------------------

    if (result.recommendation) {
        try {
            const labelResult = await github.ensureLabel(
                prNumber,
                "Announcement"
            );

            result.labelAdded = labelResult.added;
            result.labelAlreadyPresent = labelResult.alreadyPresent;
        } catch (error) {
            result.labelError = error.message;

            console.error(
                'Could not apply the "Announcement" label:',
                error.message
            );
        }
    }

    // --------------------------------------------------
    // Publish or Update Analyzer Comment
    // --------------------------------------------------

    await publish(prNumber, result);

    console.log("");
    console.log("Announcement analysis completed.");
    console.log("");
}

main().catch(error => {
    console.error("Announcement detector failed:", error);
    process.exitCode = 1;
});