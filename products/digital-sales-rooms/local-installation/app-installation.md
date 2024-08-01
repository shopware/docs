---
nav:
   title: Front-end app installation
   position: 30

---

# Front-end App Installation

::: warning
This template is built based on the Shopware Frontends framework, so it inherits from Shopware Frontends & Nuxt 3 concepts.
:::

## Init environment

- Install pnpm with global scope
```
npm install -g pnpm
```

- From the Shopware root folder `<shopware-root-dir>`, go to the folder of *Digital Sales Rooms* templates.
```
cd ./custom/plugins/SwagDigitalSalesRooms/templates/dsr-frontends
```


## Generate env file
```
cp .env.template .env
```
**SHOPWARE_ENDPOINT**: This is the Shopware API Domain server.

**SHOPWARE_ACCESS_TOKEN**: This is the Shopware Access Token to connect to Shopware API. Head to sales channel you assign the *Digital Sales Rooms* domain, find the `API access` section, and copy the `API access key`.

**ALLOW_ANONYMOUS_MERCURE**: This is the flag for development only. When the value = 1, it means your app is running with unsecured Mercure.


## Run Front-end App
- Install dependencies
```
pnpm install
```

- Run dev server
```
pnpm dev
```
Usually, port `3000` is the default port so that you can access the domain of the Frontend App `http://localhost:3000/`
