---
nav:
  title: Quality guidelines for apps in the plugin system
  position: 20

---

# Quality guidelines for the Shopware Store

These guidelines apply to all extensions distributed via the Shopware Store, including plugins and apps. They define the quality, security, and compliance requirements for publication.

## Scope and terminology

* **Extension**: umbrella term for plugins and apps.
* **Plugin**: installed in the Shopware instance; PHP code and Composer packages.
* **App**: integrated via the app system; no direct PHP execution in core.

Unless stated otherwise, requirements apply to all extensions.

## What kind of extension is allowed?

Currently, all types of extensions are allowed, except those that violate the regulations below. Extensions with the following characteristics are not permitted and will not be approved:

* Functions that are included in the Shopware B2B Components; see [Shopware 6 - Commercial Features - B2B Components](https://docs.shopware.com/en/shopware-6-en/commercial-features/b2b-components).
* Direct SQL changes by the merchant or other security-relevant issues.
* Extensions that are two major Shopware versions below the current supported range.
* If your extension is a software app or interface with downstream costs, transaction fees, or service fees for the customer, a technology partner agreement must be completed before the app can be activated.

## Review process

All extensions are:

1. Automatically [code-reviewed](https://github.com/shopwareLabs/store-plugin-codereview) (PHPStan, SonarQube) as part of quality assurance, with special attention to impacts on the Administration and Storefront.
2. Manually reviewed for security, coding standards, user experience, and functionality.
3. Tested on the latest stable [Shopware 6](https://www.shopware.com/en/download/#shopware-6) Community Edition.

Always test against the highest supported Shopware 6 version (for example `shopware/testenv:6.7.6`).

For apps, we additionally test:

* `config.xml` per sales channel.
* Install and uninstall behavior.
* Styling and viewport issues.

Before publishing an extension, review the full test process to ensure faster approval.

## Checklist for testing

* We use automatic code review and look for security issues and Shopware coding standards in the manual code review.
* We check the full functionality of the extension and look for styling issues on every viewport.

[Documentation for Extension Partner – preview and testing](https://docs.shopware.com/en/account-en/extension-partner/extensions?category=account-en/extension-partner#how-can-i-request-a-preview)

## Extension store description

Release to the international store is standard; the German store is optional. When an extension is released in both stores, content must accurately translate one-to-one from English to German.

### Short description

Minimum 150 characters, maximum 185 characters. The short description must be unique and at least 150 characters long.

Use the short description carefully: it appears in the overview together with "Customers also bought" and "Customers also viewed". It is also used as the meta description.

### Description

Minimum 200 characters. The description must describe the extension's features in detail.

* Inline styles are stripped. The following HTML tags are allowed:

  `<a>`, `<p>`, `<br>`, `<b>`, `<strong>`, `<i>`, `<ul>`, `<ol>`, `<li>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`

* Describe the extension and its use cases accurately and clearly.
* Include clear, complete setup and configuration instructions.

::: info
* Avoid the words "plugin" / "app" and "Shopware" / "for Shopware" in the display name.
* Avoid blank spaces as filler text.
* Avoid advertising or contact information in the description.
:::

### Configuration manual

Explain how your extension is installed and configured, how it works technically, and how merchants achieve the desired outcome. The manual should include a setup guide and use clean HTML source code.

### Images

Include several screenshots and descriptive images from the Storefront and Administration that show the extension in use. They must show the extension in action, its configuration options, and how to use it. We recommend screenshots for both mobile and desktop.

Only images that represent or illustrate the extension may be used. Advertising for other extensions or services is not permitted.

::: info
* Use English-only screenshots for the English store listing and preview images.
* Screenshots in German for the German store are optional.
* Advertising for other extensions or services is not permitted.
* Provide at least one image for the Storefront and one for the Administration.
* Do not mix English with other languages in the same screenshots.

[How to add images and icons to extensions](https://docs.shopware.com/en/account-en/adding-pictures-and-icons/how-to)
:::

### Link to demo shop

If you provide a demo shop, the link must be valid and stable. Do not link to short-lived test environments; they may be removed automatically two weeks after creation.

### Personal data protection

If personal data of customers (the merchant and/or their customers) is processed with this extension according to Art. 28 GDPR, the data processor's details must be stored in the **Subprocessor** field.

If other companies are involved in processing personal data, the same information must be stored for them under **Further subprocessors**.

### Manufacturer profile

Your manufacturer profile must contain accurate English and German descriptions and a manufacturer logo.

You can edit the profile under Shopware Account → Extension Partner → [Extension Partner profile](https://account.shopware.com/producer/profile).

::: info
* Descriptions, profiles, and instructions must not use iframes, external scripts, or tracking pixels.
* Custom styles must not overwrite original Shopware styles. External resources must be loaded over HTTPS.
* Manufacturer and partner certificates are loaded dynamically at the end of each app description and are published by Shopware.
:::

## General technical guidelines

### Testing functionality

We verify the extension's full functionality everywhere it affects the Administration or Storefront. Every extension is code-reviewed by Shopware to ensure coding and security standards.

### Fallback language and translations

The shop language is not always English or German. If the merchant uses Spanish, for example, and your extension has no Spanish translation yet, use English as the fallback.

If the extension is available in more than one language, declare this with **Translations into the following languages are available** in the **Description & images** section of your Shopware Account.

We check text snippets, `config.xml`, and `composer.json`.

### Valid preview images for the Administration

A preview image must be available in the **Extension Manager**. Upload a valid favicon named `plugin.png` (PNG, 112 x 112 pixels). Store it under `src/Resources/config/`. It identifies your extension in the Extension Manager.

Also provide a preview image for themes in the **Theme Manager** and for CMS elements in **Shopping Experiences**.

### Configuration per sales channel

Apps that appear in the Storefront must be configurable separately for each sales channel.

### External links with `rel="noopener"`

Every external link in the Administration or Storefront that opens in a new tab must use `target="_blank"` together with `rel="noopener"`.

### Error messages and logging

Error or informational messages must be written only to the event log in Shopware's log directory (`/var/log/`). Implement your own log service.

**Never write extension-specific exceptions into Shopware's default log or outside the Shopware log folder.** That reduces the risk of log files being reachable via URL.

For payment extensions, we check that the plugin logger service is used for debug or error output and that logs are written under `/var/log/`. Log files must be used consistently.

Name log files for example: `MyExtension-YYYY-MM-DD.log`.

Alternatively, logs may be stored in the database. Avoid custom log tables unless you implement a scheduled task that purges data within a maximum retention of six months.

### Avoid HTTP 400 and 500 errors

Avoid **500** errors at all times. Avoid **400** errors unless they are clearly tied to an expected API response.

### Install and uninstall: data retention choice

When the merchant uses **Install** or **Uninstall** in the Extension Manager, they must be able to choose whether extension data (including snippets, media, and database changes) is **fully removed** or **kept**.

You can verify database behavior with the [Adminer extension from Friends of Shopware](https://store.shopware.com/en/frosh79014577529f/adminer-for-admin.html) in your test environment.

### Do not extend the Extension Manager

The Extension Manager must not be extended or overwritten.

### Composer dependencies

Dependencies must be declared in `composer.json`. With `executeComposerCommands() === true` in the plugin base class, Composer dependencies can be installed dynamically by default and do not need to be bundled manually. Everything shipped in code must be traceable directly or via `composer.json`.

For private Composer repositories, follow Composer's documentation on [private repositories and authentication](https://getcomposer.org/doc/articles/authentication-for-private-packages.md) so reviewers can install the extension.

### Extension Manager lifecycle

The Debug Console drives installation, uninstallation, reinstallation, and deletion. No **400** responses or unhandled exceptions may occur. If the extension needs special PHP settings, validate them during installation and show a clear growl message in the Administration if requirements are not met.

### No file reloading during installation

Apps must not load additional files during or immediately after installation in the Extension Manager.

### Ship unminified JavaScript alongside the build

Compiled JavaScript improves performance but is hard to review. Ship the original, readable JavaScript in a separate folder so others can audit it.

Build `main.js` as described in the developer documentation and generate minified assets accordingly. For injecting into the Administration, follow <PageRef page="../../plugins/plugins/administration/module-component-management/add-custom-module" title="Add custom module" /> and for the Storefront <PageRef page="../../plugins/plugins/storefront/add-custom-javascript" title="Add custom JavaScript" />.

Shopware may publish extensions with minified code only after individual review, provided the developer always grants access to the current unminified sources.

### Message queue payload size

If the extension enqueues messages, keep payloads at or below **256 KB**, in line with common message queue workers.

### Shopware Technology Partner agreement

If your extension is a software app or interface with downstream costs, transaction fees, or service fees for the customer, a technology partner agreement is required before activation.

For questions, contact the sales team at [alliances@shopware.com](mailto:alliances@shopware.com) or by phone: **+44 (0) 203 095 2445 (UK)**, **00 800 746 7626 0 (worldwide)**, **+49 (0) 2555 928 85-0 (Germany)**.

## Storefront guidelines

### Testing the Storefront

Test the full Storefront and checkout with the browser developer tools open and watch for JavaScript errors.

### Markup, CSS, and accessibility

* No inline CSS in Storefront templates. Use your own classes and compile CSS with the extension. See <PageRef page="../../plugins/plugins/storefront/add-scss-variables" title="Add SCSS variables" />.
* Avoid `!important` unless unavoidable.
* Images need meaningful `alt` text (or the original alt from the media manager).
* Links need meaningful `title` attributes where appropriate.
* External links use `target="_blank"` with `rel="noopener"`.
* Do not use `<h1>`–`<h6>` in Storefront templates on pages with `<meta name="robots" content="index,follow">`; reserve real headings for content. You may use classes such as `<span class="h2">` for visual hierarchy.
* Keep performance stable; Lighthouse audits in the A/B range are recommended.
* Re-test the Storefront and checkout after changes, including the browser console for JavaScript errors.

### SEO and indexing

* New controller URLs or XHR endpoints that must not be indexed should send `X-Robots-Tag: noindex, nofollow`. See Google's documentation on the [robots meta tag and `X-Robots-Tag`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag).
* Public frontend URLs created by the extension should appear in `sitemap.xml` where applicable, use valid canonical tags, and have unique meta descriptions and `title` tags (configurable in the Administration or via snippets).

### Lighthouse testing

Run a [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) audit before and after activating the extension.

Significant regressions in performance, accessibility, best practices, or SEO are **not** acceptable. Do not introduce new console errors.

### Structured data and rich results

Validate structured data with [Schema.org's validator](https://validator.schema.org/) and Google's [Rich Results Test](https://search.google.com/test/rich-results). Test the homepage, categories, and product detail pages across typical cases (in stock, out of stock, with and without reviews, variants with dimensions and identifiers, and so on).

### Fonts and external services

If you load fonts or assets from third parties (for example Google Fonts or Font Awesome), state this in the extension store description. Merchants may need to update their privacy policy. A tooltip next to the relevant configuration can help.

### Cookie Consent Manager

Cookies set from the shop that are not strictly required for running Shopware must be optional and registered in the Cookie Consent Manager.

We distinguish **Technically required**, **Marketing**, and **Comfort features**. Optional cookies must appear **unchecked** by default in the cookie configuration in the Storefront.

## Administration guidelines

### Main menu entries

Do not add entries to the main menu of the Administration; this is reserved for core look and feel.

### Media folders

Create dedicated media folders with correct thumbnail settings, or reuse suitable existing folders, except for upload fields defined in `config.xml`. If you use a custom folder, remove it on uninstall when the merchant chooses to delete extension data.

### API test button

If your extension calls external APIs with credentials from the Administration, provide an **API test** action (button or equivalent). You may alternatively validate credentials when saving settings; in both cases, show a clear status in the Administration and log failures to `/var/log/` or the database event log.

Example implementation: [ShyimApiTest on GitHub](https://github.com/shyim/ShyimApiTest).

### Shopping Experiences

CMS elements must ship with an element icon. After the extension is removed, Shopping Experiences must still work correctly in the Storefront.

### Themes

Themes must include their own preview image.

### Shopware Technology Partner reporting

External technology extensions under an STP contract must report commission-related usage. Example payload for `POST /shopwarepartners/reports/technology`:

```json
{
  "identifier": "8e167662-6bbb-11eb-9439-0242ac130002",
  "reportDate": "2005-08-15T15:52:01",
  "instanceId": "alur24esfaw3ghk",
  "shopwareVersion": "6.7.0",
  "reportDataKeys": [
    { "customer": 3 },
    { "turnover": 440 }
  ]
}
```

### Automatic code review (PHPStan and SonarQube)

Current review configurations for uploads via the Shopware Account are published on GitHub: [store-plugin-codereview](https://github.com/shopwareLabs/store-plugin-codereview).

### SonarQube blockers

The following patterns are blocked, among others: `die`, `exit`, `var_dump`.

[List of SonarQube blockers](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt)

### Cypress end-to-end tests

Cypress tests for Shopware 6 are maintained in the core repository; see [`src/Administration/Resources`](https://github.com/shopware/shopware/tree/trunk/src/Administration/Resources) and community projects such as Friends of Shopware for contributions.

### Shopware CLI

<PageRef page="../../../products/cli/index" title="Shopware CLI" /> helps you build, validate, and upload Shopware 6 extensions and manage store descriptions and images efficiently.

## Automatic code review errors

For a consolidated list of frequent review findings, see <PageRef page="./store-review-errors" title="Common Store Review Errors" />.

The following issues often appear in automated checks:

### The required `composer.json` file was not found

**Cause:** Invalid or missing `composer.json`, a mismatch between the Store technical name and `composer.json`, or an incorrect ZIP layout.

The technical name must match `extra.shopware-plugin-class` and the bootstrap class namespace (case-sensitive). Many failures come from a wrong technical name, for example `Swag\MyPlugin\SwagMyPluginSW6` instead of `Swag\MyPlugin\SwagMyPlugin`.

Example: [valid `composer.json`](https://github.com/FriendsOfShopware/FroshPlatformPerformance/blob/master/composer.json#L20).

### Cross-domain messaging

When using `postMessage()` or similar APIs, validate `event.origin` and avoid wildcard targets. See also the [OWASP guide on web messaging](https://github.com/OWASP/wstg/blob/master/document/4-Web_Application_Security_Testing/11-Client-side_Testing/11-Testing_Web_Messaging.md).

### No bootstrapping file found

The bootstrap class cannot be resolved. Typical causes: wrong ZIP structure, typos, or case sensitivity in paths or the technical name.

### Class `Shopware\Storefront\*` not found

Declare required Shopware packages explicitly in `composer.json`, for example `"shopware/storefront": "~6.x.0"`, instead of unconstrained `*`.

<PageRef page="../../plugins/apps/app-base-guide" title="App base guide" /> for meta information and packaging.

### Cookies must be set securely

Use secure cookie flags and register cookies in the Cookie Consent Manager where required.

### `jsonEncode()` on an unknown class

Shopware uses PHP's `json_encode()`; do not rely on non-standard wrappers.

### Lock file out of date

Run `composer update` locally so the lock matches `composer.json`. **Do not** ship `composer.lock` inside the extension archive; delete it before packaging.

### `SnippetFileInterface` not found (Early Access)

Wildcard requirements such as `"shopware/core": "*"` can resolve to Early Access builds where classes do not exist yet, which fails review.

Pin compatible versions and stability, for example:

```json
{
  "require": {
    "shopware/core": "~6.1.0",
    "shopware/storefront": "~6.1.0"
  },
  "minimum-stability": "RC"
}
```

This pins a supported 6.1 line and prefers release candidates until the stable release is available.
