---
nav:
  title: Command Types
  position: 30

---

# Command Types

Shopware CLI is organized into three main command scopes that cover the most common development and maintenance workflows:

- Project commands: interact with your Shopware project (e.g., build, dump DB, or sync configuration)
- Extension commands: build and validate Shopware extensions
- Store commands: publish or update extensions in the Shopware Store

## Automatic refactoring

Shopware CLI also includes an automatic refactoring tool for PHP, JavaScript, and Admin Twig files. It uses:

- [Rector](https://getrector.org/) for PHP
- [ESLint](https://eslint.org/) for JavaScript
- Custom rules for Admin Twig

You can run it on an extension or a full project:

```bash
# Example: refactor an extension
shopware-cli extension fix /path/to/your/extension

# Example: refactor an entire project
shopware-cli project fix /path/to/your/project
```

Always back up or version your code before running refactoring commands, as they will modify files in place. [Learn more here](./automatic-refactoring.md).

### Project commands

Work directly with your [Shopware project](../../../guides/hosting/installation-updates/deployments/index.md) to automate setup and maintenance tasks. Available commands include:

```bash
shopware-cli project create         # Create a new Shopware 6 project
shopware-cli project dump       # Dumps the Shopware database
shopware-cli project ci          # Build Shopware in the CI
```

### Extension commands

Create, build, and validate Shopware [extensions](../../../guides/plugins/index.md) and prepare them for the [Shopware Store](https://store.shopware.com/de/) or for distribution. Available commands include:

```bash
shopware-cli extension fix   # Fix an extension
shopware-cli extension build    # Builds assets for extensions
shopware-cli extension validate         # Validate an extension
```

### Store commands

Publish and manage your extensions in the [Store](https://store.shopware.com/de/), with commands such as:

```bash
shopware-cli account login    # Log in to the Shopware Store (account.shopware.com)
shopware-cli token            # Manage tokens for Store authentication
```

Run any command with `--help` to see its available options. Example: `shopware-cli extension --help`
