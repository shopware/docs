---
nav:
  title: Development
  position: 30
---

# Development

This guide covers post-installation information for building, extending, and debugging Shopware during development. The development path depends on what is being built:

* Custom project
* Extension: apps, plugins, or plugin-based themes
* Storefront customization
* Administration extension
* Headless integration

All development scenarios share common foundations:

* APIs
* Testing
* Tooling
* CLI and system commands
* Configuration
* Debugging

To build a custom Shopware project without creating an extension for distribution, start here.

## Extension development

To build an [Extensions](extensions/index.md), first choose the correct type:

* Plugin
* App
* Plugin-based theme

Each extension guide walks you through the full development flow: creation → lifecycle → implementation → testing.

To sell an extension or offer paid features, see the [Monetization guide](monetization/index.md) for available models such as paid extensions, In-App Purchases, and commission-based integrations.

## Typical development workflow

Most development follows this sequence:

* Set up the environment
* Create the project or extension
* Install and activate it
* Implement business logic
* Extend Storefront or Administration
* Add configuration or database changes (if required)
* Test and debug

Before beginning implementation, review the recommended [Code structure](extensions/code-structure.md) guide. A consistent architecture prevents long-term maintenance issues and reduces upgrade friction.

Before starting new development, review the [Upgrades and Migrations](../upgrades-migrations/index.md) section to avoid patterns that are deprecated or scheduled for removal.

:::info Upgrade impact in real projects
Upgrade complexity depends on the installation:

* Heavy custom code increases migration effort.
* No custom code but 60 Store plugins can be equally complex.
* Most real-world projects fall somewhere in between.

A consistent architecture, centralized CI, and controlled extension strategy help you get ahead of upgrade pain.
:::

Set up automated testing and [Continuous Integration (CI)](testing/ci.md) early. Static analysis, tests, and reproducible builds help catch breaking changes before they reach production.

## Working in the system

### Administration

To begin any development, first access the Administration by opening [http://localhost/admin](http://localhost/admin).

Use the Administration to:

* Install and activate extensions
* Configure the system
* Manage entities such as products and customers
* Verify extension behavior

The Administration is part of the runtime environment and will be used throughout development.

### Development tooling

* `bin/console`: Shopware's built-in CLI, used for installing and activating plugins, running database migrations, clearing caches, executing scheduled tasks, and inspecting system state. See [command reference guide](../../resources/references/core-reference/commands-reference.md).
* The standalone [Shopware CLI](../../products/cli/installation.md) supports project scaffolding, CI/CD workflows, automation tasks, and more. See the [helper commands guide](../../products/.../helper-commands.md).
* IDE support: Shopware provides a [PHPStorm plugin](tooling/shopware-toolbox.md) and [VS Code extension](https://marketplace.visualstudio.com/items?itemName=shopware.shopware-lsp).
* [Deployment Helper](../hosting/installation-updates/deployments/deployment-helper.md):  Supports database and maintenance operations for deployments (e.g., migrations, cache handling).

### Troubleshooting

The [troubleshooting](troubleshooting/index.md) guides provide reference information about the data abstraction layer (DAL), flow, and rules.
