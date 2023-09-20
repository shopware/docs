# Database Migrations

## Overview

In this guide, you'll learn what migrations are and how to use them. Migrations are PHP classes used to manage incremental and reversible database schema changes. Shopware comes with a pre-built Migration System, to take away most of the work for you. Throughout this guide, you will find the `$` symbol representing your command line.

## Prerequisites

In order to add your own database migrations for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

::: info
Refer to this video on **[Database migrations](https://www.youtube.com/watch?v=__pWwaK6lxw)**. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## File structure

By default, Shopware 6 is looking for migration files in a directory called `Migration` relative to your plugin's base class.

```text
└── plugins
    └── SwagBasicExample
        └── src
            ├── Migration
            │   └── Migration1546422281ExampleDescription.php
            └── SwagBasicExample.php
```

As you can see there is one file in the `<plugin root>/src/Migration` directory. Below you find a break down of what each part of its name means.

| File Name Snippet | Meaning |
| :--- | :--- |
| Migration | Each migration file has to start with Migration |
| 1546422281 | A Timestamp used to make migrations incremental |
| ExampleDescription | A descriptive name for your migration |

### Customizing the migration path / namespace

You are also able to change the migration directory. This is done by choosing another namespace for your migrations, which can be changed by overwriting your plugin's `getMigrationNamespace()` method in the plugin base class:

```php
public function getMigrationNamespace(): string
{
    return 'Swag\BasicExample\MyMigrationNamespace';
}
```

Since the path is read from the namespace, your Migration directory would have to be named `MyMigrationNamespace` now.

## Create migration

To create a new migration, you have to open your Shopware root directory in your terminal and execute the command `database:create-migration`. Below you can see the command used in this example to create the migration seen above in the file structure.

```bash
$ ./bin/console database:create-migration -p SwagBasicExample --name ExampleDescription
```

Below you'll find a break down of the command.

| Command Snippet | Meaning |
| :--- | :--- |
| ./bin/console | Calls the executable Symfony console application |
| database:create-migration | The command to create a new migration |
| -p your\_plugin\_name | -p creates a new migration for the plugin with the name provided |
| --name your\_descriptive\_name | Appends the provided string after the timestamp |

_Note: If you create a new migration yourself, the timestamp will vary._

If you take a look at your created migration it should look similar to this:

```php
// <plugin root>/src/Migration/Migration1611740369ExampleDescription.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1611740369ExampleDescription extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1611740369;
    }

    public function update(Connection $connection): void
    {
        // implement update
    }

    public function updateDestructive(Connection $connection): void
    {
        // implement update destructive
    }
}
```

As you can see your migration contains 3 methods:

* getCreationTimestamp\(\)
* update\(\)
* updateDestructive\(\)

There is no need to change `getCreationTimestamp()`, it returns the timestamp that's also part of the file name. In the `update()` method you implement non-destructive changes which should always be **reversible**. The `updateDestructive()` method is the follow up step, that is run after `update()` and used for **destructive none reversible changes**, like dropping columns or tables. Destructive migrations are only executed explicitly.

::: info
You do not add instructions to revert your migrations within the migration class itself. `updateDestructive` is not meant to revert instructions in `update`. Reverting changes in the database is done explicitly in plugin lifecycle method `uninstall`. Read more about [it here](./plugin-lifecycle#uninstall).
:::

Here's an example of a non-destructive migration, creating a new table:

```php
// <plugin root>/src/Migration/Migration1611740369ExampleDescription.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1611740369ExampleDescription extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1611740369;
    }

    public function update(Connection $connection): void
    {
        $query = <<<SQL
CREATE TABLE IF NOT EXISTS `swag_basic_example_general_settings` (
    `id`                INT             NOT NULL,
    `example_setting`   VARCHAR(255)    NOT NULL,
    PRIMARY KEY (id)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
SQL;

        $connection->executeStatement($query);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

## SQL schema

If you want to create a migration for your new custom entity, you could execute the following command. This command selects all active entities and saves it into `platform/src/schema`.

```bash
$ ./bin/console dal:create:schema
```

_Note: Your plugin has to be activated, otherwise your custom entity definition will not be considered. The queries are outputted into /schema._

## Execute migration

When you install your plugin, the migration directory is added to a MigrationCollection and all migrations are executed. Also, when you update a plugin via the Plugin Manager, all **new** migrations are executed. If you want to perform a migration manually as part of your development process, simply create it after installing your plugin. This way, your plugin migration directory will already be registered during the installation process and you can run any newly created migration by hand using one of the following commands.

::: warning
When updating a plugin, do not change a migration that was already executed, since every migration is only run once.
:::

| Command | Arguments | Usage |
| :--- | :--- | :--- |
| database:migrate | identifier \(optional\) | Calls the update\(\) methods of unhandled migrations |
| database:migrate-destructive | identifier \(optional\) | Calls the updateDestructive\(\) methods of unhandled migrations |

The identifier argument is used to decide which migrations should be executed. Per default, the identifier is set to run Shopware Core migrations. To run your plugin migrations, set the identifier argument to your plugin's bundle name, in this example `SwagBasicExample`.

```bash
$ ./bin/console database:migrate SwagBasicExample --all
```

## Advanced migration control

Once you have become familiar with the migration process and the development flow, you may want to have finer control over the migrations performed during the installation and update. In this case the `MigrationCollection` which is only filled with your specific migrations, can be accessed via the `InstallContext` and all its subclasses \(UpdateContext, ActivateContext, ...\). A plugin must reject the automatic execution of migrations in order to have control over the migrations that are executed.

Therefore a typical update method might look more like this:

```php
    public function update(UpdateContext $updateContext): void
    {
        $updateContext->setAutoMigrate(false); // disable auto migration execution

        $migrationCollection = $updateContext->getMigrationCollection();

        // execute all DESTRUCTIVE migrations until and including 2019-11-01T00:00:00+00:00
        $migrationCollection->migrateDestructiveInPlace(1572566400);

        // execute all UPDATE migrations until and including 2019-12-12T09:30:51+00:00
        $migrationCollection->migrateInPlace(1576143014);
    }
```

If you don't use the Shopware migration system, an empty collection \(NullObject\) will be in the context.
