# Injecting services

## Overview

This short guide will teach you how to use a service in the Shopware 6 Administration.

Along these lines, this chapter will cover the following topics:

* What is an Administration service?
* How to use a service?

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin.
Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Definition of an Administration service

Shopware 6 uses [bottleJS](https://github.com/young-steveo/bottlejs) to inject services.
Services are small self-contained utility classes, like the [repositoryFactory](https://github.com/shopware/shopware/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/core/data-new/repository-factory.data.js), which provides a way to talk to the API.

## Injection of a service

A service is typically injected into a vue component and can simply be referenced in the `inject` property.
This service is then available via its name on the object instance.

```javascript
Shopware.Component.register('swag-basic-example', {
    // inject the service
    inject: ['repositoryFactory'],

    created() {
        // insatiate the injected repositoryFactory 
        this.productRepository = this.repositoryFactory.create('product')
    }
});
```
