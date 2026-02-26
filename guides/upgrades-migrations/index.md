---
nav:
  title: Upgrades and Migrations
  position: 10

---

# Version Upgrades and Migrations

This section covers version-based upgrades and required migration effort for Shopware core and extensions. When upgrading to a new minor or major Shopware version, review it to understand breaking changes, required adjustments, and compatibility requirements.

## Scope of this section

Upgrades typically fall into one of these categories:

* **Core**: Framework-level changes, data abstraction layer (DAL) updates, APIs, feature removals, and backend behavior.
* **[Administration](administration/index.md)**: frontend framework upgrades, Vue upgrades, breaking changes.
* **Translations**: [Extension translation](extension-translation), [Language pack migration](./language-pack-migration).
* **Extensions**: Version compatibility and required refactorings.

:::info
Administration framework upgrades (Vue, Pinia, Vite, Meteor) may introduce breaking changes requiring major version updates for affected plugins.
:::

## Upgrade strategy for extension developers

To reduce long-term upgrade cost:

* Avoid internal APIs and undocumented features
* Avoid unstable Admin patterns (`this.$parent`, prop mutation, Vue internals)
* Keep dependencies aligned with Shopware core
* Maintain automated test coverage
* Keep database migrations idempotent
* Track deprecations continuously—do not batch them

## Typical upgrade workflow

When targeting a new Shopware version:

1. Review [release notes](https://www.shopware.com/de/changelog/) and UPGRADE files
2. Check breaking changes per layer (Core / Admin / Translations)
3. Validate extension compatibility
4. Apply required migrations
5. Rebuild Admin/Storefront assets if needed
6. Test critical flows
7. Update extension versions if required

## Extension responsibilities

### Custom projects

* Follow the ([Performing updates guide](../hosting/installation-updates/performing-updates.md)) to stage, test, and execute upgrades in order.
* Review [changelogs](https://github.com/shopware/shopware/tree/trunk/changelog) and UPGRADE files ([example](https://github.com/shopware/shopware/blob/trunk/UPGRADE-6.7.md)) per release.
* Script data migrations and cache warm-ups.
* Use feature toggles or maintenance mode to decouple risky changes from the deploy moment.

### Custom plugins

* Provide migration code for schema/config changes.
* Ship defaults that work on older core versions until you deliberately drop support.
* Test against the target Shopware version matrix before rollout; note breaking changes in the plugin README.

### Store plugins

* Align Store metadata (compatibility range, changelog) with the tested core versions; refuse installation on unsupported versions.
* Run Shopware Store validation on the new build before submission ([Store submission via CLI](../../products/cli/shopware-account-commands/releasing-extension-to-shopware-store.md)).
* Communicate BC breaks explicitly.
* Prefer additive changes and feature flags to keep existing shops stable.

### Apps

* Version manifests carefully. Broaden compatibility only after testing, and narrow it when deprecations apply.
* Keep webhook/action handlers tolerant to new fields and events. Avoid hard coupling to specific core patch behavior.
* Document required scopes/permissions per version and avoid removing scopes without a migration path.

## Next steps

For the operational update procedure, continue with [Update Shopware](./update-shopware).
