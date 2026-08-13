const fs = require("fs");

const token = process.env.GITHUB_TOKEN;

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

async function get(url) {

    const response = await fetch(url, {
        headers
    });

    if (!response.ok) {
        throw new Error(
            `GET ${url} failed (${response.status})`
        );
    }

    return response.json();
}

async function post(url, body) {

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {

        throw new Error(
            `POST ${url} failed (${response.status})`
        );

    }

    return response.json();

}

async function patch(url, body) {

    const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {

        throw new Error(
            `PATCH ${url} failed (${response.status})`
        );

    }

    return response.json();

}

// ======================================================
// Pull Request
// ======================================================

async function getPullRequest(number) {

    return get(
        `${API}/pulls/${number}`
    );

}

async function getFiles(number) {

    return get(
        `${API}/pulls/${number}/files?per_page=100`
    );

}

async function getComments(number) {

    return get(
        `${API}/issues/${number}/comments`
    );

}

async function createComment(number, body) {

    return post(
        `${API}/issues/${number}/comments`,
        {
            body
        }
    );

}

async function updateComment(commentId, body) {

    return patch(
        `${API}/issues/comments/${commentId}`,
        {
            body
        }
    );

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

    updateComment

};
