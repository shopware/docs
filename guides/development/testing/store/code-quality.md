---
nav:
  title: Code quality
  position: 90
---

# Code quality

Extensions must pass automated code review (PHPStan, SonarQube) and manual review for security, standards, UX, and behavior. Configurations used during submission are [public on GitHub](https://github.com/shopwareLabs/store-plugin-codereview).

* Do not ship development-only files or unused resources in the archive.
* Include only necessary dependencies.
* Use secure cookie settings (see [Cookies and privacy](./cookies-and-privacy.md)).

## SonarQube rules (blocker)

The following are prohibited and will fail review:

* `die`
* `exit`
* `var_dump`

[List of blocker patterns](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt)

## Error messages and logging

* Write file logs under the Shopware installation’s configured log directory (normally `var/log/` relative to the project root).
* Do not write to Shopware’s default logs or paths outside the logging system (logs must not be reachable via URL).
* Use the pattern `MyExtension-Year-Month-Day.log`.
* Payment extensions must use the **plugin logger** service.
* Database logging is allowed; avoid custom log tables. If you use them, add scheduled cleanup and keep data at most **six months**.

Use the [plugin logging guide](../../../plugins/plugins/plugin-fundamentals/logging.md) to configure the logger and handler.
Verify the actual file destination and rotation; a channel name alone does not establish where a message is written.
Do not include passwords, access tokens or unnecessary customer data in logs.
Provide useful error context without exposing secrets or raw sensitive request bodies.

## JavaScript delivery

* Deliver **uncompiled, readable** JavaScript together with compiled assets. Store sources in a **separate folder** for review.
* Include **unminified** sources in the submitted package so they can be inspected during review.
  This does not require exposing private server-side files through a public URL.
* Follow [Loading the JS files](../../../plugins/plugins/administration/module-component-management/add-custom-field.md#loading-the-js-files) and [Injecting into the Administration](../../../plugins/plugins/administration/module-component-management/add-custom-field.md#injecting-into-the-administration) when building `main.js` and minified output.

## Cross-domain communication

Limit cross-domain use to explicit, trusted domains. For `postMessage()` and similar APIs, verify message origins; never use `*` as the target origin.

## Plugin-specific requirements {#plugin-specific-requirements}

These apply to **plugins** only:

* Declare [Composer dependencies](../../../plugins/plugins/dependencies/using-composer-dependencies.md) in `composer.json` so code is traceable. If `executeComposerCommands()` returns true, dependencies may be installed dynamically and need not all be bundled.
* Do **not** include `composer.lock` in the archive.
* Ship the production artifacts and readable sources required for the extension, excluding development-only files.
  See [packaging guidance](./store-review-errors.md#packaging-errors-and-unauthorized-files-and-folders) for dependency manifests and generated files.
* Write extension-specific logs under the configured log directory as described above.

For `composer.json` structure, ZIP layout, and common mistakes, see [Common Store review errors](./store-review-errors.md).
