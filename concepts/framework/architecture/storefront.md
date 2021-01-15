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

## Composite data handling

## Translations and assets
