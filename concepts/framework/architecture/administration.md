# Administration

In this article, we'll get to know our Storefront component and learn a lot of its main concepts. Along the way, you'll
find answers to the following questions:

- What is the Administration and what's its main purpose?
- Which technologies are being used?
- How is the Administration structured?
- How is the Administration implemented inside the Platform?
- How is the Administration connected to other components?
- Which parts of the Core are being used?
- What are Modules, Pages and Components?
- How is the Administration handling ACL and how is it fetching data?
- How is the Administration handling Feature Flags, Inheritance and Snippets?

## Introduction

The Administration component is a Symfony bundle which contains a Single Page Application (SPA) written in JavaScript.
It conceptually sits on top of our [Core](./core.md) - similar to the [Storefront](./storefront.md) component. The SPA
itself provides a rich user interface on top of a REST-API based communication. It communicates with the Core component
throughout the Admin API & is an Interaction Oriented System following the example of the web components patterns -
albeit through [Vue.js](https://vuejs.org/). Similar to the frameworks being used in the Storefront component, the
Administration component uses SASS for styling purposes and [Twig.js](https://github.com/twigjs/twig.js/wiki) to offer
templating functionalities. By default, Shopware 6 uses the [Vue I18n plugin](https://kazupon.github.io/vue-i18n/) in
the Administration to deal with translation. Furthermore, [Webpack](https://webpack.js.org/) is being used to bundle and
compile the SPA.

## Main concerns

As mentioned preliminary, the Administration component provides a SPA which communicates with the Core throughout the
[Admin API](./../../api/admin-api/README.md). To summarize, its main concern is to provide a UI for all administrative
tasks for a shop owner in Shopware. And to be more precise: It does not contain any business logic. Therefore, there is
no functional layering, but a flat list of modules structured along the Core component and containing Vue.js web
components. Every single communication with the Core can e.g. be inspected throughout the network activities of your
browsers developer tools.

Apart from the - arguably most central - responsibility of creating the UI itself the Administrations components
implement a number of cross-cutting concerns. The most important are:

- **Providing inheritance**: As Shopware 6 offers a flexible extension system to develop own Apps, Plugins or Themes,
  one also has the opportunity to override or extend the Administration to fit needs. More information can be found in
  the [inheritance](#inheritance) chapter of this article.
- **Data management**: The Administration displays entities of the Core component and handles the management of this
  data. So of course REST-API access is an important concern of [pages and views](#modules-and-their-components) - where
  necessary. You will find many components working with in-memory representations of API-Data.
- **State management**: In contrast to the Core (Backend), the Administration is a long-running process contained in the
  browser. Proper state management is key here. There is a router present handling the current page selection. View and
  component rendering is done locally in relation to their parents. Therefore, each component manages the state of its
  subcomponents.

## Structure

## Modules and their components

## Inheritance

## ACL in the Administration
