---
nav:
  title: Deployments
  position: 3

---

# Deployments

Deploy with the same artifacts you built in CI, keep configuration outside the codebase, and make database changes predictable. Separate build from runtime wherever possible so releases stay repeatable and reversible.

## Cross-cutting practices

- Roll forward by default; keep rollbacks minimal (DB-aware and version-pinned) and practice them.
- Use maintenance mode for schema-changing releases; add health checks and smoke tests post-deploy before exiting maintenance.
- Tag releases consistently across code, artifacts, and Store metadata; keep build logs and deploy reports for audits.

## Custom projects

- Follow the deployment helper flow ([Deployment helper](../hosting/installation-updates/deployments/deployment-helper.md)) to keep steps ordered and reversible.
- Use a repeatable deploy strategy (e.g. via the [Deployment helper](../hosting/installation-updates/deployments/deployment-helper.md)); keep environment config and secrets outside the repo.

## Custom/Store plugins

- Ship plugins as versioned ZIPs from CI ([Extension build command](../../products/cli/extension-commands/build.md)); install/activate via CLI or deployment automation.
- Apply plugin migrations during deploy and keep update steps idempotent so retries are safe.
- For Store plugins, avoid post-deploy manual tweaks.

## Apps

- Deploy app backends like any web service; use blue/green or canary so webhook handling is uninterrupted.
- Keep manifest versions in sync with deployed code; register new webhooks before emitting new events to avoid gaps.
- Externalize credentials and endpoints; design for multi-tenant hosting and retry-safe handlers.