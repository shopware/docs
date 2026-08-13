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

    // Build searchable text once
    const searchableText = [
        pr.title || "",
        pr.body || "",
        ...files.map(f => f.patch || "")
    ].join("\n");

    for (const rule of RULES) {

        let matched = false;

        //--------------------------------------------------
        // 1. File Status
        //--------------------------------------------------

        if (!matched && rule.detect.status) {

            matched = files.some(file =>
                rule.detect.status.includes(file.status)
            );

        }

        //--------------------------------------------------
        // 2. File Paths
        //--------------------------------------------------

        if (!matched && rule.detect.paths) {

            matched = files.some(file =>
                rule.detect.paths.some(regex =>
                    regex.test(file.filename)
                )
            );

        }

        //--------------------------------------------------
        // 3. Keywords
        //--------------------------------------------------

        if (!matched && rule.detect.keywords) {

            matched = rule.detect.keywords.some(regex =>
                regex.test(searchableText)
            );

        }

        //--------------------------------------------------
        // Rule matched
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
    // Recommendation
    //--------------------------------------------------

    const recommendation = detectedSignals.length > 0;

    return {

        recommendation,

        signals: detectedSignals

    };

}

module.exports = detect;
