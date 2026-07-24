---
nav:
  title: Updating Store Page of Extension
  position: 3

---

# Updating store page of extension

You can use Shopware CLI to version your Store page representation of your extension. This includes the description, images, and all other assets.

## Prerequisites

- You are logged into the Shopware Store. Checkout the [Authentication](./authentication.md) guide for more information.

## Fetching the current Store page

It is recommended to start with the current Store page and update only the parts you want to change. You can fetch the current Store page with the following command:

```bash
shopware-cli account producer extension info pull <path-to-extension-folder>
```

This will download all uploaded Store images and create a `.shopware-extension.yml` with all metadata of the extension.

This file can be checked into version control and will be automatically removed when you create a zip file using Shopware CLI.

## Managing metadata locally with Git

The `.shopware-extension.yml` file contains all your extension's Store metadata (description, tags, installation instructions, images). By checking this file into Git, you can:

- Track changes to your Store page like you track code
- Review and approve Store page updates via pull requests
- Automate Store page updates as part of your CI/CD pipeline
- Use AI tools to generate tags and installation descriptions for marketing

For example, you can use AI to generate appropriate tags for the Shopware Store or write clear installation instructions based on your extension's features.

## Updating the Store page

To push the changes to the Store page, you can use the following command:

```bash
shopware-cli account producer extension info push <path-to-extension-folder>
```

This will upload all images and metadata to the Store page.

::: warning
Changes pushed with `info push` go **live immediately** to the Shopware Store and are visible to all users. The Store page cache refreshes every 6 hours, so any mistakes will be visible for that duration. Make sure your changes are correct before pushing.
:::

## Image configuration

Images can be uploaded in two ways:

Explicitly defined in the configuration like this:

```yaml
store:
  images:
    - file: <path-to-file>
      # Priority of the image for ordering
      priority: 1
      # In which language the image should be used
      activate:
        de: false
        en: false
      # Is the image a preview image, only one image can be a preview
      preview:
        de: false
        en: false
```

or you can specify a single directory with all images:

```yaml
store:
  image_directory: <path-to-directory>
```

The images will be sorted by the file name. If you want to separate the images by language, you can create subdirectories with the language code like so:

```text
src/Resources/store/images/
├── de
│   ├── 0.png
│   ├── 1.png
│   └── 2.png (preview image)
└── en
    ├── 0.png
    ├── 1.png
    └── 2.png (preview image)
```
