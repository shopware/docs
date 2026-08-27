---
nav:
  title: Upgrades and Migrations
  position: 100
product: shopware
lifecycle: maintenance
---

# Version Upgrades and Migrations

This section covers version-based upgrades and the required migration effort for Shopware core and extensions. When upgrading to a new minor or major Shopware version, review it to understand breaking changes, required adjustments, and compatibility requirements.

:::info
For a guided local upgrade, use [`shopware-cli project upgrade`](../../products/tools/cli/project-commands/upgrade.md). It checks project readiness and Composer-managed extensions, verifies the selected target with Composer before modifying project files, runs the upgrade locally, and writes a shareable report.
:::

## Scope of this section

Upgrades typically fall into one of these categories:

* **APIs**: HTTP/API contract changes.
* **Core**: Framework-level changes, data abstraction layer (DAL) updates, APIs, feature removals, and backend behavior.
* **[Administration](administration/index.md)**: frontend framework upgrades, Vue upgrades, breaking changes.
* **Storefront**: breaking changes related to Twig templates and JavaScript plugins.
* **App System**: changes that affect the app framework (e.g. manifest, webhooks, etc.).
* **Hosting & Configuration**: for infrastructure-related changes.

:::info
Administration framework upgrades (Vue, Pinia, Vite, Meteor) may introduce breaking changes requiring major version updates for affected plugins.
:::

## Typical Shopware upgrade workflow

When targeting a new Shopware version:

1. Review [release notes](https://www.shopware.com/de/changelog/) and UPGRADE files.
2. Check breaking changes per layer (Core / Admin / Storefront / API).
3. Run the [Shopware CLI upgrade preflight](../../products/tools/cli/project-commands/upgrade.md#run-a-non-interactive-preflight) or otherwise validate extension compatibility and Composer resolution.
4. Apply required migrations and project changes.
5. Rebuild Admin/Storefront assets if needed.
6. Test critical flows and extension behavior.
7. Commit the reviewed project changes and deploy through your normal process.

:::info Upgrade impact in real projects
Upgrade complexity depends on the installation:

* Heavy custom code increases migration effort.
* No custom code but 60 Store plugins can be equally complex.
* Most real-world projects fall somewhere in between.

A consistent architecture, centralized CI, and controlled extension strategy help you get ahead of upgrade pain.
:::

### Custom projects

* Follow the [Performing updates guide](../hosting/installation-updates/performing-updates.md) to stage, test, and execute upgrades in order.
* Review [RELEASE_INFO](https://github.com/shopware/shopware/blob/trunk/RELEASE_INFO-6.7.md) and UPGRADE files ([example](https://github.com/shopware/shopware/blob/trunk/UPGRADE-6.7.md)) per release.
* Use feature toggles to decouple risky changes from the deployment.

## Upgrade strategy for extension developers

To reduce long-term upgrade cost:

* Avoid internal APIs and undocumented features.
* Keep dependencies aligned with the Shopware core.
* Maintain automated test coverage.
* Keep database migrations idempotent.
* Track deprecations continuously—do not batch them.

The Shopware CLI upgrade wizard can also be useful when you maintain extensions: assemble the extensions in a representative Composer-managed test project, select the target Shopware version, and use the extension queue and generated report to identify updates, blockers, and items that need manual review. This does not replace testing the extension itself against the target Shopware version.

### Custom plugins

* Provide migration code for schema/config changes.
* Ship defaults that work on older core versions until you deliberately drop support.
* Test against the target Shopware version matrix before rollout; note breaking changes in the plugin README.

### Store plugins

* Align Store metadata (compatibility range, changelog) with the tested core versions; refuse installation on unsupported versions.
* Run Shopware Store validation on the new build before submission ([Store submission via CLI](../../products/tools/cli/shopware-account-commands/releasing-extension-to-shopware-store.md)).
* Communicate BC breaks explicitly.
* Prefer additive changes and feature flags to keep existing shops stable.

### Apps

* Version manifests carefully. Broaden compatibility only after testing, and narrow it when deprecations apply.
* Keep webhook/action handlers tolerant to new fields and events. Avoid hard coupling to specific core patch behavior.

## Next steps

For the guided local workflow, continue with [Upgrade a Shopware Project](../../products/tools/cli/project-commands/upgrade.md).

For the wider operational update procedure, continue with [Upgrade Shopware](./upgrade-shopware.md) and [Performing Shopware Updates](../hosting/installation-updates/performing-updates.md).

For general development best practices that reduce upgrade friction, see the [Development guide](../development/index.md).
