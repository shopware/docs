---
nav:
   title: Cloudflare
   position: 10

---

# Deploy with Cloudflare

In this chapter you will learn how to

- Deploy the template to Cloudflare Pages

## Setup
- Due to this [issue](https://github.com/nuxt/nuxt/issues/28248), just make sure your `.npmrc` file has

```
shamefully-hoist=true
strict-peer-dependencies=false
```

- Install Wrangler

```bash
pnpm install wrangler --save-dev
```

- Make sure the Frontend app has already [generated .env file](../local-installation/app-installation.md#generate-env-file)

- Build your project for Cloudflare Pages:

```bash
npx nuxi build --preset=cloudflare_pages
```

- Then deploy. However, for the first time, it will ask you to create a project:

```bash
wrangler pages deploy dist/
```

- After this, your website is ready and Cloudflare also gives you a frontend app domain. Please use the current domain to configure [sales channel domain](../configuration/domain-config.md).
