---
nav:
  title: Categories
  position: 20

---

# Categories

Categories in Shopware organize products, drive storefront navigation, and define SEO-relevant URLs. The entire catalog lives in one category tree, and every sales channel chooses entry points inside that tree. For how to use the Admin UI, see the [user documentation on categories](https://docs.shopware.com/en/shopware-6-en/catalogues/categories) and [Dynamic Product Groups](https://docs.shopware.com/en/shopware-6-de/Catalogues/Dynamicproductgroups). This page focuses on developer details.

![category](../../../assets/concept-categories.png)

## Category model and tree

- Each category stores `parentId`, `path`, and `level` to build breadcrumbs, infer inheritance, and traverse efficiently.
- Flags:
  - `active` determines whether the category participates in navigation and listings.
  - `visible` and `hideInNavigation` control menu rendering without disabling the category entirely.
- Types:
  - `page`: regular category (listing or landing page).
  - `folder`: structuring element; not rendered as a page and typically used to group children.
  - `link`: redirects to an external URL or internal static link.

## Entity associations and database schema

```mermaid
erDiagram
    CATEGORY ||--o{ CATEGORY_TRANSLATION : translations
    CATEGORY }o--|| CMS_PAGE : cms_page
    CATEGORY }o--|| PRODUCT_STREAM : product_stream
    CATEGORY ||--o{ PRODUCT_CATEGORY : products
    PRODUCT ||--o{ PRODUCT_CATEGORY : categories
    SALES_CHANNEL }o--|| CATEGORY : navigation_roots
    CATEGORY ||--o{ SEO_URL : seo_urls
```

- `category`: tree structure plus `cmsPageId` for layout inheritance; `productAssignmentType` controls explicit vs. stream-based listings.
- `category_translation`: localized names, breadcrumbs, links, and SEO text.
- `product_category`: explicit product links used for listings when not driven by a product stream.
- `product_stream`: dynamic filters attached to a category when assignments are stream-based.
- `cms_page`: CMS layout referenced by categories (inherited when missing).
- `sales_channel`: entry categories (`navigation`, `footer`, `service`) anchoring storefront menus.
- `seo_url`: generated URLs per category and sales channel domain, rebuilt by the SEO indexer.

## Sales channel entry points and navigation

Every [Sales Channel](sales-channels) defines `navigation`, `footer`, and `service` entry categories. The storefront builds menus from the children of those entry points, inheriting explicit assignments from lower levels.

Store API endpoints:

- `/store-api/navigation/{activeId}/{rootId}` for hierarchical menus.
- `/store-api/category/{navigationId}` for category details including assigned CMS layout data.

Navigation responses are cached. Adjust cache identity or tags via `NavigationRouteCacheKeyEvent` and `NavigationRouteCacheTagsEvent`. Use `NavigationLoadedEvent` to enrich or modify the tree before it is returned.

::: info
Categories can be hidden from navigation via the hide-in-navigation flag while remaining reachable by direct URL if they are still `active`.
:::

## Product assignments and Dynamic Product Groups

- Explicit assignments: stored in `product_category` (and `product_category_tree` for inherited links) to put category IDs directly on products.
- Dynamic Product Groups (product streams): attached to a category to evaluate saved filters at runtime and automate listings (for example, brand filters or price ranges). See the [user docs](https://docs.shopware.com/en/shopware-6-de/Catalogues/Dynamicproductgroups) for configuration guidance.

Both assignment types are merged for a category listing. `ProductListingRoute` builds the listing criteria from the category configuration, sales channel, and request filters. Extend or alter the listing query with `ProductListingCriteriaEvent`.

## CMS layout integration

Categories can reference a [CMS layout](../content/shopping-experiences-cms.md). Layout selection is inherited: if `cmsPageId` is missing, the parent layout is used. Category-specific slot configuration is stored on the category and merged at runtime, so one layout can serve many categories with different media and copy. `folder` categories ignore layouts; `link` categories redirect immediately.

## SEO and URLs

Per-category SEO fields include `metaTitle`, `metaDescription`, `keywords`, `seoUrl`, and robot flags (`noIndex`, `noFollow`). SEO URLs are generated from templates under *Settings → SEO* and are rebuilt when categories change or when the SEO indexer runs.

- Customize URL templates (e.g., include the breadcrumb) and priorities per sales channel domain.
- React to regenerated URLs via `SeoUrlUpdateEvent`, or enqueue additional updates when categories are changed programmatically.
- Emit canonical links when rendering custom category pages.

### Which categories receive SEO URLs

Category SEO URLs come from `NavigationPageSeoUrlRoute`, which serves the route `frontend.navigation.page` and uses `navigationId` as the path parameter. Its default template is `{% for part in category.seoBreadcrumb %}{{ part }}/{% endfor %}`. For the general route mechanism, see [Add custom SEO URLs](../../../guides/plugins/plugins/content/seo/add-custom-seo-url.md).

The route limits URL generation as follows:

- Only categories with `active` set to `true` are loaded.
- Categories of type `folder` are excluded. The route's criteria don't exclude other types, including `link`.
- The sales channel's `navigation`, `footer`, or `service` entry category must be the category itself or one of its ancestors. The route checks them in that order. Otherwise, the mapping carries the error `Category is not available for sales channel`, and no SEO URL is written for that sales channel.
- `seoBreadcrumb` leaves out the entry category and every category above it. With the default template, the entry category itself renders an empty path, so it gets no SEO URL.

When a category no longer passes the `active` or `folder` filter, its existing SEO URLs are marked as deleted. A category that is loaded but has a mapping error or an empty rendered path isn't marked as deleted; no new SEO URL is written for it.

A template rendering error is logged as a warning. The category is then yielded with an error and an empty path, so no SEO URL is written for it, and it isn't marked as deleted. For sales channels of the API (headless) type, URLs are generated only if the sales channel has a domain flagged as an external storefront for the current language.

## Extensibility and events

- `NavigationLoadedEvent`: navigation tree loaded; enrich or adjust nodes.
- `SalesChannelCategoryIdsFetchedEvent`: category IDs resolved for a sales channel.
- `CategoryIndexerEvent`: keep de-normalized data or external search indices in sync.
- `ProductListingCriteriaEvent`: customize listing filters, sorting, and aggregations for category pages.
- `SeoUrlUpdateEvent`: observe or react to SEO URL regeneration.

Categories are fully extensible via custom fields or entity extensions. Expose custom data through Store API response extensions when it is needed in storefronts or external channels.
