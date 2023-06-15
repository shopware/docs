# Fetching Data with Javascript

## Overview

When you develop your own plugin, you might want to fetch necessary data from the API. This guide explains how to achieve that.

## Prerequisites

This guide requires you to already have a basic plugin running. If you don't know how to do this in the first place, have a look at our [Plugin base guide](../plugin-base-guide.md).

While this is not mandatory, having read the guide about [adding custom javascript](add-custom-javascript.md) plugins beforehand might help you understand this guide a bit further.

## Fetching data

At first, we need to import the `HttpClient` to use it in our JavaScript plugin. We also create a new instance of the `HttpClient` and assigned it to a variable in our `ExamplePlugin`.

{% code title="<plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js" %}

```javascript
import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';

export default class ExamplePlugin extends Plugin {
    init() {
        this._client = new HttpClient();
    }
}
```

{% endcode %}

To fetch data from the API, we now can use the `get` method of the `HttpClient` to invoke a get request.

{% code title="<plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js" %}

```javascript
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

{% endcode %}

The `get` method takes three arguments. The first one is the `url` which we want to call. In the example we are going to fetch a widget which contains some HTML. The second parameter is a `callback` function. It will be invoked when the API call was done. In the example below we pass in the `handleData` method of our plugin. The callback function then receives the `response` of the API call. We can now use this in our plugin to display the widget in the DOM, for example.

The third parameter of the `get` method is the `contentType` which will be sent in the request header of the API call. It is optional and by default set to be `application/json`.
