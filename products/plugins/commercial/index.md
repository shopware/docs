---
nav:
  title: Commercial
  position: 30

---

# Commercial

The Shopware 6 commercial feature-set comprises myriad features, the sum of which provide additional support for businesses which require extended functionality within the Shopware 6 ecosystem.

## Plugin structure

The commercial plugin is structured as a group of nested sub-bundles. [Plugins](../../../concepts/extensions/plugins-concept) concept explains you more about this.

## Setup

Installation of the commercial plugin does not require special guidance. The installation steps are detailed in our [Plugin Base Guide](../../../guides/plugins/plugins/plugin-base-guide#install-your-plugin).

This plugin contains various features, which are covered in our docs as well.

::: warning
In accordance with a Shopware merchant's active account configuration, features within the plugin will be in *active* or *inactive* (whilst still being installed within the Shopware codebase). Pay close attention to any install information or special conditions for the provided features.
:::

## Licensing

On installation the commercial plugin tries to fetch the license key using the logged-in Shopware Account. If this can't be fetched, the plugin can be still installed but all features are deactivated. If you login into your Shopware Account, you can fetch again the license key using `bin/console commercial:license:update`.

For further debugging you can run the command:

```bash
bin/console commercial:license:info
```

which will show the current license key if set and when it expires.

## Disable Features

::: info
This Feature is available since 6.6.10.0
:::

The commercial plugin consists of multiple features. You may not need all Features included with the plugin, so you can specify with `SHOPWARE_COMMERCIAL_ENABLED_BUNDLES` environment variable all commercial bundles you want to be enabled.

Example environment variable:

```text
SHOPWARE_COMMERCIAL_ENABLED_BUNDLES=CustomPricing,Subscription
```

You can find all bundle names using this command:

```bash
./bin/console debug:container --parameter kernel.bundles --format=json
```
