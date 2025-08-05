---
nav:
  title: Shopware's twig functions
  position: 10

---

# Shopware's twig functions

In Shopware, Twig's functionality is extended with custom tags, functions, filters, and extensions.

::: info
Official support for complete Twig multi inheritance using sw_* equivalents available since 6.7
:::

::: warning
Templates which are imported via \{\% sw_use \%\} are not allowed to have additional twig statements outside of twig blocks. Therefore, changes in core templates which are imported via \{\% sw_use \%\} might break your app or plugin.
:::

## Tags

| Function        | Description                                                                                                                                            | Notes                                                                                                            |
|:----------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------|
| `sw_extends`    | Inherits from another file with support for multi inheritance. The API is the same like in Twig's default `extends`                                    | See [Twig 3 documentation for `extends`](https://twig.symfony.com/doc/3.x/tags/extends.html)                     |
| `sw_include`    | Includes template partials with support for multi inheritance. The API is the same like in Twig's default `include` but limited to one file at once    | See [Twig 3 documentation for `include`](https://twig.symfony.com/doc/3.x/tags/include.html)                     |
| `sw_embed`      | Includes another file with directly overwriting blocks with support for multi inheritance. The API is the same like in Twig's default `embed`          | See [Twig 3 documentation for `embed`](https://twig.symfony.com/doc/3.x/tags/embed.html)                         |
| `sw_use`        | Includes template blocks without rendering them from another file with support for multi inheritance. The API is the same like in Twig's default `use` | See [Twig 3 documentation for `use`](https://twig.symfony.com/doc/3.x/tags/use.html)                             |
| `sw_import`     | Includes all macros from another file with support for multi inheritance. The API is the same like in Twig's default `import`                          | See [Twig 3 documentation for `import`](https://twig.symfony.com/doc/3.x/tags/import.html)                       |
| `sw_from`       | Includes single macros from another file with support for multi inheritance. The API is the same like in Twig's default `from`                         | See [Twig 3 documentation for `from`](https://twig.symfony.com/doc/3.x/tags/from.html)                           |
| `sw_icon`       | Displays an icon from a given icon set                                                                                                                 | See [Add custom icon](../../../guides/plugins/plugins/storefront/add-icons#adding-icon) guide for details.       |
| `sw_thumbnails` | Renders a  tag with correctly configured “srcset” and “sizes” attributes based on the provided parameters                                              | See [Add thumbnail](../../../guides/plugins/plugins/storefront/use-media-thumbnails) guide for more information. |

## Functions

| Function       | Description                                                                                                                                                    | Notes                                                                                             |
|:---------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------|
| `config`       | Gets a value from the system config (used by plugins and global settings) for the given sales channel                                                          | See [Reading the configuration values](../../../guides/plugins/apps/configuration)                |
| `theme_config` | Gets a value from the current theme                                                                                                                            | See [Theme configuration](../../../guides/plugins/themes/theme-configuration)                     |
| `sw_block`     | Renders a block of the same or another file with support for multi inheritance. The is the same like in Twig's default `block`                                 | See [Twig 3 documentation for `block`](https://twig.symfony.com/doc/3.x/functions/block.html)     |
| `sw_source`    | Prints the content of a template file with support for multi inheritance. The is the same like in Twig's default `source`                                      | See [Twig 3 documentation for  `source`](https://twig.symfony.com/doc/3.x/functions/source.html)  |
| `sw_include`   | Renders the content of another template file with support for multi inheritance. The is the same like in Twig's default `include` and the new `sw_include` tag | See [Twig 3 documentation for `include`](https://twig.symfony.com/doc/3.x/functions/include.html) |

## Filter

| Filter              | Description                                                                                                                                                             | Notes                                                                                                                                                           |
|:--------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `replace_recursive` | Enables recursive replacement in addition to twig's default `replace` filter                                                                                            | To see an example, see the guide on [add custom JavaScript](../../../guides/plugins/plugins/storefront/add-custom-javascript)                                   |
| `currency`          | Adopts currency formatting: The currency symbol and the comma setting.                                                                                                  | ---                                                                                                                                                             |
| `sw_sanitize`       | Filters tags and attributes from a given string. By default, twig's auto escaping is on, so this filter explicitly allows basic HTML tags like &lt;i%gt;, &lt;b&gt;,... | ---                                                                                                                                                             |
| `sw_convert_unit`   | Convert between measurement units                                                                                                                                       | Available since 6.7.1.0, to see examples, see the [adr on the measurement system](../../../resources/references/adr/2025-05-12-implement-measurement-system.md) |

## Extensions

| Extension                     | Description                                                                                                         | Notes                                                                                               |
|:------------------------------|:--------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| `sw_breadcrumb_full()`        | Returns all categories defined in the breadcrumb as an array                                                        | Contains functionalities of `sw_breadcrumb_types` and `sw_breadcrumb_build_types`                   |
| `sw_breadcrumb()`             | Returns the category tree as array. Entry points of the SalesChannel \( e.g. footer, navigation\) are filtered out. | Deprecated in 6.5.0                                                                                 |
| `sw_breadcrumb_types()`       | Yields the types of the categories within the breadcrumb                                                            | Deprecated in 6.5.0                                                                                 |
| `sw_breadcrumb_build_types()` | returns the same as sw\_breadcrumb\_types, only without another repository call                                     | Deprecated in 6.5.0                                                                                 |
| `seoUrl()`                    | Returns seo URL of given route                                                                                      | ---                                                                                                 |
| `searchMedia()`               | Resolves media ids to media objects                                                                                 | See [Add media](../../../guides/plugins/plugins/storefront/use-media-thumbnails) guide for details. |
| `rawUrl()`                    | Returns full URL                                                                                                    | ---                                                                                                 |
