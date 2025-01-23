---
nav:
  title: Quality guidelines for apps in the plugin system
  position: 10

---

# Quality Guidelines for the Plugin System in the Shopware Store

> **Changelog**
>
>> 09/10/24: Quality guidelines for apps in the plugin system.
>
>> 01/08/24: [Added - Message queue](..//quality-guidelines-plugins/#message-queue)
>
>> 06/09/23: [Added - Rules for own composer dependencies](../quality-guidelines-plugins/#own-composer-dependencies)
>
>> 26/07/23: [Added - Identical name rule](../quality-guidelines-plugins/#every-app-based-on-the-plugin-system)

## The way we test apps based on the plugin system

It is always a good idea to review our test process before submitting your app for review.
This ensures the quickest way for your app to be published.

We perform the *first test*, and if successful, we do the *follow-up test* again with the most current Shopware version.

The Shopware installation is located in a subfolder.
It has a language sub-shop/sales channel with a virtual URL as well as an independent sub-shop/sales channel with its own URL, also located in a subfolder.
E.g. `myshop.com/public/admin`.
The app must neither produce any error messages in the administration nor in the frontend.

The app is tested with the latest official Shopware 6 CE Version.

::: info
We always test with the [actual SW6 version](https://www.shopware.com/de/download/#shopware-6).
So set it to the actual SW6 version e.g., shopware/testenv:6.6.6.
Always test with the app`s highest supported Shopware version.
:::

Link: [Test your app for the Shopware Store (DE):](https://www.youtube.com/watch?v=gLb5CmOdi4g) and EN version is coming soon.  

**Progressive Web App:** If your app is PWA compatible and you would like the PWA flag, please contact us at [alliances@shopware.com](mailto:alliances@shopware.com).

## Checklist for app testing

Could you be sure to use the most recent testing checklist from Shopware and not any other provider?
Please pay attention to every point in this guide. We'll review it before you release your app.

### Every app based on the plugin system

* We pay attention to the automatic code review and look for security issues and shopware coding standards in the manual code review.

* We check the complete functionality of the app (separately sales channel configurations in the config.xml, the uninstallation and reinstallation procedure) and check for styling errors on every viewport.

* We want to improve the quality of the Shopware Community Store and offer as many different apps as possible.
Hence, we check for a functional comparison with other apps already in the Shopware Community store, in the Rise edition or above.
If an extension with the same function exists and it does not fit into one of our differentiator clusters, it can be rejected as it doesn't provide any added value.
If you would like more information, please write an email to [qa@shopware.com](mailto:qa@shopware.com).

Link: [Differentiator cluster for Shopware extensions](../../../../../resources/guidelines/testing/Differentiator-Clusters.md)

Link: [Documentation for Extension Partner](https://docs.shopware.com/en/account-en/extension-partner/extensions?category=account-en/extension-partner#how-can-i-request-a-preview)

::: info
**Safe your app idea and get a preview in the store**
If you already have an idea and don't want it to be snatched away, ensure you get it by creating a preview in your account.
You can apply for this if you have maintained placeholder images for the store, meaningful use cases, highlight features, a description, and a release month without uploading any binary.
:::

## App store description

The release to the English store is standard.
As an app will be released in both stores (German and International), the content must accurately translate 1:1 from English to German.

* The mandatory number of characters is set in short and long descriptions. No blank spaces as fillers are allowed (EN/DE).
* Check if the description makes sense and describe the use cases of your app.
* Check if your configuration manual includes step-by-step instructions on how to configure and use your app.
* Check if you have included enough screenshots showing the app in action in the Storefront and administration.
* Check if the display name does not contain the terms "plugin" or "shopware".
* Check if all images for the English store description contain the English language. [Please do not mix English with other languages in your screenshots. Screenshots in German for the German store description are optional.]
* Check if you explained the setup of the app and added a configuration manual.

### Display Name

According to the new naming scheme, extensions may no longer display the words "plugin" and "shopware" in their names.
An extension with a name that directly reflects its functional purpose is permissible, even if it shares the same name as another extension.

Also, the store-display name had to be used for `composer.json` and `config.xml`.

### Short description

(Min. 150 — max. 185 characters)—The app's short description must be unique and at least 150 characters long.
Use the short description wisely, as the text will tease your app in the overview along with the "Customers also bought" and "Customers also viewed" recommendations.
The short description is also published as a meta-description.

### Description

(Min. 200 characters)—The app description must be at least 200 characters long and describe the app's functions in detail.

* Inline styles will be stripped. The following HTML tags are allowed:

```markdown
<a> <p> <br> <b> <strong> <i> <ul> <ol> <li> <h2> <h3> <h4> <h5>
```

* **Tips:**

    * When it comes to increasing your app sales, it is important that potential customers feel completely informed about your products and services.
	To this end, you should provide description, highlights, and features that are meaningful, detailed, and easy to understand, even for people with very minimal technical knowledge.
	Explain step-by-step how your app works and how to use it to achieve the desired result.
	Of course, your app description should be accompanied by clean HTML source code.

    * Video content increases awareness and trust and has proven to convert potential customers better than other content types.
	You can help your customers better understand your app or service with explainer videos, product demos, tutorials, etc.
	You can embed a maximum of 2 YouTube videos in your app description.

::: info
You can no longer advertise your Shopware certificates within the app description, in your app images, or in your manufacturer profile.
The manufacturer/partner certificates are dynamically loaded at the end of each app description and published by us.
:::

### Images

::: info
Screenshots and preview images in English are standard. Only full English screenshots are accepted. Please do not mix English with other languages in your screenshots. Screenshots in German for the German store description are optional.
:::

Include several screenshots and descriptive images from the Storefront and backend that represent the app functionality.
They must show the app "in action", its configuration options, and how to use it.
We recommend uploading screenshots showing the mobile and desktop-view.

Link: [How To - Add images and icons to extensions](https://docs.shopware.com/en/account-en/adding-pictures-and-icons/how-to)

### Link to demoshop

If you provide a demo shop, the link must be valid (the URL cannot contain `http:` or `https:`).
Do not link to your test environments, as we will delete them automatically two weeks after they are created.

### Personal data protection information

If necessary, personal data protection information has to be set.
If personal data of the customers (store operator and/or his customers) are processed with this extension according to Art. 28 DSGVO, the following information of the data processing company must be stored in the field "Subprocessor".

If other companies are involved in the data processing of personal data, the same information must be stored accordingly for them in the field "Further subprocessors".

### Configuration manual

Explain how your app is installed and configured, how it works on a technical base, and how it can be used to achieve the desired result.
Of course, your app manual should contain a setup guide and be accompanied by clean HTML source code.

### Manufacturer Profile

Your manufacturer profile must mandatorily contain accurate English and German descriptions and a manufacturer logo.
You can find the manufacturer profile in your account under Shopware Account > Extension Partner > [Extension Partner profile](https://account.shopware.com/producer/profile).

::: info
The source code's descriptions, profiles, and instructions do not allow iframes, external scripts, or tracking pixels.
Custom styles may not overwrite the original Shopware styles. External sources must be included via https.
:::

## Basic Guidelines

### Testing functionality

Due to our quality assurance, we check the app's complete functionality and test it wherever it impacts the administration or storefront.

Also, every app will be code-reviewed by one of our core-developer ensuring coding and security standards.

### Extension master data/license

Please enter the valid license you set in your Shopware account.
You have to identify this license in the `composer.json` as well.

::: info
The chosen license can't be changed after adding your app to your account.
If you want to change the license later, add a new app based on the app system with a new technical name and upload the extension again.
:::

### Fallback language / Translations

The installation is not always in English or German.
Could you make sure that your app works in other languages as well?
For example, if the customer has his installation in Spanish and your app is not yet available in this language, you should use the English translation as a fallback. Our test environment includes Dutch as the standard language.

If your app is available in more than one language (e.g., English, Spanish, French and German), these can be defined using the option "Translations into the following languages are available" (located in the “Description & images” section of your *Extension Manager*).

We check for text snippets, `config.xml`, and `composer.json`.

### Valid preview images for the Shopware administration

Preview images: There must be a preview image available in the *Extension Manager*.
You must upload a valid favicon named plugin.png (png / 40 x 40 px) for the app.
This favicon will help you identify your app in the Extension Manager module in the administration.
The favicon has to be stored under `src/Resources/config/`.

Also, provide a preview image for Themes in the *Theme Manager* and CMS elements in the *Shopping Experiences*.

### Configuration per sales channel

Apps that appear in the Storefront and use a `config.xml` must be able to be configured separately for each sales channel.

### External links with rel="noopener"

Every external link in the administration or Storefront must be marked as *rel="noopener" AND target="_blank"*.

### Error messages and logging

Error or informational messages can only be recorded in the event log of Shopware's log folder (/var/log/).
You have to develop your own log service.
Never write app exceptions into the Shopware default log or outside the Shopware system log folder.
This ensures that the log file can never be accessed via the URL.

For payment apps, we check if the "plugin logger" service is used for the debug/error.log and that logs are written in the directory /var/log/. Log files must be used in every circumstance.

The log file had to be named like this: "MyExtension-Year-Month-Day.log"

Another solution is to store them in the database.
Try to avoid using your own log tables. Otherwise, you have to implement a scheduled task that regularly empties your log table within the given time of max. 6 months.

### Avoid 400/500 Error

*Avoid 500 errors at any time.* Avoid 400 errors unless they are related to an API call.

### With "Install/Uninstall" the user must decide whether the data/table is to be deleted or not

When clicking on the "Install / Uninstall" option in the Extension Manager, the user must be presented with the options "completely delete" or "keep the app data, text snippets, media folder including own media and table adjustments".
You can check this using the Adminer-App from *Friends of Shopware* in your provided test-environment.

### Not allowed to extend the Extension Manager

The *Extension Manager* must not be extended or overwritten.

### Own composer dependencies

Composer dependencies are possible if they are in the `composer.json`.
With `executeComposerCommands() === true` in the plugin base class, we provide a dynamic installation of the composer dependencies by default, so they don't have to be included.
Everything that is delivered in code should be traceable either directly or via `composer.json`.

[Developer documentation article to add private dependency](../../../../../guides/plugins/plugins/plugin-fundamentals/using-composer-dependencies)

### Extension manager

The Debug Console controls the app's installation, uninstallation, reinstallation, and deletion.
No 400 errors or exceptions are allowed to appear. If the app requires special PHP options, it must be queried during installation.
If the query is negative, a growl message must appear in the administration.

### Reloading of files not allowed

Apps may not load other files during and after the installation in the *Extension Manager*.

### Uncompiled JavaScript must be delivered within the binary

Compiled JavaScript offers many benefits such as improved performance and code optimization.
However, it is difficult to read and understand the compiled code.
The uncompiled JavaScript code must be placed in a separate folder to ensure it remains accessible to all developers.
This allows other developers to review and understand the code in its original, readable form.

Please build your `main.js` as described in our documentation and create the minified code as described in our developer documentation.

[Loading the JS files](../../../../../guides/plugins/plugins/administration/module-component-management/add-custom-field.md#loading-the-js-files)

[Injecting into the Administration](../../../../../guides/plugins/plugins/administration/module-component-management/add-custom-field.md#injecting-into-the-administration)

Shopware reserves the right to publish extensions with minified code after individual consideration and consultation with the developer.
For this, the developer must ensure that Shopware has access to the current unminified code of the extension at all times.

### Message queue

If the extension adds messages to the message queue, ensure they are not bigger than 262,144 bytes (256 KB).
This limitation is set by common message queue workers and should not be exceeded.

### Note on Shopware technology partner contract for interfaces

You have now read the complete list of requirements for developing and releasing apps based on our app system in the Shopware Community Store.

If your app is a software app/interface with downstream costs, transaction fees, or service fees for the customer, we need to complete a technology partner agreement in order to activate your app.

If you have any questions regarding the technology partner agreement, please contact our sales team by writing an email to [alliances@shopware.com](mailto:alliances@shopware.com) or calling **+44 (0) 203 095 2445 (UK) / 00 800 746 7626 0 (worldwide) / +49 (0) 25 55 / 928 85-0 (Germany)**.

## Storefront Guidelines

### Testing the storefront

Test the frontend and the checkout for new errors throughout the entire Storefront using the Browser Debug Console and also pay attention to JavaScript errors.

### Links must include a title tag

Links in the storefront and administration must include a meaningful "title tag".

### Images must include the alt-tag

Links in the storefront and administration must include a meaningful "alt tag" or the original alt tag from the media manager.

### Do not use `<hX>`-Tags

The utilization of `<hX>`-tags in the storefront templates, which are set to `<meta name="robots" content="index,follow">`, is not permissible, as these tags are reserved exclusively for content purposes.
However, you may employ `<span class="h2">`, for instance.

### Do not use inline-css in the storefront templates

Use your own classes and let your CSS be compiled by the plugin.

### Prevent `!important` usage

Please avoid using the `!important` rule whenever possible.

[Add SCSS variables](../../../../../guides/plugins/plugins/storefront/add-scss-variables.md#add-scss-variables)

### New controller URLs / XHR requests

We check for new XHR/Document requests in the storefront as they must be accompanied by an `X-Robots-Tag` in the header request with the directive "noindex, nofollow.".
For further details, please refer to the [robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=de#xrobotstag) article.

If the app creates its own controller URLs set to "index, follow" and the URLs are accessible via the frontend, then these "app URLs" must also appear in the `sitemap.xml`.
In addition, these pages must include a valid canonical tag, their own meta description, and a title tag, which can be entered individually via the administration or as a text snippet.

### Lighthouse A/B-Testing

Could you do an A/B test with *Lighthouse Audit* to check the performance and quality of your frontend app?
There should not be any drastic change in performance, accessibility values, or any new errors when activating the app.

* **Testing tool** for A/B-Testing:
  * Link: [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### schema.org/Rich Snippets A/B-Testing

Do an A/B-Test with *Scheme.org's Structured Data Testing Tool* and *Google Rich Result Tester* to check the homepage, categories, and various product detail pages (incl. available products, unavailable products, products with no review, single review, many reviews with various ratings, out-of-stock products, products to be released in the future or any other kind of product configuration and products including ean, mpn, width, length, height, weight).
Also, could you check for duplicate entries as well as any new bugs?

* **Testing tool** for A/B-Testing:
  * Link: [Schema Markup Validator of schema.org](https://validator.schema.org/)
  * Link: [Google Rich Result Tester](https://search.google.com/test/rich-results)

### Usage of fonts from external sources

If you are using external fonts (e.g., Google fonts, Fontawesome) or external services, the app store description must contain this information.

Please be aware that you might have to edit your *data protection information*.
This info could be placed as a tooltip near the font settings of the app configuration.

### Register your cookie to the Cookie Consent Manager

We expect every cookie set from the store URL to be optional and not technically required for running shopware.
Therefore, the cookies had to be [registered in our Cookie Consent Manager](../../../../../guides/plugins/plugins/storefront/add-cookie-to-manager).

We differentiate between "Technically required", "Marketing" and "Comfort features".
All cookies must appear (unchecked) in the cookie configuration box in the frontend.

## Administration guidelines

### Menu entries in the main menu are not allowed

Menu entries in the main menu of the administration are not allowed because of the look and feel.

### Own media folder

Customers must create their own media folders with the right thumbnail settings or use existing ones to upload images.

If you use your own media folder, keep in mind that the folder and the included data had to be removed if selected during the uninstallation.

### API test button

* If your API corresponds via API credentials to external services, we expect an API test button.
Apart from that, you can validate the required credentials while saving them in the app settings.
In this case, a status message must be displayed in the administration and Shopware log.
If the API data is incorrect, an entry must appear in the event log file in the Shopware folder `/var/log/` respectively in the database.

* **Example** for implementing an API Test Button into the System Config form:
  * Link: [GitHub](https://github.com/shyim/ShyimApiTest)

### Shopping experiences

[Shopping worlds elements](../../../../../concepts/commerce/content/shopping-experiences-cms.md#elements) must include an element icon.
If the app is deleted, *Shopping Worlds* should work flawlessly in the frontend.

### Themes

[Themes](../../../../../guides/plugins/themes/) must include its own preview image.

### External technology/ Shopware Technology Partner (STP) apps

Every external technology app needs to track its commission.
Below is an example of implementing the tracking logic in their extensions:

// POST /shopwarepartners/reports/technology - Allows partners to send us the info based on the STP contract

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

### Automatic code reviews with PhpStan and SonarQube

Our most current code review configurations when uploading apps via the Shopware Account can be found on GitHub.

* Link: [Code reviews for Shopware 6 on GitHub](https://github.com/shopwareLabs/store-plugin-codereview)

### Sonarcube Rules status Blocker

The following statements will be blocked as of 1st Oct. 2022:  
-die; exit; var_dump

* Link: [Refer to the list of the already existing blockers](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt).

### Automated code tests with Cypress

There are Cypress tests for Shopware 6 on GitHub.
The project is driven by the *Friends of Shopware* group. You can contribute at any time:

* Link: [Developer Documentation Cypress Tests for Shopware 6](../../../../../guides/plugins/plugins/testing/end-to-end-testing)
* Link: [Cypress Tests for Shopware 6](https://github.com/shopware/shopware/tree/trunk/src/Administration/Resources)

### Helpful tools for app developers

* Link: [FroshPluginUploader](https://github.com/FriendsOfShopware/FroshPluginUploader) Tool for validating and uploading new SW6 app releases to the Community Store (GitHub Project from "Friends of Shopware").
* Link: [Shopware CLI tools / console helpers](https://github.com/shopwareLabs/sw-cli-tools)

## Automatic code review - Errors

### The required composer.json file was not found

**Cause:** Error in composer.json  

One possible cause is that the technical app name from the Community Store or Account does not match the technical name entered in composer.json, or the app is incorrectly zipped.
The technical app name must be stored in the composer.json, located at `composer.json` > extra > `shopware-plugin-class`.
Could you take a look at the bootstrap class? Most of the errors are caused by the wrong technical name.
For example, "Swag\\MyPlugin\\SwagMyPluginSW6" instead of "Swag\\MyPlugin\\SwagMyPlugin".

Link: [Example of a valid composer.json](https://github.com/FriendsOfShopware/FroshPlatformPerformance/blob/master/composer.json#L20).  

### Ensure cross-domain messages are sent to the intended domain

Link: ["Cross-document messaging domains should be carefully restricted"](https://rules.sonarsource.com/javascript/RSPEC-2819)

### No bootstrapping file found. Expecting bootstrapping in

The bootstrap cannot be found.
The reasons could be that the folder structure in the ZIP file needs to be corrected, a typo, or a case-sensitive error in the app source (e.g., in the technical name).

### Class Shopware\Storefront\* not found

Missing requirements in the composer.json (e.g. "require": {"shopware/frontend": "*"},)  

Link: "[Shopware App Development: App Meta Information - Explanation of the properties](../../../../../guides/plugins/plugins/plugin-base-guide#the-composerjson-file)

### Cookies are written safely

Be sure you set cookies as secure.
Remember to register your cookie to the *Cookie Consent Manager*.

### Call to static method jsonEncode() on an unknown class

Shopware always uses json_Encode exclusively - there is no other fallback.

### The lock file is not up to date with the latest changes in composer.json

You may need to get updated dependencies. Run an update to update them.

The `composer.lock` in the app archive has to be deleted.

### Class Shopware\Core\System\Snippet\Files\SnippetFileInterface not found and could not be autoloaded

In the Shopware 6 Early Access (EA) version, the mentioned class did not exist.
Therefore, the code review failed. The reason for the problem is the following specification in the composer.json:

```xml

<pre>"require": {

    "shopware/core": "*",

    "shopware/storefront": "*"

},</pre>
```

The Composer resolves this to "Whatever is the latest from these repositories" and then installs the Early Access version instead of the current Release Candidate.
This happens because the Composer does not know an EA as a stability level (like stable or RC) and is, therefore, ultimately considered "stable".
The solution is to amend the requirement as follows:

```xml
<pre>"require": {

    "shopware/core": "~6.1.0",

    "shopware/storefront": "~6.1.0"

},

"minimum-stability": "RC"</pre>
```

This ensures that at least version Shopware 6.1 is installed, even if it is a Release Candidate.
It will be preferred as soon as the final 6.1 is released.

### Remove out-commented code from your source-code

### Unauthorized file formats or folders detected in the app

Remove out-commented code, unused files and folders, and all dev-files from your binary.

Here are some examples of not allowed folders and files:

* /__MACOSX
* /tests
* .gitignore
* .gitkeep
* .gitlab-ci.yml
* .DS_Store
* .editorconfig
* .git
* .gitignore
* .phar
* phpstan.neon
* phpstan.neon.dist
* .prettierrc
* .shopware-extension.yml
* .tar
* .tar.gz
* .zip
* .zipignore
* composer.lock
* phpdoc.dist.xml
* package.json
* package-lock.json
* phpunit.sh
* phpunitx.xml
* shell.nix
* Thumbs.db
* webpack.config.js
