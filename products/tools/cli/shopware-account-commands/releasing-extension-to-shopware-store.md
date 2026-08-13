---
nav:
  title: Releasing extension to Shopware Store
  position: 2

---

# Releasing an extension to the Shopware Store

Shopware CLI can automate packaging checks, the extension upload, and waiting for the Store's automatic code review. It does not replace the complete Shopware Store review process.

## Prerequisites

- You are logged into the Shopware Store. Check out the [Authentication](./authentication.md) guide for more information.
- You have a ZIP file of your extension with all assets. Check out the [Creating a ZIP](../extension-commands/build.md) guide for more information.
- The ZIP file contains a `CHANGELOG*.md` file with a changelog entry for the new version. Having a German changelog is optional.
- You have validated the same ZIP file you intend to upload with `shopware-cli extension validate --full <zip-path>`. See [Validation](../validation.md#checking-a-release-before-uploading-it-to-the-store) for more information.

If you also maintain the extension's Store listing in Git, review and push those changes separately with the [Store page workflow](./updating-store-page.md).

## Releasing the extension

Upload the ZIP file with the `shopware-cli account producer extension upload` command. The command is designed for CI/CD pipelines and automates the upload and automatic code-review step:

```bash
shopware-cli account producer extension upload <zip-path>
```

The upload process:

1. Checks for an existing version and verifies that the same extension version does not already exist in the Store.
2. Uploads the package to the Shopware Store.
3. Determines compatibility from the Composer constraint in `composer.json` or `manifest.xml`.
4. Waits for the Store's automatic code review to complete. This can take several minutes.
5. Reports whether the automatic code review passed or failed.

If the automatic code review fails, fix the reported issues and upload the extension again. Use `--skip-for-review-result` when your CI/CD workflow should upload the package without waiting for that result. This option skips waiting in the CLI; it does not skip Store review.

## Where CLI validation and upload fit into Store review

Use the release workflow as a sequence of separate checks and actions:

1. **Validate locally or in CI** with `extension validate`. This covers automatable technical criteria.
2. **Package and upload** the release artifact you validated.
3. **Automatic Store code review** runs after upload. The upload command can wait for this result.
4. **Remaining Store review** can still include functional testing, Store page content checks, or manual review that local validation does not cover.
5. **Release the version** after all applicable Store requirements are satisfied.

A successful local validation and automatic code review are strong technical signals, but they do not guarantee Store approval. See [Validation](../validation.md) for the detailed boundary between CLI checks and the complete Store review.

For a fully version-controlled release workflow, combine this page with [Updating the Store page of an extension](./updating-store-page.md) so code, release artifacts, and Store listing changes can all be reviewed before publishing.
