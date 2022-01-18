# Payment Reference

{% hint style="warning" %}
This feature is only available starting with Shopware 6.4.1.0.
{% endhint %}

These two requests are executed against your API, the up to two endpoints you define per payment method. All bodies are JSON encoded.

{% swagger baseUrl="https://payment.app/" path="/pay" method="post" summary="pay" %}
{% swagger-description %}
This request gets called, when the users hits 

_Confirm Order_

 in Shopware.
{% endswagger-description %}

{% swagger-parameter name="shopware-shop-signature" type="string" required="true" in="header" %}
The hmac-signature of the JSON encoded body content, signed with the shop secret returned from the registration request
{% endswagger-parameter %}

{% swagger-parameter name="order" type="OrderEntity" required="true" in="body" %}
The order entity from Shopware including all necessary associations (like currency, shipping address, billing address, line items). See Shopware for detailed and current structure.
{% endswagger-parameter %}

{% swagger-parameter name="orderTransaction" type="OrderTransactionEntity" required="true" in="body" %}
The order transaction entity from Shopware representing the payment your are supposed to process. See Shopware for detailed and current structure.
{% endswagger-parameter %}

{% swagger-parameter name="orderTransaction.id" type="string" required="true" in="body" %}
This should be used to identify the order transaction on a second finalize request.
{% endswagger-parameter %}

{% swagger-parameter name="returnUrl" type="string" required="false" in="body" %}
This URL is the URL your app or your payment provider is supposed to redirect back to, once the user has been redirected to the payment provider with the URL you provide in your response. Only supplied on asynchronous payments.
{% endswagger-parameter %}

{% swagger-parameter name="source" type="array" required="true" in="body" %}
Data to identify the shop that sent this request
{% endswagger-parameter %}

{% swagger-parameter name="source.url" type="string" required="true" in="body" %}
The shop URL sending this request
{% endswagger-parameter %}

{% swagger-parameter name="source.shopId" type="string" required="true" in="body" %}
The shop id you can use to identify the shop that has been registered before with your app.
{% endswagger-parameter %}

{% swagger-parameter name="source.appVersion" type="string" required="true" in="body" %}
The version of the app that is installed in the shop.
{% endswagger-parameter %}

{% swagger-response status="200" description="" %}
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
{% endswagger-response %}
{% endswagger %}

{% swagger baseUrl="https://payment.app/" path="/finalize" method="post" summary="finalize" %}
{% swagger-description %}
This request gets called once the user returns to the 

`returnUrl`

 Shopware provided in the first request.
{% endswagger-description %}

{% swagger-parameter name="shopware-shop-signature" type="string" required="true" in="header" %}
The hmac-signature of the JSON encoded body content, signed with the shop secret returned from the registration request
{% endswagger-parameter %}

{% swagger-parameter name="orderTransaction" type="OrderTransactionEntity" required="true" in="body" %}
The order transaction entity from Shopware representing the payment your are supposed to process. See Shopware for detailed and current structure.
{% endswagger-parameter %}

{% swagger-parameter name="orderTransaction.id" type="string" required="true" in="body" %}
This should be used to identify the order transaction on a second finalize request.
{% endswagger-parameter %}

{% swagger-parameter name="source" type="array" required="true" in="body" %}
Data to identify the shop that sent this request
{% endswagger-parameter %}

{% swagger-parameter name="source.url" type="string" required="true" in="body" %}
The shop URL sending this request
{% endswagger-parameter %}

{% swagger-parameter name="source.shopId" type="string" required="true" in="body" %}
The shop id you can use to identify the shop that has been registered before with your app.
{% endswagger-parameter %}

{% swagger-parameter name="source.appVersion" type="string" required="true" in="body" %}
The version of the app that is installed in the shop.
{% endswagger-parameter %}

{% swagger-response status="200" description="" %}
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
{% endswagger-response %}
{% endswagger %}
