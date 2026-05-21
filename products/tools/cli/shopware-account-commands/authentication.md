---
nav:
  title: Authentication
  position: 1

---

# Authentication

To interact with the Shopware Account API, you need to authenticate yourself. Run the command:

```bash
shopware-cli account login
```

A browser window will open for you to log in.

For CI/CD pipelines, pass `SHOPWARE_CLI_ACCOUNT_CLIENT_ID` and `SHOPWARE_CLI_ACCOUNT_CLIENT_SECRET` as environment variables and directly call the command you want to use. The client ID and client secret can be generated in the **Extension Partner** section under the [Development](https://account.shopware.com/producer/development) navigation point in the [Shopware Account](https://account.shopware.com).
