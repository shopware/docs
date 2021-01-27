# Community Edition

## Intro

The **Community Edition** is the open source, basic variant of Shopware which is free for everyone to use. All other
Shopware editions, such as [Professional](../professional-edition.md), [Enterprise](../enterprise-edition)
and [Cloud](../../cloud-1.md) are based upon the Community Edition and include plugins, which are only available in
these editions.

## Running Shopware

There are several opportunities running Shopware in general. This does not only match the Community Edition, but also
the Professional Edition and Enterprise Edition. When speaking of the Community Edition let's be more precise talking
about the Shopware Platform, which can be included inside
several [setup templates](../../../guides/installation/overview.md#setup-templates) or can be shipped as a
One-Click-Installer. Of course, there are other operation forms like Docker, Vagrant, Valet+, which are explained in
the [installation guide](../../../guides/installation) section. Inside that section you will also find
the [system requirements](../../../guides/installation/overview.md#prerequisites) needed for running Shopware as a PHP
application built upon Symfony.

## Platform components

The Shopware Platform itself is a Symfony application which consists of several components developed as Symfony bundles.
Each of these components is available throughout a many repository and is included in the Shopware Platform. For the
time being, there is the [Core](../../../concepts/framework/architecture/core.md) component, which includes the
framework and business logic, as well as the APIs.
The [Storefront](../../../concepts/framework/architecture/storefront.md)
component is a default frontend for your storefront built upon the Bootstrap toolkit and Twig templates. A Vue.js
SPA [Administration](../../../concepts/framework/architecture/administration.md) component wrapped inside a Symfony
bundle is a default administration panel for all back-office tasks and communicates via the
[Admin API]() with the Core component. Last but not least, there is
the [Elasticsearch](../../../concepts/framework/architecture/elasticsearch.md)
component, which gives you the opportunity to improve indexing of entities and also contains an adapter for the entity
search. A guide for an Elasticsearch integration can be
found [here](../../../guides/hosting/performance/elasticsearch.md).

Having these components stored inside many repositories, one can also enable Shopware being used for headless scenarios.
With the help of the [Production repository](https://github.com/shopware/production), you do have the opportunity to
only require the repositories you really want to have in your project through the `composer.json` file (e.g. only
require `shopware/core`).

## Features

## Customize Shopware

## Contribution

## Repository structure
