# CLI Setup

The CLI is your tool to connect with your Enterprise cloud environment, push changes and trigger deployments etc.

## Download & Install

In order to install Enterprise cloud CLI, run the following command

```bash
curl -sfS https://cli.shopware.com/installer | php
```

## Add SSH key

For secure communication between your local machine and your Enterprise cloud environment, create a SSH key and add it to your Account using 

```
shopware ssh-key:add
```

and go through the steps provided. When you run the CLI for the first time, it will ask you to log in via your browser.

You can also generate a SSH key manually and add it in the **My profile > SSH Keys** section of your [Enterprise cloud Console](https://console.shopware.com/).

{% hint style="info" %}
**Set up SSH keys**

If unsure, how to create SSH keys, please follow [this tutorial](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) provided by GitHub.
{% endhint %}

## Authenticate

Next, you need to authenticate your CLI, which can be done through your browser. Just run the following command and follow the instructions:

```bash
shopware
```