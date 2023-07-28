# Quality Guidelines for Apps and Themes based on App System in Shopware Store

[Added - Name preset according to new naming scheme](#every-app-based-on-the-app-system)

> **Changelog**
>> 26/07/23: [Added - Name preset according to new naming scheme.](https://developer.shopware.com/docs/resources/guidelines/testing/store/quality-guidelines-apps#every-app-based-on-the-app-system)
>
>> 18/07/23: [Compiled code.](../quality-guidelines-apps/README.md#checklist-for-app-testing)
>
>> 12/04/23: [Check for a functional comparison with functions from the Rise or above edition.](../quality-guidelines-apps/README.md#every-app-based-on-the-app-system)
>
>> 14/02/23: [Added new STP tracking - External technology apps/STP apps.](../quality-guidelines-apps/README.md#external-technology-shopware-technology-partner-stp-apps)
>
>> 28/10/21: [Added - Safe your app idea and get a preview in the store.](../quality-guidelines-apps/README.md#every-app-based-on-the-app-system)
>
>> 06/08/21: [Added - Useful links and tutorials for creating an app.](../quality-guidelines-apps/README.md#useful-links-and-tutorials-for-creating-an-app)
>
>> 08/06/21: [Added URL and info regarding the docker environment we use for testing SW6 apps.](../quality-guidelines-apps/README.md#the-way-we-test-apps-based-on-the-app-system)
>
>> 07/06/21: [Template Tests - Now using Scheme.org Structured Data Testing tool instead of Google Structured Testing tool.](../quality-guidelines-apps/README.md#theme-apps)
>
>> 07/06/21: [Account app description - Subprocessor and/or Further subprocessor information may be required for your app.](../quality-guidelines-apps/README.md#app-descriptions-in-your-shopware-account)
>
>> 17/04/21: Restructured the quality guidelines. No new content added.
>
>> 12/05/20: [Added app checklist for your quality assurance.](../quality-guidelines-apps/README.md#checklist-for-app-testing)
>
>> 22/04/20: [Menu entries in the main menu of the Administration are not allowed anymore because of look and feel.](../quality-guidelines-apps/README.md#menu-entries-in-the-main-menu-not-allowed)

## The way we test apps based on the app system

It is always a good idea to review the process of how we conduct tests prior to submitting your app for review. This ensures the quickest way for your app to be published.

We perform the *first test*, and if successful, we do the *follow-up test* again with the most current Shopware version.

The Shopware installation is located in a subfolder. It has a language sub-shop/sales channel with a virtual URL as well as an independent sub-shop/sales channel with its own URL, also located in a subfolder. E.g. `myshop.com/subfolder/backend` or `myshop.com/public/admin`. The app must neither produce any error messages in the backend nor in the frontend.

The app is tested with the latest official Shopware 6 CE Version. Our testing environment is built with the following components: Nginx Webserver, PHP 7.4 as FPM, MariaDB latest, Shopware installed in subfolder `/shop/public`, default Shopware language *Netherland*.
The environment is built using Docker and is published on Docker Hub. You can use the following command to run it on your system:

```markdown
docker run --rm -p 80:80 -e VIRTUAL_HOST=localhost ghcr.io/shopwarelabs/testenv:6.X.X
```

{% hint style="information" %}
**The shop will be accessible at:** `http://localhost/shop/public`  
**Admin-User:** demo
**Admin-Password:** demodemo
{% endhint %}

{% hint style="information" %}
We always test with the [actual SW6 version](https://www.shopware.com/de/download/#shopware-6). So set it to the actual SW6 version e.g., `shopware/testenv:6.4.3`. Always test with the app`s highest supported Shopware version.
{% endhint %}

**Progressive Web App:** If your app is PWA compatible and you would like the PWA flag, please contact us at [alliances@shopware.com](mailto:alliances@shopware.com).

### Useful links and tutorials for creating an app

* [Sample app development template](https://github.com/shopwareLabs/AppExample)
* [App base guide](https://developer.shopware.com/docs/guides/plugins/apps/app-base-guide)
* [Storefront](https://developer.shopware.com/docs/guides/plugins/apps/storefront)
* [Admin](https://developer.shopware.com/docs/guides/plugins/apps/administration)

## Checklist for app testing

Be sure to use the most recent testing checklist from Shopware and not from any other provider. Pay attention to every single point given below in this guide, as this will be reviewed by us in order to release your app.

### Every app based on the app system

* If you are using external fonts (e.g., from Google fonts) or external services, the app store description must contain this information. Please be aware that you might have to edit your *data protection information*. This info could be otherwise placed as a tooltip near the font settings of the app configuration.

* **App store description**:

    * The mandatory number of characters is set in short and long descriptions. No blank spaces as fillers are allowed (EN/DE).
    * Check if the description makes sense and if it includes step-by-step instructions on how to use and test your app.
    * Check if you have included enough screenshots showing the app in action in the Storefront and Administration (please add a screenshot of the app in the extension manager settings).
    * Check if the display name does not contain the term "plugin."

* We pay attention to the automatic code review and look for security issues.

* **Cookie check in the browser console**: If the app sets cookies in any way in the checkout, these cookies must be registered to the cookie configuration box in the frontend.

* Every external link in the Administration or Storefront must be marked as *rel="no opener" AND target="_blank"*.

* We check for styling errors on every viewport.

* We check the complete functionality of the app (including the uninstallation and reinstallation procedure).

* Compiled JavaScript offers many benefits such as improved performance and code optimization. However, it is difficult to read and understand the compiled code.
To ensure that the code remains accessible to all developers, the uncompiled version of the JavaScript code must be placed in a separate folder. This allows other developers to review and understand the code in its original, readable form.

* We want to improve the quality of the Shopware Community Store and offer as many different apps as possible. Hence, we check for a functional comparison with other apps already in the Shopware Community store, in the Rise edition, or above. If there is an app with the same function, it can be rejected as it doesn't provide any added value. For further information, write an email to [alliances@shopware.com](mailto:alliances@shopware.com).

{% hint style="information" %}
**Safe your app idea and get a preview in the store** - If you already have an idea and don't want it to be snatched away, then make sure you get it by creating a preview in your account. You can apply for this if you already have maintained images, description, and release months without uploading anything.
{% endhint %}

### App descriptions in your Shopware account

* **Display name:** According to the new naming scheme, the word "plugin" is no longer allowed in the display name of extensions. Instead of "Plugin" use "Extension" or "App".

* **Short description:** (Min. 150 - max. 185 characters) - The app's short description must have at least 150 characters long and unique. Use the short description wisely, as the text will be used to tease your app in the overview along with the "Customers also bought" and "Customers also viewed" recommendations. The short description is also published as a meta-description.

* **Description:** (Min. 200 characters) - The app description must contain at least 200 characters and should clearly represent the app functions in detail.

  * Inline styles will be stripped. The following HTML tags are allowed:

    ```markdown
    <a> <p> <br> <b> <strong> <i> <ul> <ol> <li> <h2> <h3> <h4> <h5>
    ```

  * **Tips:**

    * When it comes to increasing your app sales, it is important that potential customers feel completely informed about your products and services. To this end, you should provide a description that is meaningful, detailed, and easy to understand, even for people with very little technical knowledge. Explain step-by-step how your app works and how to use it to achieve the desired result. Of course, your app description should be accompanied by clean HTML source code.

    * Video content increases awareness, trust and has proven to convert potential customers better than other content types. Help your customers better understand your app or service with explainer videos, product demos, tutorials, etc. You can embed maximum 2 YouTube videos in your app description.

    {% hint style="information" %}
    You can no longer advertise your Shopware certificates within the app description, in your app images, or in your manufacturer profile. The manufacturer/partner certificates are dynamically loaded at the end of each app description and published by us.
    {% endhint %}

* Include several screenshots and descriptive images from the Storefront and backend that represent the app functionality. They must show the app "in action", its configuration options, and how to use it.

* Be sure that the app is assigned to the appropriate categories.

* The link must be valid if you provide a demo shop (the URL cannot contain http: or https:).

* The description must be a 1:1 translation. As an app is to be released in both stores (German and International), the content must be accurately translated 1:1 from/to German/English.​​​

* If necessary, personal data protection information has to be set. If personal data of the customers (store operator and/or his customers) are processed with this extension according to Art. 28 DSGVO, the following information of the data processing company must be stored in the field "Subprocessor". If other companies are involved in the data processing of personal data, the same information must be stored accordingly for them in the field "Further subprocessors".

* Your manufacturer profile must mandatorily contain accurate English and German descriptions and a manufacturer logo. You can find the manufacturer profile in your account under Shopware Account > Extension Administration > Manufacturer profile.

* The content of the images/screenshots must be in English.

{% hint style="information" %}
Iframes, external scripts, or tracking pixels are not allowed in the descriptions, profiles, and instructions of the source code. Custom styles may not overwrite the original Shopware styles. External sources must be included via https.
{% endhint %}

### Template tests

* **Testing tools**:

  * [Schema Markup Validator of Schema.org](https://validator.schema.org/)

  * [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Theme apps

* There must be a preview image available in the *Theme Manager*.

* Links must include a "title-tag" and images must have an "alt-tag".

* Use *Scheme.org's Structured Data Testing Tool* to check the homepage, categories, and various product detail pages (incl. available products, unavailable products, products with no review, single review, many reviews with various ratings, out of stock products, products to be released in the future or any other kind of product configuration). Also, check for any new bugs.

* Do a *Lighthouse Audit* to check the performance and quality of your frontend app. There should not be any drastic change in performance or accessibility values when activating the app.

* The price and shopping cart button may not be covered by customizations - for example, "badges". Furthermore, the shopping cart button must always be clickable.

### Service Solution App (SSA)

With SSA, you can offer API services for apps in the store. We recommend you develop this as a cloud app. The app will be available for both cloud and on-premises customers. The following basic requirements must be met:

* The manufacturer contract must be accepted.

* The STP (Shopware technology partner) contract must be additionally concluded with the technology.

* Add the company logo and the manifest file. For more support, refer to our [App Base Guide](/docs/guides/plugins/apps/app-base-guide.md).

{% hint style="warning" %}
The name of your app that you provide in the manifest file needs to match the folder name of your app.
{% endhint %}

* Upload your app to your Account.

* Submit your app for automatic and manual code review.

* Launch your successfully tested app in our store.

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

### Admin apps

We check the complete functionality of the app and test wherever the Administration is impacted by the app.

### API or payment apps

* The functionality of an app will be tested together with the app developer in a live session.

* Define in the description which currencies/countries are compatible with the payment method.

### External technology/ Shopware Technology Partner (STP) apps

Every external technology app needs to track its commission. Below is an example of implementing the tracking logic in their extensions:

{% code %}

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

{% endcode %}

## Quality guidelines for Shopware 6 apps based on the app system

### Extension master data/license

Please enter the valid license you set in your Shopware account. You have to identify this license in the manifest.xml as well.

{% hint style="information" %}
The chosen license can't be changed after adding your app to your account. If you want to change the license later, you must add a new app based on the app system with a new technical name and upload the extension again.
{% endhint %}

### Fallback language

The installation is not always in English or German. So make sure that your app works in other languages as well. For example, if the customer has the installation in Spanish and your app is not yet available in this language, you should use the English translation as a fallback. Our test environment includes Netherland as the standard language.

### Translations

If your app is available in more than one language (e.g., English and German), these can be defined using the option "Translations into the following languages are available" (located in the “Description & images” section of your *Extension Manager*).

### Valid app favicon for the Shopware Administration

You must upload a valid favicon named plugin.png (png / 40 x 40 px) for the app. This favicon will make it easier to identify your app in the *Extension Manager* module in the backend. The favicon has to be stored under `src/Resources/config/`.

### Error messages must be entered in the event log

Error or informational messages can only be recorded in the event log of Shopware's log folder (/var/log/). You have to develop your own app-specific logger. Never write app exceptions into the Shopware default log or outside the Shopware system's log folder. This ensures that the log file can never be accessed via URL.

{% hint style="danger" %}
Avoid 400/500 errors at any time unless the 400 errors are related to an API call.
{% endhint %}

### Untrusted content should not be included

See [Untrusted content should not be included in SonarQube rules](https://rules.sonarsource.com/javascript/RSPEC-2611)

### Extension manager

The Debug Console controls the app's installation, uninstallation, reinstallation, and deletion. No 400 errors or exceptions are allowed to appear.

### Reloading of files not allowed

Apps may not load other files during and after the installation in the *Extension Manager*.

### App pages with their own URL must appear in the sitemap.xml

If the app creates its own pages that are set to "index, follow" and the URLs are accessible via the frontend, then these "app URLs" must also appear in the `sitemap.xml`. In addition, these pages must include their own "meta description" and "title-tag", which can be entered individually via the backend or as a text snippet.

### Register a cookie to the Cookie Consent Manager

We expect that every cookie set from the store URL is [registered in our Cookie Consent Manager](https://developer.shopware.com/docs/guides/plugins/plugins/storefront/add-cookie-to-manager). We differentiate between "Technically required", "Comfort functions" and "Statistics and Tracking". All cookies have to appear in the cookie configuration box in the frontend.

### Shopping worlds/shopping experiences

[Shopping worlds elements](#shopping-worldsstorytelling-elements) element must include an element icon. If the app is deleted, *Shopping worlds* should continue to work flawlessly in the frontend.

### Menu entries in the main menu not allowed

Menu entries in the main menu of the Administration are not allowed because of the look and feel.

### Automated code tests with Cypress

There are Cypress tests for Shopware 6 on GitHub. The project is driven by the *Friends of Shopware* group. You can contribute at any time:

* [Developer Documentation Cypress Tests for Shopware 6](https://developer.shopware.com/docs/guides/plugins/plugins/testing/end-to-end-testing)
* [Cypress Tests for Shopware 6](https://github.com/shopware/platform/tree/trunk/src/Administration/Resources)

### Helpful tools for app developers

* [FroshPluginUploader](https://github.com/FriendsOfShopware/FroshPluginUploader): Tool for validating and uploading new SW6 app releases to the Community Store (GitHub Project from "Friends of Shopware")]
* [Shopware CLI tools](https://github.com/shopwareLabs/sw-cli-tools): When you think about performance, these are various useful console helpers for generating data.

### Descriptions in your Shopware account

[App descriptions in your Shopware account](#app-descriptions-in-your-shopware-account) must follow the checklist criterion.

## Automatic code review - Errors

### Ensure cross-domain messages are sent to the intended domain

See ["Cross-document messaging domains should be carefully restricted"](https://rules.sonarsource.com/javascript/RSPEC-2819) for more information.

### No bootstrapping file found. Expecting bootstrapping in

The bootstrap cannot be found. The reasons could be that the folder structure in the ZIP file is incorrect, there could be a typo, or a case-sensitive error in the app source (e.g., in the technical name).

### Cookies are written safely

Be sure you set cookies as secure. Remember to register your cookie to the *Cookie Consent Manager*.

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

## Note on Shopware technology partner contract for interfaces

You have now read the complete list of requirements for developing and releasing apps based on our app system in the Shopware Community Store.

If your app is a software app/interface with downstream costs, transaction fees, or service fees for the customer, we need to complete a technology partner agreement in order to activate your apps.

If you have any questions regarding the technology partner agreement, please contact our sales team by writing an email to [alliances@shopware.com](mailto:alliances@shopware.com) or calling **+44 (0) 203 095 2445 (UK) / 00 800 746 7626 0 (worldwide) / +49 (0) 25 55 / 928 85-0 (Germany)**.
