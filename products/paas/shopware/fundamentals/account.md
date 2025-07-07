---
nav:
  title: Account
  position: 60
---

# Account

An account represents your access to resources within the Shopware PaaS Native backend environment which includes context management, token handling, and role identification.

## Roles

To find what resources you have access to via the CLI:

```sh
sw-paas account whoami
```

## Context

To avoid repetitive prompts for `organization-id` and `project-id`, you can set a context and the CLI will automatically use these values without asking.

Setting your context streamlines your workflow by eliminating the need to specify these parameters with every command.

```sh
sw-paas account context set
```

The context is saved as `context-production.yaml` and stored alongside the main configuration file in the following locations:

|                 | Unix                   | macOS                                      | Windows        |
| --------------- | ---------------------- | ------------------------------------------ | -------------- |
| XDG_CONFIG_HOME | ~/.config/sw-paas      | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |
| XDG_STATE_HOME  | ~/.local/state/sw-paas | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |

## Authentication Tokens

The `token` command manages personal access tokens, enabling secure authentication for both API and CLI operations without exposing your main account credentials. Personal access tokens are especially useful for automating workflows, such as authenticating in CI/CD pipelines or integrating with external systems.

### Creating a Token

Generate a new access token:

```sh
sw-paas account token create --name "ci-token"
```

### Revoking a Token

Remove a specific token by ID:

```sh
sw-paas account token revoke --token-id abcd-1234
```
