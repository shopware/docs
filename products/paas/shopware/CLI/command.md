---
nav:
  title: Managing commands
  position: 50
---

# Managing Commands

The `command` command allows you to create and manage commands that are executed in dedicated containers. This is particularly useful for CI/CD environments or when you need to run commands asynchronously without waiting for their completion.

## Usage

```sh
sw-paas command [command]
```

:::info
The default execution directory is `/var/www/html`
The container has a time-to-live (TTL) of 1 hour, so your command must complete within that timeframe.
:::

## Description

Unlike the `exec` command which provides an interactive shell session, the `command` command executes your commands in dedicated containers that are spun up specifically for that purpose. This approach is better suited for:

- CI/CD environments
- Asynchronous command execution
- Automated processes
- Situations where you don't need to wait for command completion

Here is [a list of Shopware console commands](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/shopware-cli).

## Available Commands

### `command create`

Create a new command that will be executed in a dedicated container.

```sh
sw-paas command create [flags]
```

### `command get`

Get detailed information about a specific command.

```sh
sw-paas command get [flags]
```

### `command list`

List all available commands.

```sh
sw-paas command list [flags]
```

### `command output`

Get the output of a specific command.

```sh
sw-paas command output [flags]
```

:::info
See this [FAQ section](./../faq) for the main difference between `exec` and `command`
:::

## Examples

1. Create a new command:

   ```sh
   sw-paas command create --project-id my-project --application-id my-app --script "bin/console cache:clear"
   ```

2. List all commands:

   ```sh
   sw-paas command list
   ```

3. Get command output:

   ```sh
   sw-paas command output --command-id abc123
   ```

## Notes

- Commands are executed in isolated containers, ensuring clean environments for each execution
- You can track command execution status and retrieve output even after the command has completed
- This approach is more suitable for automated processes than interactive debugging
