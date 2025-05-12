---
nav:
   title: Hosting a Frontend App on an Ubuntu Server with PM2
   position: 10

---

# Hosting a Frontend App on an Ubuntu Server with PM2

This guide will walk you through the steps to deploy DSR frontend web application to an Ubuntu server using [PM2](https://nuxt.com/docs/getting-started/deployment#pm2), a process manager for Node.js applications. PM2 will help you keep your app running in the background, restart it automatically when it crashes, and manage logs for easier troubleshooting.

## Prerequisites

* Ubuntu Server: This guide assumes you have an Ubuntu server running, and you can access it via SSH.
* Node.js & npm: Make sure Node.js and npm (Node package manager) are installed on your server.
* PM2: PM2 should be installed globally.

```bash
npm install -g pm2
```

* pnpm

```bash
npm install -g pnpm
```

* Frontend Application: Clone the frontend source code and push to your GitHub repository.
  * Download the plugin zip. After extracting, you can find it inside `/templates/dsr-frontends`.

## Build code

* After clone the source code into Ubuntu server, please follow the guide to [build env](../../installation/app-installation.md#generate-env-file) & [build code for production](../../installation/app-installation.md#for-production)

## Start the Application with PM2

Now that your app is built, create a file named `ecosystem.config.cjs` in the root of your project with the following content. Ensure that the script path points to your app's build output directory (e.g., `.output/server/index.mjs` for Nuxt 3)

```js
module.exports = {
  apps: [
    {
      name: 'DSRNuxtApp',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs'
    }
  ]
}
```

Once saved, you can start the app with:

```bash
pm2 start ecosystem.config.cjs
```
