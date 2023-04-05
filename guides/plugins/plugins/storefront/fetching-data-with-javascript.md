---
nav:
  title: Fetching data with Javascript
  position: 140

---

# Fetching Data with Javascript

## Overview

When you develop your own plugin, you might want to fetch necessary data from the API. This guide explains how to achieve that.

## Prerequisites

This guide requires you to already have a basic plugin running. If you don't know how to do this in the first place, have a look at our [Plugin base guide](../plugin-base-guide).

While this is not mandatory, having read the guide about [adding custom javascript](add-custom-javascript) plugins beforehand might help you understand this guide a bit further.

## Fetching data

At first, we need to import the `HttpClient` to use it in our JavaScript plugin. We also create a new instance of the `HttpClient` and assigned it to a variable in our `ExamplePlugin`.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';

export default class ExamplePlugin extends Plugin {
    init() {
        this._client = new HttpClient();
    }
}
```

To fetch data from the API, we now can use the `get` method of the `HttpClient` to invoke a get request.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';

export default class ExamplePlugin extends Plugin {
    init() {
        this._client = new HttpClient();

        this.fetchData();
    }

    // ...

    fetchData() {
        this._client.get('/widgets/checkout/info', this.handleData);
    }

    handleData(response) {
        console.log(response);
    }
}
```

The `get` method takes three arguments. The first one is the `url` which we want to call. In the example we are going to fetch a widget which contains some HTML. The second parameter is a `callback` function. It will be invoked when the API call was done. In the example below we pass in the `handleData` method of our plugin. The callback function then receives the `response` of the API call. We can now use this in our plugin to display the widget in the DOM, for example.

The third parameter of the `get` method is the `contentType` which will be sent in the request header of the API call. It is optional and by default set to be `application/json`.

## Call the Store API from the Storefront

There's an extension of the client above - the `StoreApiClient` which automatically injects the correct credentials, so you can make calls from the Storefront to the [Store API](../../../../concepts/api/store-api).

It works the same as the `HttpClient`:

```javascript
const client = new StoreApiClient();

import Plugin from 'src/plugin-system/plugin.class';
import StoreApiClient from 'src/service/store-api-client.service';

export default class ExamplePlugin extends Plugin {
    init() {
        this._client = new StoreApiClient();

        this.fetchData();
    }

    fetchData() {
        this._client.get('store-api/checkout/cart', this.handleData);
    }

    // ...
}
```

::: info
To see a list of available endpoints in our Store API, head to the [Store API Endpoint Reference](https://shopware.stoplight.io/docs/store-api).
:::
