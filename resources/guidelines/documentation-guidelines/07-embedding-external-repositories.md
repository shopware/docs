# Embedding external repositories

This guide will explain how to embed project documentation from your repository into the [Developer documentation](https://developer.shopware.com/frontends/).

[Developer Portal](https://github.com/shopware/developer-portal) is built using the [`shopware/developer-documentation-vitepress`](https://github.com/shopware/developer-documentation-vitepress) repository (`vitepress-shopware-docs` package). This setup heavily utilizes [Vitepress](https://vitepress.dev/) and incorporates custom Shopware features such as unique design, breadcrumbs, Algolia search, Copilot AI chat and recommendations, auto-built sidebar and more.

This portal serves as a central hub for all developer resources and documentation. However, the actual content is distributed across various repositories but integrated into the developer portal using the [Docs CLI](https://github.com/shopware/developer-documentation-vitepress/blob/main/CLI.md). This approach allows for decentralized content management, enabling the maintainers of each repository to manage their content independently.

## Configure Developer Portal

To set up your local instance of the developer portal, clone Developer Portal repository and install the dependencies:

```bash
cd /www/shopware/
git clone https://github.com/shopware/developer-portal.git
cd developer-portal
pnpm i
```

We also want to create a new branch so we can test the integration first in the pull request, then merge it to the `main` branch and do production deployment.

```bash
git checkout -b feature/embed-meteor-icon-kit
```

### Docs CLI

Now access `./docs-cli` in the root of the `shopware/developer-portal` repository.

To start embedding a new repository, update `.vitepress/portal.json` and create a new entry in the `repositories` array. Then run the CLI and see if your repository is visible in the list - select it and continue by confirming the default settings.

```bash
./docs-cli manage
```

You should be able to preview your new content by running the Vitepress dev server and opening your defined URL in the browser using the below command.

```bash
pnpm dev
```

### Sidebar and main navigation

The content is already there and published, but in most cases you will also want to have a sidebar dedicated for your section.

Open `.vitepress/navigation.ts` and update `sublinks` and `ignore` parameters to auto-build the sidebar based on your directory structure and frontmatter config.

If you also want to add it to the top-bar main menu, update the `navigation` accordingly.

### Algolia search

By default, contents are grouped under `General` section in the Algolia search using Algolia _facets_. You can configure that and group your articles together into a new section, or even create multiple new sections.

Update `sections: SwagSectionsConfig[]` with all the regex matches for your sections and define the title of new section displayed in the Algolia search modal.

```javascript
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

### Edit links

Every article has a `Edit this page on GitHub` link in the bottom left corner. Because we are embedding content from external repositories, we need to make sure that the link points to the correct repository and branch.

You can do that by updating `const embeds: SwagEmbedsConfig[]`.

```javascript
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

### Optional

#### Copilot AI

Update `themeConfig.swag.similarArticles.filter` with your settings for recommended articles in Copilot AI. This is only needed for repositories that are embedding multiple branches (versions) so that Copilot only uses articles from one version at the time.

#### Version switcher

Update `themeConfig.swag.versionSwitcher` with additional settings for your paths when you are embedding multiple branches (versions) from the same repository. This allows users to switch between different versions of the same article.

#### Color coding

Update `themeConfig.swag.colorCoding` with your settings for color coding in the breadcrumbs. This is currently only used for Plugins and Apps in the `docs` repository.

#### Static assets

When you also want to share static assets from your repository such as `.pdf` or `.zip` files (excluding statically linked images in articles), make sure to copy them in the `buildEnd` hook.

```javascript
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

### Production deployment

While we already added the repository to the Docs CLI, it is not included in the production build by default.

The new repository must be activated in `.github/scripts/mount.sh`. This script is needed to apply correct build config in production build and during PR workflows where custom `branch` or even `org` is used and switched to by overwriting environment variables.

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

## Configure your repository

The Last step includes configuring your repository for better developer experience and integration with the Developer Portal. Let's switch to your repository.

```bash
cd ../docs
# or
cd /www/shopware/docs
```

### Shortcuts

You will want to create at least 3 scripts in `package.json` of your repository

* `docs:env` - Run this in the context of your repository and the script will either clone the `developer-portal` inside `../developer-portal` or pull changes from the remote, and install latest dependencies.
* `docs:link` - Mount documentation from your repository into your local `developer-portal` instance.
* `docs:preview` - Run Vitepress dev server from your local `developer-portal` instance.

Examples are available in [meteor](https://github.com/shopware/meteor/blob/main/package.json) (monorepo setup), [frontends](https://github.com/shopware/frontends/blob/main/package.json), [release](https://github.com/shopware/release-notes/blob/main/package.json) and [docs](https://github.com/shopware/docs/blob/main/package.json) repositories (all standard repos).

```json
{
  "scripts": {
    "docs:env": "[ -d \"../developer-portal\" ] && ../developer-portal/docs-cli.cjs pull || (git clone git@github.com:shopware/developer-portal.git ../developer-portal && pnpm i -C ../developer-portal)",
    "docs:link": "../developer-portal/docs-cli.cjs link --src . --dst docs --symlink",
    "docs:preview": "../developer-portal/docs-cli.cjs preview"
  }
}
```

### CI pipelines

It is recommended for external repositories to also set up the same workflows as in the `docs` and other repos - this includes the same checks and deployment triggers. This way, the repositories are in sync and the developer portal is consistent.

This usually means copy-pasting `deploy-developer-portal.yml`, `update-healthcheck.yml` and `developer-portal-healthcheck.yml` workflows from any of the repositories mentioned above.

Make sure to also add `DEV_HUB_PERSONAL_ACCESS_TOKEN` secret to your repository.

## Commit changes and create a PR

Once you have everything set up, commit your changes and create PRs for the `shopware/developer-portal` and your repository.

Usually, you will want to first preview the docs from the feature branch of your repository inside the Developer portal. You can do that by changing the environment variable of the default branch for your repository in the `.github/scripts/mount.sh` inside the `developer-portal`, review changes, and then switch back to `main` branch before merging.

For example, follow the instructions in the article above, and use the feature branch of your repository in production build.

```bash
BRANCH_METEOR_ICON_KIT=feature/embed-meteor-repo-to-developer-portal
```

```shell
cd /www/shopware/developer-portal/
git checkout -b feature/embeds-meteor-icon-kit
# apply changes
git commit -m "feat: embedded meteor repo"
```

Make changes in your feature branch of your repository.

```shell
cd /www/shopware/meteor/
git checkout -b feature/embed-meteor-repo-to-developer-portal
# apply changes
git commit -m "chore: updated shortcuts, set up pipeline for developer portal"
```

Then create a PR and once the Vercel preview inside `developer-portal` is ready and correct, merge feature branch in your repository.

```shell
cd /www/shopware/meteor/
git checkout main
git merge feature/embed-meteor-repo-to-developer-portal
```

Now switch back production branch for your repository to `main` in the `developer-portal`.

```shell
cd /www/shopware/developer-portal/
git checkout feature/embeds-meteor-icon-kit
# change BRANCH_METEOR_ICON_KIT=main inside .github/scripts/mount.sh
git commit -m "chore: switched back to main branch for meteor repo"
```

Once the PR is merged, the production build will be triggered and the changes will be live on the Developer Portal.
