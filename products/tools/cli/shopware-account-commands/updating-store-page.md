---
nav:
  title: Updating Store Page of Extension
  position: 3

---

# Updating the Store page of an extension

Use Shopware CLI to manage an extension's Store listing as code. You can keep descriptions, images, and other Store metadata next to the extension, review changes in Git, and push the approved listing from CI/CD instead of maintaining it only in the Store UI.

## Prerequisites

- You are logged into the Shopware Store. Check out the [Authentication](./authentication.md) guide for more information.

## Fetching the current Store page

Start with the current Store page and update only the parts you want to change. Fetch the current Store page with the following command:

```bash
shopware-cli account producer extension info pull <path-to-extension-folder>
```

This downloads all uploaded Store images and creates a `.shopware-extension.yml` file with the extension's Store metadata.

The file can be checked into version control and is automatically removed when you create a ZIP file using Shopware CLI.

## Managing Store metadata locally with Git

The `.shopware-extension.yml` file contains the extension's Store metadata, such as descriptions, tags, installation instructions, and image configuration. By checking this file into Git, you can:

- Track Store listing changes together with code changes.
- Review and approve localized or marketing content through pull requests.
- Reuse the same review and CI/CD controls you apply to extension code.
- Automate Store page updates instead of copying content manually into the Store UI.

This workflow is especially useful when you maintain several extensions or localized listings. Keep each extension's Store metadata with that extension so its listing history remains reproducible and accessible for review.

## How this fits into an extension release

Store listing updates and extension package uploads are separate actions. A typical version-controlled workflow is:

1. Pull the current Store metadata with `extension info pull` when you first adopt the workflow.
2. Edit `.shopware-extension.yml` and the referenced images in the extension repository.
3. Review the Store listing changes in Git like any other content change.
4. Push approved Store metadata with `extension info push`.
5. Validate and upload the release package using the [Store release workflow](./releasing-extension-to-shopware-store.md).

Because `.shopware-extension.yml` is not included in the extension ZIP created by Shopware CLI, keeping Store metadata in the repository does not add the listing configuration to the distributed package.

## Updating the Store page

Push changes to the Store page with the following command:

```bash
shopware-cli account producer extension info push <path-to-extension-folder>
```

This uploads all configured images and metadata to the Store page.

::: warning
Changes pushed with `info push` go **live immediately** to the Shopware Store and are visible to all users. The Store page cache refreshes every 6 hours, so mistakes can remain visible during that period. Review your changes before pushing.
:::

## Image configuration

Images can be uploaded in two ways.

Define images explicitly in the configuration:

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

Or specify a single directory with all images:

```yaml
store:
  image_directory: <path-to-directory>
```

The images are sorted by filename. To separate images by language, create subdirectories with the language code:

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
