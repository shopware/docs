---
nav:
  title: Tooling
  position: 10

---

# Tooling

Shopware provides official tools that support the full lifecycle of a Shopware project, from development to deployment and long-term maintenance:

- [Admin Extension SDK](/resources/admin-extension-sdk/): an NPM library for Shopware 6 apps and plugins that need an easy way to extend or customize the Administration.

- `bin/console`: Shopware's built-in CLI, used for installing and activating plugins, running database migrations, clearing caches, executing scheduled tasks, and inspecting system state. See [command reference guide](../../../resources/references/core-reference/commands-reference.md).

- [Deployment Helper](../../hosting/installation-updates/deployments/deployment-helper.md):  Supports database and maintenance operations for deployments (e.g., migrations, cache handling).

- [Fixture Bundle](../../../guides/development/tooling/fixture-bundle.md): Seed development environments with demo and test data.

- For IDE support, Shopware provides a [PHPStorm plugin](shopware-toolbox.md) and [VS Code extension](https://marketplace.visualstudio.com/items?itemName=shopware.shopware-lsp).

- [Shopware CLI](../../../products/cli/index.md): The central command-line tool for working with Shopware projects and extensions, including scaffolding, builds, validation, packaging, Store interaction, CI support, and development workflows such as watchers and [formatting](../../../products/cli/formatter.md).

- [MCP Server](./mcp-server/index.md): A native Model Context Protocol server that lets AI clients (Claude Desktop, Cursor, Claude Code) interact with a Shopware shop through tools, resources, and prompts. Extensible via plugins and apps.
