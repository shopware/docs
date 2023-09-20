# Customize Templates

## Overview

This guide will cover customizing Storefront templates with a plugin.

## Prerequisites

As most guides, this guide is built upon the [Plugin base guide](../plugin-base-guide), so you might want to have a look at it. Other than that, knowing [Twig](https://twig.symfony.com/) is a big advantage for this guide, but that's not necessary.

## Getting started

In this guide you will see a very short example on how you can extend a storefront block. For simplicity's sake, only the logo is replaced with a 'Hello world!' text.

### Setting up your view directory

First of all you need to register your plugin's own view path, which basically represents a path in which Shopware 6 is looking for template-files. By default, Shopware 6 is looking for a directory called `views` in your plugin's `Resources` directory, so the path could look like this: `<plugin root>/src/Resources/views`

### Finding the proper template

As mentioned earlier, this guide is only trying to replace the 'demo' logo with a 'Hello world!' text. In order to find the proper template, you can simply search for the term 'logo' inside of the `<shopware root>/src/Storefront` directory. This will eventually lead you to [this file](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/views/storefront/layout/header/logo.html.twig).

Overriding this file now requires you to copy the exact same directory structure starting from the `views` directory. In this case, the file `logo.html.twig` is located in a directory called `storefront/layout/header`, so make sure to remember this path.

::: info
There's a plugin out there called [FroshDevelopmentHelper](https://github.com/FriendsOfShopware/FroshDevelopmentHelper), that adds hints about template blocks and includes into the rendered HTML. This way it's easier to actually find the proper template.
:::

### Overriding the template

Now, that you've found the proper template for the logo, you can override it.

This is done by creating the very same directory structure for your custom file, which is also being used in the Storefront core. As you hopefully remember, you have to set up the following directory path in your plugin: `<plugin root>/src/Resources/views/storefront/layout/header` In there you want to create a new file called `logo.html.twig`, just like the original file. Once more to understand what's going on here: In the Storefront code, the path to the logo file looks like this: `Storefront/Resources/views/storefront/layout/header/logo.html.twig` Now have a look at the path being used in your plugin: `<plugin root>/src/Resources/views/storefront/layout/header/logo.html.twig`

Starting from the `views` directory, the path is **exactly the same**, and that's the important part for your custom template to be loaded automatically.

### Custom template content

It's time to fill your custom `logo.html.twig` file. First of all you want to extend from the original file, so you can override its blocks.

Put this line at the very beginning of your file:

```text
{% sw_extends '@Storefront/storefront/layout/header/logo.html.twig' %}
```

This is simply extending the `logo.html.twig` file from the Storefront bundle. If you would leave the file like that, it wouldn't change anything, as you're currently just extending from the original file with no overrides.

You want to replace the logo with some custom text though, so let's have a look at the original file. In there you'll find a block called `layout_header_logo_link`. Its contents then would create an anchor tag, which is not necessary for our case anymore, so this seems to be a great block to override.

To override it now, just add the very same block into your custom file and replace its contents:

```text
{% sw_extends '@Storefront/storefront/layout/header/logo.html.twig' %}

{% block layout_header_logo_link %}
    <h2>Hello world!</h2>
{% endblock %}
```

If you wanted to append your text to the logo instead of replacing it, you could add a line like this to your override: <code v-pre>{{ parent() }}</code>

And that's it already, you're done. You might have to clear the cache and refresh your storefront to see your changes in action. This can be done by using the command following command inside your command line:

```bash
./bin/console cache:clear
```

::: info
Also remember to not only activate your plugin but also to assign your theme to the correct sales channel by clicking on it in the sidebar, going to the tab Theme and selecting your theme.
:::

### Finding variables

Of course this example is very simplified and does not use any variables, even though you most likely want to do that. Using variables is exactly the same like in [Twig](https://twig.symfony.com/doc/3.x/templates.html#variables) in general, so this won't be explained here in detail. Still, this is how you use a variable: `{{ variableName }}`

But rather than that, how do you know which variables are available to use? For this case, you can just dump all available variables:

```text
{{ dump() }}
```

This `dump()` call will print out all variables available on this page.

::: info
Once again, the plugin called [FroshDevelopmentHelper](https://github.com/FriendsOfShopware/FroshDevelopmentHelper) adds all available page data to the Twig tab in the profiler, when opening a request and its details. This might help here as well.
:::

## Next steps

You are able to customize templates now, which is a good start. However, there are a few more things you should definitely learn here:

* [Adding styles](add-custom-styling)
* [Adding translations](add-translations)
* [Using icons](add-icons)
* [Using custom assets](add-custom-assets)
