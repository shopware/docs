---
nav:
  title: Page Loader
  position: 80

---

# Page Loader

* Pageloaders must be divided into appropriate domains that represent the different sections of the Storefront - "products", "account", etc.
* Each page loader must have an abstract class from which it derives (See [decoration pattern](../../../../resources/references/adr/2020-11-25-decoration-pattern.md)). This pattern can be used to replace the page loader in a project completely.
* Each page loader has a page object to return, in which all the necessary information for the page is present.
* At the end of each page loader, an individual `PageLoaded` event is thrown. Third-party developers can use this event to provide additional data.
* Page loaders are not allowed to work directly with repositories but are only allowed to load data via the Store API. This is to ensure that all storefront functionalities can also be accessed via the Store API.
* A Page object must always extend from the base `\Shopware\Storefront\Page\Page` class.
