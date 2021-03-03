# Fetch a single category

`POST /category/{categoryId}` | CategoryRoute

This endpoint returns information about the category, as well as a fully resolved (hydrated with mapping values) CMS page, if one is assigned to the category. You can pass slots which should be resolved exclusively.

## Parameters

**Path**

**`categoryId`** | string | required  
Identifier of a category or string. Use the `"home"` alias to fetch the root category for the sales channel.

**Body**

`slots` | string | optional  
Slot ids that should be resolved exclusively. Separate multiple slot ids using a `|` character.

[`includes`](../../../../guides/integrations-api/general-concepts/search-criteria.md#includes-apialias) | object | optional  

## Returns

Returns a category object.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "parentId": "845170a6041f4b76bad7bd2de47b7aae",
  "autoIncrement": 3,
  "mediaId": "6b83840ed4b14cf7835e3a689e910970",
  "name": "Electronics",
  "breadcrumb": [ ... ],
  "path": "|845170a6041f4b76bad7bd2de47b7aae|",
  "level": 2,
  "active": true,
  "childCount": 11,
  "displayNestedProducts": true,
  "parent": null,
  "children": null,
  "translations": null,
  "media": { ... },
  "products": null,
  "nestedProducts": null,
  "afterCategoryId": "221eb39cde6449fea27636f5f2912cab",
  "customFields": null,
  "tags": null,
  "cmsPageId": "7dd245b4d3664b7ab7ba8d7c17a8f119",
  "cmsPage": { ... },
  "productStreamId": null,
  "productStream": null,
  "slotConfig": null,
  "externalLink": null,
  "visible": true,
  "type": "page",
  "productAssignmentType": "product",
  "description": "Earum error veniam impedit eos esse accusamus. Rerum ut quia sint est fugiat voluptate sit. Et qui voluptas deleniti voluptas adipisci pariatur.",
  "metaTitle": null,
  "metaDescription": null,
  "keywords": null,
  "mainCategories": null,
  "seoUrls": [ ... ],
  "_uniqueIdentifier": "98ec6dcd360441f6b9153de99114a4ac",
  "versionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
  "translated": { ... },
  "id": "98ec6dcd360441f6b9153de99114a4ac",
  "parentVersionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
  "afterCategoryVersionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
  "apiAlias": "category"
}
```
{% endtab %}
{% endtabs %}

# Fetch a list of categories by criteria

`POST /category` | CategoryListRoute

Perform a filtered search for categories.

## Parameters

**Body**

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/search-criteria.md) | Criteria | optional  

## Returns

Returns a search result containing categories, aggregations and pagination properties.

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "total": 1,
  "aggregations": [],
  "page": 1,
  "limit": 10,
  "elements": [ ... ],
  "apiAlias": "dal_entity_search_result"
}
```
{% endtab %}
{% endtabs %}

# Fetch a navigation menu

`POST /navigation/{activeId}/{rootId}` | NavigationRoute

This endpoint returns a categories that can be used as a page navigation. You can either return them as a tree or as a flat list. You can also control the depth of the tree.

## Parameters

**Header**

`sw-include-seo-urls` | boolean | optional  
Fetch routes for every category. Default is `false`.

**Path**

**`activeId`** | uuid | required  
Id of the active category in the navigation tree (if not used, just set to the same as `rootId`.

**`rootId`** | uuid | required  
Id of the root category for your desired navigation tree. You can use it to fetch sub-trees of your navigation tree.

{% hint style="info" %}
Instead of passing **uuids**, you can also use one of the following **aliases** for the **`activeId`** and **`rootId`** parameters to get the respective navigations of your sales channel.
 
 * `main-navigation`
 * `service-navigation`
 * `service-navigation`

```
POST /navigation/main-navigation/main-navigation
```
{% endhint %}

**Body**

`buildTree` | boolean | optional  
Return the categories as a tree or as a flat list. Default is `true`.

`depth` | integer | optional  
Determines the depth of fetched navigation levels.  Default is `2`.

[`Search Criteria`](../../../../guides/integrations-api/general-concepts/search-criteria.md) | Criteria | optional  

## Returns

Returns a collection of categories.

{% tabs %}
{% tab title="200 OK" %}
```javascript
[
  {
    "parentId": "845170a6041f4b76bad7bd2de47b7aae",
    "autoIncrement": 2,
    "mediaId": "a555beb721004b8fbc89c3b38859d891",
    "name": "Toys, Garden & Electronics",
    "breadcrumb": [
      "Home",
      "Toys, Garden & Electronics"
    ],
    "path": "|845170a6041f4b76bad7bd2de47b7aae|",
    "level": 2,
    "active": true,
    "childCount": 7,
    "displayNestedProducts": true,
    "parent": null,
    "children": [ ... ],
    "translations": null,
    "media": { ... },
    "products": null,
    "nestedProducts": null,
    "afterCategoryId": null,
    "customFields": null,
    "tags": null,
    "cmsPageId": "50602872dd814fe282028a364b9d8be6",
    "cmsPage": null,
    "productStreamId": null,
    "productStream": null,
    "slotConfig": null,
    "externalLink": null,
    "visible": true,
    "type": "page",
    "productAssignmentType": "product",
    "description": "Quod vitae molestiae maxime consequatur atque ut alias. Debitis similique illo ratione facere provident cum. Dolor velit aspernatur facere consectetur vero quis dolores.",
    "metaTitle": null,
    "metaDescription": null,
    "keywords": null,
    "mainCategories": null,
    "seoUrls": [ ... ],
    "_uniqueIdentifier": "221eb39cde6449fea27636f5f2912cab",
    "versionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
    "translated": { ... },
    "id": "221eb39cde6449fea27636f5f2912cab",
    "parentVersionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
    "afterCategoryVersionId": "0fa91ce3e96a4bc2be4bd9ce752c3425",
    "apiAlias": "category"
  },
  { ... }
]
```
{% endtab %}
{% endtabs %}