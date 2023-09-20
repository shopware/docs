---
nav:
  title: Add custom data to the search
  position: 310

---

# Add custom data to the search

## Overview

When developing a customization that has a frequently visited entity listing you're able to make use of an interesting opportunity: You can enable the user to take a shortcut finding his desired entry using the global search.

There are two different ways how the global search works:

* Global search without type specification
* Typed global search

They only differ in the API they use and get displayed in a slightly different way.

::: warning
Think twice about adding this shortcut because if every plugin adds their own search tag it gets cluttered.
:::

## Prerequisites

For this guide, it's necessary to have a running Shopware 6 instance and full access to both the files and a running plugin. See our plugin page guide to learn how to create your own plugins.

<PageRef page="../plugin-base-guide" />

In addition, you need a custom entity to add to the search to begin with. Head over to the following guide to learn how to achieve that:

<PageRef page="../plugin-base-guide" />

## Support custom entity via search API

To support an entity in the untyped global search the definition in the symfony container needs the tag `shopware.composite_search.definition`. The priority of the tag defines the order in the search order.

The typed global search needs an instance of the JavaScript class `ApiService` with the key of the entity in camelcase suffixed with `Service`. E.g. The service key is `yourCustomSearchService` when requesting a service for `your_custom_search`. Every entity definition gets automatically an instance in the injection container but can be overridden so there is no additional work needed.

## Support in the Administration UI

### Add search tag

The search tag displays the entity type that is used in the typed search and is a clickable button to switch from the untyped to the typed search. In order to add the tag, a service decorator is used to add a type to the `searchTypeService`:

```javascript
const { Application } = Shopware;

Application.addServiceProviderDecorator('searchTypeService', searchTypeService => {
    searchTypeService.upsertType('foo_bar', {
        entityName: 'foo_bar',
        entityService: 'fooBarService',
        placeholderSnippet: 'foo-bar.general.placeholderSearchBar',
        listingRoute: 'foo.bar.index'
    });

    return searchTypeService;
});
```

Let's take a closer look on how this decorator is used:

* The key and `entityName` is used as the same to change also existing types.
* The `entityService` is used for the typed search.
* This service can be overridden with an own implementation for customization.
* The `placeholderSnippet` is a translation key that is shown when no search term is entered.
* The `listingRoute` is used to show a link to continue the search in the module specific listing view.

### Add the search result item

By default, the search bar does not know how to display the result items, so a current search request will not show any result. In order to declare a search result view the `sw-search-bar-item` template has to be altered as seen below, starting with the template:

```twig
// <plugin root>/src/Resources/app/administration/src/app/component/structure/sw-search-bar-item/sw-search-bar-item.html.twig
{% block sw_search_bar_item_cms_page %}
    {% parent %}

    <router-link v-else-if="type === 'foo_bar'"
                 v-bind:to="{ name: 'foo.bar.detail', params: { id: item.id } }"
                 ref="routerLink"
                 class="sw-search-bar-item__link">
        {% block sw_search_bar_item_foo_bar_label %}
            <span class="sw-search-bar-item__label">
                <sw-highlight-text v-bind:searchTerm="searchTerm"
                                   v-bind:text="item.name">
                </sw-highlight-text>
            </span>
        {% endblock %}
    </router-link>
{% endblock %}
```

Here you see the changes in the `index.js` file:

```javascript
// <plugin root>/src/Resources/app/administration/src/app/component/structure/sw-search-bar-item/index.js
import template from './sw-search-bar-item.html.twig';

Shopware.Component.override('sw-search-bar-item', {
    template
})
```

The `sw_search_bar_item_cms_page` block is used as it is the last block, but it is not important which shopware type is extended as long as the vue else-if structure is kept working.

### Add custom show more results link

By default, the search bar tries to resolve to the registered listing route. If your entity can be searched externally you can edit the `sw-search-more-results` or `sw-search` components as well:

```twig
// <plugin root>/src/Resources/app/administration/src/app/component/structure/sw-search-more-results/sw-search-more-results.html.twig
{% block sw_search_more_results %}
    <template v-if="result.entity === 'foo_bar'">
        There are so many hits.
        <a :href="'https://my.erp.localhost/?q=' + searchTerm"
           class="sw-search-bar-item__link"
           target="_blank">
             Look it directly up
        </a>
        in the ERP instead.
    </template>
    <template v-else>
        {% parent %}
    </template>
{% endblock %}
```

See for the changes in the `index.js` file below:

```javascript
// <plugin root>/src/Resources/app/administration/src/app/component/structure/sw-search-more-results/index.js
import template from './sw-search-more-results.html.twig';

Shopware.Component.override('sw-search-more-results', {
    template
})
```

### Potential pitfalls

In case of a tag with a technical name with a missing translation, proceed like this:

```json
{
    "global": {
        "entities": {
            "my_entity": "My entity | My entities"
        }
    }
}
```

To change the color of the tag, or the icon in the untyped global search a module has to be registered with an entity reference in the module:

```javascript
Shopware.Module.register('any-name', {
    color: '#ff0000',
    icon: 'default-basic-shape-triangle',
    entity: 'my_entity',
})
```
