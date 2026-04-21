---
nav:
  title: Account
  position: 70
---

# Account

An account represents your access to resources within the Shopware PaaS Native backend environment. The `sw-paas account` commands cover identity inspection, context management, human user memberships, service accounts, and access tokens.

## Identity and roles

To find what resources you have access to via the CLI:

```sh
sw-paas account whoami
```

This shows the currently authenticated user and the roles attached to that user.

For role details at organization level, see [Organizations](./organization.md).

## Context

To avoid repetitive prompts for `organization-id` and `project-id`, you can set a context and the CLI will automatically use these values without asking.

Setting your context streamlines your workflow by eliminating the need to specify these parameters with every command.

```sh
sw-paas account context set
```

Display the current context:

```sh
sw-paas account context show
```

Delete the saved context:

```sh
sw-paas account context delete
```

The context is saved as `context-production.yaml` and stored alongside the main configuration file in the following locations:

|                 | Unix                   | macOS                                      | Windows        |
|-----------------|------------------------|--------------------------------------------|----------------|
| XDG_CONFIG_HOME | ~/.config/sw-paas      | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |
| XDG_STATE_HOME  | ~/.local/state/sw-paas | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |

## Human user access

Human user memberships at organization, project, and application level are managed through `account user`.

List memberships:

```sh
sw-paas account user list
```

Add a user membership:

```sh
sw-paas account user add
```

Remove a user membership:

```sh
sw-paas account user remove
```

Users can also request access themselves:

```sh
sw-paas account user request
sw-paas account user requests list
```

Users with the `account-admin` role can review and resolve pending requests:

```sh
sw-paas account user requests resolve
```

## Service accounts

Service accounts are machine identities for CI/CD pipelines and other automation.

Create, list, update, or delete a service account:

```sh
sw-paas account service-account create
sw-paas account service-account list
sw-paas account service-account update
sw-paas account service-account delete
```

Manage service account grants:

```sh
sw-paas account service-account grant list
sw-paas account service-account grant add
sw-paas account service-account grant policies
sw-paas account service-account grant revoke
```

## Authentication tokens

The `token` command manages access tokens for either your own account or a service account. Personal access tokens are useful for non-interactive CLI usage, CI/CD pipelines, and integrations with external systems.

Personal access tokens inherit the permissions of the user who created them, except the ability to create new tokens. This means any action the user can perform, the personal token can perform as well.

Service account tokens do not inherit the full permissions of the user who created them. They authenticate as the service account and are limited to the permissions granted to that service account.

### Personal tokens

Generate a new access token:

```sh
sw-paas account token create --name "ci-token"
```

### Using a Token

To use a token you have multiple options:

```sh
token=<your-token-here>
sw-paas --token $token account whoami
sw-paas --token "<your-token-here>" account whoami

# Set it for the current terminal session
export SW_PAAS_TOKEN=<your-token-here>
sw-paas account whoami
```

### Revoking a Token

Remove a specific token by ID:

```sh
sw-paas account token revoke --token-id abcd-1234
```

### Service account tokens

To manage tokens for a service account, pass `--service-account-id`:

```sh
sw-paas account token create --service-account-id <service-account-id>
sw-paas account token list --service-account-id <service-account-id>
sw-paas account token revoke --service-account-id <service-account-id>
```
