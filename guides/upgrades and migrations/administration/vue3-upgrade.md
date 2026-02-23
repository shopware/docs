---
nav:
  title: Vue 3 Upgrade
  position: 10

---

# Vue 3 Upgrade

## Introduction

The Shopware administration uses Vue.js `2`, which will reach its end of life (EOL) **on December 31st 2023**. To deliver up-to-date and maintainable software, the administration will use Vue.js `3` from Shopware version `6.6` and upwards. If you are unfamiliar with the changes from Vue.js `2` to Vue.js `3`, please refer to this [official guide](https://v3-migration.vuejs.org/).

## FAQ

Let's start with some frequently asked questions. These will also help you figure out if this upgrade affects you.

### Which extensions are affected by the Vue 3 upgrade?

App-based extensions aren't affected by these changes. However, if your extension is plugin-based and contains custom administration code, you likely need to do some refactoring.

### Are there any breaking changes I should be aware of?

Yes, Vue 3 introduced breaking changes. It's crucial to review the migration guide provided by Vue.js and this document for detailed information.

### What steps should I follow to upgrade my Shopware plugin to Vue 3?

Typically, the process involves updating your project dependencies and modifying your code to adhere to Vue 3's API changes. Consult the Vue 3 documentation and this document's step-by-step instructions.

### Can one plugin version be compatible with Shopware 6.5 and 6.6?

No, your plugin requires a new version in the Store. For instance, version `1.x` is for Shopware `6.5.x`, while version `2.0` is compatible with Shopware `6.6` and newer.

### How can I check if my Shopware extension is compatible with Vue 3?

You can verify compatibility by reviewing the extension's functionality and updating test suites according to this document.

### Do I need to rewrite my extension to upgrade to Vue 3?

While some changes are required, a complete rewrite is not necessary. The amount of effort is dictated by your use of Vue's internal API.

### Are tools or libraries available to facilitate the migration to Vue 3?

Yes, there are tools and migration helpers that can automate certain aspects of the upgrade process. You could start by enabling the Vue 3 rule set of `eslint`.

### Where can I find support and community discussions about updating Shopware plugin to Vue 3?

You can participate in discussions and seek help on the Shopware community Discord. There is a dedicated channel for this topic called `#shopware-development`.

## External resources

Here is a handpicked selection of external resources. This list provides a handy reference, granting you access to all the essential materials you might need.

- [Vue 3 migration guide](https://v3-migration.vuejs.org)
- [Vue 3 breaking changes](https://v3-migration.vuejs.org/breaking-changes/)
- [Vue router migration guide](https://router.vuejs.org/guide/migration/)
- [Vue test utils migration guide](https://test-utils.vuejs.org/migration/)

## Step-by-step guide

To follow along, you should have the following:

- the latest Shopware `trunk` or an official release candidate
- installed and activated your plugin
- a running administration watcher (`composer run watch:admin`)

### Update your plugin npm dependencies

Make sure to align your `package.json` dependencies with the [administration](https://github.com/shopware/shopware/blob/trunk/src/Administration/Resources/app/administration/package.json).

### Check your templates

For your templates to work correctly, perform the following in no specific order:

- Replace all `sw-field` usages with the corresponding [components](https://github.com/shopware/shopware/blob/6.5.x/src/Administration/Resources/app/administration/src/app/component/form/sw-field/index.js#L16).
- [Check all v-models](https://v3-migration.vuejs.org/breaking-changes/v-model.html)
- [Check event listeners](https://v3-migration.vuejs.org/breaking-changes/v-model.html#_3-x-syntax)
- [Check for deprecated slot syntax](https://eslint.vuejs.org/rules/no-deprecated-slot-attribute.html)
- [Check router-view transition combinations](https://router.vuejs.org/guide/migration/#-router-view-keep-alive-and-transition-)
- [Check your key attributes](https://v3-migration.vuejs.org/breaking-changes/key-attribute.html)
- [Check for filter usages](https://v3-migration.vuejs.org/breaking-changes/filters.html)

### Check your code

Most of your code should be unaffected by the upgrade. You can start by searching for `this.$`. The usage of `this.$` is an indicator of Vue's internal API. These calls are very likely to break except for `this.$tc`.

If you have a lot of Vue internal API calls, check out the [Known issues section](#known-issues).
The best way to find errors is to test your application thoroughly, either by hand or automated.

## Known issues

### Lifecycle hooks

Lifecycle hooks such as `@hook:mounted` may be triggered multiple times if the component is loaded asynchronously. Vue 3 will emit the hook for the `AsyncComponentWrapper` and the underlying component. You can only use those hooks if your code allows to be executed multiple times.

### Using slots programmatically

It is no longer sufficient to check if `this.$slots` has a property with the slot name to see if that slot exists. Instead, you must verify if your `slotName` contains an actual `v-node`.

### this.$parent

`this.$parent` is prone to errors because Vue 3 wraps the `AsyncWrapperComponent` around asynchronous components. Leading to the virtual dom tree to differ from Vue 2 to Vue 3. Where in Vue 2, a `this.$parent` call was successful, in Vue 3, a `this.$parent.$parent` may be necessary.
Try to avoid `this.$parent` communication wherever possible as this is an anti pattern. Use services or event communication instead.

### Vue dev tools performance

Vue dev tools causes massive performance issues with huge Vue 3 applications.
There is an open [issue on Github](https://github.com/vuejs/devtools-v6/issues/1875) with next to no activity from the maintainers.

### v-model changes

`v-model` has several breaking changes. Please consider the official [guide](https://v3-migration.vuejs.org/breaking-changes/v-model.html)

### vuex reactivity

Vuex stores lose reactivity if one or more getters alter state data. For more context, see [here](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactivity-fundamentals).

### Form field id's

Fields in the administration no longer have the previous ID almost exclusively used in tests. To fix any failing test, add the `name` attribute to your field with a unique identifier.

### Prop default

Prop default functions no longer have access to the component's `this` scope. You can no longer call `this.$tc` in default functions. Use `Shopware.Snippet.tc` instead.

### Mutating props

This is an antipattern also for Vue 2. In Vue 2, however, those mutations were not always detected. In Vue 3, this will fail with hard errors. Take a look at this [example](https://eslint.vuejs.org/rules/no-mutating-props.html) to get a basic understanding of how to avoid mutating props directly.

## Conclusion

This document emphasizes the crucial need to upgrade your Shopware extensions to Vue.js 3 as Vue.js 2 reaches its end of life on December 31st 2023. Here's a concise recap of the key points:

- **Transition to Vue 3**: Shopware will adopt Vue.js 3 from version 6.6 onwards.
- **FAQ**: Addressing frequently asked questions:
  - **Extension Compatibility**: Plugin-based extensions with custom administration code are primarily affected. App-based extensions remain unaffected.
  - **Breaking Changes**: Vue 3 introduces significant modifications, necessitating review through the Vue.js migration guide.
  - **Migration Steps**: Adapting your Shopware plugin to Vue 3 involves aligning dependencies and adhering to Vue 3's API changes, following the Vue 3 documentation.
- **Dual Compatibility**: For plugins serving both Shopware 6.5 and 6.6, separate versions are required.
- **Support**: Find support in the Shopware community Discord channel #shopware-development.
