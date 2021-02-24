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

## Structure

## Modules and their components

## Inheritance - adjust components

## ACL in the Administration
