---
nav:
   title: Frontend app installation
   position: 30

---

# Frontend App Installation

::: warning
This template is built based on the Shopware Frontends framework, so it inherits from Shopware Frontends & Nuxt 3 concepts.
:::

## Init environment

* Install pnpm with global scope

```shell
npm install -g pnpm
```

* From the Shopware root folder `<shopware-root-dir>`, go to the folder of *Digital Sales Rooms* templates.

```shell
cd ./custom/plugins/SwagDigitalSalesRooms/templates/dsr-frontends
```

## Generate env file

* Assume Shopware platform is running at `http://localhost:8000` & frontend app will run in `http://localhost:3000`.

```shell
cp .env.template .env
```

**ORIGIN**: This is current frontend app domain. E.g: `http://localhost:3000`

**SHOPWARE_STOREFRONT_URL**: This is default Shopware storefront domain. E.g: `http://localhost:8000`

**SHOPWARE_ADMIN_API**: This is Shopware admin-api domain server. E.g: `http://localhost:8000/admin-api`

**SHOPWARE_STORE_API**: This is the Shopware store-api domain server. E.g: `http://localhost:8000/store-api`

**SHOPWARE_STORE_API_ACCESS_TOKEN**: This is the Shopware Access Token to connect to Shopware API. Head to sales channel you assign the *Digital Sales Rooms* domain, find the `API access` section, and copy the `API access key`.

**ALLOW_ANONYMOUS_MERCURE**: This is the flag for development only. When the value = 1, it means your app is running with unsecured Mercure.

## Run frontend App

For development, you can run the dev server by the following commands:

* Install dependencies

```shell
pnpm install
```

* Run dev server

```shell
pnpm dev
```

Usually, port `3000` is the default port so that you can access the domain of the Frontend App `http://localhost:3000/`

## Build frontend App

For production, you can build code by the following commands:

* Install dependencies

```shell
pnpm install
```

* Build

```shell
pnpm build
```

The Following section guides you on 3rd parties setup procedure.
