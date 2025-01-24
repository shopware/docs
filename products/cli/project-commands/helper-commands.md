---
nav:
  title: Helper Commands
  position: 5

---

# Helper Commands

This is a curated list of helper commands that are useful for your daily work with Shopware-CLI in your Shopware project.

## Create a new project

To create a new project, you can use the following command:

```bash
shopware-cli project create <folder-name>
```

It will ask you for the Shopware version. You can pass also the version as second parameter:

```bash
shopware-cli project create <folder-name> <version>
```

The version parameter can be also `latest` for the latest stable version or `dev-trunk` for the latest development version.

## Replacements to include in shell scripts

Shopware-CLI contains replacements for `bin/build-administration.sh` and `bin/build-storefront.sh`.

| Shell Script                | Shopware Command                        |
|-----------------------------|-----------------------------------------|
| bin/build-storefront.sh     | `shopware-cli project storefront-build` |
| bin/build-administration.sh | `shopware-cli project admin-build`      |
| bin/watch-storefront.sh     | `shopware-cli project storefront-watch` |
| bin/watch-administration.sh | `shopware-cli project admin-watch`      |

Additionally to the replacement, Shopware-CLI allows to only watch a specific set of extensions or exclude few.

To only watch specific:

```bash
shopware-cli project admin-watch --only-extensions <name>,<second>....
```

To exclude specific:

```bash
shopware-cli project admin-watch --skip-extensions <name>,<second>....
```

## Worker

Usually you have to start the worker with `bin/console messenger:consume` in the project root directory. But if you want to have more than one worker at once, it gets a bit tricky. Shopware-CLI has a helper command for that:

```bash
shopware-cli project worker <amount>
```

For production, you should let this handle **supervisord** or **systemd**. But for development, this is a quick way to start multiple workers.

## Clear cache

It is just a short cut for `bin/console cache:clear` without having to be in the project root directory.

```bash
shopware-cli project clear-cache
```

If in the `.shopware-project.yml` a API connection is configured, it will clear the remote instance cache.

## Console

Similar to `clear-cache`, there is also a general shortcut for `bin/console`:

```bash
shopware-cli project console <command>
```

## Generate JWT secret

To generate a new JWT secret, you can use the following command:

```bash
shopware-cli project generate-jwt
```

It is similar to `bin/console system:generate-jwt-secret`, but requires no Shopware project to be present or PHP to be installed.

## Admin API

If you want to make requests against the Shopware-API using curl, you need to obtain a JWT token and add it as a header. Shopware-CLI has a helper command for that:

```bash
shopware-cli project admin-api --output-token
```

This will output the JWT token to the console. You can also make directly API requests like:

```bash
shopware-cli project admin-api GET /_info/version
```

You can also pass more options like `-d` for data or `-H` for headers as you would do with curl.
