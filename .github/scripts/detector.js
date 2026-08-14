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

    // Search only PR title and description
    const searchableText = [
        pr.title || "",
        pr.body || ""
    ].join("\n");

    for (const rule of RULES) {

        let matched = false;

        // --------------------------------------------------
        // Check each changed file individually
        // --------------------------------------------------

        for (const file of files) {

            let ruleMatches = true;

            // ----------------------------------------------
            // 1. File Status
            // ----------------------------------------------

            if (rule.detect.status) {

                if (!rule.detect.status.includes(file.status)) {
                    ruleMatches = false;
                }

            }

            // ----------------------------------------------
            // 2. File Path
            // ----------------------------------------------

            if (ruleMatches && rule.detect.paths) {

                const pathMatched = rule.detect.paths.some(regex =>
                    regex.test(file.filename)
                );

                if (!pathMatched) {
                    ruleMatches = false;
                }

            }

            // ----------------------------------------------
            // 3. Keywords (PR title + description only)
            // ----------------------------------------------

            if (ruleMatches && rule.detect.keywords) {

                const keywordMatched = rule.detect.keywords.some(regex =>
                    regex.test(searchableText)
                );

                if (!keywordMatched) {
                    ruleMatches = false;
                }

            }

            // ----------------------------------------------
            // Rule matched
            // ----------------------------------------------

            if (ruleMatches) {

                matched = true;
                break;

            }

        }

        // ----------------------------------------------
        // Save detected signal
        // ----------------------------------------------

        if (matched) {

            detectedSignals.push({
                id: rule.id,
                name: rule.name,
                description: rule.description,
                priority: rule.priority
            });

        }

    }

    // --------------------------------------------------
    // Recommendation
    // --------------------------------------------------

    const recommendation = detectedSignals.some(
        signal => signal.priority === "high"
    );

    return {

        recommendation,

        signals: detectedSignals

    };

}

module.exports = detect;
