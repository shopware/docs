# Page Loader

* Pageloaders must be divided into appropriate domains that represent the different sections of the Storefront - "products", "account", etc.
* Each page loader must have an abstract class from which it derives ( See [decoration pattern](../../references/adr/extension/2020-11-25-decoration-pattern)). This pattern can be used to completely replace the page loader in a project.
* Each page loader has a page object to return, in which all the necessary information for the page is present.
* At the end of each pageloader, an individual `PageLoaded` event is thrown. This event can be used to provide further data by third-party developers.
* Page loaders are not allowed to work directly with repositories but are only allowed to load data via the Store API. This is to ensure that all storefront functionalities can also be accessed via the Store API.
* A Page object must always extend from the base `\Shopware\Storefront\Page\Page` class.
