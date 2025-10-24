---
nav:
  title: Template scoping
  position: 30

---

# Subscription template scoping

Please familiarise yourself with the [concept](../concept.md) first before continuing here.

In a subscription context, it's important to ensure that certain twig template adjustments, which are applicable to the standard storefront, are not automatically applied.
This precaution helps in maintaining a clear distinction between the regular checkout process and the subscription checkout process.
For instance, elements or buttons that facilitate immediate purchases or third-party payment options, like PayPal Express, should not be visible during the subscription checkout to avoid confusion.

To achieve this separation, templates used within the subscription context should explicitly define their scope.
The subscription feature adds two scopes: `subscription` and `mixed-subscription`.
Read more about the two checkout processes in the [subscription concept](../concept.md#checkout-processes).

Below is an example of extending a template in the default and subscription context:

```twig
{% sw_extends {
    template: '@Storefront/storefront/base.html.twig',
    scopes: ['default', 'subscription']
} %}
```

A specific scope also assures the availability of certain data:
**`subscription`**: The global `context` is replaced with the [subscription context](../concept.md#subscription-context), therefore having the `subscription` extension available
