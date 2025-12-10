---
nav:
  title: Rule
  position: 10
---

# Rule

Shopware provides a generic **rule system** that allows you to describe business conditions as composable rules. These rules are evaluated against a specific context, such as a cart, an order or a customer and are used across multiple domains like checkout, promotions and flows.

On top of this rule system, the **Rule Builder** is the Administration feature that lets users configure and combine rule conditions visually.

## Example scenario

The power of the rule system can be illustrated with a simple scenario:

**"If a customer orders a car, a pair of sunglasses will be free in the same order."**

This relies on multiple different data points:

- A product called "car"
- A product called "sunglasses"

Both are independent, separately buyable, and stored in the database.

- The whole state of a single cart
- The quantity of a line item

This is a runtime concept in memory, resulting in the adjustment of a single line item's price, which in turn changes the whole calculation of the cart.

The rule system sits right in the middle of this scenario, providing the necessary mapping information to get from point A (`car` is in the cart) to point B (`sunglasses` are free), without hardcoding this logic into the cart itself.

## Where rules are used

The rule system is cross-domain and used in multiple parts of Shopware, including among others:

- **Checkout and cart:**
  Controlling availability and behavior of shipping methods, payment methods and product prices based on the current cart and customer.

- **Promotions:**
  Applying or restricting promotions depending on the customer, cart content or other criteria.

- **Flow Builder:**
  Defining rule conditions, controlling flow behavior and outcome, based on order, checkout, customer or product context.
