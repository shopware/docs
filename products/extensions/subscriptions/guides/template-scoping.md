---
nav:
  title: Template scoping
  position: 10

---

# Template scoping

In a subscription context, it's important to ensure that certain template adjustments, which are applicable to the standard storefront, are not automatically applied. This precaution helps in maintaining a clear distinction between the regular checkout process and the subscription checkout process. For instance, elements or buttons that facilitate immediate purchases or third-party payment options, like PayPal Express, should not be visible during the subscription checkout to avoid confusion.

To achieve this separation, templates used within the subscription context should explicitly define their scope. Below is an example of extending a template in the default and subscription context:

```twig
{% sw_extends {
    template: '@Storefront/storefront/base.html.twig',
    scopes: ['default', 'subscription']
} %}