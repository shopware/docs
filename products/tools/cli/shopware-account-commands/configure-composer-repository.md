---
nav:
  title: Configure Composer Repository
  position: 4

---

# Configure Composer repository

To install extensions from the Shopware Store, you need to configure Composer with authentication credentials for your store account.

## Authenticate with Shopware Account

First, log in to your Shopware Account:

```bash
shopware-cli account login
```

This stores your credentials locally. See the [Authentication](./authentication.md) guide for more information.

## Configure with Shopware Packages token

Create an `auth.json` file in your project root with your Shopware Packages token:

```json
{
  "http-basic": {
    "packages.shopware.com": {
      "username": "token",
      "password": "<your-shopware-packages-token>"
    }
  }
}
```

Get your Shopware Packages token from your Shopware Account: "Shops" > "Licenses" > "..." of one extension > "Install via Composer".

::: warning
Keep `auth.json` out of version control. Add it to `.gitignore` to avoid committing credentials to your repository.
:::
