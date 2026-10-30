---
nav:
  title: Uninstallation and data cleanup
  position: 80
---

# Uninstallation and data cleanup

Extensions must be installable and uninstallable without errors. During uninstall, the extension should restore the shop where “completely delete” is chosen, as if it had never been installed—except where business-critical entities must be preserved (see below).

The Extension Manager (including the debug console) drives installation, uninstallation, reinstallation, and deletion.

* Install, uninstall, and reinstall must complete without exceptions.
* Valid install and uninstall operations must complete without unexpected HTTP errors.
  Report missing prerequisites clearly; do not hide a failed operation behind a successful response.
* Do not modify or overwrite the Extension Manager.
* Validate special PHP requirements during installation; on failure, show a growl message in the Administration.

## Uninstall options

During uninstall, merchants must be able to choose:

* **Keep extension data** (snippets, media, tables) — data may remain.
* **Completely delete extension data** — the shop must be restored as if the extension had never been installed. Remove custom tables and data created by the extension.

For **completely delete**:

* Exceptions apply to business-critical configuration: for example, **deactivate** payment or shipping methods instead of deleting them.
* Data in Shopware core tables, data shared with other extensions (for example sales channels), or tables Shopware cleans up automatically may not need manual removal.
* Remove all CMS elements the extension added.
* For custom fields, remove the association; values may remain in core storage.

The free [Adminer for Admin](https://store.shopware.com/en/frosh79014577529f/adminer-for-admin.html) extension can help verify database state in your test environment.

After uninstall, [Shopping Experiences](../../../../concepts/commerce/content/shopping-experiences-cms.md) must continue to work in the storefront.

## Configuration and data ownership

For plugins, core removes settings declared in `config.xml` when the merchant chooses to delete extension data.
Check this behavior on the supported Shopware versions before adding duplicate cleanup.
Dynamically written settings, OAuth tokens and legacy keys no longer declared in `config.xml` can need explicit cleanup by the extension.
Restrict that cleanup to exact keys or a clearly owned namespace.

Inventory other resources created by the extension: tables, relations, mail templates and types, media, CMS content and scheduled tasks.
Follow the actual foreign keys and deletion order.
For example, deleting a mail template type with a `SET NULL` relationship does not delete its templates.
Deleting a database record also does not necessarily delete an associated physical file.

Respect `keepUserData()` before deleting data covered by that option.
Do not remove another extension's resources through broad name or prefix matches.
Ensure deactivation stops the extension's active behavior even when its data is retained.

## Updates and restricted users

Test lifecycle operations with a user permitted to manage extensions, not only a full administrator.
Where internal lifecycle writes require system scope, use the supported scope mechanism narrowly around those writes and preserve the lifecycle context.
Do not reuse that elevation for ordinary customer or Administration requests.
Configuration validators and subscribers must tolerate legitimate cleanup operations, including deletion of their own settings.

Keep migrations already shipped to merchants stable and add forward migrations for later changes.
Test upgrades from an installed release as well as fresh installation.
A destructive migration is not an uninstall or rollback method.

Register scheduled tasks according to the extension's active state and ensure they cannot reference removed classes after uninstall.
Updating an inactive plugin must not leave work scheduled that cannot be handled.

## Verification checklist

* Install and activate a fresh package, then update an existing installation.
* Update while inactive, activate again and deactivate.
* Uninstall with data retained, reinstall and verify the retained data is usable.
* Uninstall with data deleted and inspect owned database records, media, configuration and tasks.
* Repeat with a restricted extension-manager role and relevant sales-channel configurations.
* Confirm storefront and Shopping Experiences still work after removal.

See [Plugin lifecycle methods](../../../plugins/plugins/plugin-fundamentals/plugin-lifecycle.md) for the implementation hooks.
