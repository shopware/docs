# Using custom fields

## Overview

Shopware's custom field system allows you to extend entities, without writing a complete entity extension.
This is possible by storing the additional data in a [JSON-Field](https://dev.mysql.com/doc/refman/8.0/en/json.html).
If you want to learn more about custom fields or even add your own custom fields to entities you might want to take a look at this guide: [Add custom input field to existing component](administration\add-custom-field.md).

This guide will cover how to write to custom fields with or without the `sw-custom-field-set-renderer`

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module. Of course you'll have to understand JavaScript and have a basic familiarity with VueJS. However, that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Preparing the template

First we are creating a template to use the `sw-custom-field-set-renderer`. You don't have to do this but it makes it easier to see the `custom fields`.


{% code title="<plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/swag-basic-example.html.twig" %}
```html 
<div>
    <sw-custom-field-set-renderer
        :entity="product"
        showCustomFieldSetSelection
        :sets="sets">
    </sw-custom-field-set-renderer>
    <button @click="save">Save</button>
</div>
```
{% endcode %}

## Loading the custom fields

The following code sample shows how to load and save the the custom field. This code sample is tailored to the `sw-custom-field-set-renderer`, but it's not essential to use the `sw-custom-field-set-renderer`. The custom fields are loaded automatically and it's possible to just modify the `custom-fields` without loading the schema in the `customFieldSets`, because the schema is just needed for display purposes.

{% code title="<plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/index.js" %}
```javascript
const { Criteria } = Shopware.Data;

Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            id: 'some-id',
            sets: [],
            product: {},
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },

        productCriteria() {
            const criteria = new Criteria();
 
            criteria.addAssociation('customFieldSets')

            return criteria;
        },

        customFieldSetRepository() {
            return this.repositoryFactory.create('custom_field_set');
        },

        customFieldSetCriteria() {
            const criteria = new Criteria(1, 100);

            // restrict the customFieldSets to be associated with products
            criteria.addFilter(Criteria.equals('relations.entityName', 'product'));
            
            // sort the customFields based on customFieldPosition
            criteria
                .getAssociation('customFields')
                .addSorting(Criteria.sort('config.customFieldPosition', 'ASC', true));

            return criteria;
        }
    },

    created: async function () {
        this.product = await this.fetchProducts();
        this.sets = await this.fetchCustomFields()
    },

    methods: {
        fetchProducts: async function () {
            
            // as noted before the custom fields are always attached to the entities
            return this.productRepository.get(this.id, Shopware.Context.api, this.productCritera);
        },

        fetchCustomFields: async function () {

            // this will fetch the customFieldSets, as noted before custom  fields can be edited without using the schema
            return this.customFieldSetRepository.search(this.customFieldSetCriteria, Shopware.Context.api);
        },

        save: function name() {

            // the product with the attached custom fields is saved here
            this.productRepository.save(this.product, Shopware.Context.api);
        }
    }
});
```
{% endcode %}