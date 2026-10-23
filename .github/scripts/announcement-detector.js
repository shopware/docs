const github = require("./github");
const detect = require("./detector");
const publish = require("./reporter");

(async () => {

    console.log("");
    console.log("==========================================");
    console.log("Developer Announcement Recommender");
    console.log("==========================================");

    const prNumber = github.event.pull_request.number;

    //--------------------------------------------------
    // Get PR
    //--------------------------------------------------

    const pr = await github.getPullRequest(prNumber);

    if (pr.draft) {

        console.log("Draft PR detected.");
        console.log("Skipping analysis.");

        return;

    }

    //--------------------------------------------------
    // Get Files
    //--------------------------------------------------

    const files = await github.getFiles(prNumber);

    console.log(`Analyzing PR #${prNumber}`);
    console.log(`Files changed: ${files.length}`);

    //--------------------------------------------------
    // Run Detector
    //--------------------------------------------------

    const result = detect(pr, files);

    console.log("");

    console.log("Recommendation:");

    console.log(
        result.recommendation
            ? "Recommend Announcement"
            : "No Recommendation"
    );

    console.log("");

    if (result.signals.length) {

        console.log("Detected Signals:");

        result.signals.forEach(signal => {

            console.log(` - ${signal.name}`);

        });

    }

    //--------------------------------------------------
    // Publish Comment
    //--------------------------------------------------

    try {

        await publish(
            prNumber,
            result
        );

    } catch (error) {

        // The token is read-only for PRs from forks and bots, so commenting is best effort
        console.warn(`::warning::Could not publish analyzer comment: ${error.message}`);

    }

    console.log("");
    console.log("Finished.");
    console.log("");

})();
