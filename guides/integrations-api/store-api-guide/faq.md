# FAQ

**How do I fetch associations to my Store API request?**

> Sometimes the standard response from Store API requests is not enough for your use case - for example when fetching an order you'd like to retrieve line items or images for a product. Just add those as an `associations` parameter.
>
> ```javascript
> {
>     "associations": {
>         "lineItems": {}
>     }
> }
> ```

**How can I check whether I'm currently logged in?**

> The least you need in order to have a logged in is a `sw-context-token` header. In order to check whether you're actually logged in call the following endpoint
>
> ```text
> GET /store-api/account/customer
> ```
>
> If you're logged in, you should see user related information, it not the response will contain a `403 Forbidden - CHECKOUT__CUSTOMER_NOT_LOGGED_IN` response exception.

**Is there an SDK for the Store API?**

> In fact, there's a Javascript SDK which has been built as part of the Shopware PWA platform. Feel free to use it in any other Javascript-based projects - [https://www.npmjs.com/package/@shopware-pwa/shopware-6-client](https://www.npmjs.com/package/@shopware-pwa/shopware-6-client)

**My customFields only contain IDs and not the objects?**

> Oftentimes, custom fields are used to persist data \(such as images or files\) along with products or categories. However, Shopware doesn't hydrate these as objects when products are fetched, because it cannot ensure that they are valid references or objects. Custom fields can contain any value and are only hydrated by the admin panel for management purposes. If you want to fetch the object \(e.g. a media object\) instead you can either [decorate the corresponding service](../../plugins/plugins/plugin-fundamentals/adjusting-service.md) or add these entities as an association using an [entity extension](../../plugins/plugins/framework/data-handling/add-complex-data-to-existing-entities.md).

