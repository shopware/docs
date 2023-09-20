---
nav:
  title: Quality guidelines for apps in plugin system
  position: 20

---

# Quality Guidelines for Apps based on Plugin System in Shopware Store

> **Changelog**
>
>> 14/02/23: Added new STP tracking  "External technology apps/STP apps"
>
>> 11/07/22: [Added a list of all Blockers - Changes to the autom. coderview 1.st Oct. 2022](https://docs.shopware.com/en/account-en/manufacturer-area/quality-guidelines-for-extensions-in-the-shopware-store-based-on-our-extension-system#sonarcube-rules-status-blocker).
>
>> 26/10/21: [Added safe your app idea and get a preview in the store](https://docs.shopware.com/en/account-en/manufacturer-area/quality-guidelines-for-extensions-in-the-shopware-store-based-on-our-extension-system?category=account-en/manufacturer-area#safe-your-app-idea-and-get-a-preview-in-the-store).
>
>> 14/10/21: How we test your extension for the Shopware Store (DE): [https://www.youtube.com/watch?v=gLb5CmOdi4g](https://www.youtube.com/watch?v=gLb5CmOdi4g).
>
>> 08/06/21: SW6: [Added URL and info regarding our docker environment we use for testing SW6 apps.](https://docs.shopware.com/en/account-en/manufacturer-area/quality-guidelines-for-extensions-in-the-community-store#the-way-we-test-apps-based-on-the-extension-system).
>
>> 07/06/21: Template Tests: Now using [Scheme.org Structured Data Testing Tool.](https://docs.shopware.com/en/account-en/manufacturer-area/quality-guidelines-for-extensions-in-the-community-store#template-tests) instead of Google Structured Testing Tool.
>
>> 07/06/21: Account app description: [Subprocessor and/or Further subprocessors information may be required for your app.](https://docs.shopware.com/en/account-en/manufacturer-area/quality-guidelines-for-extensions-in-the-community-store#app-descriptions-in-your-shopware-account).
>
>> 17/04/21: Restructure the quality guidelines. No new content added.
>
>> 12/05/20: Add app [Checklist](https://docs.shopware.com/en/plugin-standard-for-community-store#checklist-for-plugin-testing) for your Quality assurance.
>
>> 22/04/20: SW6: [Menu entries in the main menu of the Administration are not allowed anymore](https://docs.shopware.com/en/account-en/manufacturer-area/quality-guidelines-for-extensions-in-the-community-store#menu-entries-in-the-main-menu-not-allowed) because of the look and feel.

## The way we test apps based on the plugin system

It is always a good idea to review the process of how we conduct tests prior to submitting your app for review. This ensures the quickest way for your app to be published.

We perform the *first test*, and if successful, we do the *follow-up test* again with the most current Shopware version.

The Shopware installation is located in a subfolder. It has a language sub-shop/sales channel with a virtual URL as well as an independent sub-shop/sales channel with its own URL, also located in a subfolder. E.g. `myshop.com/subfolder/backend` or `myshop.com/public/admin`. The app must neither produce any error messages in the backend nor in the frontend.

The app is tested with the latest official Shopware 6 CE Version. Our testing environment is built with the following components: Nginx Webserver, PHP 7.4 as FPM, MariaDB latest, Shopware installed in subfolder `/shop/public`, default Shopware language Netherland.
The environment is built using Docker and is published on Docker Hub. You can use the following command to run it on your system:

```markdown
docker run --rm -p 80:80 -e VIRTUAL_HOST=localhost ghcr.io/shopwarelabs/testenv:6.X.X
```

::: info
The shop will be accessible at `http://localhost/shop/public`  
Admin-User: demo
Admin-Password: demodemo
:::

::: info
We always test with the [actual SW6 version](https://www.shopware.com/de/download/#shopware-6). So set it to the actual SW6 version e.g., shopware/testenv:6.4.3. Always test with the app`s highest supported Shopware version.
:::

[Test your extension for the Shopware Store (DE):](https://www.youtube.com/watch?v=gLb5CmOdi4g) and EN version is coming soon.  

**Progressive Web App:** If your app is PWA compatible and you would like the PWA flag, please contact us at [alliances@shopware.com](mailto:alliances@shopware.com).

## Checklist for app testing

Be sure to use the most recent testing checklist from Shopware and not from any other provider. Please pay attention to every single point in this guide, as this will be reviewed by us in order to release your app.

### Every app based on the plugin system

* If you are using external fonts (e.g., from Google fonts) or external services, the app store description must contain this information. Please be aware that you might have to edit your *data protection information*. This info could be otherwise placed as a tooltip near the font settings of the app configuration.

* **App store description**:

    * The mandatory number of characters is set in short and long descriptions. No blank spaces as fillers are allowed (EN/DE).
    * Check if the description makes sense and if it includes step-by-step instructions on how to use and test your app.
    * Check if you have included enough screenshots showing the app in action in the Storefront and Administration (please add a screenshot of the app in the extension manager settings).

* We pay attention to the automatic code review and look for security issues.

* **Cookie check in the browser console**: If the app sets cookies in any way in the checkout, these cookies must be registered to the cookie configuration box in the frontend.

* Every external link in the Administration or Storefront must be marked as *rel="no opener" AND target="_blank"*.

* We check for styling errors on every viewport.

* We check the complete functionality of the app (including the uninstallation and reinstallation procedure).

* We want to improve the quality of the Shopware Community Store and offer as many different apps as possible. Hence, we check for a functional comparison with other apps already present in the Shopware Community Store. If there is an app with the same function, it can be rejected as it doesn't provide any added value. For further information, write an email to [alliances@shopware.com](mailto:alliances@shopware.com).

::: info
**Safe your app idea and get a preview in the store** - If you already have an idea and don't want it to be snatched away, then make sure you get it by creating a preview in your account. You can apply for this if you already have maintained images, description, and release months without uploading anything.
:::

### App descriptions in your Shopware account

* **Short description:** (Min. 150 - max. 185 characters) - The app's short description must have at least 150 characters long and unique. Use the short description wisely, as the text will be used to tease your app in the overview along with the "Customers also bought" and "Customers also viewed" recommendations. The short description is also published as a meta-description.

* **Description:** (Min. 200 characters) - The app description must contain at least 200 characters and should clearly represent the app functions in detail.

    * Inline styles will be stripped. The following HTML tags are allowed:

    ```markdown
    <a> <p> <br> <b> <strong> <i> <ul> <ol> <li> <h2> <h3> <h4> <h5>
    ```

    * **Tips:**

        * When it comes to increasing your app sales, it is important that potential customers feel completely informed about your products and services. To this end, you should provide a description that is meaningful, detailed, and easy to understand, even for people with very little technical knowledge. Explain step-by-step how your app works and how to use it to achieve the desired result. Of course, your app description should be accompanied by clean HTML source code.

        * Video content increases awareness, trust and has proven to convert potential customers better than other content types. Help your customers better understand your app or service with explainer videos, product demos, tutorials, etc. You can embed maximum 2 YouTube videos in your app description.

::: info
    You can no longer advertise your Shopware certificates within the app description, in your app images, or in your manufacturer profile. The manufacturer/partner certificates are dynamically loaded at the end of each app description and published by us.
:::

* Include several screenshots and descriptive images from the Storefront and backend that represent the app functionality. They must show the app "in action", its configuration options, and how to use it.

* Be sure that the app is assigned to the appropriate categories.

* The link must be valid if you provide a demo shop (the URL cannot contain http: or https:).

* The description must be a 1:1 translation. As an app is to be released in both stores (German and International), the content must be accurately translated 1:1 from/to German/English.​​​

* If necessary, personal data protection information has to be set. If personal data of the customers (store operator and/or his customers) are processed with this extension according to Art. 28 DSGVO, the following information of the data processing company must be stored in the field "Subprocessor". If other companies are involved in the data processing of personal data, the same information must be stored accordingly for them in the field "Further subprocessors".

* Your manufacturer profile must mandatorily contain accurate English and German descriptions and a manufacturer logo. You can find the manufacturer profile in your account under Shopware Account > Extension Administration > Manufacturer profile.

* The content of the images/screenshots must be in English.

::: info
Iframes, external scripts, or tracking pixels are not allowed in the descriptions, profiles, and instructions of the source code. Custom styles may not overwrite the original Shopware styles. External sources must be included via https.
:::

### Template tests

* **Testing tools**:
    * [Schema Markup Validator of schema.org](https://validator.schema.org/)
    * [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Theme apps

* There must be a preview image available in the *Theme Manager*.

* Links must include a "title-tag" and images must have an "alt-tag".

* Use *Scheme.org's Structured Data Testing Tool* to check the homepage, categories, and various product detail pages (incl. available products, unavailable products, products with no review, single review, many reviews with various ratings, out of stock products, products to be released in the future or any other kind of product configuration). Also, check for any new bugs.

* Do a *Lighthouse Audit* to check the performance and quality of your frontend app. There should not be any drastic change in performance or accessibility values when activating the app.

* The price and shopping cart button may not be covered by customizations - for example, "badges". Furthermore, the shopping cart button must always be clickable.

### Shopping worlds/storytelling elements

* Links must include a "title-tag" and images must have an "alt-tag".

* Test the frontend and the checkout with the Debug Console – also pay attention to new JavaScript errors.

* Use *Scheme.org's Structured Data Testing Tool* to check the homepage, categories, and various product detail pages (incl. available products, unavailable products, products with no review, single review, many reviews with various ratings, out of stock products, products to be released in the future or any other kind of product configuration). Also, check for any new bugs.

* Do a *Lighthouse Audit* to check the performance and quality of your frontend app. There should not be any drastic change in performance or accessibility values when activating the app.

### Frontend apps

* Links must include a "title-tag" and images must have an "alt-tag".

* If you create custom controller URLs in the sales channel, please note that we check for SEO and a valid canonical-tag.

* Use *Scheme.org's Structured Data Testing Tool* to check the homepage, categories, and various product detail pages (incl. available products, unavailable products, products with no review, single review, many reviews with various ratings, out of stock products, products to be released in the future or any other kind of product configuration). Also, check for any new bugs.

* We check for new errors throughout the entire Storefront using the Browser Debug Console. We also pay attention to new JavaScript errors.

* We do a *Lighthouse Audit* to check the performance and quality of your frontend app. There should not be any drastic change in performance or accessibility values when activating the app.

### Backend apps

We check the complete functionality of the app and test wherever the Administration is impacted by the app.

### API or Payment apps

* We check for an API test button. Apart from that, you can validate the required credentials while saving them in the app settings. In this case, a status message must be displayed in the backend and Shopware log.

* The functionality of an app will be tested together with the app developer in a live session.

## Quality Guidelines for Shopware 6 Apps based on the extension System

### Extension master data/license

Please enter the valid license you set in your Shopware account. You have to identify this license in the manifest.xml as well.

::: info
The chosen license can't be changed after adding your app to your account. If you want to change the license later, you must add a new app based on the app system with a new technical name and upload the extension again.
:::

### Fallback language

The installation is not always in English or German. So make sure that your app works in other languages as well. For example, if the customer has his installation in Spanish and your app is not yet available in this language, you should use the English translation as a fallback. Our test environment includes Netherland as the standard language.

### Translations

If your app is available in more than one language (e.g., English and German), these can be defined using the option "Translations into the following languages are available" (located in the “Description & images” section of your *Extension Manager*).

### Valid app favicon for the Shopware Administration

You must upload a valid favicon named plugin.png (png / 40 x 40 px) for the app. This favicon will make it easier to identify your app in the *Extension Manager* module in the backend. The favicon has to be stored under `src/Resources/config/`.

### Error messages must be entered in the event log

Error or informational messages can only be recorded in the event log of Shopware's log folder (/var/log/). You have to develop your own log service. Never write app exceptions into the Shopware default log or outside the Shopware system log folder. This ensures that the log file can never be accessed via the URL.

::: danger
Avoid 400/500 errors at any time unless the 400 errors are related to an API call.
:::

### Untrusted content should not be included

See [Untrusted content should not be included in SonarQube rules](https://rules.sonarsource.com/javascript/RSPEC-2611).

### Own media folder

Customers must create own media folders or use existing ones to upload images.

### With "Install/Uninstall" the user must decide whether the data/tables are to be deleted or not

When clicking on the "Install / Uninstall" option in the Extension Manager, the user must be presented with the options "completely delete" or "keep the app data, text snippets, and table adjustments".

### Not allowed to extend the Extension Manager

The *Extension Manager* must not be extended or overwritten.

### Extension manager

The Debug Console controls the app's installation, uninstallation, reinstallation, and deletion. No 400 errors or exceptions are allowed to appear. If the app requires special PHP options, it must be queried during installation. If the query is negative, a growl message must appear in the backend.

### Reloading of files not allowed

Apps may not load other files during and after the installation in the *Extension Manager*.

### App pages with their own URL must appear in the sitemap.xml

If the app creates its own pages that are set to "index, follow" and the URLs are accessible via the frontend, then these "app URLs" must also appear in the sitemap.xml. In addition, these pages must include their own "meta description" and "title-tag", which can be entered individually via the backend or as a text snippet.

### Register a cookie to the Cookie Consent Manager

We expect that every cookie set from the store URL is [registered in our Cookie Consent Manager](/docs/guides/plugins/plugins/storefront/add-cookie-to-manager). We differentiate between "Technically required", "Comfort functions" and "Statistics and Tracking". All cookies have to appear in the cookie configuration box in the frontend.

### Shopping worlds/shopping experiences

[Shopping worlds elements](#shopping-worldsstorytelling-elements) must include an element icon. If the app is deleted, *Shopping Worlds* should continue to work flawlessly in the frontend.

### Payment apps

We check if the "pluginlogger" service is used for the debug/error.log and that logs are written in the directory /var/log/. Log files must use this folder in every circumstance. Another solution is to store them in the database.

### Every app accessing external API services

A test button for optional API access data must be available. If the API data is incorrect, an entry must appear in the event log file in the Shopware folder `/var/log/` respectively in the database. Apart from that, you can validate the required credentials while saving them in the app settings. In this case, a status message must be displayed in the backend and in the Shopware log.

[Example for implementing an API Test Button into the System Config form](https://github.com/shyim/ShyimApiTest)

### External technology/ Shopware Technology Partner (STP) apps

Every external technology app needs to track its commission. Below is an example of implementing the tracking logic in their extensions:

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

### Menu entries in the main menu not allowed

Menu entries in the main menu of the Administration are not allowed because of the look and feel.

### Automatic code reviews with PhpStan and SonarQube

Our most current code review configurations that we use when uploading apps via the Shopware Account can be found on GitHub.

* [Code reviews for Shopware 6 on GitHub](https://github.com/shopwareLabs/store-plugin-codereview)

### Automated code tests with Cypress

There are Cypress tests for Shopware 6 on GitHub. The project is driven by the *Friends of Shopware* group. You can contribute at any time:

* [Developer Documentation Cypress Tests for Shopware 6](/docs/guides/plugins/plugins/testing/end-to-end-testing)
* [Cypress Tests for Shopware 6](https://github.com/shopware/platform/tree/trunk/src/Administration/Resources)

### Helpful tools for app developers

* [FroshPluginUploader](https://github.com/FriendsOfShopware/FroshPluginUploader): Tool for validating and uploading new SW6 app releases to the Community Store (GitHub Project from "Friends of Shopware")]
* [Shopware CLI tools](https://github.com/shopwareLabs/sw-cli-tools): When you think about performance, these are various useful console helpers for generating data.

### Descriptions in your Shopware account

[App descriptions in your Shopware account](#app-descriptions-in-your-shopware-account) must follow the checklist criterion.

## Automatic code review - Errors

### The required composer.json file was not found

**Cause:** Error in composer.json  

One possible cause is that the technical app name from the Community Store or Account does not match the technical name entered in composer.json, or the app is incorrectly zipped. The technical app name has to be stored in the last part of the composer.json located at composore.json > extra > shopware-plugin-class. So take a look at the bootstrap class. Most of the errors is caused by the wrong technical name. For example, "Swag\\MyPlugin\\SwagMyPluginSW6" instead of "Swag\\MyPlugin\\SwagMyPlugin".

[Here is an example](https://github.com/FriendsOfShopware/FroshPlatformPerformance/blob/master/composer.json#L20) of a valid composer.json.  
See "[Plugin-Base Class](https://developers.shopware.com/designers-guide/javascript-statemanager-and-pluginbase/#plugin-base-class)" for more information.

### Ensure cross-domain messages are sent to the intended domain

See ["Cross-document messaging domains should be carefully restricted"](https://rules.sonarsource.com/javascript/RSPEC-2819) for more information.

### No bootstrapping file found. Expecting bootstrapping in

The bootstrap cannot be found. The reasons could be that the folder structure in the ZIP file is incorrect, there could be a typo, or a case-sensitive error in the app source (e.g., in the technical name).

### Class Shopware\Storefront\* not found

Missing requirements in the composer.json (e.g. "require": {"shopware/frontend": "*"},)  
See "[Shopware App Development: App Meta Information - Explanation of the properties](../../../../../guides/plugins/plugins/plugin-base-guide#the-composerjson-file) for more information.

### Cookies are written safely

Be sure you set cookies as secure. Remember to register your cookie to the *Cookie Consent Manager*.

### Call to static method jsonEncode() on an unknown class

Shopware always uses json_Encode exclusively - there is no other fallback.

### The lock file is not up to date with the latest changes in composer.json. You may be getting outdated dependencies. Run an update to update them

The `composer.lock` in the app archive has to be deleted.

### Class Shopware\Core\System\Snippet\Files\SnippetFileInterface not found and could not be autoloaded

In the Shopware 6 Early Access (EA) version, the mentioned class did not exist. Therefore, the code review failed. The reason for the problem is the following specification in the composer.json:

```xml

<pre>"require": {

    "shopware/core": "*",

    "shopware/storefront": "*"

},</pre>
```

The Composer resolves this to "Whatever is the latest from these repositories" and then installs the Early Access version instead of the current Release Candidate. This happens because an EA is not known by the Composer as a stability level (like stable or RC) and is, therefore, ultimately considered "stable". The solution is to amend the requirement as follows:

```xml
<pre>"require": {

    "shopware/core": "^6.1",

    "shopware/storefront": "^6.1"

},

"minimum-stability": "RC"</pre>
```

This ensures that at least version Shopware 6.1 is installed, even if it is a Release Candidate. It will be preferred as soon as the final 6.1 is released.

### Unauthorized file formats or folders detected in the app. Please remove the following files/folders

Not allowed folders and files:

    * .gitignore
    * .DS_Store
    * Thumbs.db
    * .git, __MACOSX
    * .zip
    * .tar
    * .tar.gz
    * .phar

## Sonarcube Rules status Blocker

The following statements will be blocked as of 1st Oct. 2022:  
-die; exit; var_dump; @internal  

[Refer to the list of the already existing blockers](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt).

## Note on Shopware technology partner contract for interfaces

You have now read the complete list of requirements for developing and releasing apps based on our app system in the Shopware Community Store.

If your app is a software app/interface with downstream costs, transaction fees, or service fees for the customer, we need to complete a technology partner agreement in order to activate your apps.

If you have any questions regarding the technology partner agreement, please contact our sales team by writing an email to [alliances@shopware.com](mailto:alliances@shopware.com) or calling **+44 (0) 203 095 2445 (UK) / 00 800 746 7626 0 (worldwide) / +49 (0) 25 55 / 928 85-0 (Germany)**.
