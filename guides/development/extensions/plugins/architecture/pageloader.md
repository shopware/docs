---
nav:
  title: Page Loader Extension Architecture
  position: 80

---

# Page Loader Extension Architecture

Page loaders assemble all data required to render a storefront page. They centralize data fetching and guarantee consistent storefront behavior.

## Design principles

* Page loaders separate HTTP concerns from business logic.
* Data must be fetched via Store API routes.
* Page loaders must remain replaceable via decoration.
* Pages must be fully constructed before rendering.

## Extension guidelines

* Divide page loaders by domains that represent different Storefront sections: e.g. products, account, checkout.
* Provide an abstract base class for [decoration](../../references/adr/2020-11-25-decoration-pattern.md). The decoration pattern can be used to completely replace the page loader in a project.
* Return a dedicated page object containing all required data.
* Dispatch a corresponding `PageLoaded` event after loading. This event can be used to provide further data by third-party developers.
* Never access repositories directly inside a page loader.
* Use Store API routes for all data retrieval, to ensure that Store API can access all storefront functionalities.
* Page objects must extend from the base `\Shopware\Storefront\Page\Page` class.

## Why this matters

Page loaders guarantee that:

* Storefront rendering remains deterministic.
* Data can be reused via the Store API.
* Extensions can replace or decorate page behavior safely.
* Rendering logic stays independent from database concerns.
