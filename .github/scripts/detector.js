const RULES = require("./rules");

/**
 * Run all announcement rules against a PR
 *
 * @param {Object} pr
 * @param {Array} files
 * @returns {{
 *   recommendation: boolean,
 *   signals: Array
 * }}
 */
function detect(pr, files) {

    const detectedSignals = [];

    // Searchable text (used only if a rule defines keywords)
    const searchableText = [
        pr.title || "",
        pr.body || ""
    ].join("\n");

    //--------------------------------------------------
    // Evaluate each rule
    //--------------------------------------------------

    for (const rule of RULES) {

        let matched = false;

        //--------------------------------------------------
        // Check each changed file
        //--------------------------------------------------

        for (const file of files) {

            let ruleMatches = true;

            //--------------------------------------------------
            // File Status
            //--------------------------------------------------

            if (rule.detect.status) {

                if (!rule.detect.status.includes(file.status)) {
                    ruleMatches = false;
                }

            }

            //--------------------------------------------------
            // File Path
            //--------------------------------------------------

            if (ruleMatches && rule.detect.paths) {

                const pathMatched = rule.detect.paths.some(regex =>
                    regex.test(file.filename)
                );

                if (!pathMatched) {
                    ruleMatches = false;
                }

            }

            //--------------------------------------------------
            // Keywords (Optional)
            //--------------------------------------------------

            if (ruleMatches && rule.detect.keywords) {

                const keywordMatched = rule.detect.keywords.some(regex =>
                    regex.test(searchableText)
                );

                if (!keywordMatched) {
                    ruleMatches = false;
                }

            }

            //--------------------------------------------------
            // Rule matched
            //--------------------------------------------------

            if (ruleMatches) {

                matched = true;
                break;

            }

        }

        //--------------------------------------------------
        // Store matched rule
        //--------------------------------------------------

        if (matched) {

            detectedSignals.push({
                id: rule.id,
                name: rule.name,
                description: rule.description,
                priority: rule.priority
            });

        }

    }

    //--------------------------------------------------
    // Recommend only if a HIGH priority rule matched
    //--------------------------------------------------

    const recommendation = detectedSignals.some(
        signal => signal.priority === "high"
    );

    return {
        recommendation,
        signals: detectedSignals
    };

}

module.exports = detect;
