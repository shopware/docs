"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    parseMilestoneTag,
    BOT_LOGIN,
    markerFor,
    commentFor,
    isAnnouncement,
    createApi,
    run,
} = require("./milestone-release-sync");

const SOURCE = "shopware/shopware";
const quiet = () => {};

const byBot = body => ({ user: { login: BOT_LOGIN }, body });
const byUser = body => ({ user: { login: "some-contributor" }, body });

// ---------------------------------------------------------------------------
// parseMilestoneTag
// ---------------------------------------------------------------------------

test("parseMilestoneTag normalizes the real milestone titles in the repo", () => {
    assert.equal(parseMilestoneTag("v6.7.17.0"), "v6.7.17.0");
    assert.equal(parseMilestoneTag("6.7.16.0"), "v6.7.16.0");
    assert.equal(parseMilestoneTag("6.7.13.0 "), "v6.7.13.0"); // trailing space exists
    assert.equal(parseMilestoneTag(" v6.6.10.0"), "v6.6.10.0");
});

test("parseMilestoneTag refuses everything that is not a four part version", () => {
    for (const title of [
        "App Guides",
        "Frontend Migration",
        "6.7.17",
        "v6.7",
        "6.7.17.0.1",
        "v6.7.17.0-rc1",
        "6.7.x.0",
        "",
        null,
        undefined,
    ]) {
        assert.equal(parseMilestoneTag(title), null, String(title));
    }
});

// ---------------------------------------------------------------------------
// run(): decisions
// ---------------------------------------------------------------------------

function fakeApi({ pulls, releases, comments = {}, failOn = {} }) {
    const writes = [];
    const maybeFail = key => {
        if (failOn[key]) {
            throw new Error(`boom ${key}`);
        }
    };

    return {
        writes,
        async listOpenPulls() {
            return pulls;
        },
        async getRelease(tag) {
            maybeFail(`release:${tag}`);
            const released = releases[tag] === true;
            return { released, reason: released ? "published" : "no release" };
        },
        async listComments(number) {
            maybeFail(`comments:${number}`);
            return comments[number] || [];
        },
        async addLabel(number, name) {
            maybeFail(`add:${number}`);
            writes.push(["addLabel", number, name]);
        },
        async removeLabel(number, name) {
            maybeFail(`remove:${number}`);
            writes.push(["removeLabel", number, name]);
        },
        async createComment(number, body) {
            maybeFail(`comment:${number}`);
            writes.push(["createComment", number, body]);
        },
    };
}

const pr = (number, milestone, labels = [], draft = false) => ({
    number,
    draft,
    milestone: milestone === null ? null : { title: milestone },
    labels: labels.map(name => ({ name })),
});

test("release not published: Blocked is added when missing", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0"), pr(2, "v6.7.17.0", ["Blocked"])],
        releases: { "v6.7.17.0": false },
    });

    const { errors } = await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(errors, []);
    assert.deepEqual(api.writes, [["addLabel", 1, "Blocked"]]);
});

test("release published: Blocked is removed, then the comment is posted", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0", ["Blocked", "Improvement"])],
        releases: { "v6.7.17.0": true },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes.map(w => w[0]), ["removeLabel", "createComment"]);
    assert.equal(api.writes[0][2], "Blocked");
    assert.match(api.writes[1][2], /The feature is ready to be merged @Isengo1989 @sushmangupta @bojanrajh/);
    assert.ok(api.writes[1][2].includes(markerFor("v6.7.17.0")));
});

test("release published: no Blocked label means only the comment", async () => {
    const api = fakeApi({
        pulls: [pr(1, "6.7.17.0")],
        releases: { "v6.7.17.0": true },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes.map(w => w[0]), ["createComment"]);
});

test("running twice does not comment twice", async () => {
    const comments = {};
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0", ["Blocked"])],
        releases: { "v6.7.17.0": true },
        comments,
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    // The second run sees the comment from the first run.
    comments[1] = [byBot(api.writes.find(w => w[0] === "createComment")[2])];
    api.writes.length = 0;

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes, []);
});

test("after the announcement a manually added Blocked label is left alone", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0", ["Blocked"])],
        releases: { "v6.7.17.0": true },
        comments: { 1: [byBot(`${markerFor("v6.7.17.0")}\nready`)] },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes, []);
});

test("a marker posted by a user cannot suppress the announcement", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0", ["Blocked"])],
        releases: { "v6.7.17.0": true },
        comments: { 1: [byUser(markerFor("v6.7.17.0"))] },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes.map(w => w[0]), ["removeLabel", "createComment"]);
});

test("isAnnouncement needs the bot author and the marker of the same tag", () => {
    const marker = markerFor("v6.7.17.0");

    assert.equal(isAnnouncement(byBot(marker), "v6.7.17.0"), true);
    assert.equal(isAnnouncement(byUser(marker), "v6.7.17.0"), false);
    assert.equal(isAnnouncement(byBot(marker), "v6.7.16.0"), false);
    assert.equal(isAnnouncement(byBot("no marker here"), "v6.7.17.0"), false);
    assert.equal(isAnnouncement({ body: marker }, "v6.7.17.0"), false); // no author
    assert.equal(isAnnouncement({ user: null, body: marker }, "v6.7.17.0"), false); // deleted account
    assert.equal(isAnnouncement({ user: { login: BOT_LOGIN }, body: null }, "v6.7.17.0"), false);
    // Looks like the bot, but is not the exact login.
    assert.equal(
        isAnnouncement({ user: { login: "github-actions" }, body: marker }, "v6.7.17.0"),
        false
    );
});

test("a marker for another version does not count", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0")],
        releases: { "v6.7.17.0": true },
        comments: { 1: [byBot(`${markerFor("v6.7.16.0")}\nready`)] },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes.map(w => w[0]), ["createComment"]);
});

test("a PR in an old released milestone is never re-blocked", async () => {
    // The old workflow compared against the latest release and re-added
    // Blocked here once a newer release was out.
    const api = fakeApi({
        pulls: [pr(1, "6.7.16.0")],
        releases: { "v6.7.16.0": true, "v6.7.17.0": true },
        comments: { 1: [byBot(markerFor("v6.7.16.0"))] },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes, []);
});

test("an old released milestone that was never announced is announced", async () => {
    const api = fakeApi({
        pulls: [pr(1, "6.7.16.0", ["Blocked"])],
        releases: { "v6.7.16.0": true, "v6.7.17.0": true },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes.map(w => w[0]), ["removeLabel", "createComment"]);
});

test("drafts, no milestone and non-version milestones are never touched", async () => {
    const api = fakeApi({
        pulls: [
            pr(1, "v6.7.17.0", [], true),
            pr(2, null),
            pr(3, "App Guides"),
            pr(4, "6.7.17"),
        ],
        releases: {},
    });

    const { results } = await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes, []);
    assert.deepEqual(results.map(r => r.number), [1, 3, 4]);
});

test("dry run writes nothing but reports what would happen", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0"), pr(2, "v6.7.16.0", ["Blocked"])],
        releases: { "v6.7.17.0": false, "v6.7.16.0": true },
    });

    const { results } = await run({ api, dryRun: true, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes, []);
    assert.deepEqual(
        results.map(r => r.action),
        ["would add label", "would remove label", "would comment"]
    );
});

test("a failed release lookup aborts before anything is written", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0"), pr(2, "v6.7.16.0", ["Blocked"])],
        releases: { "v6.7.16.0": true },
        failOn: { "release:v6.7.17.0": true },
    });

    await assert.rejects(
        run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet }),
        /boom release:v6.7.17.0/
    );
    assert.deepEqual(api.writes, []);
});

test("one failing PR is reported and does not stop the others", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0"), pr(2, "v6.7.17.0")],
        releases: { "v6.7.17.0": false },
        failOn: { "add:1": true },
    });

    const { errors } = await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.equal(errors.length, 1);
    assert.equal(errors[0].number, 1);
    assert.deepEqual(api.writes, [["addLabel", 2, "Blocked"]]);
});

test("a failed label removal posts no comment, so the next run retries both", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0", ["Blocked"])],
        releases: { "v6.7.17.0": true },
        failOn: { "remove:1": true },
    });

    const { errors } = await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.equal(errors.length, 1);
    assert.deepEqual(api.writes, []);
});

test("label names are matched case-insensitively", async () => {
    const api = fakeApi({
        pulls: [pr(1, "v6.7.17.0", ["blocked"])],
        releases: { "v6.7.17.0": false },
    });

    await run({ api, dryRun: false, sourceRepo: SOURCE, log: quiet });

    assert.deepEqual(api.writes, []);
});

test("the comment links to the release", () => {
    assert.match(
        commentFor("v6.7.17.0", SOURCE),
        /https:\/\/github\.com\/shopware\/shopware\/releases\/tag\/v6\.7\.17\.0/
    );
});

// ---------------------------------------------------------------------------
// createApi(): HTTP behaviour
// ---------------------------------------------------------------------------

function response(status, body, headers = {}) {
    return {
        status,
        ok: status >= 200 && status < 300,
        headers: { get: name => headers[name.toLowerCase()] || null },
        json: async () => body,
        text: async () => JSON.stringify(body),
    };
}

function apiWith(handler) {
    const calls = [];
    const fetchImpl = async (url, options) => {
        calls.push({ url, method: options.method });
        return handler(url, options);
    };

    return {
        calls,
        api: createApi({
            token: "t",
            docsRepo: "shopware/docs",
            sourceRepo: SOURCE,
            fetchImpl,
        }),
    };
}

const release = overrides => ({
    tag_name: "v6.7.17.0",
    draft: false,
    prerelease: false,
    published_at: "2026-12-01T09:00:00Z",
    ...overrides,
});

test("getRelease: 200 with a published release is released", async () => {
    const { api } = apiWith(() => response(200, release()));

    assert.equal((await api.getRelease("v6.7.17.0")).released, true);
});

test("getRelease: 404 is not released", async () => {
    const { api, calls } = apiWith(() => response(404, { message: "Not Found" }));

    assert.equal((await api.getRelease("v6.7.17.0")).released, false);
    assert.match(calls[0].url, /repos\/shopware\/shopware\/releases\/tags\/v6\.7\.17\.0$/);
});

test("getRelease: drafts and prereleases are not released", async () => {
    for (const overrides of [
        { draft: true },
        { prerelease: true },
        { published_at: null },
    ]) {
        const { api } = apiWith(() => response(200, release(overrides)));

        assert.equal((await api.getRelease("v6.7.17.0")).released, false);
    }
});

test("getRelease: a different tag in the answer is an error", async () => {
    const { api } = apiWith(() => response(200, release({ tag_name: "v6.7.16.0" })));

    await assert.rejects(api.getRelease("v6.7.17.0"), /expected "v6.7.17.0"/);
});

test("getRelease: rate limit, permission and server errors throw instead of meaning 'not released'", async () => {
    for (const status of [401, 403, 429, 500, 502, 503]) {
        const { api } = apiWith(() => response(status, { message: "nope" }));

        await assert.rejects(api.getRelease("v6.7.17.0"), new RegExp(`\\(${status}\\)`));
    }
});

test("lists follow the Link header across pages", async () => {
    const { api, calls } = apiWith(url => {
        if (url.endsWith("page=2")) {
            return response(200, [{ number: 3 }]);
        }

        return response(200, [{ number: 1 }, { number: 2 }], {
            link: '<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=2>; rel="last"',
        });
    });

    const comments = await api.listComments(5);

    assert.deepEqual(comments.map(c => c.number), [1, 2, 3]);
    assert.equal(calls.length, 2);
});

test("lists throw when the request fails", async () => {
    const { api } = apiWith(() => response(403, { message: "Resource not accessible" }));

    await assert.rejects(api.listOpenPulls(), /\(403\)/);
});

test("removeLabel tolerates 404 but nothing else", async () => {
    const gone = apiWith(() => response(404, {}));
    await gone.api.removeLabel(1, "Blocked");

    const denied = apiWith(() => response(403, {}));
    await assert.rejects(denied.api.removeLabel(1, "Blocked"), /\(403\)/);
});

test("addLabel and createComment throw on failure", async () => {
    const { api } = apiWith(() => response(403, { message: "denied" }));

    await assert.rejects(api.addLabel(1, "Blocked"), /\(403\)/);
    await assert.rejects(api.createComment(1, "x"), /\(403\)/);
});
