---
nav:
  title: Automatically Release an Extension to the Shopware Store
  position: 2

---

# Automatically Release an Extension to the Shopware Store

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

1. Reads name and version: Both are taken from the ZIP file, so the extension must already exist in your producer account
2. Creates or reuses the version: Creates a new binary for that version, or updates the existing binary if that version was already uploaded and is not published yet
3. Pushes metadata: Sends the German and English changelog entries and the list of compatible Shopware versions, derived from the Composer constraint in `composer.json` or `manifest.xml`
4. Uploads the package: Sends your ZIP file to the Shopware Store
5. Triggers the automatic code review and waits for its result (may take several minutes)
6. Reports results: Shows whether the code review passed, passed with warnings, or failed

If the code review fails, the command exits with an error. Fix the issues and upload again.

If a version is already published in the Store, its binary can no longer be replaced. The command detects this, logs a message indicating the binary/version is already published and skips the upload, and exits successfully. Upload a new version instead.

## What happens after the upload

There is no separate release, publish, or approve command in Shopware CLI. The `upload` command submits the extension version, triggers the automatic code review, and waits for its result by default, unless waiting is skipped with `--skip-for-review-result`.

```bash
shopware-cli account producer extension release <name> --version <version>  # does not exist
```

After the automatic review completes, check the version status in your Shopware Account to see whether any further approval or publication steps remain.

Two things are worth keeping in mind:

- A first submission requires additional review. A brand-new extension also goes through Shopware's functional test and manual code review before it appears in the Store. See [Shopware Store review and quality](../../../../guides/development/testing/store/index.md).
- The automatic review is not the full Store review. Passing the automatic code review does not guarantee final Store approval. See the [Validation guide](../validation.md) for what the automated checks do and do not cover. 

You can verify the state at any time in your Shopware Account under the extension's version overview, which shows the version status, the analyses that ran (basic extension analysis, code quality analysis), and the most recent review result.

## Waiting for the review result in CI

By default, the command waits 10 seconds and then polls the review result up to 10 times with a 15-second interval (roughly two and a half minutes in total). If the review has not finished by then, the command logs `Skipping waiting for code review result as it took too long` and exits successfully. A green pipeline does not by itself prove that the review passed. Check the result in the Account, or poll it in a later job.

Use `--skip-for-review-result` to return immediately after triggering the review, for pipelines that report the outcome separately:

```bash
shopware-cli account producer extension upload <zip-path> --skip-for-review-result
```

This workflow means you don't need to use the Shopware Store Admin UI for releasing a version—your CI/CD pipeline can handle the entire process automatically.
