---
nav:
  title: Commands Reference
  position: 10

---

# Commands Reference

These commands can be executed using the Shopware command line interface \(CLI\), located within your Shopware project.

```bash
$ bin/console [command] [parameters]
```

## Commands

### General

| Command      | Description                                    |
|:-------------|:-----------------------------------------------|
| `about`      | Displays information about the current project |
| `completion` | Dump the shell completion script               |
| `help`       | Displays help for a command                    |
| `list`       | Lists commands                                 |

### Administration

| Command                                              | Description                                                                                                                                                   |
|:-----------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `administration:delete-extension-local-public-files` | Deletes all files in the local public folder of the extension. This command should run after assets:install so the assets are available in the public folder. |
| `administration:delete-files-after-build`            | Deletes all unnecessary files of the administration after the build process                                                                                   |

### App

| Command                  | Description                                                              |
|:-------------------------|:-------------------------------------------------------------------------|
| `app:activate`           | Activates the app in the folder with the given name                      |
| `app:create`             | Creates an app skeleton                                                  |
| `app:deactivate`         | Deactivates the app in the folder with the given name                    |
| `app:install`            | Installs the app in the folder with the given name                       |
| `app:list`               | Lists all apps                                                           |
| `app:refresh`            | \[app:update\] Refreshes the installed apps                              |
| `app:uninstall`          | Uninstalls the app                                                       |
| `app:url-change:resolve` | Resolves changes in the app URL and how the app system should handle it. |
| `app:validate`           | Checks manifests for errors                                              |

### Assets

| Command          | Description                                              |
|:-----------------|:---------------------------------------------------------|
| `assets:install` | Installs bundles web assets under a public web directory |

### Bundle

| Command       | Description                                                                                                                              |
|:--------------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| `bundle:dump` | \[administration:dump:plugins\|administration:dump:bundles\] Creates a JSON file with the configuration for each active Shopware bundle. |

### Cache

| Command                      | Description                                                                                                                      |
|:-----------------------------|:---------------------------------------------------------------------------------------------------------------------------------|
| `cache:clear`                | Clears the cache                                                                                                                 |
| `cache:clear:all`            | Clears all caches/pools, invalidates expired tags, removes old kernel cache directories |
| `cache:clear:delayed`        | Invalidates the delayed cache keys/tags                                                                                          |
| `cache:clear:http`           | Clear only the HTTP cache                                                                                                        |
| `cache:pool:clear`           | Clears cache pools                                                                                                               |
| `cache:pool:delete`          | Deletes an item from a cache pool                                                                                                |
| `cache:pool:invalidate-tags` | Invalidate cache tags for all or a specific pool                                                                                 |
| `cache:pool:list`            | Lists available cache pools                                                                                                      |
| `cache:pool:prune`           | Prunes cache pools                                                                                                               |
| `cache:warmup`               | Warms up an empty cache                                                                                                          |
| `cache:watch:delayed`        | Watches the delayed cache keys/tags                                                                                              |

### Cart

| Command        | Description                           |
|:---------------|:--------------------------------------|
| `cart:migrate` | Migrates carts from redis to database |

### Changelog

| Command             | Description                                                                                            |
|:--------------------|:-------------------------------------------------------------------------------------------------------|
| `changelog:change`  | Returns all changes made in a specific / unreleased version.                                           |
| `changelog:check`   | Checks the validation of a given changelog file or of all files in the "changelog/\_unreleased" folder |
| `changelog:create`  | Creates a changelog markdown file in `/changelog/_unreleased`                                          |
| `changelog:release` | Creates or updates the final changelog for a new release                                               |

### Config

| Command                 | Description                                      |
|:------------------------|:-------------------------------------------------|
| `config:dump-reference` | Dumps the default configuration for an extension |

### Customer

| Command                         | Description                    |
|:--------------------------------|:-------------------------------|
| `customer:delete-unused-guests` | Deletes unused guest customers |

### Dal

| Command                | Description                            |
|:-----------------------|:---------------------------------------|
| `dal:create:entities`  | Creates the entity classes             |
| `dal:create:hydrators` | Creates the hydrator classes           |
| `dal:migration:create` | Creates migration for entity schema    |
| `dal:create:schema`    | Creates the database schema            |
| `dal:refresh:index`    | Refreshes the index for a given entity |
| `dal:validate`         | Validates the DAL definitions          |

### Database

| Command                        | Description                            |
|:-------------------------------|:---------------------------------------|
| `database:clean-personal-data` | Cleans personal data from the database |
| `database:create-migration`    | Creates a new migration file           |
| `database:migrate`             | Executes all migrations                |
| `database:migrate-destructive` | Executes all migrations                |
| `database:refresh-migration`   | Refreshes the migration state          |

### Debug

| Command                  | Description                                                |
|:-------------------------|:-----------------------------------------------------------|
| `debug:autowiring`       | Lists classes/interfaces you can use for autowiring        |
| `debug:business-events`  | Dumps all business events                                  |
| `debug:config`           | Dumps the current configuration for an extension           |
| `debug:container`        | Displays current services for an application               |
| `debug:dotenv`           | Lists all dotenv files with variables and values           |
| `debug:event-dispatcher` | Displays configured listeners for an application           |
| `debug:messenger`        | Lists messages you can dispatch using the message buses    |
| `debug:router`           | Displays current routes for an application                 |
| `debug:scheduler`        | Lists schedules and their recurring messages               |
| `debug:serializer`       | Displays serialization information for classes             |
| `debug:translation`      | Displays translation messages information                  |
| `debug:twig`             | Shows a list of twig functions, filters, globals and tests |
| `debug:validator`        | Displays validation constraints for classes                |

### Dotenv

| Command       | Description                                 |
|:--------------|:--------------------------------------------|
| `dotenv:dump` | Compile .env files to .env.local.php        |

### Error

| Command      | Description                                                                      |
|:-------------|:---------------------------------------------------------------------------------|
| `error:dump` | Dump error pages to plain HTML files that can be directly served by a web server |

### Es

| Command                   | Description                                    |
|:--------------------------|:-----------------------------------------------|
| `es:admin:index`          | Indexes the elasticsearch for the admin search |
| `es:admin:mapping:update` | Update the Elasticsearch indices mapping       |
| `es:admin:reset`          | Reset Admin Elasticsearch indexing             |
| `es:admin:test`           | Allows you to test the admin search index      |
| `es:create:alias`         | Creates the elasticsearch alias                |
| `es:index`                | Reindexes all entities to elasticsearch        |
| `es:index:cleanup`        | Cleans outdated indices                        |
| `es:mapping:update`       | Update the Elasticsearch indices mapping       |
| `es:reset`                | Resets the elasticsearch index                 |
| `es:status`               | Shows the status of the elasticsearch index    |
| `es:test:analyzer`        | Allows to test an elasticsearch analyzer       |

### Feature

| Command           | Description                                                                                                            |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------|
| `feature:disable` | Disable feature flags                                                                                                  |
| `feature:dump`    | \[administration:dump:features\] Creates a JSON file with feature config for JS testing and hot reloading capabilities |
| `feature:enable`  | Enable feature flags                                                                                                   |
| `feature:list`    | List all registered features                                                                                           |

### Framework

| Command                       | Description                              |
|:------------------------------|:-----------------------------------------|
| `framework:demodata`          | Generates demo data                      |
| `framework:dump:class:schema` | Dumps the schema of the given entity     |
| `framework:schema`            | Dumps the api definition to a json file. |

### Http

| Command              | Description             |
|:---------------------|:------------------------|
| `http:cache:warm:up` | Warms up the HTTP cache |

### Import

| Command         | Description                      |
|:----------------|:---------------------------------|
| `import:entity` | Imports entities from a CSV file |

### Import-export

| Command                        | Description                             |
|:-------------------------------|:----------------------------------------|
| `import-export:delete-expired` | Deletes all expired import/export files |

### Integration

| Command              | Description                                       |
|:---------------------|:--------------------------------------------------|
| `integration:create` | Create an integration and dump the key and secret |

### Lint

| Command             | Description                                                           |
|:--------------------|:----------------------------------------------------------------------|
| `lint:container`    | Ensures that arguments injected into services match type declarations |
| `lint:translations` | Lint translations files syntax and outputs encountered errors         |
| `lint:twig`         | Lints a Twig template and outputs encountered errors                  |
| `lint:xliff`        | Lints a XLIFF file and outputs encountered errors                     |
| `lint:yaml`         | Lints a YAML file and outputs encountered errors                      |

### Mailer

| Command       | Description                                 |
|:--------------|:--------------------------------------------|
| `mailer:test` | Tests Mailer transports by sending an email |

### Make plugin

Generating the skeletons and essential files needed to create and structure a Shopware plugin.

 | Command                             | Description                                    |
 |:------------------------------------|:-----------------------------------------------|
 | `make:plugin:admin-module`          | Generate an administration module skeleton     |
 | `make:plugin:command`               | Generate a plugin CLI command skeleton         |
 | `make:plugin:composer`              | Generate a composer configuration for a plugin |
 | `make:plugin:config`                | Generate a plugin system config skeleton       |
 | `make:plugin:custom-fieldset`       | Generate a custom field set for a plugin       |
 | `make:plugin:entity`                | Generate entity scaffolding for a plugin       |
 | `make:plugin:event-subscriber`      | Generate an event subscriber skeleton          |
 | `make:plugin:javascript-plugin`     | Generate a JavaScript plugin skeleton          |
 | `make:plugin:plugin-class`          | Generate the base plugin class                 |
 | `make:plugin:scheduled-task`        | Generate a scheduled task skeleton             |
 | `make:plugin:store-api-route`       | Generate a Store API route skeleton            |
 | `make:plugin:storefront-controller` | Generate a Storefront controller skeleton      |
 | `make:plugin:tests`                 | Generate a plugin tests skeleton               |

### Media

| Command                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|:--------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `media:delete-local-thumbnails` | Deletes all physical media thumbnails when remote thumbnails is enabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `media:delete-unused`           | Deletes all media files that are never used. Use the `--dry-run` flag to see a paginated list of files that will be deleted, without actually deleting them. Use the `--grace-period-days=10` to set a grace period for unused media, meaning only media uploaded before the current date and time minus 10 days will be considered for deletion. The default is 20 and therefore any media uploaded in the previous 20 days will not be considered for deletion even if it is unused. Use the `--folder-entity` flag to target only a specific folder (e.g. `--folder-entity=PRODUCT` to purge all product images) |
| `media:generate-media-types`    | Generates the media types for all media entities                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `media:generate-thumbnails`     | Generates the thumbnails for all media entities                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `media:update-path`             | Iterates over the media and updates the path column.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

### Messenger

| Command                      | Description                                             |
|:-----------------------------|:--------------------------------------------------------|
| `messenger:consume`          | Consumes messages                                       |
| `messenger:failed:remove`    | Removes given messages from the failure transport       |
| `messenger:failed:retry`     | Retries one or more messages from the failure transport |
| `messenger:failed:show`      | Shows one or more messages from the failure transport   |
| `messenger:setup-transports` | Prepares the required infrastructure for the transport  |
| `messenger:stats`            | Shows the message count for one or more transports      |
| `messenger:stop-workers`     | Stops workers after their current message               |

### Number-range

| Command                | Description                                      |
|:-----------------------|:-------------------------------------------------|
| `number-range:migrate` | Migrates the increment storage of a number range |

### Plugin

| Command             | Description                                                    |
|:--------------------|:---------------------------------------------------------------|
| `plugin:activate`   | Activates given plugins                                        |
| `plugin:create`     | Creates a plugin skeleton                                      |
| `plugin:deactivate` | Deactivates given plugins                                      |
| `plugin:install`    | Installs given plugins                                         |
| `plugin:list`       | Lists all plugins                                              |
| `plugin:refresh`    | Refreshes the plugins list in the storage from the file system |
| `plugin:uninstall`  | Uninstalls given plugins                                       |
| `plugin:update`     | Updates given plugins                                          |
| `plugin:update:all` | Install all available plugin updates                           |
| `plugin:zip-import` | Imports a plugin from a zip file                               |

### Product-export

| Command                   | Description                     |
|:--------------------------|:--------------------------------|
| `product-export:generate` | Generates a product export file |

### Router

| Command        | Description                                        |
|:---------------|:---------------------------------------------------|
| `router:match` | Helps debug routes by simulating a path info match |

### S3

| Command             | Description                                                     |
|:--------------------|:----------------------------------------------------------------|
| `s3:set-visibility` | Sets the visibility of all files in the s3 filesystem to public |

### Sales-channel

| Command                             | Description                                   |
|:------------------------------------|:----------------------------------------------|
| `sales-channel:create`              | Creates a new sales channel                   |
| `sales-channel:create:storefront`   | Creates a new storefront sales channel        |
| `sales-channel:list`                | Lists all sales channels                      |
| `sales-channel:maintenance:disable` | Disables maintenance mode for a sales channel |
| `sales-channel:maintenance:enable`  | Enables maintenance mode for a sales channel  |
| `sales-channel:update:domain`       | Updates a sales channel domain                |

### Scheduled-task

| Command                     | Description                   | Version |
|:----------------------------|:------------------------------|:--------|
| `scheduled-task:deactivate` | Deactivate a scheduled task   | 6.7.2.0 |
| `scheduled-task:register`   | Registers all scheduled tasks |
| `scheduled-task:run`        | Runs scheduled tasks          |
| `scheduled-task:run-single` | Runs single scheduled tasks   | 6.5.5.0 |
| `scheduled-task:list`       | Lists all scheduled tasks     | 6.5.5.0 |
| `scheduled-task:schedule`   | Schedule a scheduled task     | 6.7.2.0 |

### Secrets

| Command                      | Description                                             |
|:-----------------------------|:--------------------------------------------------------|
| `secrets:decrypt-to-local`   | Decrypts all secrets and stores them in the local vault |
| `secrets:encrypt-from-local` | Encrypts all local secrets to the vault                 |
| `secrets:generate-keys`      | Generates new encryption keys                           |
| `secrets:list`               | Lists all secrets                                       |
| `secrets:remove`             | Removes a secret from the vault                         |
| `secrets:reveal`             | Reveal the value of a secret                            |
| `secrets:set`                | Sets a secret in the vault                              |

### Server

| Command       | Description                                                            |
|:--------------|:-----------------------------------------------------------------------|
| `server:dump` | Start a dump server that collects and displays dumps in a single place |
| `server:log`  | Start a log server that displays logs in real time                     |

### Services

| Command            | Description           |
|:-------------------|:----------------------|
| `services:install` | Install all services  |

### Sitemap

| Command            | Description                                                |
|:-------------------|:-----------------------------------------------------------|
| `sitemap:generate` | Generates sitemaps for a given shop \(or all active ones\) |

### Snippets

| Command             | Description        |
|:--------------------|:-------------------|
| `snippets:validate` | Validates snippets |

### State-machine

| Command              | Description                              |
|:---------------------|:-----------------------------------------|
| `state-machine:dump` | Dumps a state machine to a graphviz file |

### Store

| Command          | Description                       |
|:-----------------|:----------------------------------|
| `store:download` | Downloads a plugin from the store |
| `store:login`    | Login for the store               |

### System

| Command                      | Description                                                                        |
|:-----------------------------|:-----------------------------------------------------------------------------------|
| `system:check`               | Check the shopware application system health                                       |
| `system:config:get`          | Gets a config value                                                                |
| `system:config:set`          | Sets a config value                                                                |
| `system:configure-shop`      | Configures the shop                                                                |
| `system:generate-app-secret` | Generates a new app secret                                                         |
| `system:generate-jwt-secret` | Generates a new JWT secret                                                         |
| `system:install`             | Installs the Shopware 6 system                                                     |
| `system:is-installed`        | Checks if the system is installed and returns exit code 0 if Shopware is installed |
| `system:setup`               | Setup the system                                                                   |
| `system:setup:staging`       | Installs the Shopware 6 system in staging mode                                     |
| `system:update:finish`       | Finishes the update process                                                        |
| `system:update:prepare`      | Prepares the update process                                                        |

### Theme

| Command               | Description                                  |
|:----------------------|:---------------------------------------------|
| `theme:change`        | Changes the active theme for a sales channel |
| `theme:compile`       | Compiles the theme                           |
| `theme:create`        | Creates a theme skeleton                     |
| `theme:dump`          | Dumps the theme configuration                |
| `theme:prepare-icons` | Prepares the theme icons                     |
| `theme:refresh`       | Refreshes the theme configuration            |

### Translation

| Command               | Description                                                                                                                    |
|:----------------------|:-------------------------------------------------------------------------------------------------------------------------------|
| `translation:extract` | Extract missing translations keys from code to translation files                                                               |
| `translation:install` | Downloads and installs translations from the translations GitHub repository for the specified locales or all available locales |
| `translation:pull`    | Pull translations from a given provider.                                                                                       |
| `translation:push`    | Push translations to a given provider.                                                                                         |

### User

| Command                | Description                    |
|:-----------------------|:-------------------------------|
| `user:change-password` | Changes the password of a user |
| `user:create`          | Creates a new user             |
| `user:list`            | List current users             |
