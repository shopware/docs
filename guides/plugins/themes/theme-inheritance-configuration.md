---
nav:
  title: Theme inheritance configuration
  position: 110

---

# Theme Inheritance Configuration

::: info
The `configInheritance` is available from Shopware Version 6.4.8.0
:::

## Overview

This guide explains how you can use a theme as a basic corporate design theme and create inherited themes for special purposes like holiday time or a sales week.

Imagine you have a theme that is applying your corporate design to the storefront. With your colors, your logo and other configuration fields. But on a special week in the year, you have additional requirements for a special design, like a discount counter or an advent calendar.  

## Setup

### Create two themes

Create the two themes like described in [Theme inheritance](./add-theme-inheritance).

### Configure your themes

Add some configuration fields you need in your basic theme inside the `theme.json` of the `SwagBasicExampleTheme`

```js
// <plugin root>/src/Resources/theme.jsonon
{
  "name": "SwagBasicExampleTheme",
  .....
  "config": {
    "blocks": {
      "colors": {
        "themeColors": {
          "en-GB": "Theme colours",
          "de-DE": "Theme Farben"
        }
      }
    },
    "sections": {
      "importantColors": {
        "label": {
          "en-GB": "Important colors",
          "de-DE": "Wichtige Farben"
        }
      }
    },
    "tabs": {
      "colors": {
          "label": {
              "en-GB": "Colours",
              "de-DE": "Farben"
          }
      } 
    },
    "fields": {
      "sw-color-brand-primary": {
        "label": {
          "en-GB": "Primary colour",
          "de-DE": "Primär"
        },
        "type": "color",
        "value": "#399",
        "editable": true,
        "tab": "colors",
        "block": "themeColors",
        "section": "importantColors"
      },
      "sw-brand-icon": {
        "label": {
            "en-GB": "Brand icon", 
            "de-DE": "Markenlogo"
        },
        "type": "url",
        "value": "/our-logo.png",
        "editable": true
      }
    }
  }
}
```

## Extending an existing theme configuration with a new theme

Add configurations to your extended theme

```js
// <plugin root>/src/Resources/theme.jsonon
{
  "name": "SwagBasicExampleThemeExtend",
  .....
  "configInheritance": [
    "@Storefront",
    "@SwagBasicExampleTheme"
  ],
  "config": {
    "fields": {
      "sw-brand-icon": {
        "type": "url",
        "value": "/our-logo-holidays.png",
        "editable": true
      },
      "sw-advent-calendar-background-color": {
        "label": {
          "en-GB": "Advent calendar background color",
          "de-DE": "Adventskalender Hintergrundfarbe"
        },
        "type": "color",
        "value": "#399",
        "editable": true
      }
    }
  }
}
```

In this theme (`SwagBasicExampleThemeExtend`) all the configuration fields from the themes `Storefront` and `SwagBasicExampleTheme` will be used as inherited values. They will be shown in the Administration with an inherit anchor and will use the value of the parent themes as long as they are not set to a different value. In the `theme.json` the `sw-brand-icon` field value will be overwritten with a different default value. So this field will not be inherited regardless that it is already defined in the `SwagBasicExampleTheme`. This theme also adds a new field for the background color of the advent calendar (`sw-advent-calendar-background-color`) because this is only needed in this special theme which will only be used for 4-6 weeks a year.

## Next steps

Now that you know how the theme inheritance works you can start with own customizations. Here is a list of other related topics where assets can be used.

* [Add SCSS Styling and JavaScript to a theme](add-css-js-to-theme)
* [Customize templates](../plugins/storefront/customize-templates)
