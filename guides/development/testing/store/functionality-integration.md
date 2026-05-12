---
nav:
  title: Functionality and integration
  position: 30
---

# Functionality and integration

The extension’s visual design must be consistent with Shopware and fit existing sections.

## API validation and external services

When the extension uses external APIs:

* Provide an **API test button** or validate credentials when saving settings.
* Show a **status message** in the Administration; log success or failure appropriately.
* Log invalid API data to `/var/log/` or the database event log.

Example pattern: [ShyimApiTest](https://github.com/shyim/ShyimApiTest).

## Configuration per sales channel

Extensions that appear in the Storefront must be able to be configured separately for each sales channel, or scoped so they apply only to a single channel.

## Message queue

If the extension adds messages to the message queue, the entry should not be bigger than **256 KB**.

This limitation is set by common message queue workers and should not be exceeded.

## Structure

**Own media folder:** Create separate media folders or use existing ones for uploads. Do not change Shopware’s base structure. Do not add entries to the main menu of the Administration.

The basic structure of Shopware should not be changed or modified.

* Provide **per-sales-channel** configuration when you use `config.xml`.
* Do **not** load external files during installation in the Extension Manager.
* Include an **API test** integration when API credentials are required.
* Do **not** modify the Extension Manager.
* A **Shopware Technology Partner (STP)** agreement is required for commission-based integrations that bill the merchant.

**App-specific requirements:**

* Apps visible in the Storefront with `config.xml` must support separate configuration per sales channel.

## External fonts and services

If external fonts (for example, Google Fonts, Font Awesome) or external services are used, this information must be included in the description in the extension store.

## Tools

* [Adminer for Admin](https://store.shopware.com/en/frosh79014577529f/adminer-for-admin.html)
* [Tools](https://store.shopware.com/en/frosh12599847132f/tools.html)
* [Mail Archive](https://store.shopware.com/en/frosh97876597450f/mail-archive.html)
