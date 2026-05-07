---
nav:
  title: Quality Guidelines for Store Extensions
  position: 10
---

# Quality Guidelines for Store Extensions

These guidelines apply to all extensions distributed through the Shopware Store (both plugins and apps). This page provides a general overview, while the detailed requirements are covered in the topic pages below. Refer to them when implementing and testing your extension.

## Scope and terminology

* **Extension**: Umbrella term for plugins and apps.
* **Plugin**: Installed in the Shopware instance; PHP code, Composer.
* **App**: Integrated via the app system; no direct PHP execution in core.

Unless stated otherwise, requirements apply to all extensions.

Architecture boundaries (database, core files, APIs) are covered in [Not allowed behaviors in the Shopware Store](./not-allowed-store-behaviors.md).

## Review process

All extensions are:

1. Automatically [code-reviewed](https://github.com/shopwareLabs/store-plugin-codereview) (PHPStan, SonarQube), with emphasis on Administration and Storefront impact.
2. Manually reviewed for security, coding standards, user experience, and functionality.
3. Tested on the latest stable [Shopware 6](https://www.shopware.com/de/download/#shopware-6) CE version.

Always test against the highest supported Shopware 6 version (for example, `shopware/testenv:6.7.6`).

For apps, we additionally test `config.xml` per sales channel, install/uninstall behavior, and styling/viewport issues.

::: info
[Test your app for the Shopware Store (DE)](https://www.youtube.com/watch?v=gLb5CmOdi4g); (English version is planned)
:::

## Requirements

### Store listing requirements

Listing copy, languages, images, previews, manufacturer profile, and account rules are defined in [Content and translations](./content-and-translations.md).

#### Fallback language/translations

Fallback languages, account configuration, and Administration translations are covered in [Content and translations](./content-and-translations.md#fallback-language-and-translations).

### Functional requirements

Overall behavior (errors, cookies, performance, uninstall options, Shopping Experiences) is split across:

* [Storefront, performance, and errors](./storefront-performance-and-errors.md)
* [Cookies and privacy](./cookies-and-privacy.md)
* [Uninstallation and data cleanup](./installation-and-cleanup.md)
* [Functionality and integration](./functionality-integration.md)

#### Plugin-specific requirements

Packaging and delivery rules for plugins—Composer archive, readable JavaScript, production-only ZIP, and logging—are documented under [Code quality](./code-quality.md#plugin-specific-requirements).

#### App-specific requirements

Rules that apply only to apps—per-sales-channel `config.xml`, API test flows, no Extension Manager changes, and STP where required — are documented under [Functionality and integration](./functionality-integration.md#app-specific-requirements).

### Storefront guidelines

Storefront templates, CSS, accessibility, Lighthouse, and console checks: [Storefront, performance, and errors](./storefront-performance-and-errors.md).

### SEO & indexing requirements

Sitemaps, canonicals, robots headers, and structured data: [SEO and structured data](./seo-and-structured-data.md).

### Administration guidelines

Main-menu rules, media folders, API test buttons, validation messages, and logging in the Administration: [Content and translations](./content-and-translations.md) and [Functionality and integration](./functionality-integration.md).

### Composer and dependencies

Dependencies must be traceable and archives must respect store size limits. See [Common Store review errors](./store-review-errors.md) for `composer.json`, `composer.lock`, ZIP layout, and dependency mistakes.

### Lighthouse A/B-Testing

Lighthouse workflows and regression expectations: [Storefront, performance, and errors](./storefront-performance-and-errors.md) and [SEO and structured data](./seo-and-structured-data.md#lighthouse-and-structured-data-checks).

#### schema.org/rich snippets A/B-testing checklist

Validators and page types to test: [SEO and structured data](./seo-and-structured-data.md#rich-result-and-schema-checks).

### Tools

Use the [Shopware CLI](../../../../products/cli/index.md) to build, validate, and upload Shopware 6 plugin releases and to manage store descriptions and images.

## Final notes

An extension may be rejected if it violates coding standards, introduces security issues, bundles unauthorized files, breaks storefront behavior, or misrepresents functionality in the listing.

Ensure full compliance before submission to avoid publication delays.
