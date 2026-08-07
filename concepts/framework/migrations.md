---
nav:
  title: Migrations
  position: 30

---

# Migrations

Migrations are PHP classes containing database schema changesets. You might know the concept of migrations from other frameworks or Symfony as well.

## Adding migrations to a plugin

For Shopware to recognize additional plugin migrations, they need to be placed in the `Migration` directory under your plugin's source code root directory.

Each migration filename follows a specific pattern. To ease plugin development, Shopware provides a console command which can be used to generate a correctly named migration file with the default methods needed.

## Modifying the database

Each migration implements an `update()` method. That is where you put schema and data changes for your plugin. On plugin install and update, Shopware runs `update()` for every new migration once. There is no automatic rollback of migrations; remove plugin data in the plugin lifecycle `uninstall` method when appropriate.

::: info
Shopware core migrations also define an optional `updateDestructive()` method for delayed destructive changes across major versions. Plugin install and update never execute it, and it is not useful for plugin development. See the [Database migration](../../guides/plugins/plugins/database/database-migrations) guide for the full plugin workflow.
:::

For examples of database migrations, refer to the guide below:

<PageRef page="../../guides/plugins/plugins/database/database-migrations" title="Database migration" />
