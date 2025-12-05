---
nav:
  title: Rule evaluation
  position: 30
---

# Rule evaluation

The lifecycle of rule evaluation form UI to decision making can be summarized as follows:

1. The Rule Builder lets a user create a rule tree (containers and conditions).
2. The rule system validates each condition against the corresponding rule class from the registry.
3. Valid rule and rule condition records are stored in the database.
4. At runtime, a domain builds an appropriate rule scope and, if needed, precomputes matching rules for that scope.
5. Features either: Filter by rule Ids exposed on the context, or evaluate a specific rule tree directly by calling it.

The sections below explains the individual steps in more detail.

## 1. From Rule Builder to stored rule definition

### 1.1. Rule trees and conditions

When a user configures a rule in the Rule Builder:

- The **visual tree** is mapped to: a `rule` representing the whole rule and multiple `rule_condition` records, each describing a single leaf condition (with type, operator and values).
- Each `rule_condition` is associated with a **condition type** (a class implementing `Rule`, containing the logic for evaluation).

So the Rule Builder is building the **structure and configuration** that will later be hydrated into a tree of `Rule` objects for evaluation.

### 1.2. Validation

Before writes are accepted, `RuleValidator` validates each condition. It subscribes to write events and inspects commands targeting `RuleConditionEntity`. For each condition, it:

- Resolves the condition type to a rule class via the `RuleConditionRegistry`.
- Instantiates the rule and uses its constraints to understand which fields and operators are valid.

If the payload does not match what the rule calss declares (wrong fields, types, operatores) the write is rejected.

## 2. Preparing evaluation

Rules do not fetch data themselves, they always evaluate against a provided **rule scope**.

### 2.1. Rule scope specification

The abstract `RuleScope` defines the minimal contract for evaluation. Domains extend to it add domain-specific data.

- `CheckoutRuleScope` - base for checkout-related rules.
- `CartRuleScope` - adds access to cart data.
- `FlowRuleScope` - adds access to order data.
- `LineItemScope` - focuses on a single line item.

## 2.2. Scope owners

Different parts of the system are responsible for constructing scopes:

- **Cart / Checkout**: `CartRuleLoader` is the main entry point for cart and checkout rule evaluation, building the necessary scopes and evaluates rules against them.

- **Flows**: `FlowRuleScopeBuilder` is responsible for building `FlowRuleScope`. It reconstructs a cart-like context from an order, runs data collectors so rules see realtistic checkout data.

- **Line items**: classes like `AnyRuleLineItemMatcher` construct `LineItemScope` when they need to test rules against individual line items.

The important point is: rules themselves are pure functions that depend only on the scope they receive. They do not depend on global state.

## 3. Matching rules

For some domains (checkout), the system precomputes which rules currently match and exposes their Ids in the context so features can filter by them.

## 3.1. Candidate loading

`CartRuleLoader` is central for checkout. It uses the `AbstractRuleLoader` to load a collection of rules and narrows these to context-relevant rules before evaluation anything.

