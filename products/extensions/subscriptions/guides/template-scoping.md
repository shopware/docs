---
nav:
  title: Template scoping
  position: 10

---

# Template scoping

When you are in a subscription context, templates would not extend storefront templates by default. This is to prevent buttons being displayed on checkout that should not be displayed (i.e. A PayPal Express checkout button should not be visible when we are processing a subscription product). The same applies to themes. If you want your template to also be used in a subscription context, you should add the scope to your template extension:

```twig
{% sw_extends {
    template: '@Storefront/storefront/base.html.twig',
    scopes: ['default', 'subscription']
} %}
```

Keep in mind that the subscription buy button is separate from the regular button, so that accidental overwrites do not occur.
