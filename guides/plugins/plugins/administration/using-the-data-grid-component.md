---
nav:
  title: Using the data grid component
  position: 230

---

# Using the data grid component

## Overview

The data grid component makes it easy to render tables with data. It also supports hiding columns or scrolling horizontally when many columns are present. This guide shows you how to use it.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line and preferably registered module. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Creating a template for the data grid component

Let's create the simplest template we need in order to use the [`sw-data-grid`](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/component/data-grid/sw-data-grid/index.js).

```html
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-example/swag-example.html.twig
<div>
    <sw-data-grid :dataSource="dataSource" :columns="columns">
    </sw-data-grid>
</div>
```

This template will be used in a new component. Learn how to override existing components [here](customizing-components) .

## Declaring the data

Since this is a very basic example the following code will just statically assign data to the `dataSource` and `columns` data attribute. If you want to load data and render that instead, please consult the guide [How to use the data handling](using-data-handling)

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-example/index.js
import template from 'swag-example.html.twig';

Shopware.Component.register('swag-basic-example', {
    template,

    data: function () {
        return {
            dataSource: [
                { id: 'uuid1', company: 'Wordify', name: 'Portia Jobson' },
                { id: 'uuid2', company: 'Twitternation', name: 'Baxy Eardley' },
                { id: 'uuid3', company: 'Skidoo', name: 'Arturo Staker' },
                { id: 'uuid4', company: 'Meetz', name: 'Dalston Top' },
                { id: 'uuid5', company: 'Photojam', name: 'Neddy Jensen' }
            ],
            columns: [
                { property: 'name', label: 'Name' },
                { property: 'company', label: 'Company' }
            ],
        };
    }
});
```

## More interesting topics

* [Using base components](using-base-components)
