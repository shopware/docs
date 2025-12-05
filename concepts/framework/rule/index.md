---
nav:
  title: Rule
  position: 10
---

# Rule

Shopware provides a generic **rule system** that allows you to describe business conditions as composable rules. These rules are evaluated against a specific context, such as a cart, an order or a customer and are used accross multiple domains like checkout, promotions and flows.

On top if this rule system the **Rule Builder** is the Administration feature that lets users configure and combine rule conditions visually.

## Key Capabilities

### Composable rule trees

Rules can be combined into trees using logical containers (AND, OR, NOT, etc.). This mirrors how conditions are structured in the Rule Builder UI.

### Context-aware evaluation

Rules are evaulated against a specific context (a *rule scope*). The scope defines which data is availabe to the rule, such as cart content, customer information or order details.

### UI configurable behavior via Rule Builder

The Rule Builder UI allows business users to create and modify rules. The core rule framework provides config metadata so that the Rule Builder can offer the correct fields and operators for each rule condition type.

## Where Rules are used

The rule system is cross-domain and used in multiple parts of Shopware, including among others:

- **Checkout and cart**
  Controlling availiability and behavior of shipping methods, payment methods and product prices based on the current cart and customer.

- **Promotions
  Applying or restructing promotions depending on the cusomter, cart content or ther critieria.

- **Flow Builder
  Defining rule conditions, controlling flow behavior and outcome, based on order, checkout, customer or product context.>