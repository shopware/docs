---
nav:
  title: Uninstallation and data cleanup
  position: 80
---

# Uninstallation and data cleanup

Extensions must be installable and uninstallable without errors. During uninstall, the extension should restore the shop where “completely delete” is chosen, as if it had never been installed—except where business-critical entities must be preserved (see below).

The Extension Manager (including the debug console) drives installation, uninstallation, reinstallation, and deletion.

* Install, uninstall, and reinstall must complete without exceptions.
* No 400/500 errors during install or uninstall unless clearly tied to an API.
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

## Apps and Extension Manager

**Apps:** Do not load or reload external files during or after installation in the Extension Manager.

Avoid extending or overwriting the Extension Manager in general.
