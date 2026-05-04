---
nav:
  title: Storefront, performance, and errors
  position: 40
---

# Storefront, performance, and errors

## Storefront

* Support viewports for mobile, tablet, and desktop.
* No inline CSS in storefront templates. Use your own classes and compile CSS with the plugin. See [Add SCSS variables](../../../plugins/plugins/storefront/styling/add-scss-variables.md#add-scss-variables).
* Avoid `!important` unless it is unavoidable.
* Design for accessibility; the extension must not break the overall look of the store and must be responsive.

## Performance

* The extension must not measurably impair store or server performance.
* Stability under load matters for review: avoid severe performance regressions.
* Run a [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) audit before and after activating the extension. Significant regressions in performance, accessibility, best practices, or SEO can fail review.

## Errors and HTTP behavior

* No JavaScript or console errors in the storefront or checkout. Test the full Storefront with the browser developer tools.
* No HTTP 500 errors.
* No 404s introduced by the extension.
* No 400/500 responses except when tied to a documented API call.
* Error messages must clearly state what went wrong or what the user should do.
* Extensions must work without uncaught 500 errors in normal operation.

## Tools

* [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) — performance and quality audits.
* [Google Rich Results Test](https://search.google.com/test/rich-results) — use together with [SEO and structured data](./seo-and-structured-data.md) when you change product or listing markup.

After uninstalling the extension, [Shopping Experiences](../../../../concepts/commerce/content/shopping-experiences-cms.md) must keep working in the storefront. See [Uninstallation and data cleanup](./installation-and-cleanup.md) for data and CMS cleanup rules.
