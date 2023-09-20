---
nav:
  title: Commands Reference
  position: 10

---

# Commands Reference

These commands can be executed using the Shopware command line interface \(CLI\), located within your Shopware project

```bash
$ bin/console [command] [parameters]
```

## Commands

### General

| Command | Description |
| :--- | :--- |
| `about` | Displays information about the current project |
| `help` | Displays help for a command |
| `list` | Lists commands |

### App

| Command | Description |
| :--- | :--- |
| `app:activate` | activate the app in the folder with the given name |
| `app:deactivate` | deactivate the app in the folder with the given name |
| `app:install` | Installs the app in the folder with the given name |
| `app:refresh` | Refreshes the installed Apps |
| `app:uninstall` | Uninstalls the app |
| `app:url-change:resolve` | Resolve changes in the app url and how the app system should handle it. |
| `app:validate` | checks manifests for errors |
| `app:verify` | checks manifests for errors |

### Assets

| Command | Description |
| :--- | :--- |
| `assets:install` |  |

### Bundle

| Command | Description |  |
| :--- | :--- | :--- |
| `bundle:dump` | \[administration:dump:bundles\] Creates a json file with the configuration for each active Shopware bundle. |

### Cache

| Command | Description |
| :--- | :--- |
| `cache:clear` | Clears the cache |
| `cache:pool:clear` | Clears cache pools |
| `cache:pool:delete` | Deletes an item from a cache pool |
| `cache:pool:list` | List available cache pools |
| `cache:pool:prune` | Prunes cache pools |
| `cache:warmup` | Warms up an empty cache |

### Changelog

| Command | Description |
| :--- | :--- |
| `changelog:change` | Returns all changes made in a specific / unreleased version. |
| `changelog:check` | Check the validation of a given changelog file. This command will check all files in "changelog/\_unreleased" folder, if users don't specify a changelog file. |
| `changelog:create` | Create a changelog markdown file in `/changelog/_unreleased` |
| `changelog:release` | Creating or updating the final changelog for a new release |

### Config

| Command | Description |
| :--- | :--- |
| `config:dump-reference` | Dumps the default configuration for an extension |

### Dal

| Command | Description |
| :--- | :--- |
| `dal:create:entities` |  |
| `dal:create:schema` |  |
| `dal:refresh:index` | Refreshes the shop indices |
| `dal:validate` |  |

### Database

| Command | Description |
| :--- | :--- |
| `database:clean-personal-data` |  |
| `database:create-migration` |  |
| `database:migrate` |  |
| `database:migrate-destructive` |  |
| `database:refresh-migration` |  |

### Debug

| Command | Description |
| :--- | :--- |
| `debug:autowiring` | Lists classes/interfaces you can use for autowiring |
| `debug:business-events` |  |
| `debug:config` | Dumps the current configuration for an extension |
| `debug:container` | Displays current services for an application |
| `debug:event-dispatcher` | Displays configured listeners for an application |
| `debug:messenger` | Lists messages you can dispatch using the message buses |
| `debug:router` | Displays current routes for an application |
| `debug:swiftmailer` | Displays current mailers for an application |
| `debug:translation` | Displays translation messages information |
| `debug:twig` | Shows a list of twig functions, filters, globals and tests |

### Enqueue

| Command | Description |
| :--- | :--- |
| `enqueue:consume` | \[enq:c\] A client's worker that processes messages. By default it connects to default queue. It select an appropriate message processor based on a message headers |
| `enqueue:produce` | Sends an event to the topic |
| `enqueue:routes` | \[debug:enqueue:routes\] A command lists all registered routes. |
| `enqueue:setup-broker` | \[enq:sb\] Setup broker. Configure the broker, creates queues, topics and so on. |
| `enqueue:transport:consume` | A worker that consumes message from a broker. To use this broker you have to explicitly set a queue to consume from and a message processor service |

### Es

| Command | Description |
| :--- | :--- |
| `es:create:alias` | Dev command to create alias immediately |
| `es:index` | Reindex all entities to elasticsearch |
| `es:index:cleanup` | Admin command to remove old and unused indices |
| `es:test:analyzer` | Allows to test an elasticsearch analyzer |

### Feature

| Command | Description |
| :--- | :--- |
| `feature:dump` | \[administration:dump:features\] Creating json file with feature config for js testing and hot reloading capabilities. |

### Framework

| Command | Description |
| :--- | :--- |
| `framework:demodata` |  |
| `framework:dump:class:schema` |  |
| `framework:schema` | Dumps the api definition to a json file. |

### Http

| Command | Description |
| :--- | :--- |
| `http:cache:warm:up` |  |

### Import

| Command | Description |
| :--- | :--- |
| `import:entity` |  |

### Import-export

| Command | Description |
| :--- | :--- |
| `import-export:delete-expired` | Deletes all expired import/export files |

### Lint

| Command | Description |
| :--- | :--- |
| `lint:container` | Ensures that arguments injected into services match type declarations |
| `lint:twig` | Lints a template and outputs encountered errors |
| `lint:xliff` | Lints a XLIFF file and outputs encountered errors |
| `lint:yaml` | Lints a file and outputs encountered errors |

### Mail-templates

| Command | Description |
| :--- | :--- |
| `mail-templates:assign-to-saleschannels` | Assignes all mailTemplates to all SaleChannels |

### Media

| Command | Description |
| :--- | :--- |
| `media:delete-unused` | Deletes all media files that are never used |
| `media:generate-media-types` | Generates the media type for all media entities |
| `media:generate-thumbnails` | Generates the thumbnails for media entities |

### Messenger

| Command | Description |
| :--- | :--- |
| `messenger:consume` | \[messenger:consume-messages\] Consumes messages |
| `messenger:setup-transports` | Prepares the required infrastructure for the transport |
| `messenger:stop-workers` | Stops workers after their current message |

### Plugin

| Command | Description |
| :--- | :--- |
| `plugin:activate` | Activates given plugins |
| `plugin:create` | Creates a plugin skeleton |
| `plugin:deactivate` | Deactivates given plugins |
| `plugin:install` | Installs given plugins |
| `plugin:list` | Show a list of available plugins. |
| `plugin:refresh` | Refreshes the plugins list in the storage from the file system |
| `plugin:uninstall` | Uninstalls given plugins |
| `plugin:update` | Updates given plugins |
| `plugin:zip-import` | Import plugin zip file. |

### Product-export

| Command | Description |
| :--- | :--- |
| `product-export:generate` |  |

### Pwa

| Command | Description |
| :--- | :--- |
| `pwa:dump-plugins` |  |

### Router

| Command | Description |
| :--- | :--- |
| `router:match` | Helps debug routes by simulating a path info match |

### Sales-channel

| Command | Description |
| :--- | :--- |
| `sales-channel:create` |  |
| `sales-channel:create:storefront` |  |
| `sales-channel:list` |  |
| `sales-channel:maintenance:disable` |  |
| `sales-channel:maintenance:enable` |  |

### Scheduled-task

| Command | Description |
| :--- | :--- |
| `scheduled-task:register` | Registers all available scheduled tasks. |
| `scheduled-task:run` | Worker that runs scheduled task. |

### Secrets

| Command | Description |
| :--- | :--- |
| `secrets:decrypt-to-local` | Decrypts all secrets and stores them in the local vault. |
| `secrets:encrypt-from-local` | Encrypts all local secrets to the vault. |
| `secrets:generate-keys` | Generates new encryption keys. |
| `secrets:list` | Lists all secrets. |
| `secrets:remove` | Removes a secret from the vault. |
| `secrets:set` | Sets a secret in the vault. |

### Sitemap

| Command | Description |
| :--- | :--- |
| `sitemap:generate` | Generates sitemaps for a given shop \(or all active ones\) |

### Snippets

| Command | Description |
| :--- | :--- |
| `snippets:validate` |  |

### State-machine

| Command | Description |
| :--- | :--- |
| `state-machine:dump` | Dump a workflow |

### Store

| Command | Description |
| :--- | :--- |
| `store:download` |  |
| `store:login` |  |

### Swiftmailer

| Command | Description |
| :--- | :--- |
| `swiftmailer:email:send` | Send simple email message |
| `swiftmailer:spool:send` | Sends emails from the spool |

### System

| Command | Description |
| :--- | :--- |
| `system:config:get` |  |
| `system:config:set` |  |
| `system:generate-app-secret` |  |
| `system:generate-jwt-secret` |  |
| `system:install` |  |
| `system:setup` |  |
| `system:update:finish` |  |
| `system:update:prepare` |  |

### Theme

| Command | Description |
| :--- | :--- |
| `theme:change` |  |
| `theme:compile` |  |
| `theme:create` | Creates a theme skeleton |
| `theme:dump` |  |
| `theme:refresh` |  |

### Translation

| Command | Description |
| :--- | :--- |
| `translation:update` | Updates the translation file |

### User

| Command | Description |
| :--- | :--- |
| `user:change-password` |  |
| `user:create` |  |
