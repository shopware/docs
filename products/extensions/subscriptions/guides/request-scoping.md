---
nav:
  title: Request scoping
  position: 20

---

# Request scoping

When you are in a subscription checkout, you are using a separate cart and context. In Storefront, there is an additional URL parameter (`subscriptionToken`) that gets resolved. In headless, there are two header parameters that need to be set namely `sw-subscription-plan` and `sw-subscription-interval`.

Below is an example of the context set on a subscription cart in the Storefront:

```xml
    <route id="frontend.subscription.checkout.cart.page"
           path="/subscription/checkout/cart/{subscriptionToken}"
           methods="GET"
           controller="subscription.storefront.controller.checkout::cartPage">
        <default key="_noStore">true</default>
        <default key="_routeScope"><list><string>storefront</string></list></default>
        <default key="_subscriptionCart">true</default>
        <default key="_subscriptionContext">true</default>
        <default key="_controllerName">checkout</default>
        <default key="_controllerAction">cartpage</default>
        <default key="_templateScopes">subscription</default>
        <option key="seo">false</option>
    </route>
```

And, here is an example of the headers set on a subscription cart using headless:

```bash
curl -XPOST /
    -H 'sw-subscription-plan: planId' /
    -H 'sw-subscription-interval: intervalId' /
    -d 'your body' /
    '/store-api/subscription/{subscriptionId}/activate'
```

These context definitions can be found in `Subscription/Resources/app/config/routes/storefront.xml` or `Subscription/Resources/app/config/routes/store-api.xml`.
