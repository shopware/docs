---
nav:
  title: Configure Composer Repository
  position: 4

---

# Configure composer repository

To install extensions from the Shopware Store, you need to configure the Composer repository in your `composer.json` file. Shopware CLI can configure this for you automatically.

First, make sure you have access to the given Shop in Shopware Account. You can check this with the following command:

```bash
shopware-cli account merchant shop list
```

If you don't see the shop you want to use, you need to switch to the correct company with the following command. Check the [Authentication](./authentication.md) guide for more information.

To create a `auth.json` file with the Composer repository configuration, you can use the following command:

::: info
You can also use the tab completion in the terminal to get the domains of the shops you have access to.
:::

```bash
shopware-cli account merchant shop configure-composer <domain>
```

This will create `auth.json` and append the Composer repository configuration to your `composer.json` file.
