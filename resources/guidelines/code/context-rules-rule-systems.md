---
nav:
  title: Context Rules & Rule Systems
  position: 40

---

# Context Rules and Rule Systems

* In a rule, there must never be a query against the database because all configured rules are validated in a request.
* Rules that check for the cart must always support the `\Shopware\Core\Checkout\Cart\Rule\CartRuleScope` class and the `\Shopware\Core\Checkout\Cart\Rule\LineItemScopeclass`.
* Rules may only access data provided in the appropriate scopes.
