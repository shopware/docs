---
nav:
  title: Tooling
  position: 10

---

# Tooling

Shopware provides official tools that support the full lifecycle of a Shopware project, from development to deployment and long-term maintenance.

## Choosing the right CLI

Shopware projects use two main command-line entry points:

| Tool                                                        | Use it for                                                                                                                                                                                                |
|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `bin/console`                                               | Commands provided by the Shopware application itself, such as plugin lifecycle commands, database migrations, cache clearing, scheduled tasks, and system inspection.                                     |
| [`shopware-cli`](https://github.com/shopware/shopware-cli/) | Project and extension tooling around Shopware, such as creating projects, running the development environment, building assets, validating and packaging extensions, Store interaction, and CI workflows. |
| `shopware-cli project console <command>`                    | Running a Shopware `bin/console` command through Shopware CLI when you want the CLI to resolve the project context for you.                                                                               |
| `swx <command>`                                             | Short alias for `shopware-cli project console <command>`, useful for daily development commands.                                                                                                          |
| `shopware-cli project dev`                                  | Starting the interactive local development environment and TUI for managing the Docker-based stack, logs, watchers, and common development tasks.                                                         |

As a rule of thumb: use `bin/console` for application-level Shopware commands, use `shopware-cli` for project, extension, build, CI, and development-environment workflows, and use `swx` when you want a quick wrapper around `bin/console`.

## Raw commands, helper commands, or deployment tooling?

Use the lowest-level command that fits the task, but prefer helper or deployment tooling when the same steps need to be repeated reliably.

| Situation                                                 | Prefer                                                      | Why                                                                                                                                                      |
|-----------------------------------------------------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Running a one-off Shopware application command locally    | `bin/console`                                               | Direct access to commands provided by the Shopware application.                                                                                          |
| Running common Shopware commands during daily development | `shopware-cli project console <command>` or `swx <command>` | Wraps `bin/console` through Shopware CLI and resolves the project context for you.                                                                       |
| Starting or managing the local development stack          | `shopware-cli project dev`                                  | Provides the interactive development environment for the Docker-based stack, logs, watchers, and common development tasks.                               |
| Building a project in CI                                  | `shopware-cli project ci`                                   | Produces a reproducible build artifact with dependencies and assets prepared before deployment.                                                          |
| Generating a project SBOM                                 | `shopware-cli project sbom`                                 | Writes a CycloneDX 1.7 Software Bill of Materials from `composer.lock` without running the full CI build.                                                  |
| Installing, updating, or maintaining a deployed instance  | Deployment Helper                                           | Automates deploy-time tasks such as install/update detection, migrations, extension management, maintenance mode, cache handling, and one-time commands. |
| Debugging an exceptional production issue manually        | Raw commands, carefully                                     | Useful for investigation, but repeated deployment or maintenance steps should move into Deployment Helper configuration.                                 |

As a rule of thumb: use raw `bin/console` commands for direct local or diagnostic work, Shopware CLI helpers for daily development convenience, and Deployment Helper for repeatable deployment and maintenance workflows.

## Available tooling

- [Development Environment](../dev-environment.md): The Docker-based development environment with an interactive terminal dashboard that manages your entire stack, streams logs, and controls watchers.

- [Admin Extension SDK](https://developer.shopware.com/resources/admin-extension-sdk/): an NPM library for Shopware 6 apps and plugins that need an easy way to extend or customize the Administration.

- `bin/console`: Shopware's built-in CLI, used for installing and activating plugins, running database migrations, clearing caches, executing scheduled tasks, and inspecting system state. See [command reference guide](../../../resources/references/core-reference/commands-reference.md).

- [Deployment Helper](../../hosting/installation-updates/deployments/deployment-helper.md): Supports database and maintenance operations for deployments (e.g., migrations, cache handling).

- [Fixture Bundle](../../../guides/development/tooling/fixture-bundle.md): Seed development environments with demo and test data.

- For IDE support, Shopware provides a [PHPStorm plugin](shopware-toolbox.md) and [VS Code extension](https://marketplace.visualstudio.com/items?itemName=shopware.shopware-lsp).

- [Shopware CLI](../../../products/tools/cli/index.md): The central command-line tool for working with Shopware projects and extensions, including scaffolding, builds, validation, packaging, Store interaction, CI support, and development workflows such as watchers and [formatting](../../../products/tools/cli/formatter.md).

- [MCP Server](./mcp-server/index.md): A native Model Context Protocol server that lets AI clients (Claude Desktop, Cursor, Claude Code) interact with a Shopware shop through tools, resources, and prompts. Extensible via plugins and apps.
