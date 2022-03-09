# Migrations

Migrations are PHP classes containing database schema changesets. These changesets can be applied or reverted to bring the database into a certain state. You might know the concept of migrations from other Frameworks or Symfony as well.

## Adding migrations to a plugin

For Shopware to recognise additional plugin migrations, they need to be placed in the `Migration` directory under your plugin's source code root directory.

Each migration filename follows a specific pattern. To ease plugin development, Shopware provides a console command which can be used to generate a correctly named migration file with the default methods needed.

{% page-ref page="../../guides/plugins/plugins/plugin-fundamentals/database-migrations#create-migration" %}

## Modifying the database

Each migration can have two methods. The `update` and `updateDestructive`. The `update` method must contain only non-destructive changes which can be rolled back at any time. The `updateDestructive` method can contain destructive changes, which cannot be reversed, like dropping columns or tables. For examples of database migrations please refer to the guide on how to use database migrations:

{% page-ref page="../../guides/plugins/plugins/plugin-fundamentals/database-migrations.md" %}

