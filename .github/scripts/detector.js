
const RULES = require("./rules");

/**
 * Run announcement rules against a pull request.
 *
 * High-confidence match:
 *   file status + file path + PR title/body keywords
 *
 * Manual review:
 *   file status + file path match, but keywords do not
 *
 * This detector does not inspect file contents or the PR diff.
 *
 * @param {Object} pr
 * @param {Array} files
 * @returns {{
 *   recommendation: boolean,
 *   manualReview: boolean,
 *   signals: Array,
 *   reviewSignals: Array
 * }}
 */
function detect(pr, files) {
    const signals = [];
    const reviewSignals = [];

    const searchableText = [
        pr.title || "",
        pr.body || ""
    ].join("\n");

    for (const rule of RULES) {
        const config = rule.detect || {};

        const matchingFiles = files.filter(file => {
            if (
                config.status &&
                !config.status.includes(file.status)
            ) {
                return false;
            }

            if (
                config.paths &&
                !config.paths.some(regex => regex.test(file.filename))
            ) {
                return false;
            }

            return true;
        });

        if (matchingFiles.length === 0) {
            continue;
        }

        const keywordMatched = !config.keywords ||
            config.keywords.some(regex => regex.test(searchableText));

        const signal = {
            id: rule.id,
            name: rule.name,
            description: rule.description,
            priority: rule.priority,
            matchingFiles: matchingFiles.map(file => file.filename)
        };

        if (keywordMatched) {
            signals.push(signal);
        } else {
            reviewSignals.push({
                ...signal,
                reason:
                    "The changed file path matches this category, " +
                    "but the PR title/body does not provide enough " +
                    "keyword evidence for an automatic recommendation."
            });
        }
    }

    const recommendation = signals.some(
    signal => signal.priority === "high"
);

const manualReview =
    reviewSignals.length > 0 ||
    signals.some(signal => signal.priority === "medium");

return {
    recommendation,
    manualReview,
    signals,
    reviewSignals
};
}

module.exports = detect;