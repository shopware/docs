---
nav:
  title: Updating Store Page of Extension
  position: 3

---

# Updating store page of extension

You can use Shopware-CLI to version your Store page representation of your extension. This includes the description, images, and all other assets.

## Prerequisites

- You are logged into the Shopware Store. Checkout the [Authentication](./authentication.md) guide for more information.

## Fetching the current Store page

It is recommended to start with the current Store page and update only the parts you want to change. You can fetch the current Store page with the following command:

```bash
shopware-cli account producer extension info pull <path-to-extension-folder>
```

This will download all uploaded Store images and create a `.shopware-extension.yml` with all metadata of the extension.

This file can be checked in into the version control and will be automatically removed when you create a zip file using Shopware-CLI.

## Updating the Store page

To push the changes to the Store page, you can use the following command:

```bash
shopware-cli account producer extension info push <path-to-extension-folder>
```

This will upload all images and metadata to the Store page.

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
