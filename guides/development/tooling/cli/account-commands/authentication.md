---
nav:
  title: Authentication
  position: 1

---

# Authentication

To interact with the Shopware Account API, you need to authenticate yourself.

For this, you need to log in using:

```bash
shopware-cli account login
```

and it will ask you interactively for your credentials.

For CI/CD pipelines, you should pass `SHOPWARE_CLI_ACCOUNT_EMAIL` and `SHOPWARE_CLI_ACCOUNT_PASSWORD` as environment variables and call directly the command you want to use.

::: info
For CI/CD tasks you should create a dedicated Shopware Account with limited access to the Shopware Store.
:::

## Multiple companies

A single Shopware Account can be part of multiple companies. You can only interact with one company at a time.

You can use the following commands to list all companies you have access to:

```bash
shopware-cli account company list
```

Next, select the active company with:

```bash
shopware-cli account company use <id>
```
