---
nav:
  title: Functionality and integration
  position: 30
---

# Functionality and integration

## Extension functionality

The extension’s features must work as described. All advertised features must be available at review time.

## API validation and external services

When the extension uses external APIs:

* Provide an **API test button** or validate credentials when saving settings.
* Show a **status message** in the Administration; log success or failure appropriately.
* Log invalid API data to `/var/log/` or the database event log.

Example pattern: [ShyimApiTest](https://github.com/shyim/ShyimApiTest).

## Configuration per sales channel

Apps that appear in the Storefront and use `config.xml` must be configurable **per sales channel**, or explicitly scoped to a single channel.

## Message queue

If the extension enqueues messages, each payload must not exceed **262,144 bytes (256 KB)**.

## External fonts and services

If you use external fonts (for example Google Fonts, Font Awesome) or other third-party services, state this clearly in the **extension store description**. If personal data is transferred, update privacy information; a **tooltip** in configuration is recommended.

## App-specific requirements {#app-specific-requirements}

These apply to **apps** only:

* Provide **per-sales-channel** configuration when you use `config.xml`.
* Do **not** load external files during installation in the Extension Manager.
* Include an **API test** integration when API credentials are required.
* Do **not** modify the Extension Manager.
* A **Shopware Technology Partner (STP)** agreement is required for commission-based integrations that bill the merchant (see below).
* Apps visible in the Storefront with `config.xml` must support separate configuration per sales channel.

## Commercial and technology partner (STP) integrations

If the extension integrates external services and generates revenue (for example fees per transaction), an **STP agreement** may be required. Commission-based integrations must report usage as defined in the contract.

Example payload shape reported to Shopware (see your contract for the live endpoint and fields):

```json
{
  "identifier": "8e167662-6bbb-11eb-9439-0242ac130002",
  "reportDate": "2005-08-15T15:52:01",
  "instanceId": "alur24esfaw3ghk",
  "shopwareVersion": "6.3.1",
  "reportDataKeys": [
    { "customer": 3 },
    { "turnover": 440 }
  ]
}
```

Partners typically `POST` reports to `/shopwarepartners/reports/technology` as specified in the STP documentation.

Questions: [alliances@shopware.com](mailto:alliances@shopware.com) or **+44 (0) 203 095 2445 (UK)**, **00 800 746 7626 0 (worldwide)**, **+49 (0) 25 55 / 928 85-0 (Germany)**.

**Progressive Web App:** For PWA compatibility and the PWA flag in the Store, contact [alliances@shopware.com](mailto:alliances@shopware.com).

## Tools

* [Adminer for Admin](https://store.shopware.com/en/frosh79014577529f/adminer-for-admin.html)
* [Tools](https://store.shopware.com/en/frosh12599847132f/tools.html)
* [Mail Archive](https://store.shopware.com/en/frosh97876597450f/mail-archive.html)
