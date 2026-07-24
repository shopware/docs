---
nav:
  title: Releasing automated extension to Shopware Store
  position: 2

---

# Releasing automated extension to Shopware Store

## Prerequisites

- You are logged into the Shopware Store. Checkout the [Authentication](./authentication.md) guide for more information.
- You have a zip file of your extensions with all assets. Checkout the [Creating a zip](../extension-commands/build.md) guide for more information.
- The zip file contains a `CHANGELOG*.md` file with a Changelog entry for the new version. Having a German changelog is optional.
- You have validated the zip file with `shopware-cli extension validate <zip-path>`. See [Validating the zip](../validation.md) for more information.

## Releasing the extension

To release the extension to the Shopware Store, upload the ZIP file using the `shopware-cli account producer extension upload` command. This is primarily designed for CI/CD pipelines to automate extension releases:

```bash
shopware-cli account producer extension upload <zip-path>
```

The upload process:

1. Checks for existing version: Verifies no extension with the same version already exists in the store
2. Uploads the package: Sends your ZIP file to the Shopware Store
3. Determines compatibility: Uses the Composer constraint from `composer.json` or `manifest.xml`
4. Waits for code review: The command automatically waits for the Store's automatic code review to complete (may take several minutes)
5. Reports results: Shows whether the code review passed or failed

If the code review fails, fix the issues and upload again. You can skip waiting for the review result with the `--skip-for-review-result` option if needed for CI/CD workflows that handle results separately.

This workflow means you don't need to use the Shopware Store Admin UI at all—your CI/CD pipeline can handle the entire release process automatically.
