---
nav:
  title: PaaS CLI Setup
  position: 10

---

# PaaS CLI Setup

The PaaS CLI is your tool to connect with your PaaS environment, push changes, trigger deployments, etc.

## Download and install

To install PaaS CLI, run the following command:

```sh
curl -sfS https://cli.shopware.com/installer | php
```

When you run the PaaS CLI for the first time, it will ask you to log in via your browser.

You can also generate an SSH key manually and add it in the **My profile > SSH Keys** section of your [PaaS Console](https://console.shopware.com/).

::: info
**Set up SSH keys**

If you are unsure of how to create SSH keys, please follow [this tutorial](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) provided by GitHub.
:::

## Authenticate

Next, you need to authenticate your PaaS CLI. This can be done through your browser. Run the following command and follow the instructions:

```sh
sw-paas auth
```

## Access management

After authentication, you can inspect your current access and manage users or service accounts with the account commands.

See [Account](account) for:

* `sw-paas account whoami`
* `sw-paas account context`
* user memberships on organization, project, and application level
* membership requests and approvals
* service accounts, grants, and tokens
