---
nav:
  title: Upgrades
  position: 4

---

# Upgrades

Upgrade plans should protect customer data and keep extensions compatible. Rehearse upgrades on staging with production-like data before touching production, and keep recovery steps ready.

## Cross-cutting practices

- Automate pre-upgrade checks (PHP/DB versions, extensions, disk space) and post-upgrade smoke tests.
- Keep database backups and a recovery plan; practice on staging with production-like data.
- Track deprecations early and use official tooling (e.g. Rector/Admin codemods referenced in [Performing updates](../hosting/installation-updates/performing-updates.md)) to reduce manual work.

## Custom projects

- Follow the update guide ([Performing updates](../hosting/installation-updates/performing-updates.md)) to stage, test, and execute upgrades in order.
- Review changelogs/UPGRADE files per release; script data migrations and cache warmups.
- Use feature toggles or maintenance mode to decouple risky changes from the deploy moment.

## Custom plugins

- Provide migration code for schema/config changes; ship defaults that work on older core versions until you deliberately drop support.
- Test against the target Shopware version matrix before rollout; note breaking changes in the plugin README.

## Store plugins

- Align Store metadata (compatibility range, changelog) with the tested core versions; refuse installation on unsupported versions.
- Run Shopware Store validation on the new build before submission ([Store submission via CLI](../../products/cli/shopware-account-commands/releasing-extension-to-shopware-store.md)).
- Communicate BC breaks explicitly; prefer additive changes and feature flags to keep existing shops stable.

## Apps

- Version manifests carefully: broaden compatibility only after testing; narrow it when deprecations apply.
- Keep webhook/action handlers tolerant to new fields and events; avoid hard coupling to specific core patch behavior.
- Document required scopes/permissions per version and avoid removing scopes without a migration path.
