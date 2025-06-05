---
nav:
  title: Managing your Account and Users
  position: 30
---

# Account

The `account` command gives you access to account-level operations such as context management, token handling, user-role mapping, and role identification. An **account** represents your access to resources within our backend environment.

## Usage

```sh
sw-paas account [command]
```

## Commands

### Account Context

The `context` command lets you define and manipulate a _context file_, allowing the CLI to skip repetitive prompts for `organization-id` and `project-id`. The default context file is saved as `context-production.yaml` and stored alongside the main config file. Below is the location of where these files are stored.

|                 | Unix                   | MacOS                                      | Windows        |
|-----------------|------------------------|--------------------------------------------|----------------|
| XDG_CONFIG_HOME | ~/.config/sw-paas      | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |
| XDG_STATE_HOME  | ~/.local/state/sw-paas | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |

**Usage:**

```sh
sw-paas account context [command]
```

**Available Subcommands:**

- `set`: Define or update your current context.
- `show`: Display the currently active context values.
- `delete`: Remove the saved context.

**Examples:**

```sh
# Set a new context for organization and project
sw-paas account context set --organization-id org-123 --project-id proj-456

# Set a new context for organization skipping project
sw-paas account context set --organization-id org-123 --skip-project-id

# View the current context
sw-paas account context show

# Delete the current context file
sw-paas account context delete
```

### Authentication Tokens

The `token` command manages personal access tokens for secure API and CLI usage. Tokens can be created, listed, and revoked.

**Usage:**

```sh
sw-paas account token [command]
```

**Available Subcommands:**

- `create`: Generate a new access token.
- `list`: View all your active tokens.
- `revoke`: Remove a specific token.

**Examples:**

```sh
# Create a new token
sw-paas account token create --name "ci-token"

# List all active tokens
sw-paas account token list

# Revoke a token by ID
sw-paas account token revoke --token-id abcd-1234
```

### Users and Roles

Use the `user` command to map users to specific roles within the organization. Only users with sufficient privileges (e.g., admin) can modify roles.

**Usage:**

```sh
sw-paas account user [command]
```

**Available Subcommands:**

- `add`: Add a user to the organization with a specific role.
- `remove`: Remove a user from a role.

If you already have the `project-admin` role and wish to add additional users to your organization, they can share their **user ID (sub-id)** with you. You can instruct them to retrieve it using the following command:

```sh
sw-paas account whoami --output json
```

Or, if they have `jq` installed for easier parsing:

```sh
sw-paas account whoami --output json | jq ".sub"
```

Once you receive their `sub` (subject ID), you can proceed to add them to your organization with the appropriate role.

**Available Roles:**

- `read-only`: Gets access to projects and applications. Only action allowed are `get` and `list`.
- `developer`: Gets access to projects and applications. All actions are allowed.
- `account-admin`: Gets access to projects and applications. All actions are allowed.
- `project-admin`: Gets access to account management. Actions for manageing Users are allowed.

**Examples:**

```sh
# Add a new user as a developer
sw-paas account user add --sub adbs-123 --organization-id abc-123 --role developer

# Remove a user from the developer role
sw-paas account user remove --sub adbs-123 --organization-id abc-123 --role developer
```

### **whoami** – Show Your Identity and Roles

Use the `whoami` command to display your identity, including your User ID(Sub ID), email, and associated policies within the account.

**Usage:**

```sh
sw-paas account whoami
```

This is especially helpful for confirming which roles and permissions are currently active in a given account.

## **Tips**

- Always set a context to reduce repetitive prompts across commands.
- Token management is essential for CI/CD and script-based access. You can use this in environments such as Github Action, CircleCI, GitLab CI, Travis CI etc.
- Use `whoami` to verify access if permission errors occur.
