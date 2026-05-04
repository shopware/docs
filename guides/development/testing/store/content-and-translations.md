---
nav:
  title: Content and translations
  position: 70
---

# Content and translations

Listing text, translations, previews, and account profile content for the Shopware Store. For HTML and technical packaging issues, see [Common Store review errors](./store-review-errors.md).

## Store listing

All extensions must:

* Be available in English, with 1:1 translation between English and German. For the German store, German is required. Extensions are released in both the German and International stores.
* Use meaningful short and long descriptions.
* Accurately and clearly describe the extension and its use cases.
* Avoid the words “plugin” and “shopware” in the display name.
* Avoid blank spaces as filler text.
* Include clear, complete setup and configuration instructions.
* Use clean HTML source code. Inline styles in the description will be stripped.

Allowed HTML tags:

```markdown
<a> <p> <br> <b> <strong> <i> <ul> <ol> <li> <h2> <h3> <h4> <h5>
```

There must be no advertising for your own services or contact information in the Administration, description, or images. Links that encourage contact are not permitted, including support email addresses and backlinks.

The extension’s visual design must be consistent with Shopware and fit existing sections.

The store display name must be used for `composer.json` and `config.xml`.

An extension whose name reflects its functional purpose is allowed, even if another extension uses a similar name.

### Short and long description

* **Short description** (150–185 characters): Teaser in overviews, “Customers also bought” / “Customers also viewed,” and published as the meta description.
* **Long description** (minimum 200 characters): Describe functionality in detail; must match 1:1 between English and German where both are used.

### Store description (DE and EN)

* Minimum 200 characters for the long description; describe functionality in detail.
* Must be accurately translated 1:1 (EN ↔ DE) where both languages are offered.
* A precise, clear description of the extension and its use cases.

### Images and screenshots

* Use English-only screenshots for the English store listing and preview images. German screenshots for the German description are optional.
* Do not mix languages within the same image.
* Only images that represent the extension’s function are allowed.
* Advertising for other extensions or services is not permitted.
* Show the extension in use in Storefront and Administration, including configuration and how-to detail.
* Prefer screenshots for mobile and desktop.
* Images must be high quality; at least one storefront and one admin screenshot should show main features.

::: info
[How to add images and icons to extensions](https://docs.shopware.com/en/account-en/adding-pictures-and-icons/how-to)
:::

## Fallback language and translations {#fallback-language-and-translations}

Extensions must work independently of the system language. If a translation is missing (for example, Spanish), use a proper fallback (usually English).

If the extension is available in multiple languages, define them in your Shopware Account under “Translations into the following languages are available,” in the "Description & images" section.

During review we check text snippets, `config.xml`, and `composer.json` where applicable.

### Admin translations

English must be the fallback and always be available for settings and error messages.

**Own media folder:** Create separate media folders or use existing ones for uploads. Do not change Shopware’s base structure. Do not add entries to the main menu of the Administration.

## Preview and Extension Manager presentation

* A preview image must exist in the Extension Manager.
* Store a valid favicon named `plugin.png` (112×112px) under `src/Resources/config/` so the extension is identifiable under **Administration > Extension Manager**.
* [Themes](../../../plugins/themes/index.md) require a preview image in the Theme Manager.
* [Shopping Experiences CMS elements](../../../../concepts/commerce/content/shopping-experiences-cms.md#elements) must include an element icon.

[How to request a preview](https://docs.shopware.com/en/account-en/extension-partner/extensions?category=account-en/extension-partner#how-can-i-request-a-preview)

### Reserve a name with a store preview

To secure an idea early, create a preview in your Shopware Account with placeholder images, meaningful use cases, key features, a description, and an expected release month. No binary upload is required.

### Extension master data and license

The license in your Shopware Account must match the license in `composer.json`. The selected license cannot be changed after the extension is created; a new extension with a new technical name and upload is required for changes.

### Demo shop URLs in listings

* URLs must not contain `http:` or `https:` prefixes in the form required by the listing workflow.
* Test environments are deleted after about two weeks; do not link to them as permanent demos.

## Manufacturer profile

Configure the profile under **Shopware Account > Extension Partner > [Extension Partner profile](https://account.shopware.com/producer/profile)**.

* A manufacturer logo is required.
* No iframes, tracking, or external scripts.
* External sources must use HTTPS.
* Accurate English and German descriptions.

::: info
Descriptions, profiles, and instructions must not use iframes, external scripts, or tracking pixels. Custom styles must not overwrite core Shopware styles. External resources must use HTTPS.
:::

::: info
You cannot advertise Shopware certificates in an extension description, images, or the manufacturer profile. Certificates are added automatically at the end of each extension description by Shopware.
:::

## Listing content rules (privacy and media)

If personal data is processed under Art. 28 DSGVO, declare subprocessors and further subprocessors as required in your account.

**Not allowed in listings and profiles:**

* Inline styles in descriptions.
* Certificates embedded in descriptions (see note above).
* Iframes, tracking pixels, and external scripts.

**Allowed:**

* Up to two YouTube videos embedded in the extension description.

::: info
Video content (explainers, demos, tutorials) improves trust and conversion.
:::
