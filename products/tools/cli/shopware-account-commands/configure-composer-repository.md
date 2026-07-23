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

## Manual composer configuration

After logging in, you can manually create an `auth.json` file in your project root with your store credentials:

```json
{
  "http-basic": {
    "packages.shopware.com": {
      "username": "<your-username>",
      "password": "<your-password>"
    }
  }
}
```

Replace `<your-username>` and `<your-password>` with your Shopware Account credentials.

::: warning
Keep `auth.json` out of version control. Add it to `.gitignore` to avoid committing credentials to your repository.
:::
