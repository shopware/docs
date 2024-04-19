---
nav:
   title: Admin installation
   position: 20

---

# Admin Installation

::: warning
To access the *Digital Sales Rooms* source code, please create a support ticket in your Shopware Account and share your GitLab (not GitHub) username. You will then be granted access to the private repository.
:::

## Get the plugin

1. Clone or download the [SwagDigitalSalesRooms repository 6.6.x](https://gitlab.com/shopware/shopware/shopware-6/services/swagdigitalsalesrooms/-/tree/6.6.x).
2. Extract the plugin, including the outer folder `SwagDigitalSalesRooms`, to `platform/custom/plugins` directory of the Shopware repository.
3. Ensure the plugin has a PHP package structure containing `composer.json` file, `src/` folder, and so on.
4. Prepare a zip file containing the plugin as in the following structure:

```bash
# SwagDigitalSalesRooms.zip

**SwagDigitalSalesRooms**/
├── bin
├── composer.json
├── composer.lock
├── makefile
├── phpstan.neon
├── phpunit.xml
├── README.md
├── src
└── tests
```

## Install & activate the plugin in Admin Extension

To install and use the *Digital Sales Rooms* feature, place and extract the above zip file in this location `<shopware-root-dir>/custom/plugins` directory. Once it is done, you can either refer the guide to [install plugin](../../guides/plugins/plugins/plugin-base-guide.html#install-your-plugin) or you can run the below Symfony commands:

```bash
# refresh the list of available plugins
bin/console plugin:refresh
# find the plugin **name** (first column on the list). In this case, it is "**SwagDigitalSalesRooms"**
bin/console plugin:install **SwagDigitalSalesRooms** --activate
# clear the cache afterward
bin/console cache:clear

# Now it is ready to use
```
