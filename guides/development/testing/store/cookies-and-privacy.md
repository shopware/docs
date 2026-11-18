---
nav:
  title: Cookies and privacy
  position: 60
---

# Cookies and privacy

Register cookies correctly in the [Cookie Consent Manager](../../../plugins/plugins/storefront/advanced/add-cookie-to-manager.md).

* Every cookie set from the store URL should be optional and not classified as technically required for running Shopware unless it truly is. We use **Technically required**, **Marketing**, and **Comfort features** (see below).
* All cookies must appear **unchecked** by default in the cookie configuration UI in the storefront, except where law and product behavior explicitly require otherwise.

## Cookie categories

Cookies may only be assigned to one of these categories in the Cookie Consent Manager:

* **Technically required** — Only cookies strictly necessary for the shop to function.
* **Marketing** — Analytics or data collection.
* **Comfort features** — Everything that does not fit the other two but is needed for a specific feature.

**Example:** A pop-up reminder cookie is not technically required; use Comfort features or tie it to the session cookie where appropriate.

## Consent behavior

Registering a cookie does not by itself prevent optional tracking from starting.
Gate the related scripts, network requests, embedded services and storage writes on the relevant consent state.
Do not replace Shopware's consent mechanism with an independent banner that only records a choice without controlling those integrations.

Handle consent changes and withdrawal as well as the initial page load.
Stop further optional tracking when consent is withdrawn and remove extension-owned optional cookies where applicable.
Check that consent and configuration behavior remain consistent across sales channels.

**Verify:** use a fresh browser session, decline consent, accept it, withdraw it and reload.
Inspect network requests and storage at each step, not only the banner's appearance.
See [Reacting to cookie consent changes](../../../plugins/plugins/storefront/advanced/reacting-to-cookie-consent-changes.md).

## Privacy and personal data (DSGVO)

If personal data of customers (merchant and/or end customers) is processed with the extension under Art. 28 DSGVO:

* Enter the data processor’s details in **Subprocessor**.
* Enter any further processors under **Further subprocessors**.

If external services transmit personal data or are in use, this should be specified in the description.
