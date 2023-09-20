# Using base components

The Shopware 6 Administration comes with a bunch of tailored Vue components, already accessible in all of your templates via the `component registry`. This guide will show you how you can use Shopware-made components in your templates, if you want to learn more about the `component registry` and how you can register your own components to it have a look at the [corresponding guide](add-custom-component.md)

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module. Of course you'll have to understand JavaScript and have a basic familiarity with [Vue](https://vuejs.org/), the framework used in the Administration. However, that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Finding the base component needed

All Shopware 6 Administration components can be found in the [Component Library](https://component-library.shopware.com/). There you can see what each of the components does and looks like, it also shows you what props they can work with and which slots they have.

## Using the base component

As mentioned before in the introduction, all components used in the Shopware 6 Administration are first registered to the `component registry`. This `component registry` is just a map of all components, which then get registered to Vue during the `Administrations boot process`. Since all of the components are registered as [global `Vue` components](https://vuejs.org/v2/guide/components-registration.html#Global-Registration), they are accessible in all templates of the Administration.

Using base components in your own Administration templates is rather simple. In the example below we will use the `sw-text-field` in our template, which simply renders a `text` input tag, but also supports some fancy functionality, like inheritance, etc:

```html
// <plugin-root>/src/Resources/app/administration/app/src/component/example-component/example.html.twig
<div>
    <sw-text-field />
</div>
```

That's basically it. To continue building beautiful custom components, learn how to write templates and how to include them in your components [here](writing-templates.md)
