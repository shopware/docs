# Building assets of Administration and Storefront without a Database

It is common to prebuild assets in professional deployments to deploy the build artifact assets to the production environment. This task is mostly done by a CI job that doesn't have access to the production database. Shopware needs access to the database to look up the installed extensions/load the configured theme variables. To be able to build the assets without a database, we can use static dumped files.

::: warning
This guide requires Shopware 6.4.4.0 or higher
:::

## Compiling the Administration without database

By default, Shopware builds the Administration without extensions if there is no database connection. To include the extensions without a database, you will need to use the `ComposerPluginLoader`. This determines the used plugins by looking up the installed project dependencies. To get this working, the plugin needs to be required in the system using `composer req [package/name]`.

There is a file `bin/ci` which uses the `ComposerPluginLoader` and can be used instead of `bin/console`.
Using this, you can dump the plugins for the Administration with the new file without a database using the command `bin/ci bundle:dump`. It is recommended to call `bin/ci` instead of `bin/console` in the `bin/*.js` scripts, which can be achieved by setting the environment variable `CI=1`.

## Compiling the Storefront without database

To compile the Storefront theme, you will need the theme variables from the database. To allow compiling it without a database, it is possible to dump the variables to the private file system of Shopware. This file system interacts with the local folder `files/theme-config` by default, but for it to be compiled, it should be shared such that settings are shared across deployments. This can be achieved, for example, by using a [storage adapter like s3](../../infrastructure/filesystem.md). The configuration can be dumped using the command `bin/console theme:dump`, or it happens automatically when changing theme settings or assigning a new theme.

This means that you still **need a dumped configuration from a system with a working database setup**. You then need to copy these files to your setup without a database and follow the steps below.

By default, Shopware still tries to load configurations from the database. In the next step, you will need to change the loader to `StaticFileConfigLoader`. To change that, you will need to create a new file, `config/packages/storefront.yaml` with the following content:

 ```yaml
storefront:
    theme:
        config_loader_id: Shopware\Storefront\Theme\ConfigLoader\StaticFileConfigLoader
        available_theme_provider: Shopware\Storefront\Theme\ConfigLoader\StaticFileAvailableThemeProvider
        theme_path_builder_id: Shopware\Storefront\Theme\MD5ThemePathBuilder
 ```

This will force the theme compiler to use the static dumped file instead of looking into the database.

::: info
Warnings about Database errors can still occur but will be caught and should be ignored in this case.
:::

The dumped files should be found in the directory `files/theme-config`

### Example

directory (files/theme-config):

```text
a729322c1f4e4b4e851137c807b4f363.json
index.json
```

index.json

```json
{"99ef1e95716d43d7be78e9d9921c7163":"a729322c1f4e4b4e851137c807b4f363"}
```

<details>
<summary>a729322c1f4e4b4e851137c807b4f363.json</summary>

```json
{
  "extensions": [],
  "themeConfig": {
    "blocks": {
      "themeColors": {
        "label": {
          "en-GB": "Theme colours",
          "de-DE": "Theme-Farben"
        }
      },
      "typography": {
        "label": {
          "en-GB": "Typography",
          "de-DE": "Typografie"
        }
      },
      "eCommerce": {
        "label": {
          "en-GB": "E-Commerce",
          "de-DE": "E-Commerce"
        }
      },
      "statusColors": {
        "label": {
          "en-GB": "Status messages",
          "de-DE": "Status-Ausgaben"
        }
      },
      "media": {
        "label": {
          "en-GB": "Media",
          "de-DE": "Medien"
        }
      },
      "unordered": {
        "label": {
          "en-GB": "Misc",
          "de-DE": "Sonstige"
        }
      }
    },
    "fields": {
      "sw-color-brand-primary": {
        "label": {
          "en-GB": "Primary colour",
          "de-DE": "Prim\u00e4rfarbe"
        },
        "type": "color",
        "value": "#ff0000",
        "editable": true,
        "block": "themeColors",
        "order": 100
      },
      "sw-color-brand-secondary": {
        "label": {
          "en-GB": "Secondary colour",
          "de-DE": "Sekund\u00e4rfarbe"
        },
        "type": "color",
        "value": "#3d444d",
        "editable": true,
        "block": "themeColors",
        "order": 200
      },
      "sw-border-color": {
        "label": {
          "en-GB": "Border",
          "de-DE": "Rahmen"
        },
        "type": "color",
        "value": "#798490",
        "editable": true,
        "block": "themeColors",
        "order": 300
      },
      "sw-background-color": {
        "label": {
          "en-GB": "Background",
          "de-DE": "Hintergrund"
        },
        "type": "color",
        "value": "#fff",
        "editable": true,
        "block": "themeColors",
        "order": 400
      },
      "sw-color-success": {
        "label": {
          "en-GB": "Success",
          "de-DE": "Erfolg"
        },
        "type": "color",
        "value": "#3cc261",
        "editable": true,
        "block": "statusColors",
        "order": 100
      },
      "sw-color-info": {
        "label": {
          "en-GB": "Information",
          "de-DE": "Information"
        },
        "type": "color",
        "value": "#26b6cf",
        "editable": true,
        "block": "statusColors",
        "order": 200
      },
      "sw-color-warning": {
        "label": {
          "en-GB": "Notice",
          "de-DE": "Hinweis"
        },
        "type": "color",
        "value": "#ffbd5d",
        "editable": true,
        "block": "statusColors",
        "order": 300
      },
      "sw-color-danger": {
        "label": {
          "en-GB": "Error",
          "de-DE": "Fehler"
        },
        "type": "color",
        "value": "#e52427",
        "editable": true,
        "block": "statusColors",
        "order": 400
      },
      "sw-font-family-base": {
        "label": {
          "en-GB": "Fonttype text",
          "de-DE": "Schriftart Text"
        },
        "type": "fontFamily",
        "value": "'Inter', sans-serif",
        "editable": true,
        "block": "typography",
        "order": 100
      },
      "sw-text-color": {
        "label": {
          "en-GB": "Text colour",
          "de-DE": "Textfarbe"
        },
        "type": "color",
        "value": "#2b3136",
        "editable": true,
        "block": "typography",
        "order": 200
      },
      "sw-font-family-headline": {
        "label": {
          "en-GB": "Fonttype headline",
          "de-DE": "Schriftart \u00dcberschrift"
        },
        "type": "fontFamily",
        "value": "'Inter', sans-serif",
        "editable": true,
        "block": "typography",
        "order": 300
      },
      "sw-headline-color": {
        "label": {
          "en-GB": "Headline colour",
          "de-DE": "\u00dcberschriftfarbe"
        },
        "type": "color",
        "value": "#2b3136",
        "editable": true,
        "block": "typography",
        "order": 400
      },
      "sw-color-price": {
        "label": {
          "en-GB": "Price",
          "de-DE": "Preis"
        },
        "type": "color",
        "value": "#2b3136",
        "editable": true,
        "block": "eCommerce",
        "order": 100
      },
      "sw-color-buy-button": {
        "label": {
          "en-GB": "Buy button",
          "de-DE": "Kaufen-Button"
        },
        "type": "color",
        "value": "#0b539b",
        "editable": true,
        "block": "eCommerce",
        "order": 200
      },
      "sw-color-buy-button-text": {
        "label": {
          "en-GB": "Buy button text",
          "de-DE": "Kaufen-Button Text"
        },
        "type": "color",
        "value": "#fff",
        "editable": true,
        "block": "eCommerce",
        "order": 300
      },
      "sw-logo-desktop": {
        "label": {
          "en-GB": "Desktop",
          "de-DE": "Desktop"
        },
        "helpText": {
          "en-GB": "Displayed on viewport sizes above 991px and as a fallback on smaller viewports, if no other logo is set.",
          "de-DE": "Wird bei Ansichten \u00fcber 991px angezeigt und als Alternative bei kleineren Aufl\u00f6sungen, f\u00fcr die kein anderes Logo eingestellt ist."
        },
        "type": "media",
        "value": "http:\/\/shopware.local\/media\/64\/17\/g0\/1678462492\/demostore-logo.png",
        "editable": true,
        "block": "media",
        "order": 100,
        "fullWidth": true
      },
      "sw-logo-tablet": {
        "label": {
          "en-GB": "Tablet",
          "de-DE": "Tablet"
        },
        "helpText": {
          "en-GB": "Displayed between a viewport of 767px to 991px",
          "de-DE": "Wird zwischen einem viewport von 767px bis 991px angezeigt"
        },
        "type": "media",
        "value": "http:\/\/shopware.local\/media\/64\/17\/g0\/1678462492\/demostore-logo.png",
        "editable": true,
        "block": "media",
        "order": 200,
        "fullWidth": true
      },
      "sw-logo-mobile": {
        "label": {
          "en-GB": "Mobile",
          "de-DE": "Mobil"
        },
        "helpText": {
          "en-GB": "Displayed up to a viewport of 767px",
          "de-DE": "Wird bis zu einem Viewport von 767px angezeigt"
        },
        "type": "media",
        "value": "http:\/\/shopware.local\/media\/64\/17\/g0\/1678462492\/demostore-logo.png",
        "editable": true,
        "block": "media",
        "order": 300,
        "fullWidth": true
      },
      "sw-logo-share": {
        "label": {
          "en-GB": "App & share icon",
          "de-DE": "App- & Share-Icon"
        },
        "type": "media",
        "value": "",
        "editable": true,
        "block": "media",
        "order": 400
      },
      "sw-logo-favicon": {
        "label": {
          "en-GB": "Favicon",
          "de-DE": "Favicon"
        },
        "type": "media",
        "value": "http:\/\/shopware.local\/media\/d3\/f5\/b7\/1678462492\/favicon.png",
        "editable": true,
        "block": "media",
        "order": 500
      }
    },
    "sw-color-brand-primary": {
      "extensions": [],
      "name": "sw-color-brand-primary",
      "label": {
        "en-GB": "Primary colour",
        "de-DE": "Prim\u00e4rfarbe"
      },
      "helpText": null,
      "type": "color",
      "value": "#0b539b",
      "editable": true,
      "block": "themeColors",
      "section": null,
      "tab": null,
      "order": 100,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-brand-secondary": {
      "extensions": [],
      "name": "sw-color-brand-secondary",
      "label": {
        "en-GB": "Secondary colour",
        "de-DE": "Sekund\u00e4rfarbe"
      },
      "helpText": null,
      "type": "color",
      "value": "#3d444d",
      "editable": true,
      "block": "themeColors",
      "section": null,
      "tab": null,
      "order": 200,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-border-color": {
      "extensions": [],
      "name": "sw-border-color",
      "label": {
        "en-GB": "Border",
        "de-DE": "Rahmen"
      },
      "helpText": null,
      "type": "color",
      "value": "#798490",
      "editable": true,
      "block": "themeColors",
      "section": null,
      "tab": null,
      "order": 300,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-background-color": {
      "extensions": [],
      "name": "sw-background-color",
      "label": {
        "en-GB": "Background",
        "de-DE": "Hintergrund"
      },
      "helpText": null,
      "type": "color",
      "value": "#fff",
      "editable": true,
      "block": "themeColors",
      "section": null,
      "tab": null,
      "order": 400,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-success": {
      "extensions": [],
      "name": "sw-color-success",
      "label": {
        "en-GB": "Success",
        "de-DE": "Erfolg"
      },
      "helpText": null,
      "type": "color",
      "value": "#3cc261",
      "editable": true,
      "block": "statusColors",
      "section": null,
      "tab": null,
      "order": 100,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-info": {
      "extensions": [],
      "name": "sw-color-info",
      "label": {
        "en-GB": "Information",
        "de-DE": "Information"
      },
      "helpText": null,
      "type": "color",
      "value": "#26b6cf",
      "editable": true,
      "block": "statusColors",
      "section": null,
      "tab": null,
      "order": 200,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-warning": {
      "extensions": [],
      "name": "sw-color-warning",
      "label": {
        "en-GB": "Notice",
        "de-DE": "Hinweis"
      },
      "helpText": null,
      "type": "color",
      "value": "#ffbd5d",
      "editable": true,
      "block": "statusColors",
      "section": null,
      "tab": null,
      "order": 300,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-danger": {
      "extensions": [],
      "name": "sw-color-danger",
      "label": {
        "en-GB": "Error",
        "de-DE": "Fehler"
      },
      "helpText": null,
      "type": "color",
      "value": "#e52427",
      "editable": true,
      "block": "statusColors",
      "section": null,
      "tab": null,
      "order": 400,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-font-family-base": {
      "extensions": [],
      "name": "sw-font-family-base",
      "label": {
        "en-GB": "Fonttype text",
        "de-DE": "Schriftart Text"
      },
      "helpText": null,
      "type": "fontFamily",
      "value": "'Inter', sans-serif",
      "editable": true,
      "block": "typography",
      "section": null,
      "tab": null,
      "order": 100,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-text-color": {
      "extensions": [],
      "name": "sw-text-color",
      "label": {
        "en-GB": "Text colour",
        "de-DE": "Textfarbe"
      },
      "helpText": null,
      "type": "color",
      "value": "#2b3136",
      "editable": true,
      "block": "typography",
      "section": null,
      "tab": null,
      "order": 200,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-font-family-headline": {
      "extensions": [],
      "name": "sw-font-family-headline",
      "label": {
        "en-GB": "Fonttype headline",
        "de-DE": "Schriftart \u00dcberschrift"
      },
      "helpText": null,
      "type": "fontFamily",
      "value": "'Inter', sans-serif",
      "editable": true,
      "block": "typography",
      "section": null,
      "tab": null,
      "order": 300,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-headline-color": {
      "extensions": [],
      "name": "sw-headline-color",
      "label": {
        "en-GB": "Headline colour",
        "de-DE": "\u00dcberschriftfarbe"
      },
      "helpText": null,
      "type": "color",
      "value": "#2b3136",
      "editable": true,
      "block": "typography",
      "section": null,
      "tab": null,
      "order": 400,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-price": {
      "extensions": [],
      "name": "sw-color-price",
      "label": {
        "en-GB": "Price",
        "de-DE": "Preis"
      },
      "helpText": null,
      "type": "color",
      "value": "#2b3136",
      "editable": true,
      "block": "eCommerce",
      "section": null,
      "tab": null,
      "order": 100,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-buy-button": {
      "extensions": [],
      "name": "sw-color-buy-button",
      "label": {
        "en-GB": "Buy button",
        "de-DE": "Kaufen-Button"
      },
      "helpText": null,
      "type": "color",
      "value": "#0b539b",
      "editable": true,
      "block": "eCommerce",
      "section": null,
      "tab": null,
      "order": 200,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-color-buy-button-text": {
      "extensions": [],
      "name": "sw-color-buy-button-text",
      "label": {
        "en-GB": "Buy button text",
        "de-DE": "Kaufen-Button Text"
      },
      "helpText": null,
      "type": "color",
      "value": "#fff",
      "editable": true,
      "block": "eCommerce",
      "section": null,
      "tab": null,
      "order": 300,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-logo-desktop": {
      "extensions": [],
      "name": "sw-logo-desktop",
      "label": {
        "en-GB": "Desktop",
        "de-DE": "Desktop"
      },
      "helpText": {
        "en-GB": "Displayed on viewport sizes above 991px and as a fallback on smaller viewports, if no other logo is set.",
        "de-DE": "Wird bei Ansichten \u00fcber 991px angezeigt und als Alternative bei kleineren Aufl\u00f6sungen, f\u00fcr die kein anderes Logo eingestellt ist."
      },
      "type": "media",
      "value": "18f45736ef6a4beea22d867573bd1af6",
      "editable": true,
      "block": "media",
      "section": null,
      "tab": null,
      "order": 100,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": true
    },
    "sw-logo-tablet": {
      "extensions": [],
      "name": "sw-logo-tablet",
      "label": {
        "en-GB": "Tablet",
        "de-DE": "Tablet"
      },
      "helpText": {
        "en-GB": "Displayed between a viewport of 767px to 991px",
        "de-DE": "Wird zwischen einem viewport von 767px bis 991px angezeigt"
      },
      "type": "media",
      "value": "18f45736ef6a4beea22d867573bd1af6",
      "editable": true,
      "block": "media",
      "section": null,
      "tab": null,
      "order": 200,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": true
    },
    "sw-logo-mobile": {
      "extensions": [],
      "name": "sw-logo-mobile",
      "label": {
        "en-GB": "Mobile",
        "de-DE": "Mobil"
      },
      "helpText": {
        "en-GB": "Displayed up to a viewport of 767px",
        "de-DE": "Wird bis zu einem Viewport von 767px angezeigt"
      },
      "type": "media",
      "value": "18f45736ef6a4beea22d867573bd1af6",
      "editable": true,
      "block": "media",
      "section": null,
      "tab": null,
      "order": 300,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": true
    },
    "sw-logo-share": {
      "extensions": [],
      "name": "sw-logo-share",
      "label": {
        "en-GB": "App & share icon",
        "de-DE": "App- & Share-Icon"
      },
      "helpText": null,
      "type": "media",
      "value": "",
      "editable": true,
      "block": "media",
      "section": null,
      "tab": null,
      "order": 400,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    },
    "sw-logo-favicon": {
      "extensions": [],
      "name": "sw-logo-favicon",
      "label": {
        "en-GB": "Favicon",
        "de-DE": "Favicon"
      },
      "helpText": null,
      "type": "media",
      "value": "7bf586ac4343480292ebd5f349e16607",
      "editable": true,
      "block": "media",
      "section": null,
      "tab": null,
      "order": 500,
      "sectionOrder": null,
      "blockOrder": null,
      "tabOrder": null,
      "custom": null,
      "scss": null,
      "fullWidth": null
    }
  },
  "name": "Swag Dev Theme",
  "previewMedia": "custom\/apps\/SwagDevTheme\/Resources\/app\/storefront\/src\/assets\/images\/showroomPreview.png",
  "author": "Shopware AG",
  "isTheme": true,
  "styleFiles": [
    {
      "extensions": [],
      "filepath": "@Storefront",
      "resolveMapping": []
    }
  ],
  "scriptFiles": [
    {
      "extensions": [],
      "filepath": "@Storefront",
      "resolveMapping": []
    }
  ],
  "storefrontEntryFilepath": null,
  "basePath": "custom\/apps\/SwagDevTheme\/Resources",
  "assetPaths": [
    "custom\/apps\/SwagDevTheme\/Resources\/app\/storefront\/src\/assets"
  ],
  "viewInheritance": [
    "@Storefront",
    "@SwagCustomizedProducts",
    "@SwagPayPal",
    "@SwagAmazonPay",
    "@SwagCmsExtensions",
    "@SwagB2bPlatform",
    "@SwagDevTheme",
    "@Plugins"
  ],
  "iconSets": {
    "showroom": "app\/storefront\/src\/assets\/icon\/showroom"
  },
  "technicalName": "SwagDevTheme"
}
```

</details>

### Partially compiling the Storefront

You can also build just the Javascript bundle using `CI=1 SHOPWARE_SKIP_THEME_COMPILE=true PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true bin/build-storefront.sh` (without the need for the above loader) in your CI. After that, run `bin/console theme:dump` on your production system when the database is available. This will happen automatically if theme variables are changed via the admin panel.
