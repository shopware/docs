# Embedding external repositories

[Developer Portal](https://github.com/shopware/developer-portal) is built on top of [`shopware/developer-documentation-vitepress`](https://github.com/shopware/developer-documentation-vitepress) repository (`vitepress-shopware-docs` package) which heavily utilizes [Vitepress](https://vitepress.dev/) and customizes it with custom Shopware features such as breadcrumbs, Algolia search, Copilot AI chat and recommendations, auto-built sidebar and more.

It acts as a central point for all developer resources and documentation. However, the actual content is stored in various repositories and embedded into the developer portal with help of the custom Docs CLI. This allows for a decentralized approach to managing the content and enables the maintainers of the respective repositories to manage their content independently.

## Checkout the Developer Portal

First, checkout the Developer Portal repository and install the dependencies:

```bash
cd /www/shopware/
git clone https://github.com/shopware/developer-portal.git
cd developer-portal
pnpm i
```

## Configure CLI

Docs CLI is accessible by running `./docs-cli` in the root of the `shopware/developer-portal` repository.

To add a new repository config, update `.vitepress/portal.json` and create a new entry in the `repositories` array. The entry should contain the following keys:
- `name` - The name of the repository. Example: `shopware/meteor-icon-kit` or `gitlab.shopware.com/shopware/meteor-icon-kit`
- `src` - Name of the directory where your documentation is located, in an array format. Example: `["packages", "docs"]` for `./packages/docs/` or `.` when your repo is docs-only.
- `dst` - The directory where the content will be embedded to in the developer portal. Example: `resources/meteor-icon-kit` for when the content should be accessible under `https://developer.shopware.com/resources/meteor-icon-kit/`.
- `branch` - Array of values where the first one is the environment variable prefixed with `env.` and second one is the actual branch (usually `main`). Example: `["env.BRANCH_METEOR_ICON_KIT", "main"]`
- `org` - Array of values where the first one is the environment variable prefixed with `env.` and second one is the actual organization (usually `shopware`). Example: `["env.ORG_METEOR_ICON_KIT", "shopware"]`
- `env` - Object of all environment variables required by the process (usually empty).

Try to run the CLI and see if you can embed the content of the new repository. Your repository should be visible in the list, and you should be able to select it and embed it by confirming the default settings.

```bash
./docs-cli manage
```

You should be able to preview your new content by running the developer portal locally:

```bash
pnpm dev
```

## Configure Shopware specific features

Now it's time to configure all custom features.

### Configure Algolia search

Update `sections: SwagSectionsConfig[]` with all the regex matches for your repository and define the title of new section displayed in the Algolia search modal.

```js
const sections: SwagSectionsConfig[] = [
    // ...
    {
        title: 'Meteor Icon Kit',
        matches: [
            '/resources/meteor-icon-kit/',
        ],
    },
];
```

### Configure edit links

Update `const embeds: SwagEmbedsConfig[]` to make sure correct Edit link is displayed in your articles.

```js
const embeds: SwagEmbedsConfig[] = [
    // ...
    {
        repository: 'meteor',
        points: {
            '/resources/meteor-icon-kit/': 'main',
        },
        folder: 'packages/icon-kit/docs',
    },
]
```

### Configure Copilot AI

Update `themeConfig.swag.similarArticles.filter` with your settings for recommended articles in Copilot AI (optional).

### Configure version switcher

Update `themeConfig.swag.versionSwitcher` with additional settings for your paths when you are embedding multiple branches (versions) from the same repository.

### Configure color coding

Update `themeConfig.swag.colorCoding` with your settings for color coding in the breadcrumbs. This is currently only used for Plugins and Apps in the `docs` repository.

### Static assets

When you also want to share static assets from your repo, make sure to copy them in the `buildEnd` hook.

```js
export default {
    // ...
    async buildEnd() {
        // ...
        await copyAdditionalAssets([
            // meteor-icon-kit
            {
                src: './resources/meteor-icon-kit/public/icons/regular',
                dst: 'icons/regular',
            }
        ])
    }
}
```

## Make it ready for deployment

The new repo needs to be activated in `.github/scripts/mount.sh`. This is needed to apply correct build config in production build and during PR workflows.

```sh
# ...
BRANCH_METEOR_ICON_KIT=main
ORG_METEOR_ICON_KIT=shopware

# ...
./docs-cli.cjs clone \
 --ci \
 --repository shopware/meteor \
 --branch ${BRANCH_METEOR_ICON_KIT:-main} \
 --src packages/icon-kit/docs \
 --dst resources/meteor-icon-kit \
 --org ${ORG_METEOR_ICON_KIT:-shopware} \
 --root ../..
```

## Simplify your local workflow

Last step is setting up dev commands in `package.json` of your repository. Examples are available in [meteor](https://github.com/shopware/meteor/src/blob/package.json) (monorepo setup), [meteor](https://github.com/shopware/frontends/src/blob/package.json), [meteor](https://github.com/shopware/release-notes/src/blob/package.json) and [meteor](https://github.com/shopware/docs/src/blob/package.json) repositories (all standard repos).

## Set up repository workflows and triggers

It is recommended for external repositories to also set up the same workflows as in the docs repo - this includes the same checks and deployments. This way, the repositories are in sync and the developer portal is consistent. This usually means copy/pasting `deploy-developer-portal.yml`, `update-healthcheck.yml` and `developer-portal-healthcheck.yml` workflows from any of the repositories mentioned above.

Make sure to also add `DEV_HUB_PERSONAL_ACCESS_TOKEN` secret to your repository.