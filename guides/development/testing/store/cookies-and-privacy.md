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

## Privacy and personal data (DSGVO)

If personal data of customers (merchant and/or end customers) is processed with the extension under Art. 28 DSGVO:

* Enter the data processor’s details in **Subprocessor**.
* Enter any further processors under **Further subprocessors**.

If external services transfer personal data, update your privacy information; a tooltip in the extension configuration is recommended.
