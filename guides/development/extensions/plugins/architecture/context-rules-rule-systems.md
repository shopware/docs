---
nav:
  title: Rule System Extension Architecture
  position: 40

---

# Rule System Extension Architecture

Rules are evaluated synchronously during request handling. They must be deterministic and performant. Custom rule implementations must operate only on data already available in the evaluation context.

## Design Principles

* Rule evaluation must not introduce database queries, as all rules are evaluated during a request cycle.
* Rules must rely exclusively on the provided evaluation scope.
* Rule execution must be predictable and free of side effects.

## Extension Guidelines

* Never execute database queries inside rule classes.
* Use the provided rule scopes to access data.
* Do not mutate state during rule evaluation.
* Keep rule logic lightweight and computation-focused.

## Technical requirements

* Cart-related rules must support:
  * the `\Shopware\Core\Checkout\Cart\Rule\CartRuleScope` class
  * the `\Shopware\Core\Checkout\Cart\Rule\LineItemScope`class
* Rules may only access data exposed through their respective scope classes.
