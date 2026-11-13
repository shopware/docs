---
nav:
  title: Command Types
  position: 30
meta:
  description: Shopware CLI provides project, extension, and Store commands for builds, validation, publishing, and automatic refactoring of PHP, JavaScript, and Admin Twig.
---

# Command Types

Shopware CLI is organized into three main command scopes that cover the most common development and maintenance workflows:

- Project commands: create, develop, build, and maintain your Shopware project (e.g., build, dump the database, or start the development environment)
- Extension commands: create, build, validate, and package Shopware extensions
- Account commands: publish or update extensions in the Shopware Store

## Automatic refactoring

Shopware CLI also includes an automatic refactoring tool. It uses:

- [Rector](https://getrector.org/) for PHP
- [ESLint](https://eslint.org/) for JavaScript, TypeScript, and Vue
- [Stylelint](https://stylelint.io/) for SCSS
- A converter that migrates deprecated `services.xml` and `routes.xml` plugin configuration

You can run it on an extension or a full project:

```bash
# Example: refactor an extension
shopware-cli extension fix /path/to/your/extension

# Example: refactor an entire project
shopware-cli project fix /path/to/your/project
```

Both commands modify files in place. Use `--dry-run` to see which files would change, and version your code before applying fixes. [Learn more here](automatic-refactoring.md).

### Project commands

Work directly with your [Shopware project](../../../guides/hosting/installation-updates/deployments/index.md) to automate setup and maintenance tasks. Available commands include:

```bash
shopware-cli project create     # Create and install a new Shopware 6 project
shopware-cli project dump       # Export the project database as SQL
shopware-cli project ci         # Turn a project directory into a production build
shopware-cli project sbom       # Generate a CycloneDX SBOM from composer.lock
```

**During CI/CD:** Use `shopware-cli project ci` to build and prepare your deployment artifact (dependencies, compiled theme, built assets). Then, use the [Deployment Helper](../../../guides/hosting/installation-updates/deployments/deployment-helper/index.md) at deploy time to install Shopware, manage extensions, and run database migrations on the target environment.

### Extension commands

Create, build, and validate Shopware [extensions](../../../guides/plugins/index.md) and prepare them for the [Shopware Store](https://store.shopware.com/de/) or for distribution. Available commands include:

```bash
shopware-cli extension create     # Create a new plugin or theme
shopware-cli extension add        # Add an example implementation to a plugin
shopware-cli extension fix        # Apply code-quality fixes to an extension
shopware-cli extension build      # Compile extension Administration and Storefront assets
shopware-cli extension validate   # Validate extension metadata, assets, and code quality
```

### Account commands

Publish and manage your extensions in the [Store](https://store.shopware.com/de/), with commands such as:

```bash
shopware-cli account login                # Log in to Shopware Account
shopware-cli account logout               # Log out of Shopware Account
shopware-cli account producer extension   # List, sync, and upload Extension Store extensions
```

Run any command with `--help` to see its available options. Example: `shopware-cli extension --help`
