# Admin API Reference

The Admin API contains endpoints to read, write and update every entity. Instead of providing a list of all endpoints, the generic behaviour of the API is described in our corresponding guide.

{% page-ref page="/guides/integrations-api/admin-api/README.md" %}

# Action Endpoints

In addition to all data-oriented endpoints, the Admin API has a list of endpoints used to execute business logic on the server. These endpoints are protected by user authentication and ACL.

{% hint style="info" %}
A list of these endpoints is currently not available, but you can find all endpoints by searching for `@Route("/api/_action` in the [`shopware/core`](/products/editions/community-edition.md) repository.

We are working having a documentation for you soon.
{% endhint %}

The endpoints include operations such as

* Transitioning an order state
* Clearing the cache
* Trigger indexing
* Calculate modified orders
* Manage plugins 
* Run migrations

Some of these endpoints have a corresponding [console command](/resources/references/core-reference/commands-reference.md).