---
nav:
  title: Uninstallation and data cleanup
  position: 80
---

# Uninstallation and data cleanup

During the uninstallation process, the customers can choose between:

- **Keep extension data** (snippets, media, tables)
  - The stored data can remain as is.

- **Completely delete extension data**
  - The extension must restore the shop to its original state upon uninstallation, as if it had never been installed. All custom tables and data created by the extension must be removed.
  - Exceptions apply to business-critical changes. For example, payment or shipping methods should not be deleted; instead, they should be deactivated.
  - This requirement does not necessarily apply to data stored in Shopware's standard tables, data used by other extensions (for example, sales channels), or tables that Shopware automatically cleans up during uninstallation.
  - All CMS elements added by the extension must be removed from the shop.
  - For custom fields, the association must be removed, while the values themselves may remain.

## More

**Reloading of files not allowed**  
Apps may not load other files during and after the installation in the Extension Manager.
