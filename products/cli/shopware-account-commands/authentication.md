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

and it will open a browser window for you to log in.

For CI/CD pipelines, you should pass `SHOPWARE_CLI_ACCOUNT_CLIENT_ID` and `SHOPWARE_CLI_ACCOUNT_CLIENT_SECRET` as environment variables and call directly the command you want to use. The client ID and client secret can be generated in the **Extension Partner** section under the [Development](https://account.shopware.com/producer/development) navigation point in the [Shopware Account](https://account.shopware.com).
