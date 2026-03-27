nav:\
title: Quality guidelines for apps in the plugin system\
position: 20

* * * * *

Quality Guidelines for the Plugin System in the Shopware Store
==============================================================

These guidelines apply to all extensions distributed via the Shopware Store, including both plugins and apps. They define the quality, security, and compliance requirements for publication.

Scope and terminology

-   **Extension**: umbrella term for plugins and apps.

-   **Plugin**: installed in the Shopware instance; PHP code, Composer.

-   **App**: integrated via app system; no direct PHP execution in core.

Unless stated otherwise, requirements apply to all extensions.

What kind of extension is allowed?
----------------------------------

Currently, all types of extensions are allowed, except those that violate the following regulations. Extensions with the functions listed below are not permitted and will not be approved:

-   Function that included in the shopware B2B Components - [Shopware 6 - Commercial Features - B2B Components](https://docs.shopware.com/en/shopware-6-en/commercial-features/b2b-components)

-   Direct SQL adjustments by user or other security relefant issues

-   Extensions that are two major versions below the current one

-   If your extensionis a software app/interface with downstream costs, transaction fees, or service fees for the customer, we need to complete a technology partner agreement in order to activate your app.

Review process
--------------

All extensions are:

1.  Automatically [code-reviewed](https://github.com/shopwareLabs/store-plugin-codereview "https://github.com/shopwareLabs/store-plugin-codereview") (PHPStan, SonarQube), due to our quality assurance, with special attention on impacts to the Administration and Storefront.

2.  Manually reviewed for security, coding standards, user experience, and functionality.

3.  Tested on the latest stable [Shopware 6](https://www.shopware.com/de/download/#shopware-6 "https://www.shopware.com/de/download/#shopware-6") CE version.

Always test against the highest supported Shopware 6 version (e.g., `shopware/testenv:6.7.6`).

For apps, we additionally test:

-   `config.xml` per sales channel

-   Install/uninstall behavior

-   Styling and viewport issues

Before publishing an extension, review the full test process to ensure fast approval.

Checklist for testing
---------------------

-   We pay attention to the automatic code review and look for security issues and shopware coding standards in the manual code review.

-   We check the complete functionality of the extension and check for styling errors on every viewport.

Link: [Documentation for Extension Partner](https://docs.shopware.com/en/account-en/extension-partner/extensions?category=account-en/extension-partner#how-can-i-request-a-preview "https://docs.shopware.com/en/account-en/extension-partner/extensions?category=account-en/extension-partner#how-can-i-request-a-preview")

Extension store description
---------------------------

The release to the international store is standard, the German store is optional.\
As an extension will be released in both stores (German and international), the content must accurately translate 1:1 from English to German.

### Short description

(Min. 150 --- max. 185 characters)---The app's short description must be unique and at least 150 characters long.\
Use the short description wisely, as the text will tease your extension in the overview along with the "Customers also bought" and "Customers also viewed" recommendations.\
The short description is also published as a meta-description.

### Description

(Min. 200 characters)---The extension description must be at least 200 characters long and describe the app's functions in detail.

-   Inline styles will be stripped. The following HTML tags are allowed:

`<a>  <p>  <br>  <b>  <strong>  <i>  <ul>  <ol>  <li>  <h2>  <h3>  <h4>  <h5>`

-   Accurately and clearly describe the extension and its use cases.

-   Include clear, complete setup and configuration instructions.

    ::: info\
    - Avoid the words "plugin / app" and "shopware / for shopware" in the display name.\
    - Avoid blank spaces as filler text.\
    - Avoid any form of advertising or contact information in description.\
    :::

### Configuration manual

Explain how your extension is installed and configured, how it works on a technical base, and how it can be used to achieve the desired result.\
Of course, your extension manual should contain a setup guide and be accompanied by clean HTML source code.

### Images

Include several screenshots and descriptive images from the Storefront and backend that represent the extension functionality.\
They must show the extension "in action", its configuration options, and how to use it.\
We recommend uploading screenshots showing the mobile and desktop-view.

Only images that represent or show the function of the extension may be used. Advertising for other extensions or services is not permitted.

::: info\
- Use English-only screenshots for the English store listing and preview images.\
- Screenshots in German for the German store description are optional.\
- Advertising for other extensions or services is not permitted.\
- At least one image for the storefront and one image for the admin\
- Do not mix English with other languages in your screenshots.\
Link: [How To - Add images and icons to extensions](https://docs.shopware.com/en/account-en/adding-pictures-and-icons/how-to "https://docs.shopware.com/en/account-en/adding-pictures-and-icons/how-to")\
:::

### Link to demoshop

If you provide a demo shop, the link must be valid (the URL cannot contain `http:` or `https:`).\
Do not link to your test environments, as we will delete them automatically two weeks after they are created.

### Personal data protection information

If personal data of the customers (store operator and/or his customers) are processed with this extension according to Art. 28 DSGVO, the following information of the data processing company must be stored in the field "Subprocessor".

If other companies are involved in the data processing of personal data, the same information must be stored accordingly for them in the field "Further subprocessors".

### Manufacturer Profile

Your manufacturer profile must mandatorily contain accurate English and German descriptions and a manufacturer logo.\
You can find the manufacturer profile in your account under Shopware Account > Extension Partner > [Extension Partner profile](https://account.shopware.com/producer/profile "https://account.shopware.com/producer/profile").

::: info\
- The source code's descriptions, profiles, and instructions do not allow iframes, external scripts, or tracking pixels.\
Custom styles may not overwrite the original Shopware styles. External sources must be included via https.\
- The manufacturer/partner certificates are dynamically loaded at the end of each app description and published by us.\
:::

Basic Guidelines
----------------

### Testing functionality

Due to our quality assurance, we check the app's complete functionality and test it wherever it impacts the administration or storefront.

Also, every extension will be code-reviewed by one of our core-developer ensuring coding and security standards.

### Fallback language / Translations

The installation is not always in English or German.\
For example, if the customer has his installation in Spanish and your extension is not yet available in this language, you should use the English translation as a fallback.

If your extension is available in more than one language (e.g., English, Spanish, French and German), these can be defined using the option "Translations into the following languages are available" (located in the "Description & images" section of your *Account*).

We check for text snippets, `config.xml`, and `composer.json`.

### Valid preview images for the Shopware administration

Preview images: There must be a preview image available in the *Extension Manager*.\
You must upload a valid favicon named plugin.png (png / 112 x 112 pixels) for the extension.\
This favicon will help you identify your extension in the Extension Manager module in the administration.\
The favicon has to be stored under `src/Resources/config/`.

Also, provide a preview image for Themes in the *Theme Manager* and CMS elements in the *Shopping Experiences*.

### Configuration per sales channel

Apps that appear in the Storefront must be able to be configured separately for each sales channel.

### External links with rel="noopener"

Every external link in the administration or Storefront must be marked as *rel="noopener" AND target="_blank"*.

### Error messages and logging

Error or informational messages can only be recorded in the event log of Shopware's log folder (/var/log/).\
You have to develop your own log service.\
**Never write extension exceptions into the Shopware default log or outside the Shopware system log folder.**\
This ensures that the log file can never be accessed via the URL.

For payment extensions, we check if the "plugin logger" service is used for the debug/error.log and that logs are written in the directory /var/log/. Log files must be used in every circumstance.

The log file had to be named like this: "MyExtension-Year-Month-Day.log"

Another solution is to store them in the database.\
Try to avoid using your own log tables. Otherwise, you have to implement a scheduled task that regularly empties your log table within the given time of max. 6 months.

### Avoid 400/500 Error

*Avoid 500 errors at any time.* Avoid 400 errors unless they are related to an API call.

### With "Install/Uninstall" the user must decide whether the data/table is to be deleted or not

When clicking on the "Install / Uninstall" option in the Extension Manager, the user must be presented with the options "completely delete" or "keep the extension data, text snippets, media folder including own media and table adjustments".\
You can check this using the [Adminer-Extension from *Friends of Shopware*](https://store.shopware.com/de/frosh79014577529f/adminer-fuer-das-admin.html "https://store.shopware.com/de/frosh79014577529f/adminer-fuer-das-admin.html") in your provided test-environment.

### Not allowed to extend the Extension Manager

The *Extension Manager* must not be extended or overwritten.

### Own composer dependencies

Composer dependencies are possible if they are in the `composer.json`.\
With `executeComposerCommands() === true` in the plugin base class, we provide a dynamic installation of the composer dependencies by default, so they don't have to be included.\
Everything that is delivered in code should be traceable either directly or via `composer.json`.

Developer documentation article to add private dependency

### Extension manager

The Debug Console controls the app's installation, uninstallation, reinstallation, and deletion.\
No 400 errors or exceptions are allowed to appear. If the extension requires special PHP options, it must be queried during installation.\
If the query is negative, a growl message must appear in the administration.

### Reloading of files not allowed

Apps may not load other files during and after the installation in the *Extension Manager*.

### Uncompiled JavaScript must be delivered within the binary

Compiled JavaScript offers many benefits such as improved performance and code optimization.\
However, it is difficult to read and understand the compiled code.\
The uncompiled JavaScript code must be placed in a separate folder to ensure it remains accessible to all developers.\
This allows other developers to review and understand the code in its original, readable form.

Please build your `main.js` as described in our documentation and create the minified code as described in our developer documentation.

Loading the JS files

Injecting into the Administration

Shopware reserves the right to publish extensions with minified code after individual consideration and consultation with the developer.\
For this, the developer must ensure that Shopware has access to the current unminified code of the extension at all times.

### Message queue

If the extension adds messages to the message queue, ensure they are not bigger than 256 KB.\
This limitation is set by common message queue workers and should not be exceeded.

### Note on Shopware technology partner contract for interfaces

If your extension is a software app/interface with downstream costs, transaction fees, or service fees for the customer, we need to complete a technology partner agreement in order to activate your app.

If you have any questions regarding the technology partner agreement, please contact our sales team by writing an email to <alliances@shopware.com> or calling **+44 (0) 203 095 2445 (UK) / 00 800 746 7626 0 (worldwide) / +49 (0) 25 55 / 928 85-0 (Germany)**.

Storefront Guidelines
---------------------

### Testing the storefront

Test the frontend and the checkout for new errors throughout the entire Storefront using the Browser Debug Console and also pay attention to JavaScript errors.

### No inline CSS allowed in storefront templates. Use your own classes and let your CSS be compiled by the plugin. See [Add SCSS variables](https://developer.shopware.com/docs/guides/plugins/plugins/storefront/add-scss-variables.html#add-scss-variables "https://developer.shopware.com/docs/guides/plugins/plugins/storefront/add-scss-variables.html#add-scss-variables").

-   Avoid using the `!important` rule unless unavoidable.

-   All images must include meaningful `alt` tags, or original `alt` tags from the media manager.

-   All links must include meaningful `title` tags.

-   External links must use `target="_blank"` together with `rel="noopener"`.

-   No `<hX>` tags in the storefront templates, which are set to `<meta name="robots" content="index,follow">`. These are reserved exclusively for content purposes.

    -   However, you may employ `<span class="h2">`, for instance.

-   Performance should remain stable (Lighthouse A/B check recommended).

-   Test the frontend and the checkout for new errors throughout the entire Storefront using the Browser Debug Console, paying close attention to JavaScript errors.

### SEO & indexing requirements

-   New controller URLs or XHR requests must include the header `X-Robots-Tag: noindex, nofollow`. See [robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=de#xrobotstag "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=de#xrobotstag") documentation for additional guidance.

-   Public frontend URLs created by the extension must appear in `sitemap.xml` and include a valid canonical tag, unique meta descriptions, and `title` tags (configurable via Administration or as a text snippet).

### Lighthouse A/B-Testing

Run a [Google Lighthouse](https://developer.chrome.com/docs/lighthouse "https://developer.chrome.com/docs/lighthouse") audit before and after activating the extension.

Significant regressions in performance, accessibility, best practices, or SEO are allowed. No new console errors may be introduced.

### [schema.org/Rich](http://schema.org/Rich "http://schema.org/Rich") Snippets A/B-Testing

Do an A/B-Test with [The Scheme Programming Language](http://scheme.org/) *'s Structured Data Testing Tool* and *Google Rich Result Tester* to check the homepage, categories, and various product detail pages (incl. available products, unavailable products, products with no review, single review, many reviews with various ratings, out-of-stock products, products to be released in the future or any other kind of product configuration and products including ean, mpn, width, length, height, weight).

-   **Testing tool** for A/B-Testing:

    -   Link: [Schema Markup Validator of schema.org](https://validator.schema.org/ "https://validator.schema.org/")

    -   Link: [Google Rich Result Tester](https://search.google.com/test/rich-results "https://search.google.com/test/rich-results")

### Usage of fonts from external sources

If you are using external fonts (e.g., Google fonts, Fontawesome) or external services, the extension store description must contain this information.

Please be aware that you might have to edit your *data protection information*.\
This info could be placed as a tooltip near the font settings of the extension configuration.

### Register your cookie to the Cookie Consent Manager

We expect every cookie set from the store URL to be optional and not technically required for running shopware.\
Therefore, the cookies had to be registered in our Cookie Consent Manager.

We differentiate between "Technically required", "Marketing" and "Comfort features".\
All cookies must appear (unchecked) in the cookie configuration box in the frontend.

Administration guidelines
-------------------------

### Menu entries in the main menu are not allowed

Menu entries in the main menu of the administration are not allowed because of the look and feel.

### Own media folder

Manufacturer must create their own media folders with the right thumbnail settings or use existing ones to upload images, except for upload fields within the `config.xml`.

If you use your own media folder, keep in mind that the folder and the included data had to be removed if selected during the uninstallation.

### API test button

-   If your API corresponds via API credentials to external services, we expect an API test button.\
    Apart from that, you can validate the required credentials while saving them in the extension settings.\
    In this case, a status message must be displayed in the administration and Shopware log.\
    If the API data is incorrect, an entry must appear in the event log file in the Shopware folder `/var/log/` respectively in the database.

-   **Example** for implementing an API Test Button into the System Config form:

    -   Link: [GitHub](https://github.com/shyim/ShyimApiTest "https://github.com/shyim/ShyimApiTest")

### Shopping experiences

Shopping worlds elements must include an element icon.\
If the extension is deleted, *Shopping Worlds* should work flawlessly in the frontend.

### Themes

Themes must include its own preview image.

### External technology/ Shopware Technology Partner (STP) apps

Every external technology extension needs to track its commission.\
Below is an example of implementing the tracking logic in their extensions:

// POST /shopwarepartners/reports/technology - Allows partners to send us the info based on the STP contract

`{  "identifier":  "8e167662-6bbb-11eb-9439-0242ac130002",  "reportDate":  "2005-08-15T15:52:01",  "instanceId":  "alur24esfaw3ghk",  "shopwareVersion":  "6.7.0",  "reportDataKeys":  [  {  "customer":  3  },  {  "turnover":  440  }  ]  }`

### Automatic code reviews with PhpStan and SonarQube

Our most current code review configurations when uploading apps via the Shopware Account can be found on GitHub.

-   Link: [Code reviews for Shopware 6 on GitHub](https://github.com/shopwareLabs/store-plugin-codereview "https://github.com/shopwareLabs/store-plugin-codereview")

### Sonarcube Rules status Blocker

The following statements will be blocked:\
-die; exit; var_dump

-   Link: [Refer to the list of the already existing blockers](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt "https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt").

### Automated code tests with Cypress

There are Cypress tests for Shopware 6 on GitHub.\
The project is driven by the *Friends of Shopware* group. You can contribute at any time:

-   Link: Developer Documentation Cypress Tests for Shopware 6

-   Link: [Cypress Tests for Shopware 6](https://github.com/shopware/shopware/tree/trunk/src/Administration/Resources "https://github.com/shopware/shopware/tree/trunk/src/Administration/Resources")

### Useful tool for plugin development and extension management

The `shopware-cli` is a useful tool for building, validating and uploading new Shopware 6 plugin releases to the Community Store. It also allows you to manage the store description and images of your plugins efficiently.

Automatic code review - Errors
------------------------------

### The required composer.json file was not found

**Cause:** Error in composer.json

One possible cause is that the technical extension name from the Community Store or Account does not match the technical name entered in composer.json, or the extension is incorrectly zipped.\
The technical extension name must be stored in the composer.json, located at `composer.json` > extra > `shopware-plugin-class`.\
Could you take a look at the bootstrap class? Most of the errors are caused by the wrong technical name.\
For example, "Swag\\MyPlugin\\SwagMyPluginSW6" instead of "Swag\\MyPlugin\\SwagMyPlugin".

Link: [Example of a valid composer.json](https://github.com/FriendsOfShopware/FroshPlatformPerformance/blob/master/composer.json#L20 "https://github.com/FriendsOfShopware/FroshPlatformPerformance/blob/master/composer.json#L20").

### Ensure cross-domain messages are sent to the intended domain

When using `postMessage()` or similar cross-window messaging APIs, verify the message origin (e.g. `event.origin`) and restrict target domains to trusted URLs instead of `'*'`. This prevents malicious sites from sending or receiving unauthorized messages.

### No bootstrapping file found. Expecting bootstrapping in

The bootstrap cannot be found.\
The reasons could be that the folder structure in the ZIP file needs to be corrected, a typo, or a case-sensitive error in the extension source (e.g., in the technical name).

### Class Shopware\Storefront\* not found

Missing requirements in the composer.json (e.g. "require": {"shopware/frontend": "*"},)

Link: "Shopware App Development: App Meta Information - Explanation of the properties

### Cookies are written safely

Be sure you set cookies as secure.\
Remember to register your cookie to the *Cookie Consent Manager*.

### Call to static method jsonEncode() on an unknown class

Shopware always uses json_Encode exclusively - there is no other fallback.

### The lock file is not up to date with the latest changes in composer.json

You may need to get updated dependencies. Run an update to update them.

The `composer.lock` in the extension archive has to be deleted.

### Class Shopware\Core\System\Snippet\Files\SnippetFileInterface not found and could not be autoloaded

In the Shopware 6 Early Access (EA) version, the mentioned class did not exist.\
Therefore, the code review failed. The reason for the problem is the following specification in the composer.json:

`<pre>"require": { "shopware/core": "*", "shopware/storefront": "*" },</pre>`

The Composer resolves this to "Whatever is the latest from these repositories" and then installs the Early Access version instead of the current Release Candidate.\
This happens because the Composer does not know an EA as a stability level (like stable or RC) and is, therefore, ultimately considered "stable".\
The solution is to amend the requirement as follows:

`<pre>"require": { "shopware/core": "~6.1.0", "shopware/storefront": "~6.1.0" }, "minimum-stability": "RC"</pre>`

This ensures that at least version Shopware 6.1 is installed, even if it is a Release Candidate.\
It will be preferred as soon as the final 6.1 is released.
