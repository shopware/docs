---
nav:
  title: Hot Module Reloading using watchers
  position: 10

---

# Hot Module Replacement

## Building JS and CSS

When developing with Shopware, you will probably notice that changes in JavaScript require commands to build the Administration or
Storefront, depending on your change using the following commands:

<Tabs>
<Tab title="Build administration (Source code)">

```bash
composer run build:js:admin
```

</Tab>

<Tab title="Build administration (Production template)">

```bash
./bin/build-administration.sh
```

</Tab>

<Tab title="Build storefront (Source code)">

```bash
composer run build:js:storefront
```

</Tab>

<Tab title="Build storefront (Production template)">

```bash
./bin/build-storefront.sh
```

</Tab>
</Tabs>

## Watchers

This building process is always time-consuming. Alternatively, to speed up the process.
Shopware's [Production template](https://github.com/shopware/production) and [Source code](https://github.com/shopware/shopware) offers
commands to enable Hot Module Replacement (HMR) to automatically reload and preview your changes.

::: info
This procedure doesn't replace the final build process when you finish developing your feature.
:::

To enable Hot Module Replacement, use the following composer commands in the Shopware source code:

<Tabs>
<Tab title="Admin watcher">

```bash
composer run watch:admin
```

</Tab>

<Tab title="Storefront watcher">

```bash
composer run watch:storefront
```

</Tab>

</Tabs>

To enable Hot Module Reloading, use the following shell scripts in the Shopware Production template:

<Tabs>

<Tab title="Admin watcher">

```bash
./bin/watch-administration.sh
```

</Tab>

<Tab title="Storefront watcher">

```bash
./bin/watch-storefront.sh
```

</Tab>
</Tabs>

### Environment variables

Using environment variables can also affect Shopware and, therefore, its watchers. Like in Unix, prefixing command calls with a variable set
will run the command with the respective change. The following example will run the storefront watcher in production mode:

```bash
APP_ENV=prod composer run watch:storefront
```

#### APP_ENV

When using `APP_ENV=dev`, Shopware runs in development mode and provides features for debugging - for example, the Symfony toolbar in the
Storefront, while its counterpart `APP_ENV=prod` enables production mode and therefore disables any such tools.

#### IPV4FIRST

Starting with NodeJS v17.0.0, it prefers IPv6 over IPv4. However, in some setups, IPv6 may cause problems when using watchers. In such
cases, setting `IPV4FIRST=1` reverts this behavior.
