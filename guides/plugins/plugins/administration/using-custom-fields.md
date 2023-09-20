---
nav:
  title: Using custom fields
  position: 300

---

# Using custom fields

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module in your own plugin. Don't know how to create an own plugin yet? Head over to the following guide:

<PageRef page="../plugin-base-guide" />

In order to craft your module, you will need to create lots on own components. If you're not sure about how to do that, take a look at the corresponding guide:

<PageRef page="add-custom-component" />

In addition, of course you need an entity with custom fields to be able to add those custom fields to your module to begin with. Here you can learn how to add your custom fields:

<PageRef page="../framework/custom-field/add-custom-field" />

## Using custom fields in your module

In Shopware, we provide an own component called `sw-custom-field-set-renderer` for your template, being tailored specifically to display custom field sets.

As a consequence, you're able to use this component to display your custom fields. See here:

```html
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/swag-basic-example.html.twig
<sw-card title="Custom fields">
    <sw-custom-field-set-renderer
        :entity="customEntity"
        showCustomFieldSetSelection
        :sets="sets">
    </sw-custom-field-set-renderer>
</sw-card>
```

For further details on the `sw-custom-field-set-renderer` component, feel free to refer to its page in our component library:

<PageRef page="https://component-library.shopware.com/components/sw-custom-field-set-renderer" title="Homepage - Shopware Component library" target="_blank" />

The next step is loading your custom fields. First things first, create a variable for your custom fields in `data`:

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/index.js
    data() {
        return {
            ...
            yourCustomFields: null
        };
    }
```

Afterwards, you can start to integrate the custom field data into your component. Therefore, you need to create a `customFieldSetRepository` first as `computed` property. In this context, it may come in handy to already set the `customFieldSetCriteria`. Both steps can be seen in the example below:

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/index.js
computed: {
    // Using the repository to work with customFields
    customFieldSetRepository() {
        return this.repositoryFactory.create('custom_field_set');
    },

    // sets the criteria used for your custom field set
    customFieldSetCriteria() {
        const criteria = new Criteria();

        // restrict the customFieldSets to be associated with products
        criteria.addFilter(Criteria.equals('relations.entityName', 'product'));

        // sort the customFields based on customFieldPosition
        criteria
            .getAssociation('customFields')
            .addSorting(Criteria.sort('config.customFieldPosition', 'ASC', true));

        return criteria;
    }
}
```

Now you can access your custom fields, e.g. within a `method`. In order to achieve that, you can use the `search` method as you're used to working with repositories:

```javascript
    // this will fetch the customFieldSets
    this.customFieldSetRepository.search(this.customFieldSetCriteria, Shopware.Context.api)
        .then((customFieldSets) => {
            this.currencyCustomFields = customFieldSets;
        });
```
