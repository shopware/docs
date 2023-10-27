const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function createCheck() {

    try {
        const createCheckResponse = await octokit.checks.create({
            owner: process.env.GITHUB_REPOSITORY_OWNER,
            repo: 'docs',
            name: 'DevHub',
            head_sha: process.env.GITHUB_SHA,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            output: {
                title: 'Developer Portal healthcheck',
                summary: 'Building the project in DevHub (Developer Portal)',
            },
        });

        console.log(createCheckResponse.data.id);
    } catch (error) {
        console.error("Error triggering workflow:", error.message, error);
    }
}

createCheck();