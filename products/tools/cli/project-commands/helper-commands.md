---
nav:
  title: Helper Commands
  position: 5

---

# Helper Commands

This is a curated list of helper commands that are useful for your daily work with Shopware CLI in your Shopware project.

## Create a new project

To create a new project, you can use the following command:

```bash
shopware-cli project create <folder-name>
```

It will ask you for the Shopware version. You can pass the version as the second parameter:

```bash
shopware-cli project create <folder-name> <version>
```

The version parameter can be also `latest` for the latest stable version or `dev-trunk` for the latest development version.

## Development Environment

Shopware CLI provides a fully integrated Docker-based development environment. See the [Development Environment](../../../../guides/development/dev-environment.md) guide for the full workflow, or the [CLI command reference](./dev-environment.md) for a quick overview.

```bash
# Launch the interactive dashboard
shopware-cli project dev

# Start/stop in the background
shopware-cli project dev start
shopware-cli project dev status
shopware-cli project dev stop

# View application logs
shopware-cli project logs
```

## Replacements to include in shell scripts

Shopware CLI contains replacements for `bin/build-administration.sh` and `bin/build-storefront.sh`.

| Shell Script                | Shopware Command                        |
|-----------------------------|-----------------------------------------|
| bin/build-storefront.sh     | `shopware-cli project storefront-build` |
| bin/build-administration.sh | `shopware-cli project admin-build`      |
| bin/watch-storefront.sh     | `shopware-cli project storefront-watch` |
| bin/watch-administration.sh | `shopware-cli project admin-watch`      |

In addition to the replacements, Shopware CLI allows only watching a specific set of extensions or excluding a few.

To only watch specific extensions:

```bash
shopware-cli project admin-watch --only-extensions <name>,<second>....
```

To exclude specific extensions:

```bash
shopware-cli project admin-watch --skip-extensions <name>,<second>....
```

### Building only custom extensions

When working with many third-party extensions, `project storefront-build` and `project admin-build` would become slow, when all extensions are built.
This is unnecessary because store extensions are shipped together with their assets.

Use

```bash
shopware-cli project storefront-build --only-custom-static-extensions
shopware-cli project admin-build --only-custom-static-extensions
```

to build only extensions in the `custom/static-plugins` folder of your project, which are usually not shipping the assets.

## Worker

Usually you have to start the worker with `bin/console messenger:consume` in the project root directory. But if you want to have more than one worker at once, it gets a bit tricky. Shopware CLI has a helper command for that:

```bash
shopware-cli project worker <amount>
```

For production, you should let this handle **supervisord** or **systemd**. But for development, this is a quick way to start multiple workers.

## Clear cache

It is just a shortcut for `bin/console cache:clear` without having to be in the project root directory.

```bash
shopware-cli project clear-cache
```

If an API connection is configured in the `.shopware-project.yml`, it will clear the remote instance cache.

## Console

Similar to `clear-cache`, there is also a general shortcut for `bin/console`:

```bash
shopware-cli project console <command>
```

## Admin API

If you want to make requests against the Shopware-API using curl, you need to get a JWT token and add it as a header. Shopware CLI has a helper command for that:

```bash
shopware-cli project admin-api --output-token
```

This will output the JWT token to the console. You can also make directly API requests like:

```bash
shopware-cli project admin-api GET /_info/version
```

You can also pass more options like `-d` for data or `-H` for headers as you would do with curl.
