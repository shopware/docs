# Community Edition

## Overview

The Community Edition is an open-source, basic variant of Shopware, free for everyone to use. All other Shopware offerings, such as  [PaaS](paas/) and [SaaS](saas.md) are based upon the Community Edition.

## Running Shopware

In general, there are several options to run Shopware, as explained in the [Installation](../guides/installation/README.md) section. Also, find the [system requirements](../guides/installation/requirements.md) needed for running Shopware as a PHP application built upon Symfony.

## Platform components

The Shopware Platform itself is a Symfony application which consists of several components developed as Symfony bundles. Each of these components is mirrored to a dedicated repository and also included in the Shopware Platform mono repository. For the time being, there is the Core component, which includes the framework and business logic, as well as the APIs. The [Storefront](../guides/plugins/plugins/storefront/) component is a default frontend for your Storefront built upon the Bootstrap toolkit and Twig templates. A Vue.js SPA [Administration](../concepts/framework/architecture/administration-concept.md) component wrapped inside a Symfony bundle is a default Administration panel for all back-office tasks and communicates via the [Admin API](../concepts/api/admin-api.md) with the Core component. Last but not least, the Elasticsearch component gives you the opportunity to improve the indexing of entities and also contains an adapter for the entity search.

With these components stored inside many repositories, one can also enable Shopware to be used for headless scenarios. With the help of the [Production repository](https://github.com/shopware/production), you do have the opportunity to only require the repositories you really want to have in your project through the `composer.json` file \(e.g. only require `shopware/core`\).

## Features

Rather than listing all features from a user perspective below, we would like to mention a few key features that are also worth looking at in a more technical way. As Shopware 6 is built with the API first approach, your first technical feature touch points might be our different APIs built in our Core component.

The **Admin API** is used to work on all Administration tasks and is connected to our Administration component \( Vue.js SPA\). This Admin API gives you the opportunity to interact with every single entity resource of Shopware and it also ships with another endpoint, the **Sync API**. Its main purpose is to perform bulk write and delete operations within one single request via `UPSERT/DELETE`. Further conceptual information to our Admin API can be found [here](../concepts/api/admin-api.md). Now that you already know our Admin API, it is also interesting to learn about our [Store API](../concepts/api/store-api.md), which was built for a different use case. The **Store API** should be used when developing customer-facing clients. Within these endpoints, you do have the opportunity to cover the complete customer journey - starting from a product listing, showing product information and, of course, placing an order through the checkout. Not only our [Storefront](../guides/plugins/plugins/storefront/) components make use of these routes, but also the [Shopware PWA](pwa.md), which is a Vue.js client developed with our partner Vue Storefront.

Another feature worth mentioning is our CMS integration called *Shopping experiences*, which lets you build custom pages for different page types like listing, shop pages, landing pages and product detail pages. As this *Shopping Experiences* feature is also a built-in feature available through the Administration panel, you can easily drag and drop predefined \(and even custom\) blocks to your page layout. From a technical perspective, it is also important to know that this translatable content is stored in a generic way and is also available throughout the Store API. There is also a [conceptual article](../concepts/commerce/core/shopping-experiences-cms.md) covering this topic more specifically.

Shopware also has a custom built-in **ORM**, called [Data Abstraction Layer](../concepts/framework/data-abstraction-layer.md), which offers several features, like e.g., API endpoint generation for your entities. Our rule engine, called [Rule builder](../concepts/framework/rules.md), is a big feature that lets you create global rules with several conditions, which can be used and applied in several modules to e.g. configure the availability of promotion codes, shipping methods, payment methods or even product prices.

Last but not least, there is a most important technical feature, which gives you the power to create your custom ideas without touching the Shopware core. Every single feature above can be extended and customized with the help of **Extensions**. Throughout this [Extension system](../concepts/extensions/) one is able to create own [Plugins](../concepts/extensions/plugins-concept.md), [Themes](../guides/plugins/themes/README.md), or even [Apps](../concepts/extensions/apps-concept.md), for your Shopware project.

## Repository structure

Shopware 6 consists of multiple repositories bundled inside a [Mono repository](https://www.atlassian.com/git/tutorials/monorepos) called [shopware/platform](https://github.com/shopware/platform). This is where the Shopware core is developed. You need it as a dependency in your projects and this is where you can participate in the development of Shopware through pull requests. It is split into multiple repositories for production setups. All of them are read-only and include Core, Storefront, Administration, and Elasticsearch. Besides that, there is also a `Recovery` directory, which provides the opportunity to interactively update, install and maintain Shopware throughout the browser. To start developing with Shopware 6, refer to the [Installation](../guides/installation/README.md) section for an overview of the supported development environments.

<YoutubeRef video="oPf4-8eU8jQ" title="Backend Development -  Overview of platform bundles - YouTube" target="_blank" />

::: info
This video is part of our online training, the [Backend Development](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma) available on Shopware Academy for **free**.
:::

## Contribution

Shopware 6 is a community-driven platform with a lot of contributions, and we really appreciate your support. To ensure the quality of our code, our products and our documentation, we have created a small guideline for contributing [Code](../resources/guidelines/code/contribution.md) and contributing to the [Docs](../resources/guidelines/documentation-guidelines/README.md) we all should endorse to. It helps you and us to collaborate with our software. Following these guidelines will help us to integrate your changes in our daily workflow.
