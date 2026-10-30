---
nav:
  title: Storefront, performance, and errors
  position: 40
---

# Storefront, performance, and errors

## Storefront

* Support viewports for mobile, tablet, and desktop.
* Put static storefront styling in extension-owned classes and compile it with the plugin. See [Add SCSS variables](../../../plugins/plugins/storefront/styling/add-scss-variables.md#add-scss-variables).
  When a value is genuinely dynamic, such as a calculated progress width, constrain and escape it appropriately rather than generating unrestricted styles.
* Avoid `!important` unless it is unavoidable.
* Design for accessibility; the extension must not break the overall look of the store and must be responsive.

## Performance

* Avoid significant storefront or server performance regressions; compare representative pages and workloads before and after activation.
* Stability under load matters for review: avoid severe performance regressions.
* Run a [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) audit before and after activating the extension. Significant regressions in performance, accessibility, best practices, or SEO can fail review.

## Errors and HTTP behavior

* No JavaScript or console errors in the storefront or checkout. Test the full Storefront with the browser developer tools.
* Valid user flows must not introduce uncaught server errors, broken links or missing assets.
* Invalid input, unauthorized access, unavailable resources and rate limits should return appropriate HTTP responses, such as 400, 401/403, 404 or 429.
  These controlled responses are different from an unexpected failure during a valid operation.
* Do not hide failures by returning HTTP 200 with a success message when the operation failed.
* Error messages must clearly state what went wrong or what the user should do.
* Extensions must work without uncaught 500 errors in normal operation.

**Verify:** test both successful requests and expected failures.
Include malformed input and restricted users, and confirm rejected requests do not leave partial data changes.
For authorization and state-changing requests, see [Security and permissions](./security-and-permissions.md).

## Tools

* [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) — performance and quality audits.
* [Google Rich Results Test](https://search.google.com/test/rich-results) — use together with [SEO and structured data](./seo-and-structured-data.md) when you change product or listing markup.

After uninstalling the extension, [Shopping Experiences](../../../../concepts/commerce/content/shopping-experiences-cms.md) must keep working in the storefront. See [Uninstallation and data cleanup](./installation-and-cleanup.md) for data and CMS cleanup rules.
