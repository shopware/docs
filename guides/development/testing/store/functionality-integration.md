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
* Log failures through the configured logging system without recording credentials or sensitive response bodies; see [Code quality](./code-quality.md#error-messages-and-logging).

Use bounded connection and response timeouts and report failures clearly.
Avoid slow remote work in checkout or registration when it can run asynchronously.
After an external side effect succeeds, a failed local write needs a deliberate retry or reconciliation strategy rather than blindly repeating the side effect.

Example pattern: [ShyimApiTest](https://github.com/shyim/ShyimApiTest).

## Configuration per sales channel

Extensions that appear in the Storefront must be able to be configured separately for each sales channel, or scoped so they apply only to a single channel.

Resolve settings for the sales channel performing the operation and preserve the relevant language, currency and customer context.
Test global defaults, per-channel overrides and explicit disablement.
Do not assume that `0`, `false` and an empty value have identical inheritance semantics across all supported versions.
Where a numeric value cannot reliably express "disabled", use an explicit enable/disable setting and test how it inherits.
Keep help text consistent with the actual behavior.

**Verify:** use two sales channels with different settings, including one with inherited values and one with the feature disabled.

## Cache behavior

Keep cached output isolated according to the inputs that affect it, such as sales channel, language, currency, customer group or permissions.
Do not place customer-specific data into a shared response without a suitable cache strategy.
Invalidate the same dependency tags that cached responses use when the underlying data changes.
Check the event that actually carries the change, including translation events where applicable.
Avoid disabling the whole storefront cache for a feature that affects only a small part of the response.

**Verify:** warm the cache, switch customer/channel context, change relevant configuration or data and confirm both isolation and refresh.

## Data loading and batches

Filter and paginate in the query instead of loading an unbounded set and filtering in PHP.
Use ID queries or aggregations when full entities are unnecessary, and avoid a separate detail query for every item in a listing.
A fixed maximum result count is not pagination and must not silently make exports or statistics incomplete.

Filter ineligible rows before applying a batch limit, or advance a stable cursor past them.
Otherwise, the same disabled-channel rows can fill every batch while eligible work is never reached.

**Verify:** process more than one batch, including ineligible rows before eligible rows, and check that every intended record is handled without duplicates.

## Message queue

If the extension adds messages to the message queue, the entry should not be bigger than **256 KB**.

This limit supports common message queue transports.
Keep messages small by passing identifiers rather than large data exports.

Verify that messages intended for background processing are actually routed asynchronously; dispatching a message alone does not establish this.
Make handlers safe to retry, record completion only after successful work and provide a recovery path for interrupted processing.
An authorized background operation must deliberately establish its required execution context; temporary scope on the dispatching request is not a substitute for worker authorization.

Keep cancellation and progress in extension-owned state rather than deleting rows from a specific queue transport's storage.
Installations can use different transports.

**Verify:** duplicate delivery, worker restart, timeout, partial failure and concurrent processing.
See [Message queue](../../../plugins/plugins/framework/message-queue/) for implementation guidance.

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
