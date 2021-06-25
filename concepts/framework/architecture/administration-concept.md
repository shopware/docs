# Administration

In this article, we'll get to know our Administration component and learn a lot of its main concepts. Along the way, you'll find answers to the following questions:

* What is the Administration and what's its main purpose?
* Which technologies are being used?
* How is the Administration structured?
* How is the Administration implemented inside the Platform?
* How is the Administration connected to other components?
* Which parts of the Core are being used?
* What are Modules, Pages and Components?
* How is the Administration handling Inheritance & ACL?

## Introduction

The Administration component is a Symfony bundle which contains a Single Page Application \(SPA\) written in JavaScript. It conceptually sits on top of our Core - similar to the [Storefront](storefront-concept.md) component. The SPA itself provides a rich user interface on top of a REST-API based communication. It communicates with the Core component through the Admin API & is an Interaction Oriented System following the example of the web components patterns - albeit through [Vue.js](https://vuejs.org/). Similar to the frameworks being used in the Storefront component, the Administration component uses SASS for styling purposes and [Twig.js](https://github.com/twigjs/twig.js/wiki) to offer templating functionalities. By default, Shopware 6 uses the [Vue I18n plugin](https://kazupon.github.io/vue-i18n/) in the Administration to deal with translation. Furthermore, [Webpack](https://webpack.js.org/) is being used to bundle and compile the SPA.

## Main concerns

As mentioned preliminary, the Administration component provides a SPA which communicates with the Core through the [Admin API](../../../concepts/api/admin-api.md). To summarize, its main concern is to provide a UI for all administrative tasks for a shop owner in Shopware. And to be more precise: It does not contain any business logic. Therefore, there is no functional layering, but a flat list of modules structured along the Core component and containing Vue.js web components. Every single communication with the Core can e.g. be inspected throughout the network activities of your browsers developer tools.

Apart from the - arguably most central - responsibility of creating the UI itself, which can be reached through `/admin` , the Administrations components implement a number of cross-cutting concerns. The most important are:

* **Providing inheritance**: As Shopware 6 offers a flexible extension system to develop own Apps, Plugins or Themes,

  one also has the opportunity to override or extend the Administration to fit needs. More information can be found in

  the [inheritance](administration-concept.md#inheritance) chapter of this article.

* **Data management**: The Administration displays entities of the Core component and handles the management of this

  data. So of course REST-API access is an important concern of [pages and views](administration-concept.md#modules-and-their-components) - where

  necessary. You will find many components working with in-memory representations of API-Data.

* **State management**: In contrast to the Core \(Backend\), the Administration is a long-running process contained in the

  browser. Proper state management is key here. There is a router present handling the current page selection. View and

  component rendering is done locally in relation to their parents. Therefore, each component manages the state of its

  subcomponents.

## Structure

Having said, that the main Vue.js application is wrapped inside a Symfony bundle, you'll find the specific SPA sources inside the Administration component in a specific sub-directory of `platform/src/Administration`. Therefore, the SPAs main entry point is: `./Resources/app/administration`. Everything else inside `platform/src/Administration` can be seen as wrapped configuration around the SPA. This bundles main concern is to set up the initial Routing \(`/admin`\) & the Administrations main template file, which initializes the SPA \(`./Resources/views/administration/index.html.twig`\) and to provide translation handling.

The `src` directory of the SPA below is structured along the three different use cases the Administration faces: Provide common functionality, an application skeleton and modules.

```bash
<platform/src/Administration/Resources/app/administration/src/>
|- app
|- core
|- module
```

* `app`: Contains the application basis for the Administration. Generally you will find framework dependant

  computational components here.

* `core`: Contains the binding to the Admin API and services.
* `module`: UI and state management of specific view pages, structured along the Core modules. Head to

  the [modules section](administration-concept.md#modules-and-their-components) to learn more about a modules structure.

## Modules and their components

One module represents a navigation entry in the Administrations main menu. Since the Administration is highly dependent on the Shopware eCommerce Core, the module names reappear in the Administration, albeit in a slightly different order. The main building block, which the Administration knows, is called `component`, adjacent to web components.

A `component` is the combination of styling, markup and logic. What a component does will not surprise you, if you already are familiar with the [MVC pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller). The role of the model and controller collapses into a single class though. The components Twig.js template is generally being rendered by a JavaScript \(`index.js`\) file and includes styling from a SCSS file. A template file also notifies the JavaScript, which then reacts to specific \(user\) interactions. Furthermore, components can be and often are nested. Our [Component Library](https://component-library.shopware.com/) will also give you an overview about our default components.

### General module structure

A `page` represents the entry point or the page that needs to be rendered and encapsulates views. A `view` is a subordinate part of the page that encapsulates components. A `component` can itself encapsulate different components, from this level on there is no distinction in the directory structure made.

At least one `page` is mandatory in each module. Though views and components can be present in the module a vast default component library is present to help with default cases.

```bash
|- page1
  |- view1
    |- component1
    |- component2
      |- subcomponent1
      |- …
  |- view2
    |- component3
    |- …
```

### Order module

Having a look at a more practical example, one can look closer at the order module. Typically, you'll find this structure alongside other modules. Especially, when it comes to creating pages or views for creating/editing, listing or viewing a specific entity. Please head to the [Add custom module](../../../guides/plugins/plugins/administration/add-custom-module.md) article if you want to learn more about adding your custom module with a Shopware plugin.

```bash
<platform/src/Administration/Resources/app/administration/src/module/sw-order/>
|- acl
|- component
  |- sw-order-address-modal
  |- …
|- page
  |- sw-order-create
  |- sw-order-detail
  |- sw-order-list
|- snippet  
|- state  
|- view
  |- sw-order-create-base
  |- sw-order-details-base
|- index.js
```

## Inheritance

To add new functionality or change the behavior of a existing component through plugins, you can either override or extend a component. The difference between the two methods is that with `Component.extend()` a new component is created. With `Component.override()`, on the other hand, the previous behavior of the component is simply overwritten.

Within plugins, you do have the following options, when it comes to adjusting existing components:

* Override a components logic
* Extend a components logic
* Customize a component template with Twig.js
* Extending methods and computed properties

You will find more information about customizing components of the administration in our guided articles:

{% page-ref page="../../../guides/plugins/plugins/administration/customizing-components.md" %}

## ACL in the Administration

The Access Control List or ACL in Shopware ensures that by default data can only be created, read, updated or deleted \( CRUD\), once the user has specific privileges for a module. Additionally, one can set up custom roles in the Administrations UI or develop individual privileges with plugins. These roles do have finely granular rights, which every shop operator can set up himself and can be assigned to users. By default, a module of the Administration has a directory called `acl` included. In this directory one will find specific mappings of privileges \(permissions for roles; additional permissions\) for the default roles: `viewer`, `editor`, `creator`, `deleter`. A more guided article about ACL can be found here:

{% page-ref page="../../../guides/plugins/plugins/administration/add-acl-rules.md" %}

