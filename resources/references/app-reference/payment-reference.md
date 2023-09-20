# Payment Reference

::: warning
This feature is only available starting with Shopware 6.4.1.0.
:::

These two requests are executed against your API, the up to two endpoints you define per payment method. All bodies are JSON encoded.

{% api-method method="post" host="https://payment.app/" path="/pay" %}
{% api-method-summary %}
pay
{% endapi-method-summary %}

{% api-method-description %}
This request gets called, when the users hits _Confirm Order_ in Shopware.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="shopware-shop-signature" type="string" required=true %}
The hmac-signature of the JSON encoded body content, signed with the shop secret returned from the registration request
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="order" type="OrderEntity" required=true %}
The order entity from Shopware including all necessary associations \(like currency, shipping address, billing address, line items\). See Shopware for detailed and current structure.
{% endapi-method-parameter %}

{% api-method-parameter name="orderTransaction" type="OrderTransactionEntity" required=true %}
The order transaction entity from Shopware representing the payment your are supposed to process. See Shopware for detailed and current structure.
{% endapi-method-parameter %}

{% api-method-parameter name="orderTransaction.id" type="string" required=true %}
This should be used to identify the order transaction on a second finalize request.
{% endapi-method-parameter %}

{% api-method-parameter name="returnUrl" type="string" required=false %}
This URL is the URL your app or your payment provider is supposed to redirect back to, once the user has been redirected to the payment provider with the URL you provide in your response. Only supplied on asynchronous payments.
{% endapi-method-parameter %}

{% api-method-parameter name="source" type="array" required=true %}
Data to identify the shop that sent this request
{% endapi-method-parameter %}

{% api-method-parameter name="source.url" type="string" required=true %}
The shop URL sending this request
{% endapi-method-parameter %}

{% api-method-parameter name="source.shopId" type="string" required=true %}
The shop id you can use to identify the shop that has been registered before with your app.
{% endapi-method-parameter %}

{% api-method-parameter name="source.appVersion" type="string" required=true %}
The version of the app that is installed in the shop.
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
See comments for different successful responses
{% endapi-method-response-example-description %}

```javascript
/* Successful redirect */
{
    "redirectUrl": "https://payment.app/user/go/here/068b1ec4d7ff431b95d3b7431cc725aa/"
}

/* Failure due to missing credentials */
{
    "status": "fail",
    "message": "The shop has not provided all credentials for the payment provider."
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="https://payment.app/" path="/finalize" %}
{% api-method-summary %}
finalize
{% endapi-method-summary %}

{% api-method-description %}
This request gets called once the user returns to the `returnUrl` Shopware provided in the first request.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="shopware-shop-signature" type="string" required=true %}
The hmac-signature of the JSON encoded body content, signed with the shop secret returned from the registration request
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="orderTransaction" type="OrderTransactionEntity" required=true %}
The order transaction entity from Shopware representing the payment your are supposed to process. See Shopware for detailed and current structure.
{% endapi-method-parameter %}

{% api-method-parameter name="orderTransaction.id" type="string" required=true %}
This should be used to identify the order transaction on a second finalize request.
{% endapi-method-parameter %}

{% api-method-parameter name="source" type="array" required=true %}
Data to identify the shop that sent this request
{% endapi-method-parameter %}

{% api-method-parameter name="source.url" type="string" required=true %}
The shop URL sending this request
{% endapi-method-parameter %}

{% api-method-parameter name="source.shopId" type="string" required=true %}
The shop id you can use to identify the shop that has been registered before with your app.
{% endapi-method-parameter %}

{% api-method-parameter name="source.appVersion" type="string" required=true %}
The version of the app that is installed in the shop.
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
See comments for different successful responses
{% endapi-method-response-example-description %}

```javascript
/* Successful redirect */
{
    "status": "paid"
}

/* Failure due to missing funds */
{
    "status": "fail",
    "message": "The user did not have adequate funds."
}

/* Failure if the user has not finished the payment process. */
{
    "status": "cancel",
    "message": "The user did not finish payment."
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}
