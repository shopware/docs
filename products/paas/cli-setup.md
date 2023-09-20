# CLI Setup

The CLI is your tool to connect with your PaaS environment, push changes, trigger deployments, etc.

## Download and install

To install PaaS CLI, run the following command:

```sh
curl -sfS https://cli.shopware.com/installer | php
```

## Add SSH key

For secure communication between your local machine and your PaaS environment, create an SSH key, add it to your Account using the below command and go through the steps provided.

```sh
shopware ssh-key:add
```

When you run the CLI for the first time, it will ask you to log in via your browser.

You can also generate an SSH key manually and add it in the **My profile > SSH Keys** section of your [PaaS Console](https://console.shopware.com/).

::: info
**Set up SSH keys**

If you are unsure of how to create SSH keys, please follow [this tutorial](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) provided by GitHub.
:::

## Authenticate

Next, you need to authenticate your CLI. This can be done through your browser. Just run the following command and follow the instructions:

```sh
shopware
```
