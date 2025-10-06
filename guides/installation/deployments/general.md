---
nav:
  title: General
  position: 1

---

# General

There are various ways to deploy Shopware. The best way depends on your infrastructure and requirements. Here are some general recommendations:

- Use a version control system (e.g., Git) to manage your codebase.
- Automate your deployment process using CI/CD tools (e.g., GitHub Actions, GitLab CI, Jenkins).
- Use environment variables to manage configuration settings for different environments (e.g., development, staging, production) in a `.env.local` file or real environment variables.
- Implement proper logging and monitoring to track the performance and health of your application.
- Regularly back up your database and important files.

## Strong CPU

For the server setup, pay special attention to CPU speed. This applies to all servers (app, SQL, Elasticsearch, Redis). Usually, it is more optimal to choose a slightly stronger CPU. This has to be determined more precisely depending on the project and load. Experience has shown that systems with powerful CPUs finish processes faster and can release resources sooner.

## Health Check

Use the Shopware-provided Health Check API (`/api/_info/health-check`) to monitor the health of your Shopware app server. It responds with HTTP status `200` when the Shopware Application is working and `50x` when it is not.
For Docker, you can use: `HEALTHCHECK CMD curl --fail http://localhost/api/_info/health-check || exit 1`


## Next steps

<PageRef page="./cluster-setup" />