---
nav:
  title: Shopware PaaS CLI
  position: 10
---

The Shopware PaaS CLI allows you to manage shops and resources within the PaaS cloud in a simple way.

## Prerequisites

To access Shopware PaaS resources via the CLI, you must first have an account. Shopware uses AWS Cognito as its identity provider. At present, users must be invited to our identity platform before they can access any resources.

Once your organization is successfully onboarded to the Shopware Business Platform (SBP) and users added to Shopware PaaS, the initial user is assigned the admin role. This admin user can then assign roles to the rest of the organization.

For details on managing users, refer to our [Account Management Commands Guide](./commands/account.md).

## Installation

Visit the [releases page for the sw-paas](https://github.com/shopware/paas-cli/releases) GitHub project and find the appropriate archive for your operating system and architecture. Download the archive and retrieve it to your home directory.

:::info
To make this as easy as possible, we will be adding the binaries to some package managers soon.
:::

## Authentication

After successful installation, you will need to authenticate to enable authorized access to other CLI functionalities.

The `auth` command opens a browser window where you log in to your Shopware PaaS account. After successful login, the authentication token is retrieved and saved in the `XDG` state directory, which depends on your system.

```sh
sw-paas auth
```

To view your user-id and roles in the PaaS system, execute:

```sh
sw-paas account whoami
```

Visit [the account command](./account) walkthrough for more information on how to manage your account and provision machine tokens for CI/CD pipelines.

## Authorization

To access resources in our paas system, you need to have specific roles inside the organization. To add somebody to a role in your organization you need to have **Account Admin** role in your organization.

Check for the role:

```sh
sw-paas account whoami
```

If you are already `Account Admin`, and you would like to add more users.

On the cli use this command to get the user-id:

```sh
sw-paas account whoami --output json
# or if you have jq installed
sw-paas account whoami --output json | jq ".sub"
```

Add the user to your organization and select a new role:

```sh
sw-paas account user add --sub "<user-id of the new user>"
```

### Report an issue

Should you spot a bug, please report it in our [issue tracker](https://github.com/shopware/paas-cli/issues).
