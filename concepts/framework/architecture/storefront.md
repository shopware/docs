# Storefront

In this article, we'll get to know our Storefront component and learn a lot of its main concepts. Along the way, you'll
find answers to the following questions:

- What is the Storefront component & what's its main purpose?
- What technologies are being used?
- How is the Storefront structured?
- Which parts of other Platform components are being used?
- How does the composite data handling work?
- What's the definition & main purpose of Pages, Pagelets, Controllers and their corresponding Templates?
- How is the Storefront handling translations and assets?

## Introduction

The Storefront component is a Frontend written in PHP. It conceptually sits on top of our Core - similar to the
Administration component. As the Storefront can be seen as a classical PHP application, it makes usage of HTML
rendering, JavaScript and a CSS preprocessor. Speaking of technologies, the Storefront component uses Twig as the
templating engine and SASS for styling purposes. The foundation of the Storefront template is based on the Bootstrap
framework and therefore fully customizable.

## Main concerns

There are a few main concerns which the Storefront component has. To give you a brief summary, these main concerns are
listed below. Furthermore, we are diving deeper into these in the following chapters.

- Creating Pages and Pagelets
- Mapping requests to the Core
- Rendering templates
- Provide theming

Contrary to API calls that result in single resource data, a whole page in the Storefront displays multiple different
data sets on a single page. Think of partials, which lead to a single page being displayed. Imagine a page which
displays the order overview in the customer account environment. There are partials which are generic and will be
displayed on almost every page. These partials include for example Header and Footer information and are being wrapped
into a `GenericPage` as our so called `Pagelets` (`HeaderPagelet`, `FooterPagelet`). This very generic page will
afterwards be enriched with the specific information you want to display through a separate loader (e.g. a list of
orders).

To achieve getting information from a specific resource, the Storefronts second concern is to map requests to the Core.
Internally, the Storefront makes usages of our Store API routes to enrich the Page with additional information like e.g.
a list of orders, which is being fetched through the order route. Once all needed information were added to the page,
the corresponding page loader returns the page to a Storefront controller.

Contrary to the Core that can almost completely omit templating in favor JSON responses, the Storefront contains a rich
set of Twig templates to display a fully functional shop. Having said that, another concern of the Storefront is to
provide templating with Twig. The page object, which was enriched beforehand, will afterwards be passed to a specific
Twig page template throughout a controller. A more detailed look into an example can be found
in [Composite data handling](#composite-data-handling).

Last, but not least, the Storefront not only contains static templates but also inhibits a theming engine to modify the
rendered templates or change the default layout programmatically with your own Themes or Plugins.

## Structure

Depending on the repository you have chosen for your development environment, let's have a look at the Storefront's
component structure placed inside `platform/src/Storefront` (Development repository) or `vendor/shopware/storefront` (
Production repository). When opening this directory you will find several sub-directories & a vast part of the
functionality of the Storefront component includes templates (`./Resources`). But beside that, there are other
directories worth having a look at.

```bash
<platform/src/Storefront>
|- Controller
|- DependencyInjection
|- Event
|- Framework
|- Migration
|- Page
|- Pagelet
|- Resources
|- Test
|- Theme
|- .gitignore
|- composer.json
|- phpunit.xml.dist
|- README.md
|- Storefront.php
```

Starting at the top of this list, you'll find all Storefront controllers inside the `Controller` directory. As said
beforehand, a page is being built inside that controller with the help of the corresponding page loaders, pages,
pagelets and events, which you'll find in the directories: `Pages`, `Pagelets` and their sub-directories. Each
controller method will also give detailed information about its routing with the help of annotations. The
directory `DependencyInjection` includes all dependencies, which are used in the specific controllers. Whereas
the `Event` directory includes route request events, the `Framework` directory amongst other things includes the
Routing, Caching and furthermore. `Migration` and `Test` obviously include migrations and tests for our Storefront
component (e.g. tests for each Storefront controller).

Having a deeper look inside the vast templating functionalities inside `Resources`, you'll find these directories:

```bash
<platform/src/Storefront/Resources>
|- app
  |- administration
  |- storefront
|- config
|- snippet
|- views
  |- storefront
    |- block
    |- component
    |- element
    |- layout
    |- page
    |- section
    |- utilities
    |- base.html.twig
|- .browserlistrc
|- .gitignore
|- theme.json
```

The `app` directory includes assets, JavaScripts and Stylesheets for our default Theme shipped within the Storefront
component. If you are e.g. looking for the image zoom implementation of the product detail page, you'll have to have a
look at: `app/storefront/src/plugin/image-zoom`. Inside `config` one will find default configurations for caching,
routing and translation handling. Their corresponding default translations for our Storefront can be found
inside `snippet` within JSON files for each locale. Last but not least, all default Twig templates can be found
inside `./views/storefront`. This templating directory structure is considered best practice, if you are developing your
own Themes or Plugins. More information about writing your own Plugins and Themes can be found here.

## Composite data handling

## Translations and assets
