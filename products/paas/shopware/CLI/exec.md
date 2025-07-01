---
nav:
  title: Executing commands
  position: 60
---

# Executing Commands

The `exec` command allows you to execute commands in a remote terminal session for your applications. This is useful for running commands directly on your application's environment, such as debugging, maintenance, or running one-off commands. Here is [a list of Shopware console commands](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/shopware-cli).

## Usage

```sh
sw-paas exec [flags]
```

## Description

The `exec` command provides two main functionalities:

1. List existing terminal sessions
2. Start a new terminal session.

By default, the command will show existing sessions if there are any or start a new session if no existing sessions are found.

:::info
See this [FAQ section](./../faq) for the main difference between `exec` and `command`
:::

## Flags

- `--application-id string`: The ID of the application you want to execute commands in
- `--new`: Force creation of a new terminal session
- `--organization-id string`: The ID of the organization
- `--project-id string`: The ID of the project
- `-h, --help`: Show help for the exec command

## Examples

1. List existing terminal sessions:

   ```sh
   sw-paas exec
   ```

2. Force creation of a new terminal session:

   ```sh
   sw-paas exec --new
   ```

3. Execute commands in a specific application:

   ```sh
   sw-paas exec --project-id my-project --application-id my-app
   ```

## Notes

- When using the command without any flags, it will automatically handle the session management based on existing sessions
- The `--new` flag is useful when you want to ensure you're starting a fresh session
- Make sure to provide the necessary IDs (application, project, organization) when working with specific resources
- To exit the remote shell, type `exit` and press Enter
- You can reuse existing terminal sessions instead of creating new ones each time, which can be more efficient for ongoing work
