"use strict";

/**
 * Keeps docs PRs in sync with the Shopware release their milestone refers to.
 *
 * A docs PR carries a milestone such as "v6.7.17.0". That milestone names the
 * shopware/shopware release the documented feature ships in. Until this
 * release is published, the PR must not be merged.
 *
 * For every open, non-draft PR with a version milestone:
 *
 *   - Release NOT published: make sure the "Blocked" label is set.
 *   - Release published:     remove "Blocked" and post a single
 *                            "ready to be merged" comment.
 *
 * Design rules, because this must never act on a guess:
 *
 *   1. "Released" means: a published, non-draft, non-prerelease GitHub release
 *      exists for exactly that tag. "releases/latest" is not used, since it
 *      does not follow the newest release (LTS patch releases, drafts that are
 *      created long before they are published).
 *   2. Any answer other than "200 release" or "404 not found" aborts the run
 *      before anything is written.
 *   3. Every write is idempotent. The comment carries a hidden marker with the
 *      tag, so re-running never posts twice. Label removal and the comment
 *      only happen while that marker is missing, so a person who re-adds
 *      "Blocked" afterwards is not overruled.
 *   4. Failures make the job fail. Nothing is swallowed.
 *
 * Run locally (read-only, nothing is written):
 *
 *   GITHUB_TOKEN=$(gh auth token) GITHUB_REPOSITORY=shopware/docs DRY_RUN=true \
 *     node .github/scripts/milestone-release-sync.js
 *
 * Unit tests:
 *
 *   node --test .github/scripts/milestone-release-sync.test.js
 */

const BLOCKED_LABEL = "Blocked";
// Author of comments created with the workflow's GITHUB_TOKEN. Accounts that
// end in "[bot]" cannot be registered by users, so nobody can impersonate it.
const BOT_LOGIN = "github-actions[bot]";
const MENTIONS = "@Isengo1989 @sushmangupta @bojanrajh";
const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

/**
 * "v6.7.17.0", "6.7.17.0" and " 6.7.17.0 " all become "v6.7.17.0".
 * Anything that is not a four part version returns null and is left alone.
 */
function parseMilestoneTag(title) {
    if (typeof title !== "string") {
        return null;
    }

    const match = VERSION_PATTERN.exec(title.trim());

    return match ? `v${match[1]}.${match[2]}.${match[3]}.${match[4]}` : null;
}

function markerFor(tag) {
    return `<!-- docs-milestone-release:${tag} -->`;
}

function commentFor(tag, sourceRepo) {
    return [
        markerFor(tag),
        `The feature is ready to be merged ${MENTIONS}`,
        "",
        `[${tag}](https://github.com/${sourceRepo}/releases/tag/${tag}) is released.`,
    ].join("\n");
}

/**
 * True only for a comment this workflow wrote. The marker alone is not enough:
 * it is predictable, and anyone who can comment could post it to keep the
 * announcement from ever being made.
 */
function isAnnouncement(comment, tag) {
    return (
        comment.user?.login === BOT_LOGIN &&
        typeof comment.body === "string" &&
        comment.body.includes(markerFor(tag))
    );
}

function hasLabel(pr, name) {
    return (pr.labels || []).some(
        label => label.name.toLowerCase() === name.toLowerCase()
    );
}

/**
 * Looks at every open PR and applies the rules above.
 *
 * @param {object}   options
 * @param {object}   options.api         See createApi().
 * @param {boolean}  options.dryRun      Log what would happen, write nothing.
 * @param {string}   options.sourceRepo  Repository the releases come from.
 * @param {Function} options.log
 * @returns {Promise<{results: object[], errors: object[]}>}
 */
async function run({ api, dryRun, sourceRepo, log = console.log }) {
    const results = [];
    const errors = [];

    const record = (pr, action, detail) => {
        results.push({ number: pr.number, action, detail });
        log(`#${pr.number} ${action}: ${detail}`);
    };

    const pulls = await api.listOpenPulls();
    const candidates = [];

    for (const pr of pulls) {
        if (!pr.milestone) {
            continue;
        }

        if (pr.draft) {
            record(pr, "skipped", `draft (milestone ${pr.milestone.title})`);
            continue;
        }

        const tag = parseMilestoneTag(pr.milestone.title);

        if (!tag) {
            record(
                pr,
                "skipped",
                `milestone "${pr.milestone.title}" is not a version`
            );
            continue;
        }

        candidates.push({ pr, tag });
    }

    // Look up every release first. If one lookup fails, nothing is written.
    const released = new Map();

    for (const tag of new Set(candidates.map(candidate => candidate.tag))) {
        const state = await api.getRelease(tag);
        released.set(tag, state);
        log(`${tag}: ${state.released ? "released" : "not released"} (${state.reason})`);
    }

    for (const { pr, tag } of candidates) {
        try {
            if (!released.get(tag).released) {
                if (hasLabel(pr, BLOCKED_LABEL)) {
                    record(pr, "unchanged", `${tag} not released, already ${BLOCKED_LABEL}`);
                    continue;
                }

                if (!dryRun) {
                    await api.addLabel(pr.number, BLOCKED_LABEL);
                }

                record(
                    pr,
                    dryRun ? "would add label" : "added label",
                    `${BLOCKED_LABEL} (${tag} not released)`
                );
                continue;
            }

            const comments = await api.listComments(pr.number);

            if (comments.some(comment => isAnnouncement(comment, tag))) {
                record(pr, "unchanged", `${tag} released, already announced`);
                continue;
            }

            // The label goes first. If the comment fails afterwards, the next
            // run still sees no marker and posts it. The other way round, a
            // failed label removal would be skipped for good.
            if (hasLabel(pr, BLOCKED_LABEL)) {
                if (!dryRun) {
                    await api.removeLabel(pr.number, BLOCKED_LABEL);
                }

                record(
                    pr,
                    dryRun ? "would remove label" : "removed label",
                    `${BLOCKED_LABEL} (${tag} released)`
                );
            }

            if (!dryRun) {
                await api.createComment(pr.number, commentFor(tag, sourceRepo));
            }

            record(
                pr,
                dryRun ? "would comment" : "commented",
                `${tag} released`
            );
        } catch (error) {
            errors.push({ number: pr.number, message: error.message });
            log(`#${pr.number} FAILED: ${error.message}`);
        }
    }

    return { results, errors };
}

/**
 * Thin GitHub client. It throws on every unexpected status instead of
 * returning an empty value, so that a rate limit or a permission problem can
 * never be mistaken for "not released" or "no comments".
 */
function createApi({ token, docsRepo, sourceRepo, fetchImpl = fetch }) {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    };

    const docsApi = `https://api.github.com/repos/${docsRepo}`;
    const sourceApi = `https://api.github.com/repos/${sourceRepo}`;

    async function call(method, url, body) {
        const response = await fetchImpl(url, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        return response;
    }

    async function fail(method, url, response) {
        const details = await response.text();

        throw new Error(`${method} ${url} failed (${response.status}): ${details}`);
    }

    async function paginate(url) {
        const items = [];
        let next = url;

        while (next) {
            const response = await call("GET", next);

            if (!response.ok) {
                await fail("GET", next, response);
            }

            const page = await response.json();

            if (!Array.isArray(page)) {
                throw new Error(`GET ${next} did not return a list`);
            }

            items.push(...page);

            const link = response.headers.get("link") || "";
            const match = /<([^>]+)>;\s*rel="next"/.exec(link);

            next = match ? match[1] : null;
        }

        return items;
    }

    return {
        listOpenPulls: () => paginate(`${docsApi}/pulls?state=open&per_page=100`),

        listComments: number =>
            paginate(`${docsApi}/issues/${number}/comments?per_page=100`),

        async getRelease(tag) {
            const url = `${sourceApi}/releases/tags/${encodeURIComponent(tag)}`;
            const response = await call("GET", url);

            if (response.status === 404) {
                return { released: false, reason: "no release for this tag" };
            }

            if (!response.ok) {
                await fail("GET", url, response);
            }

            const release = await response.json();

            if (release.tag_name !== tag) {
                throw new Error(
                    `GET ${url} returned tag "${release.tag_name}", expected "${tag}"`
                );
            }

            if (release.draft || release.prerelease || !release.published_at) {
                return {
                    released: false,
                    reason: "release exists but is a draft or prerelease",
                };
            }

            return { released: true, reason: `published ${release.published_at}` };
        },

        async addLabel(number, name) {
            const url = `${docsApi}/issues/${number}/labels`;
            const response = await call("POST", url, { labels: [name] });

            if (!response.ok) {
                await fail("POST", url, response);
            }
        },

        async removeLabel(number, name) {
            const url = `${docsApi}/issues/${number}/labels/${encodeURIComponent(name)}`;
            const response = await call("DELETE", url);

            // 404 means the label is already gone, which is the goal.
            if (!response.ok && response.status !== 404) {
                await fail("DELETE", url, response);
            }
        },

        async createComment(number, body) {
            const url = `${docsApi}/issues/${number}/comments`;
            const response = await call("POST", url, { body });

            if (!response.ok) {
                await fail("POST", url, response);
            }
        },
    };
}

function summaryMarkdown(dryRun, results, errors) {
    const lines = [
        `## Milestone sync${dryRun ? " (dry run, nothing was changed)" : ""}`,
        "",
        "| PR | Action | Detail |",
        "| --- | --- | --- |",
        ...results.map(r => `| #${r.number} | ${r.action} | ${r.detail} |`),
        ...errors.map(e => `| #${e.number} | FAILED | ${e.message.replace(/\|/g, "\\|")} |`),
    ];

    return lines.join("\n") + "\n";
}

async function main() {
    const fs = require("fs");

    const token = process.env.GITHUB_TOKEN;
    const docsRepo = process.env.GITHUB_REPOSITORY;
    const sourceRepo = process.env.SOURCE_REPOSITORY || "shopware/shopware";
    const dryRun = process.env.DRY_RUN === "true";

    if (!token) {
        throw new Error("GITHUB_TOKEN is not set.");
    }

    if (!docsRepo) {
        throw new Error("GITHUB_REPOSITORY is not set.");
    }

    console.log(`Docs repository:   ${docsRepo}`);
    console.log(`Release source:    ${sourceRepo}`);
    console.log(`Mode:              ${dryRun ? "DRY RUN" : "live"}`);
    console.log("");

    const api = createApi({ token, docsRepo, sourceRepo });
    const { results, errors } = await run({ api, dryRun, sourceRepo });

    if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(
            process.env.GITHUB_STEP_SUMMARY,
            summaryMarkdown(dryRun, results, errors)
        );
    }

    if (errors.length > 0) {
        throw new Error(`${errors.length} pull request(s) failed, see the log above.`);
    }
}

module.exports = {
    BOT_LOGIN,
    parseMilestoneTag,
    markerFor,
    commentFor,
    isAnnouncement,
    createApi,
    run,
};

if (require.main === module) {
    main().catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
}
