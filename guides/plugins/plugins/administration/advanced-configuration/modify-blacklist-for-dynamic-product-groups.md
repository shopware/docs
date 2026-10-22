---
nav:
  title: Modify Dynamic Product Group Allowlists
  position: 20
---

# Modify Dynamic Product Group Allowlists

## Overview

The module "Dynamic product groups" includes a condition builder to configure your dynamic product groups.
The condition builder shows properties that belong to the general allowlist or the selected entity's allowlist.

Use the allowlist methods to show or hide properties in the Administration.

## Prerequisites

This guide **will not** explain in detail how to override an existing component.
For this guide you'll have to extend the component [sw-product-stream-field-select](https://github.com/shopware/shopware/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/module/sw-product-stream/component/sw-product-stream-field-select/index.js) though, since it's the one [actually checking for the properties in the computed property options](https://github.com/shopware/shopware/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/module/sw-product-stream/component/sw-product-stream-field-select/index.js#L41).

An example on how to override a component can be found [here](../module-component-management/customizing-components.md).

## Add a property to an allowlist

The computed property `options` checks each property with `isPropertyInAllowList`.
Add a property to an allowlist to make it selectable.

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/sw-product-stream-field-select/index.js
const { Component } = Shopware;
const configuredServices = new WeakSet();

Component.override('sw-product-stream-field-select', {
    computed: {
        options() {
            if (!configuredServices.has(this.conditionDataProviderService)) {
                this.conditionDataProviderService.addToEntityAllowList('category', ['breadcrumb']);
                configuredServices.add(this.conditionDataProviderService);
            }
            return this.$super('options');
        }
    }
});
```

This example adds `breadcrumb` to the category allowlist so that it can be selected for categories.

## Remove a property from an allowlist

A property checked by `isPropertyInAllowList` remains selectable while it belongs to either the general allowlist or its entity's allowlist.
Remove the relevant entries from both lists to hide it.

* The general allowlist applies to every entity that exposes the property.
* The entity allowlist applies to the selected entity.

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/sw-product-stream-field-select/index.js
const { Component } = Shopware;
const configuredServices = new WeakSet();

Component.override('sw-product-stream-field-select', {
    computed: {
        options() {
            if (!configuredServices.has(this.conditionDataProviderService)) {
                this.conditionDataProviderService.removeFromGeneralAllowList(['id']);
                this.conditionDataProviderService.removeFromEntityAllowList('category', ['id']);
                configuredServices.add(this.conditionDataProviderService);
            }
            return this.$super('options');
        }
    }
});
```

Removing `id` from both lists hides it for categories.
The general-list change also applies to other entities that expose `id`.

Each example is independent and assumes the default allowlists.

## Add properties to the general and entity allowlists

Add a property to the general allowlist to make it selectable for every entity that exposes that property.
Add a property to an entity allowlist to make it selectable for that entity.

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/sw-product-stream-field-select/index.js
const { Component } = Shopware;
const configuredServices = new WeakSet();

Component.override('sw-product-stream-field-select', {
    computed: {
        options() {
            if (!configuredServices.has(this.conditionDataProviderService)) {
                this.conditionDataProviderService.addToGeneralAllowList(['createdAt']);
                this.conditionDataProviderService.addToEntityAllowList('category', ['path']);
                configuredServices.add(this.conditionDataProviderService);
            }
            return this.$super('options');
        }
    }
});
```

Adding `createdAt` to the general allowlist makes it selectable for entities that expose that property; it is already allowed for products by default.
Adding `path` to the category allowlist makes that property selectable for categories.
