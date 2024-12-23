---
nav:
  title: Composer Commands Reference
  position: 5

---

# Composer Commands Reference

::: info
These commands are only available inside `shopware/shopware` GitHub repository, so when you contribute to Shopware. For regular projects, use `./bin/*.sh` scripts.
:::

These composer commands can be executed using composer with your Shopware project.

```bash
$ composer [command] [parameters]
```

## Commands

### Setup & build

| Command                      | Description                                                                                                                   |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `setup`                      | Resets and re-installs this Shopware instance - Database will be purged!                                                      |
| `build:js`                   | Builds Administration & Storefront - Combination of `build:js:admin` & `build:js:storefront`                                  |
| `build:js:admin`             | Builds the Administration - Includes `bundle:dump`, `feature:dump`, `admin:generate-entity-schema-types` and `assets:install` |
| `build:js:component-library` | Builds the component library                                                                                                  |
| `watch:admin`                | Build administration with hot module reloading                                                                                |
| `build:js:storefront`        | Builds the Storefront's JavaScript - Includes `bundle:dump`, `feature:dump` and `theme:compile`                               |
| `check:license`              | Check third-party dependency licenses for composer dependencies                                                               |
| `reset`                      | Resets this Shopware instance, without composer and npm install. (Faster reset if no dependencies changed)                    |

### Administration

| Command                              | Description                                                                   |
|:-------------------------------------|:------------------------------------------------------------------------------|
| `admin:create:test`                  | Generate a test boilerplate                                                   |
| `admin:generate-entity-schema-types` | Convert entity schemas to data types                                          |
| `admin:unit`                         | Launches the jest unit test-suite for the Admin                               |
| `admin:unit:watch`                   | Launches the interactive jest unit test-suite watcher for the Admin           |
| `admin:unit:prepare-vue3`            | Prepares the jest unit test-suite for the Admin with Vue3                     |
| `admin:unit:vue3`                    | Launches the jest unit test-suite for the Admin with Vue3                     |
| `admin:unit:watch:vue3`              | Launches the interactive jest unit test-suite watcher for the Admin with Vue3 |
| `npm:admin:check-license`            | Check third-party dependency licenses for administration                      |
| `watch:admin`                        | Build administration with hot module reloading                                |

### Storefront

| Command                        | Description                                                                                     |
|:-------------------------------|:------------------------------------------------------------------------------------------------|
| `build:js:storefront`          | Builds the Storefront's JavaScript - Includes `bundle:dump`, `feature:dump` and `theme:compile` |
| `npm:storefront:check-license` | Check third-party dependency licenses for storefront                                            |
| `watch:storefront`             | Build storefront with hot module reloading                                                      |

### Testsuite & Development

| Command                 | Description                                                                                           |
|:------------------------|:------------------------------------------------------------------------------------------------------|
| `bc-check`              | Checks for backwards compatibility breaks in the current branch                                       |
| `e2e:setup`             | Installs a clean shopware instance for E2E environment and launches `e2e:prepare`                     |
| `e2e:open`              | Launches the Cypress E2E test-suite UI                                                                |
| `e2e:prepare`           | Installs the Admin Extension SDK test plugin with fixtures and dumps the database                     |
| `ecs`                   | Checks all files regarding the Easy Coding Standard                                                   |
| `ecs-fix`               | Checks all files regarding the Easy Coding Standard and fixes them if possible                        |
| `eslint`                | Codestyle checks all (Administration/Storefront/E2E) JS/TS files                                      |
| `eslint:admin`          | Codestyle checks Administration JS/TS files                                                           |
| `eslint:admin:fix`      | Codestyle checks Administration JS/TS files and fixes them if possible                                |
| `eslint:e2e`            | Codestyle checks all E2E JS/TS files                                                                  |
| `eslint:e2e:fix`        | Codestyle checks all E2E JS/TS files and fixes them if possible                                       |
| `eslint:storefront`     | Codestyle checks all Storefront JS/TS files                                                           |
| `init:testdb`           | Initializes the test database                                                                         |
| `lint`                  | Shorthand for the composer commands `stylelint`, `eslint`, `ecs`, `lint:changlog` and `lint:snippets` |
| `lint:changelog`        | Validates changelogs                                                                                  |
| `lint:snippets`         | Validates existence of snippets in all core-supported languages                                       |
| `phpstan`               | runs the PHP static analysis tool                                                                     |
| `phpunit`               | Launches the PHP unit test-suit                                                                       |
| `phpunit:quarantined`   | Launches the PHP unit test-suite for quarantined tests                                                |
| `storefront:unit`       | Launches the jest unit test-suite for the Storefront                                                  |
| `storefront:unit:watch` | Launches the interactive jest unit test-suite watcher for the Storefront                              |
