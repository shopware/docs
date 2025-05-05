---
nav:
   title: Frontend app installation
   position: 30

---

# Frontend App Installation

::: warning
After finish install the plugin into Shopware platform, we will run & connect the frontend template with Shopware platform.
The frontend template is built based on the Shopware Frontends framework, so it inherits from Shopware Frontends & Nuxt 3 concepts.
:::

## Get the frontend template

* From the *Digital Sales Rooms* plugin, you can find the dsr-frontends folder by:

```shell
cd ./templates/dsr-frontends
```

* This folder contains all the source code for the frontend template. You can copy the entire source code and push it to your own private repository for easy customization in the future.

## How to run?

### Generate env file

```shell
cp .env.template .env
```

| Key | Required? | Description                     |
|-----|-----------| --------------------------------|
| ORIGIN | Yes | This is current frontend app domain. E.g: `https://dsr.shopware.io` |
| SHOPWARE_STOREFRONT_URL | Yes | This is default Shopware storefront domain. E.g: `https://shopware.store` |
| SHOPWARE_ADMIN_API | Yes | This is Shopware admin-api domain server. E.g: `https://shopware.store/admin-api` |
| SHOPWARE_STORE_API | Yes | This is the Shopware store-api domain server. E.g: `https://shopware.store/store-api` |
| SHOPWARE_STORE_API_ACCESS_TOKEN | Yes | This is the Shopware Access Token to connect to Shopware API. Head to sales channel you assign the *Digital Sales Rooms* domain, find the `API access` section, and copy the `API access key` |
| ALLOW_ANONYMOUS_MERCURE | No | This is the flag for development only. When the value = 1, it means your app is running with unsecured Mercure. |

Example .env:

```shell
ORIGIN=https://dsr.shopware.io
SHOPWARE_STOREFRONT_URL=https://shopware.store
SHOPWARE_ADMIN_API=https://shopware.store/admin-api
SHOPWARE_STORE_API=https://shopware.store/store-api
SHOPWARE_STORE_API_ACCESS_TOKEN=XXXXXXXXXXX
```

### For development

* Install pnpm with global scope

```shell
npm install -g pnpm
```

* Install dependencies

```shell
pnpm install
```

* Run dev server

```shell
pnpm dev
```

Usually, port `3000` is the default port so that you can access the domain of the Frontend App `http://localhost:3000/`

### For production

* Install pnpm with global scope

```shell
npm install -g pnpm
```

* Install dependencies

```shell
pnpm install
```

* Build

```shell
pnpm build
```

After build code, please read [here](../best-practices/app-deployment/index.md) for how to make the deployment.

The Following section guides you on 3rd parties setup procedure.
