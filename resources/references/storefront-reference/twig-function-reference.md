# Shopware's twig functions

In Shopware, we extend Twig's functionality by custom ones. See our own actions below.

## Functions

| Function | Description | Notes |
| :--- | :--- | :--- |
| `sw_extends` | Inherits from another file with support for multi inheritance. The API is the same like in twigs default `extends` | --- |
| `sw_include` | Includes template partials with support for multi inheritance. The API is the same like in twigs default `include` | --- |
| `sw_icon` | Displays an icon from a given icon set | See [Add custom icon](../../../guides/plugins/plugins/storefront/add-icons#adding-icon) guide for details. |
| `sw_thumbnails` | Renders a  tag with correctly configured “srcset” and “sizes” attributes based on the provided parameters | See [Add thumbnail](../../../guides/plugins/plugins/storefront/use-media-thumbnails) guide for more information. |
| `sw_csrf` | Generates a valid CSRF token and inject it as a hidden input field to the form | More details in [CSRF protection](../../../guides/plugins/plugins/storefront/use-csrf-protection) guide. |
| `config` | Gets a value from the system config (used by plugins and global settings) for the given sales channel |  See [Reading the configuration values](../../../guides/plugins/apps/configuration) |
| `theme_config` | Gets a value from the current theme |  See [Theme configuration](../../../guides/plugins/themes/theme-configuration) |

## Filter

| Filter | Description | Notes |
| :--- | :--- | :--- |
| `replace_recursive` | Enables recursive replacement in addition to twig's default `replace` filter | To see an example, see the guide on [add custom JavaScript](../../../guides/plugins/plugins/storefront/add-custom-javascript) |
| `currency` | Adopts currency formatting: The currency symbol and the comma setting. | --- |
| `sw_sanitize` | Filters tags and attributes from a given string. | --- |

## Extensions

| Extension | Description | Notes |
| :--- | :--- | :--- |
| `sw_breadcrumb_full()` | Returns all categories defined in the breadcrumb as an array | Contains functionalities of `sw_breadcrumb_types` and `sw_breadcrumb_build_types` |
| `sw_breadcrumb()` | Returns the category tree as array. Entry points of the SalesChannel \( e.g. footer, navigation\) are filtered out. | Deprecated in 6.5.0 |
| `sw_breadcrumb_types()` | Yields the types of the categories within the breadcrumb | Deprecated in 6.5.0 |
| `sw_breadcrumb_build_types()` | returns the same as sw\_breadcrumb\_types, only without another repository call | Deprecated in 6.5.0 |
| `seoUrl()` | Returns seo URL of given route | --- |
| `searchMedia()` | Resolves media ids to media objects | See [Add media](../../../guides/plugins/plugins/storefront/use-media-thumbnails) guide for details. |
| `rawUrl()` | Returns full URL | --- |
