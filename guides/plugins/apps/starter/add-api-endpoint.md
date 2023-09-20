# Starter Guide - Add an API Endpoint

::: info
Note that this guide relies on [App scripts](../app-scripts/), introduced from Shopware 6.4.8.0 version.
:::

This guide shows how you can add a custom API endpoint that delivers dynamic data starting from zero.

After reading, you will be able to:

* Create the basic setup of an app.
* Execute app scripts and use them to model custom logic.
* Fetch, filter, and aggregate data from Shopware.
* Consume HTTP parameters and create responses.

## Prerequisites

* A Shopware cloud store
* Basic CLI usage (creating files, directories, running commands)
* Installed and configured [shopware-cli](https://sw-cli.fos.gg/) tools
* General knowledge of [Twig Syntax](https://twig.symfony.com/)
* A text editor

## Create the app wrapper

We need to create the app "wrapper", the so-called app manifest within a new directory. Let's call that the project directory:

```text
MyApiExtension/
├─ manifest.xml
```

::: info
When using a self-hosted Shopware version, you can also create the project directory in the `custom/apps` directory of your Shopware installation. However, the descriptions in this guide apply to both Shopware cloud and self-hosted stores.
:::

Next, we will put our basic configuration into the file we just created.

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <name>MyApiExtension</name>
        <label>Topsellers API</label>
        <description>This app adds a Topseller API endpoint</description>
        <author>shopware AG</author>
        <copyright>(c) shopware AG</copyright>
        <version>1.0.0</version>
        <license>MIT</license>
    </meta>
    <permissions>
        <read>order</read>
        <read>order_line_item</read>
        <read>product</read>
    </permissions>
</manifest>
```

Besides some metadata, like a name, description, or version, this file contains permissions that the app requires.
We will need them later on when performing searches.

## Create the script

We will define our new API endpoint in a script file based on [App Scripts](./../app-scripts/).
There are specific directory conventions that we have to follow to register a new API endpoint script.
The prefix for our API endpoint is one of the following and cannot be changed:

| API        | API consumers / callers      | Prefix                |
|------------|------------------------------|-----------------------|
| Store API  | Customer-facing integrations | `/store-api/script/`  |
| Admin API  | Backend integrations         | `/api/script/`        |
| Storefront | Default Storefront           | `/storefront/script/` |

::: info
You might wonder why the Storefront shows up in that table. In Storefront endpoints, you can render not only JSON but also twig templates.
But use them with care - whenever you create a Storefront endpoint, your app will not be compatible with headless consumers.

Learn more about the different endpoints in [custom endpoints](../app-scripts/custom-endpoints)
:::

### Directory structure

In this example, we're going to create a Store API endpoint. We want to provide logic that returns the top-selling products for a specific category.
So let's use the following endpoint naming:

`/store-api/script/swag/topseller`

You see that we have added a custom subdirectory `swag` in the route.
This is a good practice because we can prevent naming collisions between different apps.
Slashes (or subdirectories) in the endpoint path are represented by a hyphen in the name of the directory that contains the script.

```text
MyApiExtension/
├─ Resources/
│  ├─ scripts/
│  │  ├─ store-api-swag-topseller/ <-- /store-api/script/swag/topseller
│  │  │  ├─ topseller-script.twig
├─ manifest.xml
```

This directory naming causes Shopware to expose the script on two routes:

* `/store-api/script/swag/topseller` and
* `/store-api/script/swag-topseller`

### Add custom logic and install

Let's start with a simple script to see it in action:

```twig
// Resources/scripts/store-api-swag-topseller/topseller-script.twig
{% block response %}
    {% set response = services.response.json({ test: 'This is my API endpoint' }) %}
    {% do hook.setResponse(response) %}
{% endblock %}
```

Next we will install the App using the Shopware CLI.

::: info
If this is your first time using the Shopware CLI, you have to [install](https://sw-cli.fos.gg/install/) it first. Next, configure it using the `shopware-cli project config init` command.
:::

Run this command from the root of the project directory.

```shell
shopware-cli project extension upload . --activate
```

This command will create a zip file from the specified extension directory (the one you are in), upload it to your configured store and activate it.

### Call the endpoint

You can call the endpoint using this curl command.

::: info
Follow this guide for more information on using the Store API : [Store API Authentication & Authorization](https://shopware.stoplight.io/docs/store-api/ZG9jOjEwODA3NjQx-authentication-and-authorisation)
:::

```shell
curl --request GET \
  --url http://<your-store-url>/store-api/script/swag/topseller \
  --header 'sw-access-key: insert-your-access-key'
```

which should return something like:

```json
{"apiAlias":"store_api_swag_topseller_response","test":"This is my API endpoint"}
```

However, instead of using curl, we recommend using visual clients to test the API - such as [Postman](https://www.postman.com/downloads/) or [Insomnia](https://insomnia.rest/download).

## Fill in the logic

For now, our script is not really doing anything. Let's change that.

```twig
// Resources/scripts/store-api-swag-topseller/topseller-script.twig
{% block response %}

    {% set categoryId = hook.request.categoryId %}

    {% set criteria = {
        aggregations: [
            {
                name: "categoryFilter",
                type: "filter",
                filter: [{
                    type: "equals",
                    field: "order.lineItems.product.categoryIds",
                    value: categoryId
                }],
                aggregation: {
                    name: "orderedProducts",
                    type: "terms",
                    field: "order.lineItems.productId",
                    aggregation: {
                        name: "quantityItemsOrdered",
                        type : "sum",
                        field: "order.lineItems.quantity"
                    }
                }
            }
        ]
    } %}

    {% set orderAggregations = services.repository.aggregate('order', criteria) %}

    {% set response = services.response.json(orderAggregations.first.jsonSerialize) %}

    {% do hook.setResponse(response) %}

{% endblock %}
```

What happened here?

We wrap everything in a block named `response`. That way, we will get access to useful objects and services, so we can build a response.

### Search criteria and fetching results

We start by reading the requested category id using `hook.request.categoryId`. In general, we can access post body parameters using `hook.request.*`.

In the following lines, we define a search criteria. The criteria contain a description of the data we want to fetch:

 1. First, we filter out all products not inside the category that was requested, using a filter aggregation.
 1. The following lines contain two further nested aggregations:
    1. The first one groups all products from all orders using their id.
    1. The second one sums up the number of ordered items in each order.

Ultimately, it gives a result of all products that have been ordered and the total ordered.

::: info
To learn more about the structure of search criteria, follow the link below:

[Search Criteria](./../../../integrations-api/general-concepts/search-criteria)
:::

We now send a request to the database to retrieve the result using:

```twig
{% set orderAggregations = services.repository.aggregate('order', criteria) %}
```

### Building the response

In the final step, we build the response. We use the `services.response.json()` method to convert the serialized json representation of our aggregation into a json response object named `response`.

```twig
{% set response = services.response.json(orderAggregations.first.jsonSerialize) %}
```

Finally, we just set the response of the hook to the result from above:

```twig
{% do hook.setResponse(response) %}
```

It is important to do all this within the `response` block of the twig script. Otherwise, you will get errors when calling the script.

### Installing the plugin

Next, we re-install our plugin using the same command as before:

```shell
shopware-cli project extension upload . --activate
```

::: warning
Remember, if you made changes to the `manifest.xml` file in the meantime, also pass the `--increase-version` parameter, else Shopware will not pick up the changes:

```shell
shopware-cli project extension upload . --activate --increase-version
```

:::

We can now call our endpoint again:

```shell
curl --request GET \
  --url http://<your-store-url>/store-api/script/swag/topseller \
  --header 'sw-access-key: insert-your-access-key'
```

and receive a different result:

```json
{
  "apiAlias": "store_api_swag_topseller_response",
  "buckets": [
    {
      "key": "0060b9b2b3804244bf8ba98cdad50234",
      "count": 3,
      "quantityItemsOrdered": {
        "extensions": [],
        "sum": 15
      },
      "apiAlias": "aggregation_bucket"
    },
    {
      "key": "a65d918f883c47778a65b73548f456ea",
      "count": 2,
      "quantityItemsOrdered": {
        "extensions": [],
        "sum": 3
      },
      "apiAlias": "aggregation_bucket"
    },
    {
      "key": "6b67935063c84bde8e9d86f25a47c69d",
      "count": 3,
      "quantityItemsOrdered": {
        "extensions": [],
        "sum": 8
      },
      "apiAlias": "aggregation_bucket"
    }
  ]
}
```

## Wrap-Up

This tutorial covered the basics of app development using app scripts and some filtering and aggregation logic.

In a proper app, you should consider the following points:

* Input parameter validation
* Format and limit the result
* Define an API contract (endpoint structure) first and build after that
* The search result does not show actual top sellers but just the quantity of products ordered

## Where to continue

* More on adding [custom endpoints](../app-scripts/custom-endpoints)
* See how you can use [Twig functions](../app-scripts/#extended-syntax) in app scripts
* Working with [DAL Aggregations](./../../../../resources/references/core-reference/dal-reference/aggregations-reference)
