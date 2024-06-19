---
nav:
  title: Customize templates
  position: 10

---

# Customize Templates

## Overview

This guide will cover customizing Storefront templates using an app.

## Prerequisites

Before you begin, make sure you have:

* A basic understanding of [Shopware app development](../app-base-guide).
* Familiarity with the [Twig template](https://twig.symfony.com/) is beneficial.

## Getting started

This guide assumes you have already set up your Shopware app. If not, refer to the [app base guide](../app-base-guide) for the initial setup.

The following sections give you a very short example of how you can extend a storefront block. For simplicity's sake, only the page logo is replaced with a 'Hello world!' text.

### Setting up app's view directory

First of all, in your app's root, register your app's own view path, which basically represents a path in which Shopware 6 is looking for template-files. By default, Shopware 6 is looking for a directory called `views` in your app's `Resources` directory, so the path could look like this: `<app root>/Resources/views`

### Locating the template

As mentioned earlier, this guide is only trying to replace the 'demo' logo with a 'Hello world!' text. In order to find the proper template, you can simply search for the term 'logo' inside the `<shopware root>/src/Storefront` directory. This will eventually lead you to [this file](https://github.com/shopware/shopware/blob/v6.3.4.1/src/Storefront/Resources/views/storefront/layout/header/logo.html.twig).

::: info
There's a plugin out there called [FroshDevelopmentHelper](https://github.com/FriendsOfShopware/FroshDevelopmentHelper), that adds hints about template blocks and includes into the rendered HTML. This way, it's easier to actually find the proper template.
:::

### Overriding the template

Now that you have found the proper template for the logo, you can override it.

Overriding this file now requires you to copy the exact same directory structure starting from the `views` directory for your custom file. In this case, the file `logo.html.twig` is located in a directory called `storefront/layout/header`, so make sure to remember this path.

Finally, you have to set up the following directory path in your app: `<app root>/Resources/views/storefront/layout/header`. Next, create a new file called `logo.html.twig`, just like the original file. Once more to understand what's going on here: In the Storefront code, the path to the logo file looks like this: `Storefront/Resources/views/storefront/layout/header/logo.html.twig`. Now have a look at the path being used in your app: `<app root>/Resources/views/storefront/layout/header/logo.html.twig`

Starting from the `views` directory, the path is **exactly the same**, and that's the important part for your custom template to be loaded automatically.

### Customizing the template

First extend from the original file, to override its blocks. Now fill your custom `logo.html.twig` file.

Put this line at the very beginning of your file:

```twig
{% sw_extends '@Storefront/storefront/layout/header/logo.html.twig' %}
```

This is simply extending the `logo.html.twig` file from the Storefront bundle. If you would leave the file like that, it wouldn't change anything, as you are currently just extending from the original file with no overrides.

To replace the logo with some custom text, take a look at the block called `layout_header_logo_link` in the original file. Its contents create an anchor tag, which is not necessary for our case anymore, so this seems to be a great block to override.

To override it now, just add the very same block into your custom file and replace its contents:

```twig
{% sw_extends '@Storefront/storefront/layout/header/logo.html.twig' %}

{% block layout_header_logo_link %}
    <h2>Hello world!</h2>
{% endblock %}
```

If you wanted to append your text to the logo instead of replacing it, you could add a line like this to your override: <code v-pre>{{ parent() }}</code>

And that's it, you are done. However, you might have to clear the cache and refresh your storefront to see your changes in action. This can be done by using the following command:

```bash
./bin/console cache:clear
```

::: info
Also remember to not only activate your app but also to assign your theme to the correct sales channel by clicking on it in the sidebar, going to the tab Theme and selecting your theme.
:::

### Finding variables

Of course, this example is very simplified and does not use any variables, even though you most likely want to do that. Using variables is exactly the same as in [Twig](https://twig.symfony.com/doc/3.x/templates.html#variables) in general, so this won't be explained here in detail. However, this is how you use a variable: <code v-pre>{{ variableName }}</code>

But how do you know which variables are available to use? For this, you can just dump all available variables:

```twig
{{ dump() }}
```

This `dump()` call will print out all variables available on this page.

::: info
Once again, the plugin called [FroshDevelopmentHelper](https://github.com/FriendsOfShopware/FroshDevelopmentHelper) adds all available page data to the Twig tab in the profiler, when opening a request and its details. This might help here as well.
:::
