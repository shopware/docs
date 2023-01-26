# Guided Shopping Overview

Guided Shopping is the state-of-the-art new feature that seamlessly integrates into your Shopware system landscape and co-operates with your existing ecommerce infrastructure.

You can create interactive live video events for your customers straight from your Shopware website without having to switch between a presentation tool, video conferencing system, and store system. It is one sophisticated solution to highlight your products, engage your customers and reinforce brand loyalty.

![Untitled](../../../docs/.gitbook/assets/products-guidedShopping.png)

{% hint style="warning" %}
Guided Shopping is a commercial extension and is not available as open source.
{% endhint %}

## Prerequisites

Review the below minimum operating requirements before you install the Guided Shopping feature:

1. Instance of [Shopware 6](https://developer.shopware.com/docs/guides/installation/from-scratch)(version 6.4.18.0 and above).

  {% hint style="warning" %}
  Compliant Node.js version for PWA setup is v14.0.0 to v16.0.0.
  {% endhint %}

1. Instance of [Shopware PWA](https://github.com/vuestorefront/shopware-pwa)(version 1.2.0 and above).
1. Install and activate [PWA plugin](https://github.com/shopware/SwagShopwarePwa)(version 0.3.3 and above) in Shopware 6 instance.
1. Install [Mercure package](https://packagist.org/packages/symfony/mercure#v0.5.3)(version 0.5.3) in Shopware 6 instance.

    {% hint style="info" %}
    To install Mercure 0.5.3, use the following command:

    ```php
    composer require symfony/mercure ^0.5.3
    ```

    {% endhint %}

1. Install Mercure service with the below available options:
   * [Self-hosted installation](./selfHostedMercureInstallation.md).
   * [Cloud service](https://mercure.rocks/). Refer to the [basic configuration](./installation.md#basic-configuration-of-mercure-hub) section.
1. An account in [daily.co](http://daily.co/). Refer to [set up an account](./installation.md#set-up-an-account) section.
