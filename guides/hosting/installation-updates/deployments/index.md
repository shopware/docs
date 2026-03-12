---
nav:
  title: Deployments
  position: 10

---

# Deployments

The following guides outline the core principles and practical steps for deploying Shopware 6 to your infrastructure. They also explain how to build assets for the Administration and Storefront independently of a database, enabling reliable CI/CD pipelines and repeatable releases.

## Best practices

Successful deployments are predictable, repeatable, and reversible:

- Build artifacts once in CI and deploy those artifacts.
- Keep configuration and secrets outside the codebase.
- Make database changes predictable.
- Wherever possible, clearly separate build-time concerns from runtime concerns to ensure consistency across environments.

## Cross-cutting practices

Across project types and deployment models, apply the following principles to maintain a stable foundation:

- Roll forward by default.
- Keep rollbacks minimal, database-aware, and version-pinned, and rehearse them regularly.
- Enable maintenance mode for schema-changing releases; to validate the system state, add health checks and smoke tests post-deploy before exiting maintenance.
- Tag releases consistently across source code, build artifacts, and Store metadata.
- Retain build logs and deployment reports for traceability and audits.

## Custom projects

Apply this approach to keep deployments deterministic and reduce environment-specific drift:

- Follow the structured flow provided by the [Deployment helper](deployment-helper.md) to keep steps ordered and reversible.
- Adopt a repeatable deployment strategy (for example, by integrating the [Deployment helper](deployment-helper.md) into your automation pipeline) and keep environment configuration and secrets outside the repository.

## Custom/Store plugins

Treat plugins as versioned deliverables that integrate cleanly into your deployment workflow (for example via the [Deployment helper](deployment-helper.md)):

- Manage extensions via Composer whenever possible. Composer ensures versioned, reproducible installs during deployment.
- For Store submission or custom distribution workflows, build versioned ZIP artifacts from CI using the [Extension build command](../../../../products/cli/extension-commands/build.md). Install and activate them via CLI or deployment automation.
- Execute plugin migrations as part of deployment and ensure update steps are idempotent so that retries remain safe.
- For Store plugins in particular, avoid post-deployment manual tweaks.

## Apps

Apps introduce an additional operational dimension because they rely on external backends and webhooks:

- Deploy app backends with the same rigor as any web service.
- Use blue/green or canary strategies to ensure that webhook handling continues uninterrupted during updates.
- Keep manifest versions aligned with deployed code.
- When introducing new events, register webhooks before emitting them to avoid delivery gaps.
- Externalize credentials and endpoints, and design webhook handlers to be retry-safe and suitable for multi-tenant environments.
