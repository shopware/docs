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

Test the oldest version allowed by your extension's constraints and the newest supported stable version.
Also test relevant intermediate versions when an API, template, component or configuration behavior changes within that range.
Use the packaged release for the final check so missing dependencies and stale assets are visible.
See [Dependency and version errors](./store-review-errors.md#dependency-and-version-errors).

For apps, we additionally test `config.xml` per sales channel, install/uninstall behavior, and styling/viewport issues.

::: info
[Test your app for the Shopware Store (DE)](https://www.youtube.com/watch?v=gLb5CmOdi4g); (English version is planned)
:::

## Responding to review findings

Distinguish publication requirements and functional or security defects from recommendations about maintainability or style.
A recommendation is not automatically a universal requirement for every extension.
For each finding, identify the affected release, supported Shopware versions, expected behavior and a way to verify the correction.
If a requested approach does not fit your extension, explain the constraint and provide evidence for an alternative in your review response.

Retest the submitted archive after changes, including compiled assets.
Do not assume a later upload fixes every earlier finding, or that an observation about an older upload still applies unchanged.

## Submission test checklist

Choose the scenarios relevant to your extension:

* Oldest and newest supported versions, with the actual release dependencies and assets.
* Full administrators and intended restricted roles; direct API calls as well as UI actions.
* Guest and registered customers, including attempts to access another customer's resources.
* Two sales channels with different settings, plus global defaults and inheritance.
* Install, activate, active and inactive updates, deactivate, both uninstall options and reinstall.
* Warm caches, more than one page or batch of data, failed external requests and retried jobs.
* Missing configuration, invalid input and advertised languages with fallback behavior.

The [security](./security-and-permissions.md), [integration](./functionality-integration.md) and [lifecycle](./installation-and-cleanup.md) pages explain these checks in more detail.

## Requirements

### Store listing requirements

Listing copy, languages, images, previews, manufacturer profile, and account rules are defined in [Content and translations](./content-and-translations.md).

#### Fallback language/translations

Fallback languages, account configuration, and Administration translations are covered in [Content and translations](./content-and-translations.md#admin-translations).

### Functional requirements

Overall behavior (errors, cookies, performance, uninstall options, Shopping Experiences) is split across:

* [Storefront, performance, and errors](./storefront-performance-and-errors.md)
* [Cookies and privacy](./cookies-and-privacy.md)
* [Uninstallation and data cleanup](./installation-and-cleanup.md)
* [Functionality and integration](./functionality-integration.md)

#### Plugin-specific requirements

Packaging and delivery rules for plugins—Composer archive, readable JavaScript, release archive contents, and logging—are documented under [Code quality](./code-quality.md#plugin-specific-requirements).

#### App-specific requirements

For apps, reviewers additionally validate `config.xml` per sales channel, install and uninstall flows, and Administration presentation. Technical rules are documented under [Functionality and integration](./functionality-integration.md).

### Storefront guidelines

Storefront templates, CSS, accessibility, Lighthouse, and console checks: [Storefront, performance, and errors](./storefront-performance-and-errors.md).

### SEO & indexing requirements

Sitemaps, canonicals, robots headers, and structured data: [SEO and structured data](./seo-and-structured-data.md).

### Administration guidelines

Main-menu rules, media folders, API test buttons, validation messages, and logging in the Administration: [Functionality and integration](./functionality-integration.md) and [Content and translations](./content-and-translations.md).

### Composer and dependencies

Dependencies must be traceable and archives must respect store size limits. See [Common Store review errors](./store-review-errors.md) for `composer.json`, `composer.lock`, ZIP layout, and dependency mistakes.

### Lighthouse A/B-Testing

Lighthouse workflows and regression expectations: [Storefront, performance, and errors](./storefront-performance-and-errors.md) and [SEO and structured data](./seo-and-structured-data.md#lighthouse-and-structured-data-checks).

#### schema.org/rich snippets A/B-testing checklist

Validators and page types to test: [SEO and structured data](./seo-and-structured-data.md#rich-result-and-schema-checks).

### Tools

Use the [Shopware CLI](../../../../products/tools/cli/index.md) to build, validate, and upload Shopware 6 plugin releases and to manage store descriptions and images.

## Final notes

An extension may be rejected if it violates coding standards, introduces security issues, bundles unauthorized files, breaks storefront behavior, or misrepresents functionality in the listing.

Ensure full compliance before submission to avoid publication delays.
