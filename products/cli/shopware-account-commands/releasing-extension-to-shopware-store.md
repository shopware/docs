---
nav:
  title: Releasing automated extension to Shopware Store
  position: 2

---

# Releasing automated extension to Shopware Store

## Prerequisites

- You are logged into the Shopware Store. Checkout the [Authentification](./authentification.md) guide for more information.
- You have a Zip file of your extensions with all assets. Checkout the [Creating a Zip](../extension-commands/build.md) guide for more information.
- The Zip file contains a `CHANGELOG*.md` file with an Changelog entry for the new version. Having a German Changelog is optional.
- You have validated the zip file with `shopware-cli extension validate <zip-path>`, see [Validating the zip](../extension-commands/validation.md) for more information.

## Releasing the extension

To release the extension to the Shopware Store, you need to upload the zip file to the store. This can be done with the `shopware-cli account producer extension upload` command.

```bash
shopware-cli account producer extension upload <zip-path>
```

This command will check first if an extension with the same version already exists in the store. If not, it will upload the extension to the store. For the compatibility of the extension, the command will use the Composer Constraint of `composer.json` or `maniofest.xml` file.

After the upload, the command will wait for the result of the automatic validation. This can take a few minutes. If the validation fails, the command will output the error message and you need to fix the issue and upload the extension again. You can skip this check with the `--skip-for-review-result` option.
