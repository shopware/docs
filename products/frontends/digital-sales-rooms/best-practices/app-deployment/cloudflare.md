---
nav:
   title: Cloudflare
   position: 30

---

# Deploy with Cloudflare

In this chapter you will learn how to deploy the frontend source code to [Cloudflare Pages](https://pages.cloudflare.com/).

## Prerequisites

* Register a Cloudflare account.
* Clone the frontend source code and push to your GitHub repository.
  * Download the plugin zip. After extracting, you can find it inside `/templates/dsr-frontends`.

## Deploy from local machine

* Due to this [issue](https://github.com/nuxt/nuxt/issues/28248), just make sure your `.npmrc` file has

```bash
shamefully-hoist=true
strict-peer-dependencies=false
```

* Install Wrangler

```bash
pnpm install wrangler --save-dev
```

* Make sure the Frontend app has already [generated .env file](../../installation/app-installation.md#generate-env-file)
* Build your project for Cloudflare Pages:

```bash
npx nuxi build --preset=cloudflare_pages
```

* Then deploy. However, for the first time, it will ask you to create a project:

```bash
wrangler pages deploy dist/
```

## Automation with GitHub Actions

### Setup GitHub Secrets & variables

* In GitHub Secrets, add `CLOUDFLARE_API_TOKEN` with API token value.
  * [Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) in the Cloudflare dashboard with the "Cloudflare Pages — Edit" permission.
* In GitHub environment variables, create new environment named `production`. Add `SHOPWARE_STORE_API`, `SHOPWARE_ADMIN_API`, `SHOPWARE_STORE_API_ACCESS_TOKEN`, `SHOPWARE_STOREFRONT_URL`, `ORIGIN` variables with appropriate values.
  * Besides `production`, we can add new values for the same variable names in multiple environments such as `development`, `staging`.

### Setup pipeline

To trigger the deployment automatically, we can attach the GitHub Actions.

* Create a `.github/workflows/publish.yml` file in your repository with below sample content.

::: warning
Please note that this pipeline is just a sample. There are some points need to update for specific purpose
:::

```yml
on:
  push:
   # Specify the pipeline trigger
   branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    name: Cloudflare Pages Deployment
    # Specify the environment name
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - uses: pnpm/action-setup@v4
        name: Install pnpm
        with:
          version: 8
          run_install: false

      - name: Install dependencies
        run: |
          pnpm install

      - name: Build env file
        run: |
          touch .env
          # echo ALLOW_ANONYMOUS_MERCURE=${{ vars.ALLOW_ANONYMOUS_MERCURE }} >> .env
          echo SHOPWARE_STORE_API=${{ vars.SHOPWARE_STORE_API }} >> .env
          echo SHOPWARE_ADMIN_API=${{ vars.SHOPWARE_ADMIN_API }} >> .env
          echo SHOPWARE_STORE_API_ACCESS_TOKEN=${{ vars.SHOPWARE_STORE_API_ACCESS_TOKEN }} >> .env
          echo SHOPWARE_STOREFRONT_URL=${{ vars.SHOPWARE_STOREFRONT_URL }} >> .env
          echo ORIGIN=${{ vars.ORIGIN }} >> .env
          cat .env

      - name: Build code
        run: |
          npx nuxi build --preset=cloudflare_pages

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1.5.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: YOUR_ACCOUNT_ID
          projectName: YOUR_PROJECT_NAME
          directory: dist
          wranglerVersion: '3'
```

* Replace `YOUR_ACCOUNT_ID` with your account ID. Get it from the dashboard URL. E.g: `https://dash.cloudflare.com/<ACCOUNT_ID>/pages`.
* Replace `YOUR_PROJECT_NAME` with the appropriate value.

## Custom domain

When deploying your Pages project, you may wish to point custom domains (or subdomains) to your site. Cloudflare has an [instruction](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Configure sales channel domain

Your website is ready, you should have a frontend app domain. Please use the current domain to configure [sales channel domain](../../configuration/domain-config.md).
