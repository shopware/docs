
const fs = require("fs");

const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("GITHUB_TOKEN is not set.");
}

const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
);

const owner = event.repository.owner.login;
const repo = event.repository.name;

const API = `https://api.github.com/repos/${owner}/${repo}`;

const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
};

// ======================================================
// Generic HTTP
// ======================================================

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const details = await response.text();

        throw new Error(
            `${options.method || "GET"} ${url} failed ` +
            `(${response.status}): ${details}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function get(url) {
    return request(url);
}

async function post(url, body) {
    return request(url, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

async function patch(url, body) {
    return request(url, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}

// ======================================================
// Pull Request
// ======================================================

async function getPullRequest(number) {
    return get(`${API}/pulls/${number}`);
}

async function getFiles(number) {
    return get(`${API}/pulls/${number}/files?per_page=100`);
}

// ======================================================
// Comments
// ======================================================

async function getComments(number) {
    return get(`${API}/issues/${number}/comments?per_page=100`);
}

async function createComment(number, body) {
    return post(`${API}/issues/${number}/comments`, { body });
}

async function updateComment(commentId, body) {
    return patch(`${API}/issues/comments/${commentId}`, { body });
}

// ======================================================
// Labels
// ======================================================

async function getLabels(number) {
    return get(`${API}/issues/${number}/labels?per_page=100`);
}

/**
 * Add a label only if it is not already present.
 *
 * @returns {{ added: boolean, alreadyPresent: boolean }}
 */
async function ensureLabel(number, labelName) {
    const labels = await getLabels(number);

    const alreadyPresent = labels.some(
        label => label.name.toLowerCase() === labelName.toLowerCase()
    );

    if (alreadyPresent) {
        console.log(`Label "${labelName}" is already present.`);

        return {
            added: false,
            alreadyPresent: true
        };
    }

    await post(`${API}/issues/${number}/labels`, {
        labels: [labelName]
    });

    console.log(`Added label "${labelName}".`);

    return {
        added: true,
        alreadyPresent: false
    };
}

// ======================================================

module.exports = {
    owner,
    repo,
    event,
    getPullRequest,
    getFiles,
    getComments,
    createComment,
    updateComment,
    getLabels,
    ensureLabel
};