# Custom Endpoints with App Scripts

If you want to execute some logic in Shopware and trigger the execution over an HTTP request or need some special data from Shopware over the API, you can create custom API endpoints in your app that allow you to execute a script when a request to that endpoint is made.

::: info
Note that custom endpoints with app scripts were introduced in Shopware 6.4.9.0 and are not supported in previous versions.
:::

## Custom Endpoints

There are specialized script-execution endpoints for the `api`, `store-api` and `storefront` scopes.
Refer to the [API docs](../../../integrations-api/README.md) for more information on the distinction of those APIs.
Those endpoints allow you to trigger the execution of your scripts with an HTTP request against those endpoints.

Custom endpoint scripts need to be located in a folder that is prefixed with the name of the api scope (one of `api-`, `store-api-` or `storefront`).
The remaining part of the folder name is the hook name.
You can specify which script should be executed by using the correct hook name in the URL of the HTTP request.

This means to execute the scripts under `Resources/scripts/api-test-script` you need to call the `/api/script/test-script` endpoint.
Note that all further slashes (`/`) in the route will be replaced by dashes (`-`). To execute the `Resources/scripts/api-test-script` scripts you could also call the `/api/script/test/script` endpoint.

::: warning
To prevent name collisions with other apps, you should always include your vendor prefix or app name as part of the hook name.
The best practice is to add your app name after the API scope prefix and then use it as a REST style resource identifier, e.g., `/api/script/swagMyApp/test-script`.
:::

In your custom endpoint scripts, you get access to the JSON payload of the request (and the query parameters for GET-requests) and have access to the read & write functionality of the [Data Abstraction Layer](../../../../concepts/framework/data-abstraction-layer.md).
For a complete overview of the available data and service, refer to the [hook reference documentation](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#api-hook).

By default, a `204 No Content` response will be sent after your script was executed.
To provide a custom response, you can use the [`response`-service](../../../../resources/references/app-reference/script-reference/custom-endpoint-script-services-reference.md#scriptresponsefactoryfacade) to create a response and set it as the `response` of the hook:

```twig
// Resources/scripts/api-custom-endpoint/my-example-script.twig
{% set response = services.response.json({ 'foo': 'bar' }) %}
{% do hook.setResponse(response) %}
```

You can execute multiple scripts for the same HTTP request by storing multiple scripts in the same order.
Those scripts will be executed in alphabetical order. Remember that later scripts may override the response set by prior scripts.
If you want to prevent the execution of further scripts, you can do so by calling `hook.stopPropagation`:

```twig
// Resources/scripts/api-custom-endpoint/my-example-script.twig
{% do hook.stopPropagation() %}
```

### Admin API endpoints

Scripts available over the Admin API should be stored in a folder prefixed with `api-`, so the folder name would be `api-{hook-name}`.
The execution of those scripts is possible over the `/api/script/{hook-name}` endpoint.

This endpoint only allows `POST` requests.

Caching of responses is not supported for Admin API responses.

For a complete overview of the available data and services, refer to the [reference documentation](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#api-hook).

### Store API endpoints

Scripts that should be available over the Store API should be stored in a folder prefixed with `store-api-`, so the folder name would be `store-api-{hook-name}`.
The execution of those scripts is possible over the `/store-api/script/{hook-name}` endpoint.

This endpoint allows `POST` and `GET` requests.

This hook is an [Interface Hook](./README.md#interface-hooks). The execution of your logic should be implemented in the `response` block of your script.

```twig
// Resources/scripts/store-api-custom-endpoint/my-example-script.twig
{% block response %}
    {% set response = services.response.json({ 'foo': 'bar' }) %}
    {% do hook.setResponse(response) %}
{% endblock %}
```

Caching of responses to `GET` requests is supported, but you need to implement the `cache_key` function in your script to provide a cache key for each response.
The cache key you generate should take every permutation of the request, which would lead to a different response into account and should return a unique key for each permutation.
A simple cache key generation would be to generate an `md5`-hash of all the incoming request parameters, as well as your hook's name:

```twig
// Resources/scripts/store-api-custom-endpoint/my-example-script.twig
{% block cache_key %}
    {% set cachePayload = hook.query %}
    {% set cachePayload = cachePayload|merge({'script': 'custom-endpoint'}) %}

    {% do hook.setCacheKey(cachePayload|md5) %}
{% endblock %}
```

For a complete overview of the available data and services, refer to the [reference documentation](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#store-api-hook).

### Storefront endpoints

Scripts available for the Storefront should be stored in a folder prefixed with `storefront-`, so the folder name would be `storefront-{hook-name}`.
The execution of those scripts is possible over the `/storefront/script/{hook-name}` endpoint.
Custom Storefront endpoints can be called by a normal browser request or from javascript via ajax.

This endpoint allows `POST` and `GET` requests.

Caching is supported and enabled by default for `GET` requests.

In addition to providing `JsonResponses` you can also render your own templates:

```twig
// Resources/scripts/storefront-custom-endpoint/my-example-script.twig
{% set product = services.store.search('product', { 'ids': [productId]}).first %}

{% do hook.page.addExtension('myProduct', product) %}

{% do hook.setResponse(
    services.response.render('@MyApp/storefront/page/custom-page/index.html.twig', { 'page': hook.page })
) %}
```

Additionally, it is also possible to redirect to an existing route:

```twig
// Resources/scripts/storefront-custom-endpoint/my-example-script.twig
{% set productId = hook.query['product-id'] %}

{% set response = services.response.redirect('frontend.detail.page', { 'productId': productId }) %}
{% do hook.setResponse(response) %}
```

For a complete overview of the available data and services, refer to the [reference documentation](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#storefront-hook).

## Caching

To improve the end-user experience and provide a scalable system, the customer-facing APIs (i.e., `store-api` and `storefront`) offer caching mechanism to cache the response to specific requests and return the response from the cache on further requests instead of computing it again and again on each request.

By default, caching is enabled for custom endpoints, but for `store-api` endpoints you have to generate the cache key in the script.
For `storefront` requests, however, shopware takes care of it so that responses get automatically cached (if the [HTTP-Cache](../../../../concepts/framework/http_cache.md) is enabled).

### Cache Config

You can configure the caching behavior for each response on the `response`-object in your scripts.

#### Add custom tags to the cache item

To allow fine-grained [cache invalidation](#cache-invalidation) you can tag the response with custom tags and then invalidate certain tags in a `cache-invalidation` script.

```twig
{% set response = services.response.json({ 'foo': 'bar' }) %}
{% do response.cache.tag('my-custom-tag') %}

{% do hook.setResponse(response) %}
```

#### Disable caching

You can opt out of the caching by calling `cache.disable()`. This means that the response won't be cached.

```twig
{% set response = services.response.json({ 'foo': 'bar' }) %}
{% do response.cache.disable() %}

{% do hook.setResponse(response) %}
```

#### Set the max-age of the cache item

You can specify for how long a response should be cached by calling the `cache.maxAge()` method and passing the number of seconds after which the cache item should expire.

```twig
{% set response = services.response.json({ 'foo': 'bar' }) %}
{% do response.cache.maxAge(120) %}

{% do hook.setResponse(response) %}
```

#### Invalidate cache items for specific states

You can specify that the cached response is not valid if one of the given states is present.
For more detailed information on the invalidation states, refer to the [HTTP-cache docs](../../../../concepts/framework/http_cache.md#sw-states).

```twig
{% set response = services.response.json({ 'foo': 'bar' }) %}
{% do response.cache.invalidationState('logged-in') %}

{% do hook.setResponse(response) %}
```

### Cache invalidation

To prevent serving stale cache items, the cache needs to be invalidated if the underlying data changes. Therefore, you can add `cache-invalidation` scripts, where you can inspect each write operation in the system and invalidate specific cache items by tag.

In your `cache-invalidation` scripts, you can get the `ids` that were written for a specific entity, e.g., `product_manufacturer`.

```twig
// Resources/scripts/cache-invalidation/my-invalidation-script.twig
{% set ids = hook.event.getIds('product_manufacturer') %}

{% if ids.empty %}
    {% return %}
{% endif %}
```

To allow even more fine-grained invalidation, you can filter down the list of written entities by filtering for specific actions that were performed on that entity (e.g., `insert`, `update`, `delete`) and filter by which properties were changed.

```twig
// Resources/scripts/cache-invalidation/my-invalidation-script.twig
{% set ids = hook.event.getIds('product') %}

{% set ids = ids.only('insert') %} // filter by action = insert
{% set ids = ids.with('description', 'parentId') %} // filter all entities were 'description` OR `parentId` was changed
{% if ids.empty %}
    {% return %}
{% endif %}
```

Note that you can also chain the filter operations:

```twig
// Resources/scripts/cache-invalidation/my-invalidation-script.twig
{% set ids = hook.event.getIds('product') %}

{% set ids = ids.only('insert').with('description', 'parentId') %}
{% if ids.empty %}
    {% return %}
{% endif %}
```

You can then use the filtered down list of ids to invalidate entity specific tags:

```twig
{% set tags = [] %}
{% for id in ids %}
    {% set tags = tags|merge(['my-product-' ~ id]) %}
{% endfor %}

{% do services.cache.invalidate(tags) %}
```

For a complete overview of what data and services are available, refer to the [cache-invalidation hook reference documentation](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#cache-invalidation).
