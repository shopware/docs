# Starter Guide - Add an API endpoint

This guide shows, how you can add a custom API endpoint that delivers dynamic data starting from zero.
After reading, you will be able to

 * Create the basic setup of an App
 * Execute app scripts and use them to model custom logic
 * Consume HTTP parameters and create responses

## Prerequisites

 * A Shopware cloud store
 * Basic CLI usage (creating files, directories, running commands)
 * Installed shopware-cli tools
 * Twig Syntax
 * A text editor

## Create the App Wrapper

We need to create the app "wrapper", the so-called app manifest within a new directory. Let's call that the project directory.

```
MyApiExtension/
├─ manifest.xml
```

{% hint style="info" %}
When you are using a self-managed Shopware Version, you can also create the project directory in the `custom/apps` directory of your Shopware installation. However, the descriptions in this guide apply to both Shopware cloud and self-managed stores.
{% endhint %}

Next, we're gonna put our basic configuration into the file we just created.

{% code title="manifest.xml" %}
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
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
{% endcode %}

Besides some metadata, like a name, description or a version, this file contains permissions that the app requires.
We will need them later on when performing searches.

## Create the script

We are going to define our new API endpoint in a script file based on [App Scripts](./../app-scripts/).
There are specific directory conventions that we have to follow in order to register a new API endpoint script.
The prefix for our API endpoint is one of the following and cannot be changed:

| API        | API consumers / callers      | Prefix                |
|------------|------------------------------|-----------------------|
| Store API  | Customer-facing integrations | `/store-api/script/`  |
| Admin API  | Backend integrations         | `/api/script/`        |
| Storefront | Default Storefront           | `/storefront/script/` |

{% hint style="info" %}
You might wonder why the storefront shows up in that table. In storefront endpoints you can not only render JSON, but also twig templates.
But use them with care - whenever you create a Storefront endpoint, your app will not be compatible with headless consumers.   
{% endhint %}

### Directory structure

In this example, we're going to create a Store API endpoint. We want to provide logic that returns the top-selling products for a specific category.
So let's use the following endpoint naming:

`/store-api/script/swag/topseller`

You see that we've added a custom subdirectory `swag` in the route.
This is a good practice, because we can prevent naming collisions between different apps. 
Slashes (or subdirectories) in the endpoint path are represented by a hyphen in the name of the directory that contains the script.

```
MyApiExtension/
├─ Resources/
│  ├─ scripts/
│  │  ├─ store-api-swag-topseller/ <-- /store-api/script/swag/topseller
│  │  │  ├─ topseller-script.twig
├─ manifest.xml
```

### Add custom logic and install

Let's start with a simple script to see it in action:

{% code title="Resources/scripts/store-api-swag-topseller/topseller-script.twig" %}
```twig
{% block response %}
    {% set response = services.response.json({ test: 'This is my API endpoint' }) %}
    {% do hook.setResponse(response) %}
{% endblock %}
```
{% endcode %}

Next we will install the App using the Shopware CLI.

Run this command from the root of the project directory.

```shell
shopware-cli project extension upload . --activate
```

This command will create a zip file from the specified extension directory (the one you are in), upload it to your configured store and activate it.

### Call the endpoint

You can call the endpoint using this curl command.

{% hint style="info" %}
Follow this guide for more information on using the Store API

[**Store API Authentication & Authorization**](https://shopware.stoplight.io/docs/store-api/ZG9jOjEwODA3NjQx-authentication-and-authorisation)
{% endhint %}

```shell
curl --request GET \
  --url http://<your-store-url>/store-api/script/swag/topseller \
  --header 'sw-access-key: insert-your-access-key'
```

which should return something like:

```json
{"apiAlias":"store_api_swag_topseller_response","test":"This is my API endpoint"}
```

However, instead of using curl we recommend using visual clients to test the API - such as [Postman](https://www.postman.com/downloads/) or [Insomnia](https://insomnia.rest/download).

## Fill in the logic

For now, our script is not really doing anything. Let's change that.

{% code title="Resources/scripts/store-api-swag-topseller/topseller-script.twig" %}
```twig
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

    {% set orderResult = services.repository.search('order', criteria) %}

    {% set response = services.response.json(orderResult.aggregations.first.jsonSerialize) %}

    {% do hook.setResponse(response) %}
{% endblock %}
```
{% endcode %}

What happened here? 

We wrap everything in a block named `response`. That way we will get access to useful objects and services, so we can build a response.

### Search criteria and fetching results

We start by reading the requested category id using `hook.request.categoryId`. In general, we can access post body parameters using `hook.request.*`.

In the following lines, we define a search criteria.
The criteria contains a description of the data we want to fetch:

 1. First, we filter out all products that are not inside the category that was requested using a filter aggregation.
 2. The following lines contain two further nested aggregations:
    1. The first one groups all products from all orders using their id.
    2. The second one sums up the number of ordered items in each order.

Ultimately, that will give us a result of all products that have been ordered along with how many were ordered in total.

{% hint style="info" %}
To learn more about the structure of search criterias follow the link below:

[Search Criteria](./../../../integrations-api/general-concepts/search-criteria.md)
{% endhint %}

We now send a request to the database to retrieve the result using

```twig
{% set orderResult = services.repository.search('order', criteria) %}
```

### Building the response

In the final step, we build the response. We don't want to return the entire result, but just the result of the aggregation.

```twig
{% set response = services.response.json(orderResult.aggregations.first.jsonSerialize) %}
```

So we take the first aggregation of our result (which is the one containing all products with their quantities), convert it to JSON and write it into a `response` variable.
Afterwards we just set the response of the hook to the result from above and we're done:

```twig
{% do hook.setResponse(response) %}
```

It is important to do all this within the `response` block of the twig script. Otherwise you will get errors when calling the script.

### Installing the plugin

Next, we re-install our plugin using the same command as before

```shell
shopware-cli project extension upload . --activate
```

Remember, if you made changes to the `manifest.xml` file in the meantime, also pass the `--increase-version` parameter - otherwise Shopware will not pick up the changes:

```shell
shopware-cli project extension upload . --activate --increase-version
```

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
			"key": "6b67935063c84bde8e9d86f25a47c69d",
			"count": 3,
			"quantityItemsOrdered": {
				"extensions": [],
				"sum": 8
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
    ]
}
```

## Wrap-Up

This tutorial covered the basics of app development using app scripts and some filtering and aggregation logic.

Steps like input parameter validation or result formatting were left out to keep the guide short and concise.

## Where to continue

 * App Scripts Custom Endpoints
 * Twig functions (app scripts)
 * Search Criteria
 * DAL Aggregationss