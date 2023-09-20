# Add Custom Styling

## Overview

Quite often your plugin will have to change a few templates for the Storefront. Those might require custom styling to look neat, which will be explained in this guide.

## Prerequisites

You won't learn to create a plugin in this guide, head over to our [Plugin base guide](../plugin-base-guide) to create a plugin first, if you don't know how it is done yet. Also knowing and understanding [SCSS](https://sass-lang.com/documentation) will be quite mandatory to fully understand what is going on here.

Other than having those two requirements, nothing else is necessary for this guide.

## Adding \(S\)CSS files

By default, Shopware 6 is looking for a `base.scss` file in your plugin. To be precise, this file has to be inside the directory `<plugin root>/src/Resources/app/storefront/src/scss` in order to be properly found and loaded by Shopware.

So just try it out, create a `base.scss` file in the directory mentioned above.

Inside of the `.scss` file, we add some basic styles to see if it's actually working. In this example, the background of the `body` will be changed.

```css
// <plugin root>/src/Resources/app/storefront/src/scss/base.scss
body {
    background: blue;
}
```

### Adding variables

In case you want to use the same color in several places, but want to define it just one time, you can use variables for this.

Create a `abstract/variables.scss` file inside your `<plugin root>/src/Resources/app/storefront/src/scss` directory and define your background color variable.

```css
// <plugin root>/src/Resources/app/storefront/src/scss/abstract/variables.scss
// in variables.scss
$sw-storefront-assets-color-background: blue;
```

Inside your `base.scss` file you can now import your previously defined variables and use them:

```css
// <plugin root>/src/Resources/app/storefront/src/scss/base.scss
@import 'abstract/variables.scss';

body {
    background: $sw-storefront-assets-color-background;
}
```

This comes with the advantage that when you want to change this color for all occurrences, you only have to change this variable once and the hard coded values are not cluttered all over the codebase.

### Testing its functionality

Now you want to test if your custom styles actually apply to the Storefront. For this, you have to execute the compiling and building of the `.scss` files first. This is done by using the following command:

<Tabs>
<Tab title="Template">

```bash
./bin/build-storefront.sh
```

</Tab>
<Tab title="platform only (contribution setup)">

```bash
composer run build:js:storefront
```

</Tab>
</Tabs>

If you want to see all style changes made by you live, you can also use our Storefront hot-proxy for that case:

<Tabs>
<Tab title="Template">

```bash
./bin/watch-storefront.sh
```

</Tab>
<Tab title="platform only (contribution setup)">

```bash
composer run watch:storefront
```

</Tab>
</Tabs>

Using the hot-proxy command, you will have to access your store with the port `9998`, e.g. `domainToYourEnvironment.in:9998`.

That's it! Open the Storefront and see it turning blue due to your custom styles!
