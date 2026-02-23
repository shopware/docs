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

We will use the standard [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to gather additional data. The fetch API is a modern replacement for the old `XMLHttpRequest` object. It is a promise-based API that allows you to make network requests similar to XMLHttpRequest (XHR).

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
const { PluginBaseClass } = window;

export default class ExamplePlugin extends PluginBaseClass {
    init() {
        this.fetchData();
    }

    // ...

    async fetchData() {
        const response = await fetch('/widgets/checkout/info');
        const data = await response.text();

        console.log(data);
    }
}
```

In this example, we fetch the data from the `/widgets/checkout/info` endpoint. The `fetch` method returns a promise that resolves to the `Response` object representing the response to the request. We then use the `text` method of the `Response` object to get the response body as text.
