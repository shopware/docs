---
nav:
  title: Theme Base Guide
  position: 10

---

# Theme Base Guide

## What is a theme?

Storefront Themes enable you to customize the visual appearance of the Shopware Storefront. They are not a separate extension type, but are implemented as plugins—or, in Cloud environments, delivered via Apps.

Shopware comes with a default theme built on top of Bootstrap 5. Everything you can do with Bootstrap, you can do with the Shopware Storefront.

Another handy capability is the theme configuration. As a theme developer, you can define variables configurable via the Administration. Those variables are accessible in your theme and let you implement powerful features.

## What themes can do

Themes allow you to:

* Override Twig templates
* Add and customize SCSS/CSS styling
* Provide JavaScript for storefront behavior
* Define configurable theme settings in the Administration
* Control template and style inheritance order

::: info
Note that a plugin can also override templates.
:::

## How themes differ from regular plugins

* They typically do not contain backend PHP logic. They're stripped-down plugins consisting of a UI.
* They're visible in the theme manager once activated and assigned per sales channel.
* They focus on storefront presentation.
* They require implementing `ThemeInterface`.
* They can inherit from other themes.

Themes are assigned per sales channel and managed via the Theme Manager.

If you need database changes, custom entities, or console commands, [build a Plugin](../plugins/plugin-base-guide) instead.

## Developer workflow

If you are building a theme, follow this path:

1. [Create a theme](create-a-theme.md)
2. Configure it via [`theme.json`](configuration/theme-configuration.md)
3. [Add SCSS styling and JavaScript](styling/add-css-js-to-theme.md)
4. [Add assets](assets/add-assets-to-theme.md) and [icons](assets/add-icons.md)
5. [Override Bootstrap variables or breakpoints](styling/override-bootstrap-variables-in-a-theme.md) or [responsive breakpoints](styling/override-theme-breakpoints.md)
6. Customize templates (see [Storefront template customization](../plugins/storefront/templates/customize-templates.md))
7. Use [theme inheritance](inheritance/add-theme-inheritance.md) if needed

Now that you know what you can do with themes, the next steps would be to [create themes](create-a-theme).
