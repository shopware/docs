---
nav:
   title: Cloudflare
   position: 10

---

# Deploy with Cloudflare

In this chapter you will learn how to

- Deploy the template to Cloudflare Pages

## Setup
- Because of this [issue](https://github.com/nuxt/nuxt/issues/28248), just make sure your .npmrc file have
```
shamefully-hoist=true
strict-peer-dependencies=false
```

- Install Wrangler

```bash
pnpm install wrangler --save-dev
```

- Make sure the Front-end App already [generated .env file](../local-installation/app-installation.md#generate-env-file)

- Build your project for Cloudflare Pages:

```bash
npx nuxi build --preset=cloudflare_pages
```

- Deploy, it will ask you to create a project for the first time:

```bash
wrangler pages deploy dist/
```

- After finish this, your website is ready and Cloudflare also give you a Front-end App domain. Please use the current domain to config [sales channel domain](../configuration/domain-config.md).
