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

For older Shopware versions with known security vulnerabilities, it is possible to use `--no-audit` to bypass Composer's security advisory blocking:

```bash
shopware-cli project create <folder-name> <version> --no-audit
```

This allows installation of older versions that have known security issues. Use with caution and consider installing the [Shopware Security plugin](https://store.shopware.com/en/swag136939272659f/shopware-6-security-plugin.html) to backport security fixes.

## Development environment

Shopware CLI provides a fully integrated Docker-based development environment. See the [Development Environment](../../../../guides/development/dev-environment.md) guide for the full workflow, or the [CLI command reference](./dev-environment.md) for a quick overview.

```bash
# Launch the interactive development terminal user interface (TUI)
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

The `admin-build` command runs npm install on first execution, which takes longer initially. Subsequent runs are faster since dependencies are cached.

The `admin-watch` command: faster than `admin-build` because it monitors changes and rebuilds only what changed. See changes in real-time during development without waiting for a full rebuild.

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

Starting Messenger workers manually with `bin/console messenger:consume` gets complicated when you need multiple workers running simultaneously. Usually you don't want just one: multiple workers handle higher message throughput.

Shopware CLI provides a wrapper to easily start multiple workers:

```bash
shopware-cli project worker <amount>
```

For example, start three workers: `shopware-cli project worker 3`

For production: use **supervisord** or **systemd** for process management. For development: quick way to spawn multiple workers without manual setup. Widely used by [Shopware PaaS](../../../paas/shopware-paas/).

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

A shorter `swx` alias is also available. See [Running Shopware commands](../../../../guides/development/dev-environment.md#running-shopware-commands).

## Admin API

The `project admin-api` command is a pre-authenticated curl wrapper for the Shopware Admin API. Instead of manually handling JWT token generation and headers, this command handles authentication automatically:

```bash
shopware-cli project admin-api GET /_info/version
shopware-cli project admin-api POST /api/search/product -d '{"limit":10}'
```

It works like curl with the same flags (`-d` for data, `-H` for headers, etc.), but pre-authenticated. This is especially useful for bash scripting and automation where getting curl authentication working can be complex.

To extract the JWT token for use in other scripts:

```bash
shopware-cli project admin-api --output-token
```

This outputs the token that you can use in your own curl commands or scripts.

## Project validation

To validate your entire Shopware project and all its extensions, use:

```bash
shopware-cli project validate
```

This runs validation checks on all extensions in your project. Available flags:

```bash
shopware-cli project validate --reporter json
shopware-cli project validate --only phpstan
shopware-cli project validate --exclude rector
```

See [Validation](../validation.md) for more details on validation tools.

## Project diagnostics

The `doctor` command checks your Shopware project for common issues and problems:

```bash
shopware-cli project doctor
```

This is useful when you encounter problems with your setup and need to understand what might be misconfigured. The output provides information about your environment and project configuration.

## Project configuration schema

To view the JSON schema for the `.shopware-project.yml` configuration file:

```bash
shopware-cli project config-schema
```

This outputs the JSON schema describing all available configuration options in `.shopware-project.yml`. Useful for automation and understanding the project configuration structure.

## Initialize project configuration

To create a new `.shopware-project.yml` configuration file interactively:

```bash
shopware-cli project config init
```

This generates a basic configuration file for your Shopware project. The file is also referenced in development environment setup and deployment configurations.

## Generate JWT secret

```bash
shopware-cli project generate-jwt <path-to-project>
```

Generates new JWT secret keys (private and public) and stores them in `<path-to-project>/config/jwt/`. Required only for Shopware versions before 6.5; in 6.5+, JWT secrets are generated automatically.

Output as environment variables:

```bash
shopware-cli project generate-jwt --env
```

This outputs keys as `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` environment variables (base64-encoded), useful for CI/CD environments.
