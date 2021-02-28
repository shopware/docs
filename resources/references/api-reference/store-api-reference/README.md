# Store API Reference

This endpoint reference contains an overview of all endpoints contained in the Shopware Store API.

{% hint style="danger" %}
As our software can be extended using apps and plugins, this reference only represents the **state of the Store API without extensions**.

The actual structure and functionality of the endpoints can differ from this reference if you are using extensions within your system.‌
{% endhint %}

### Helpful guides to read before using this reference <a id="helpful-guides-to-read-before-using-this-reference"></a>

* ​[Concept of the Store API](../../../../concepts/api/store-api.md)​
* ​[Common API Concepts](../../../../guides/integrations-api/general-concepts/README.md)​
* ​[Store API Guide](../../../../guides/integrations-api/store-api-guide/README.md)​

This reference contains endpoints and data schemas for our Store API. Each endpoint reference is structured in the same way.‌

See the below section for an exemplary endpoint description.‌

## Example endpoint <a id="example-endpoint"></a>

> The first line contains the HTTP method, the endpoint URL relative to the [base route](../../../../guides/integrations-api/store-api-guide/README.md#general) and the name of the corresponding route class within the [shopware/core](../../../../concepts/framework/architecture/core-concept.md) package.

`POST /product/{productId}` \| ProductDetailRoute

‌

### **Parameters** <a id="parameters"></a>

> The parameters section contains parameters of the endpoint. Depending on the endpoint parameters can be passed as a header, as a **query parameter** \(`?onlyAvailable=1` \), as a **route path parameter** \(`/product/{productId}` \) or \(for post requests\) as **body parameter.** The most common parameters are defined in the search criteria parameters, which can be passed in almost every list endpoint. More information about the [search criteria](../../../../guides/integrations-api/general-concepts/seach-criteria.md).

**Path**‌

**`navigationId`** \| uuid \| required  
Identifier of a product. If it points to a "parent" product, it returns the cheapest variant of that product.‌

**Body**‌

​[**`Search Criteria`**](../../../../guides/integrations-api/general-concepts/seach-criteria.md) \| Criteria \| optional

‌

### **Returns** <a id="returns"></a>

> The return codes and bodies differ from endpoint to endpoint. Usually, our reference contains examples for the successful response and the most common 4xx errors. See [Response Types](https://app.gitbook.com/@shopware/s/shopware-1/~/drafts/-MU8LxyY2Ad3ushWb8Jl/resources/references/api-reference/store-api-reference#response-types/@drafts).

Returns a single product together with a [configurator object](../../../../concepts/commerce/catalog/products.md#configurator) that contains its variant options.404 Not Found

{% tabs %}
{% tab title="200 OK" %}
```javascript
{
  "apiAlias": "product_detail",
  "product": { ... }
  "configurator": []
}
```
{% endtab %}
{% endtabs %}

## Response types <a id="response-types"></a>

There are different types of responses and knowing about them can make your work way easier.‌

### Success <a id="success"></a>

**200 OK** This is the most common response, indicating a successful operation. Oftentimes, the API responds with the entity you just modified or simply the `success: true` field in an object.‌

**204 No Content** Some endpoints respond with a no content response if it's more applicable.‌

### Client Error <a id="client-error"></a>

The API tries to resolve client errors and give an indication of what has gone wrong. Therefore, the response usually contains an `errors` field containing one or multiple errors to help you track them down. Each error contains a summary of the issue in the `detail` field.‌

**400 Bad Request** This response usually indicates that there's an issue with your request format - for example a missing parameter or violated constraints.‌

**401 Unauthorized** The unauthorised error indicates, that your [sales channel access key](../../../../guides/integrations-api/store-api-guide/README.md#authentication-and-setup) is missing.‌

**403 Forbidden** This response indicates that you are not authorised to perform that operation. For some operations, such as _placing an order_ or _submitting a review_ you need to be logged in as a customer. In those cases, check your `sw-context-token` header and whether you're [logged in](https://app.gitbook.com/@shopware/s/shopware-1/~/drafts/-MU8LxyY2Ad3ushWb8Jl/guides/integrations-api/store-api-guide/register-a-customer#logging-in/@drafts).‌

**405 Method Not Allowed** The HTTP method used for the request is not valid.‌

**412 Precondition Failed** This error occurs if your [sales channel access key](../../../../guides/integrations-api/store-api-guide/README.md) is invalid. Make sure that it matches any of your configured sales channels.‌

### Server Error <a id="server-error"></a>

**5xx** Server errors are rare, but they occur. They can be related to inconsistencies in the DB, infrastructure outages or software issues. If you cannot backtrack that issue, please create an [issue ticket to let us know](https://issues.shopware.com/).‌

## Submit reference issues‌ <a id="submit-reference-issues"></a>

If you find any issues, errors or missing parts in the reference, please create an issue or a pull request in our [Github Documentation repository](https://github.com/shopware/docs/issues).‌

## All Endpoints <a id="all-endpoints"></a>

| Route Name | Documentation Status |
| :--- | :--- |
| LoadWishlistRoute | ✅ |
| AddWishlistProductRoute | ✅ |
| MergeWishlistProductRoute | ✅ |
| RemoveWishlistProductRoute | ✅ |
| CustomerRoute | ✅ |
| ChangeCustomerProfileRoute | ✅ |
| ChangeEmailRoute | ✅ |
| LoginRoute | ✅ |
| LogoutRoute | ✅ |
| RegisterRoute | ✅ |
| RegisterConfirmRoute | ✅ |
| ChangePasswordRoute | ✅ |
| ChangePaymentMethodRoute | ✅ |
| SendPasswordRecoveryMailRoute | ✅ |
| ResetPasswordRoute | ✅ |
| ListAddressRoute | ✅ |
| DeleteAddressRoute | ✅ |
| SwitchDefaultAddressRoute | ✅ |
| UpsertAddressRoute | ✅ |
| CustomerGroupRegistrationSettingsRoute | ✅ |
| DeleteCustomerRoute | ✅ |
| CartDeleteRoute | ❌ |
| CartItemAddRoute | ❌ |
| CartItemRemoveRoute | ❌ |
| CartItemUpdateRoute | ❌ |
| CartLoadRoute | ❌ |
| CartOrderRoute | ❌ |
| CancelOrderRoute | ❌ |
| OrderRoute | ❌ |
| SetPaymentOrderRoute | ❌ |
| HandlePaymentMethodRoute | ❌ |
| PaymentMethodRoute | ❌ |
| ShippingMethodRoute | ❌ |
| CategoryListRoute | ✅ |
| CategoryRoute | ✅ |
| NavigationRoute | ✅ |
| CmsRoute | ❌ |
| ContactFormRoute | ❌ |
| NewsletterConfirmRoute | ❌ |
| NewsletterSubscribeRoute | ❌ |
| NewsletterUnsubscribeRoute | ❌ |
| ProductListListRoute | ✅ |
| ProductCrossSellingRoute | ✅ |
| ProductDetailRoute | ✅ |
| ProductListingRoute | ✅ |
| ProductReviewRoute | ✅ |
| ProductReviewSaveRoute | ✅ |
| ProductSearchRoute | ✅ |
| ProductSuggestRoute | ✅ |
| SeoUrlRoute | ❌ |
| SitemapRoute | ❌ |
| CountryRoute | ❌ |
| CurrencyRoute | ❌ |
| LanguageRoute | ❌ |
| ContextRoute | ❌ |
| ContextSwitchRoute | ❌ |
| SalutationRoute | ❌ |

