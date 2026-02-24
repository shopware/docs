---
nav:
  title: CI
  position: 10

---

# CI

CI should, at minimum, run static analysis and coding standards checks alongside the project or extension build to keep artifacts reproducible. Add sanity checks such as smoke tests and lightweight integration tests to catch regressions early. Automated tests—from unit to integration and E2E, where feasible—make refactors, upgrades, and dependency changes safer.

:::info
Follow the [Deployment guide](../../hosting/deployments.md) for information about promotion and release.
:::

## Cross-cutting practices

* Fail fast on coding standards and static analysis before slower E2E tests.
* Use the ([Shopware CLI formatter](../../products/cli/formatter.md)) to keep code style consistent and run the bundled validation tools in CI using ([Shopware CLI validation tools](../../products/cli/validation.md)).
* Produce artifacts once per commit (ZIP for plugins, deployable image/package for apps, built assets for projects) and promote the same artifact through stages.

## Custom projects

* Reuse the ([Project build command](../../products/cli/project-commands/build.md)) to compile Storefront and Administration assets and warm caches. Run it in CI so deployments do not rebuild.
* Use environment-specific config only in deployment, not in CI. See [setup patterns](../installation/setups/index.md) you can mirror in pipelines.
* Add smoke tests against the HTTP layer plus DAL-level integration tests for custom entities.
* Cache Composer/NPM dependencies but keep lockfiles committed for deterministic builds.

## Custom/Store plugins

* Build and validate with `shopware-cli extension build` ([Extension build command](../../products/cli/extension-commands/build.md)) to ensure the ZIP is reproducible.
* Run unit/integration tests with the Shopware test environment; keep fixtures inside the plugin to avoid coupling to project data.
* For Store plugins, add the Shopware Store validations early (linting, metadata, PHPStan) to catch review issues before submission ([Store submission via CLI](../../products/cli/shopware-account-commands/releasing-extension-to-shopware-store.md)).
