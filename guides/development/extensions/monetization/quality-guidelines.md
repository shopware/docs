---
nav:
  title: Quality Guidelines for Store Extensions
  position: 20

---

# Quality Guidelines for Store Extensions

These guidelines apply to all extensions distributed via the Shopware Store, including both plugins and apps. They define the quality, security, and compliance requirements for publication.

## Scope and terminology

* **Extension**: umbrella term for plugins and apps.
* **Plugin**: installed in the Shopware instance; PHP code, Composer.
* **App**: integrated via app system; no direct PHP execution in core.

Unless stated otherwise, requirements apply to all extensions.

## Review process

All extensions are:

1. Automatically [code-reviewed](https://github.com/shopwareLabs/store-plugin-codereview) (PHPStan, SonarQube), Due to our quality assurance, with special attention on impacts to the Administration and Storefront.
2. Manually reviewed for security, coding standards, user experience, and functionality.
3. Tested on the latest stable [Shopware 6](https://www.shopware.com/de/download/#shopware-6) CE version.

Always test against the highest supported Shopware 6 version (e.g., `shopware/testenv:6.7.6`).

For apps, we additionally test:

* `config.xml` per sales channel
* Install / uninstall behavior
* Styling and viewport issues

Before publishing an extension, review the full test process to ensure fast approval.

::: info
[Test your app for the Shopware Store (DE):](https://www.youtube.com/watch?v=gLb5CmOdi4g); EN version is coming soon.  
:::

## Store listing requirements

All extensions must:

* Be available in English, with 1:1 translation between English and German. For the German store, German language is required. All extensions will be released in both the German and International stores.
* Use meaningful short and long descriptions.
  * The short description (150–185 characters) teases your extension in an overview, along with "Customers also bought" and "Customers also viewed" recommendations. It is also published as a meta-description.
  * Long descriptions (minimum 200 characters) must describe the extension's functionality in detail.
* Accurately and clearly describe the extension and its use cases.
* Avoid the words “plugin” and “shopware” in the display name.
* Avoid blank spaces as filler text.
* Include clear, complete setup and configuration instructions.
* Use clean HTML source code. Inline styles will be stripped. 

These tags are allowed:

```markdown
<a> <p> <br> <b> <strong> <i> <ul> <ol> <li> <h2> <h3> <h4> <h5>
```

### Fallback language / translations

Extensions must work independently of the system language.

If a translation is missing (e.g., Spanish), a proper fallback (usually English) must be used.

If your extension is available in multiple languages, define them in your Shopware Account under “Translations into the following languages are available,” located in the "Description & images" section.

We review:

* Text snippets
* `config.xml`
* `composer.json`

### Reserve your extension name with a store preview

To secure an idea early, create a preview in your Shopware Account. Request this by providing placeholder images, meaningful use cases, key features, a description, and an expected release month. No binary upload is required.

### Extension master data/license

The license selected in your Shopware Account must match the license defined in `composer.json`. The selected license cannot be changed after the extension has been created. Changes require creating a new extension with a new technical name and uploading it again.

## Screenshots and media requirements

* Use English-only screenshots for the English store listing and preview images.
* Screenshots in German for the German store description are optional.
* Only images that represent or show the function of the extension are permissible.
* Advertising for other extensions or services is not permitted.
* Ensure that screenshots show the extension's functionality in action in the Storefront and administration, as well as configuration options and how-to-use details.
* We recommend screenshots showing mobile and desktop views.

:::Info
[How To - Add images and icons to extensions](https://docs.shopware.com/en/account-en/adding-pictures-and-icons/how-to)
:::

## Preview requirements

* A preview image must be available in the Extension Manager.
* Store a valid favicon named `plugin.png` (112x112px) under `src/Resources/config/`. This favicon will help you identify your extension in the Extension Manager module in the Administration.
* [Themes](../../../../../guides/plugins/themes/) require a preview image in the Theme Manager.
* [Shopping World elements](../../../../../concepts/commerce/content/shopping-experiences-cms.md#elements) must include an element icon.

Read our [How to request a preview](https://docs.shopware.com/en/account-en/extension-partner/extensions?category=account-en/extension-partner#how-can-i-request-a-preview) guide for additional help.

## Demo shop requirements

* URLs must not contain `http:` or `https:`.
* Test environments will be automatically deleted after two weeks, so do not link to them.

## Manufacturer profile requirements

The manufacturer profile exists in your account under Shopware Account > Extension Partner > [Extension Partner profile](https://account.shopware.com/producer/profile).

* A manufacturer logo is required.
* No iframes, tracking, or external scripts are allowed.
* External sources must use HTTPS.
* Must contain accurate English and German descriptions.

::: info
The source code's descriptions, profiles, and instructions do not allow iframes, external scripts, or tracking pixels. Custom styles may not overwrite the original Shopware styles. External sources must be included via https.
:::

::: info
You can no longer advertise Shopware certificates within a extension's description, images, or your manufacturer profile.
Manufacturer/partner certificates are dynamically loaded at the end of each extension description and published by Shopware.
:::

## Data Protection

If the personal data of customers, including store operators and their customers, is processed according to Art. 28 DSGVO:

* Subprocessor information must be declared.
* Additional processors must be listed accordingly, under "further subprocessors."

An extension with a name that directly reflects its functional purpose is permissible, even if it shares the same name as another extension.

The store display name must be used for `composer.json` and `config.xml`.

Not allowed:

* Inline styles.
* Certificates in descriptions.
* Iframes, tracking pixels, external scripts.

We allow up to two YouTube videos embedded in your extension description.

:::info
Video content—especially explainer videos, product demos, and tutorials—increases awareness and trust and has proven to convert potential customers better than other content types.
:::

## Functional requirements

All extensions must:

* Work without 500 errors.
* Avoid 400 errors unless they are related to an API call.
* Be installable and uninstallable without issues.
* During uninstall, users must be able to choose in the Extension Manager whether to "completely delete or "keep the app data, text snippets, media folder including own media and table adjustments." The free [Adminer](https://store.shopware.com/en/frosh79014577529f/adminer-for-admin.html) extension from Friends of Shopware enables you to do this via your provided test environment.
* Avoid extending or overwriting the Extension Manager.
* Properly register cookies in the [Cookie Consent Manager](../../../../../guides/plugins/plugins/storefront/add-cookie-to-manager).
  * Every cookie set from the store URL should be optional and not technically required for running Shopware. We differentiate between "Technically required", "Marketing," and "Comfort features."
  * All cookies must appear (unchecked) in the cookie configuration box in the frontend.
* Not introduce severe performance regressions.
* Not break Storefront SEO, structured data, or canonical logic.
* If the extension publishes messages to the message queue, each message must not exceed 262,144 bytes (256 KB). This limitation is set by common message queue workers.
* After uninstalling the extension, Shopping Experiences must continue to work in the frontend.

### Plugin-specific requirements

These apply only to plugins:

* [Composer dependencies](../../../../../guides/plugins/plugins/plugin-fundamentals/using-composer-dependencies) must be declared in `composer.json` so they are traceable.
  * If `executeComposerCommands() === true` is used, dependencies are installed dynamically and do not need to be bundled.
* `composer.lock` must not be included in the archive.
* Deliver uncompiled (readable) JavaScript in addition to compiled assets. Uncompiled sources must be included in a separate folder to allow code review.
  * Build `main.js` and create the minified code according to our documentation: [Loading the JS files](../../../../../guides/plugins/plugins/administration/module-component-management/add-custom-field.md#loading-the-js-files) and [Injecting into the Administration](../../../../../guides/plugins/plugins/administration/module-component-management/add-custom-field.md#injecting-into-the-administration).
* Only production files may be included in archive.
* Unified logs must be written to `/var/log/`.
* No forbidden PHP statements like `die`, `exit`, or `var_dump` are allowed. See [List of blockers](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt)
* Shopware must have access to the unminified source code of the extension at all times.

### App-specific requirements

These apply only to apps:

* Per-sales-channel configuration required if using `config.xml``.
* No loading external files during installation.
* API integrations must include API test button.
* Must not modify Extension Manager.
* STP agreement required for commission-based integrations.
* Apps that appear in the Storefront and use a `config.xml` must be able to be configured separately for each sales channel.

## Code and security requirements

* Pass automated code reviews (PHPStan, SonarQube).
* Not include development files or unused resources in the binary.
* Include only necessary dependencies.
* Use secure cookie settings.

## Composer and dependencies

If the extension includes Composer dependencies:

* All delivered code must be traceable via Composer.
* The extension must not exceed store size limits.

## Storefront guidelines

* No inline CSS allowed in storefront templates. Use your own classes and let your CSS be compiled by the plugin. See [Add SCSS variables](../../../../../guides/plugins/plugins/storefront/add-scss-variables.md#add-scss-variables).
* Avoid using the `!important` rule unless unavoidable.
* All images must include meaningful `alt` tags, or original `alt` tags from the media manager.
* All links must include meaningful `title` tags.
* External links must use `target="_blank"` together with `rel="noopener"`.
* No `<hX>` tags in the storefront templates, which are set to `<meta name="robots" content="index,follow">`. These are reserved exclusively for content purposes.
  * However, you may employ `<span class="h2">`, for instance.
* Performance should remain stable (Lighthouse A/B check recommended).
* Test the frontend and the checkout for new errors throughout the entire Storefront using the Browser Debug Console, paying close attention to JavaScript errors.

## SEO & indexing requirements

* New controller URLs or XHR requests must include the header `X-Robots-Tag: noindex, nofollow`. See [robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=de#xrobotstag) documentation for additional guidance.
* Public frontend URLs created by the extension must appear in `sitemap.xml` and include a valid canonical tag, unique meta descriptions, and `title` tags (configurable via Administration or as a text snippet).

## Administration guidelines

* Do not add new main menu entries in the Administration, to preserve look and feel consistency.
* Create a dedicated media folder with correct thumbnail settings or use an existing one (except for uploads defined in `config.xml`). 
* Custom media folders and their contents must be removed during uninstall.
* All links must include meaningful `title` tags.
* All images must include meaningful `alt` tags, or original `alt` tags from the media manager.
* If your API corresponds via API credentials to external services, provide an API test button. ([Example implementation](https://github.com/shyim/ShyimApiTest) in the system config form)
* It is possible to validate required credentials while saving them in extension settings. Display a status message in the Administration and log the result in Shopware.
* If API data is incorrect, an entry must appear in the `/var/log/` file or in the database event log.

### Installation and lifecycle

* The Extension Manager (Debug Console) controls installation, uninstallation, reinstallation, and deletion.
* Install, uninstall, reinstall must work without exceptions.
* No 400/500 errors during install/uninstall are allowed.
* Users must be able to choose whether to delete or keep extension data.
* Special PHP requirements must be validated during installation.
* If validation fails, a growl message must appear in the Administration.
* Extensions must not modify or overwrite the Extension Manager.
* Apps must not reload or load external files during installation.

### Error messages and logging

* Error or informational messages can only be recorded in the event log of Shopware's log folder, `/var/log/`.
* Do not write to Shopware’s default logs or outside the system log directory. This ensures that the log file can never be accessed via the URL.
* Log files must follow naming pattern: `MyExtension-Year-Month-Day.log`.
* Payment apps must use the "plugin logger" service.
* If storing logs in a database, avoid using custom log tables. Otherwise, you have to implement scheduled cleanup (max retention six months).

### API integrations

If external APIs are used:

* API test button required.
* Credentials must be validated on save.
* Success/failure must display status message in Administration.
* Errors must be logged in `/var/log/` or database.

## Commercial and external integrations

If your extension integrates with external services and generates revenue (e.g., interfaces with downstream fees), a Shopware Technology Partner (STP) agreement may be required.

Commission-based integrations must report usage data according to the STP contract:

Every external technology extension needs to track its commission. Below is an example of implementing the tracking logic:

```json
    {
      "identifier": "8e167662-6bbb-11eb-9439-0242ac130002",
      "reportDate": "2005-08-15T15:52:01",
      "instanceId": "alur24esfaw3ghk",
      "shopwareVersion": "6.3.1",
      "reportDataKeys": [
        {
          "customer": 3
        },
        {
          "turnover": 440
        }
      ]
    }
```

`// POST /shopwarepartners/reports/technology` allows partners to send Shopware the info based on the STP contract.

If you have any questions regarding the STP agreement, please contact our sales team at [alliances@shopware.com](mailto:alliances@shopware.com) or call **+44 (0) 203 095 2445 (UK) / 00 800 746 7626 0 (worldwide) / +49 (0) 25 55 / 928 85-0 (Germany)**.

**Progressive Web App:** If your app is Progressive Web App-compatible and you would like the PWA flag, please contact us at [alliances@shopware.com](mailto:alliances@shopware.com).

### External fonts and services

If external fonts (e.g., Google Fonts, Font Awesome) or other third-party services are used, this must be clearly stated in the store description.

If personal data is transferred, update your data protection information accordingly. A tooltip in the extension configuration is recommended to inform users.

## Lighthouse A/B-Testing

Run a [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) audit before and after activating the extension.

Significant regressions in performance, accessibility, best practices, or SEO are allowed. No new console errors may be introduced.

### schema.org/rich snippets A/B-testing checklist

A/B testing can ensure structured data is valid and rich results behave correctly across page types.

Use Scheme.org's [Schema Markup Validator](https://validator.schema.org/) and Google's [Rich Result Tester](https://search.google.com/test/rich-results) to check the homepage, categories, and product detail pages — including available products, unavailable products, products with no review, single review, reviews with varied ratings, out-of-stock products, products for future release, and/or any other product configuration and product types (including EAN, MPN, width, length, height, and weight). Also check for duplicate entries and any new bugs.

## Tools

Use the [Shopware CLI](/development/tooling/cli) to build, validate, and upload Shopware 6 plugin releases to the Community Store. It also supports managing store descriptions and plugin images efficiently.

## Final notes

An extension may be rejected if:

* It violates coding standards.
* It introduces security issues.
* It bundles unauthorized files.
* It breaks storefront behavior.
* It misrepresents functionality in the store description.

Ensure full compliance before submission to avoid delays in publication.
