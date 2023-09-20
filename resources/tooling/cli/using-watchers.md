# Hot Module Reloading

## Watchers

When developing with Shopware, you will probably notice that changes in JavaScript require commands to build the Administration or Storefront, depending on your change using the following commands:

<Tabs>
<Tab title="Administration (Composer)">

```bash
composer run build:js:admin
```

</Tab>

<Tab title="Administration (Shell)">

```bash
./bin/build-administration.sh
```

</Tab>

<Tab title="Storefront (Composer)">

```bash
composer run build:js:storefront
```

</Tab>

<Tab title="Storefront (Shell)">

```bash
./bin/build-storefront.sh
```

</Tab>
</Tabs>

This building process is always time-consuming. Alternatively, to speed up the process, Shopware's Production template offers composer commands to enable Hot Module Reloading/watchers to automatically reload and preview your changes.

::: info
This procedure doesn't replace the final build process when you finish developing your feature.
:::

To enable Hot Module Reloading, use the following composer commands:

<Tabs>
<Tab title="Administration">

```bash
composer run watch:admin
```

</Tab>

<Tab title="Storefront">

```bash
composer run watch:storefront
```

</Tab>
</Tabs>

### Environment variables

Using environment variables can also affect Shopware and, therefore, its watchers. Like in Unix, prefixing command calls with a variable set will run the command with the respective change. The following example will run the storefront watcher in production mode:

```bash
APP_ENV=prod composer run watch:storefront
```

#### APP_ENV

When using `APP_ENV=dev`, Shopware runs in development mode and provides features for debugging - for example, the Symfony toolbar in the Storefront, while its counterpart `APP_ENV=prod` enables production mode and therefore disables any such tools.

#### IPV4FIRST

Starting with NodeJS v17.0.0, it prefers IPv6 over IPv4. However, in some setups, IPv6 may cause problems when using watchers. In such cases, setting `IPV4FIRST=1` reverts this behavior.
