---
nav:
  title: Extending Services
  position: 100

---

# Extending services

## Overview

This guide will teach you how to extend a Shopware provided service with middleware and decorators.
The Shopware 6 Administration uses [BottleJS](https://github.com/young-steveo/bottlejs) to provide the framework for services.
If you want to learn how to create your own services, look at [this guide](./add-custom-service).

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Reset Providers

The [`resetProviders`](https://github.com/young-steveo/bottlejs#resetprovidersnames) function is used to reset providers for the next reference to re-instantiate the provider.
You need to do this to add decorators or middleware to Shopware provided services, after they are initially instantiated in the Shopware boot-process.

```javascript
Shopware.Application.$container.resetProviders()
```

If the `names` param is passed, it will only reset the named providers.

## Adding decorators

[BottleJS decorators](https://github.com/young-steveo/bottlejs#decorators) are just simple functions that intercept a service in the provider phase after it has been created, but before it is accessed for the first time.
The function should return the service or another object to be used as the service instead.

With Shopware you have to reset the providers before extending Service.

Let's look at an example:

```javascript
Shopware.Application.$container.resetProviders();

Shopware.Application.addServiceProviderDecorator('acl', (aclService) => {
  aclService.foo = 'bar';
  console.log(aclService);
  return aclService;
});
```

## Adding middleware

[BottleJS middleware](https://github.com/young-steveo/bottlejs#middleware) are similar to decorators, but they are executed every time a service is accessed from the container.
They are passed the service instance and a `next` function:

As mentioned before with Shopware you have to reset the providers, before extending Service.

Let's look at an Example:

```javascript
Shopware.Application.$container.resetProviders();

Shopware.Application.addServiceProviderMiddleware('acl', (service, next) => {
    console.log('ACL service gets called');
    next();
});
```
