---
nav:
  title: Add custom data to the search
  position: 310

---

# Add custom data to the search

## Overview

When developing a customization that has a frequently visited entity listing, you're able to make use of an interesting opportunity: You can enable the user to take a shortcut finding his desired entry using the global search.

There are two different ways how the global search works:

* Global search without type specification
* Typed global search

They only differ in the API they use and get displayed in a slightly different way.

::: warning
Think twice about adding this shortcut because if every plugin adds their own search tag, it gets cluttered.
:::

## Prerequisites

For this guide, it's necessary to have a running Shopware 6 instance and full access to both the files and a running plugin. See our plugin page guide to learn how to create your own plugins.

<PageRef page="../../plugin-base-guide" />

In addition, you need a custom entity to add to the search to begin with. Head over to the following guide to learn how to achieve that:

<PageRef page="../../framework/data-handling/add-custom-complex-data" />

## Support custom entity via search API

To support an entity in the untyped global search, the entity has to be defined in one of the Administration Modules.

<PageRef page="../module-component-management/add-custom-module.md" />

Add the `entity` and `defaultSearchConfiguration` values to your module to make it available to the search bar component.

```javascript
Shopware.Module.register('swag-plugin', {
    entity: 'swag_example',
    defaultSearchConfiguration: {
        _searchable: true,
        name: {
            _searchable: true,
            _score: 500,
        },
        description: {
            name: {
                _searchable: true,
                _score: 500,
            },
        },
    },
});
```

## Support in the Administration UI

### Add search tag

The search tag displays the entity type used in the typed search and is a clickable button to switch from the untyped to the typed search. To add the tag, a service decorator is used to add a type to the `searchTypeService`:

```javascript
const { Application } = Shopware;

Application.addServiceProviderDecorator('searchTypeService', searchTypeService => {
    searchTypeService.upsertType('foo_bar', {
        entityName: 'foo_bar',
        placeholderSnippet: 'foo-bar.general.placeholderSearchBar',
        listingRoute: 'foo.bar.index',
        hideOnGlobalSearchBar: false,
    });

    return searchTypeService;
});
```

Let's take a closer look at how this decorator is used:

* The key and `entityName` is used as the same to change also existing types.
* This service can be overridden with an own implementation for customization.
* The `placeholderSnippet` is a translation key that is shown when no search term is entered.
* The `listingRoute` is used to show a link to continue the search in the module-specific listing view.
* The `hideOnGlobalSearchBar` is used to determine whether the entity should be searched when searching globally untyped.

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
// <plugin root>/src/Resources/app/administration/src/main.js

Shopware.Component.override('sw-search-bar-item', () => import('./app/component/structure/sw-search-bar-item'));
```

```javascript
// <plugin root>/src/Resources/app/administration/src/app/component/structure/sw-search-bar-item/index.js
import template from './sw-search-bar-item.html.twig';

export default {
    template
};
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
// <plugin root>/src/Resources/app/administration/src/main.js

Shopware.Component.override('sw-search-more-results', () => import('./app/component/structure/sw-search-more-results'));
```

```javascript
// <plugin root>/src/Resources/app/administration/src/app/component/structure/sw-search-more-results/index.js
import template from './sw-search-more-results.html.twig';

export default {
    template
};
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

To change the color of the tag, or the icon in the untyped global search, a module has to be registered with an entity reference in the module:

```javascript
Shopware.Module.register('any-name', {
    color: '#ff0000',
    icon: 'default-basic-shape-triangle',
    entity: 'my_entity',
})
```
