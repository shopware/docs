---
nav:
  title: CLI
  position: 30
---

The Shopware PaaS Native CLI makes it easy to manage your shops and resources in the cloud.

## Prerequisites

Before you start, you'll need a Shopware account. Shopware uses AWS Cognito for identity management. Currently, you must be invited to join our platform before you can access any resources.

Once your organization is onboarded to the Shopware Business Platform (SBP) and users are added to Shopware PaaS Native, the first user gets the admin role. This admin can then assign roles to other users in your organization.

For more on managing users, see our [Organization Guide](../fundamentals/organization.md).

## Installation

To install the CLI, run:

```sh
curl -L https://install.sw-paas-cli.shopware.systems | sh
```

:::info
Soon, you'll also be able to install the CLI using popular package managers.
:::

## Authentication

After installing, you'll need to log in to use the CLI.

Run the following command to open a browser window and log in to your Shopware PaaS Native account. Your authentication token will be saved automatically.

```sh
sw-paas auth
```

For more details on managing your account and creating machine tokens for CI/CD, see the [account command](./account) guide.

## Authorization

To access resources, you need the right roles in your organization. Only users with the **Account Admin** role can assign roles to others.

To check your current role:

```sh
sw-paas account whoami
```

If you are an Account Admin and want to add more users, ask the new user to get their user ID:

```sh
sw-paas account whoami --output json
```

Add the user to your organization and assign a role:

```sh
sw-paas account user add --sub "<user-id of the new user>"
```

## Available commands

To view all available commands with supported flags:

```sh
sw-paas
```

## Need help or found a bug?

If you find a bug or have feedback, please let us know in our [issue tracker](https://github.com/shopware/sw-paas/issues).
