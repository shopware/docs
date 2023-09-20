---
nav:
  title: Mixins
  position: 20

---

# Mixins

This is an overview of all the mixins provided by the Shopware 6 Administration. Mixins in the Shopware 6 Administration are essentially the same in default Vue. They behave generally the same as they do in Vue normally, differing only in the registration and the way mixins are included in a component. Learn more about them in the official [Vue documentation](https://vuejs.org/v2/guide/mixins.html).

If you want to learn how to use them in your plugin, take a look at this guide [here](../../../../guides/plugins/plugins/administration/using-mixins) or if you want to register your own mixin take a look at this [guide](../../../../guides/plugins/plugins/administration/add-mixins)

## Overview of all the mixins

| Name | Description | Link |
| :--- | :--- | :--- |
| `discard-detail-page-changes` | Mixin which resets entity changes on page leave or if the id of the entity changes. This also affects changes in associations of the entity | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/discard-detail-page-changes.mixin.js) |
| `listing` | Mixin which is used in almost all listing pages to for example keep track of the current page of the administration | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/listing.mixin.js) |
| `notification` | This mixin is used to create notifications in the administrations more easily | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/notification.mixin.js) |
| `placeholder` | Provides a function to localize placeholders | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/placeholder.mixin.js) |
| `position` | A Mixin which contains helpers to work with position integers | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/position.mixin.js) |
| `remove-api-error` | This mixin removes API errors e.g. after the user corrected a invalid input i.e. leaving the product name field blank | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/remove-api-error.mixin.js) |
| `ruleContainer` | Provides common functions between the `sw-condition-or-container` and the `sw-condition-and-container` | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/rule-container.mixin.js) |
| `salutation` | A common adapter for the `salutation` filter | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/salutation.mixin.js) |
| `sw-form-field` | This mixin is used to provide common functionality between form fields | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/form-field.mixin.js) |
| `sw-inline-snippet` | Makes it possible to use snippets inline | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/sw-inline-snippet.mixin.js) |
| `validation` | Is used to validate inputs in various form fields | [link](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/mixin/validation.mixin.js) |
