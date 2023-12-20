---
nav:
  title: How to add a new approval condition
  position: 40

---

# How to add a new approval condition

The order approval component provides a set of conditions that you can use to define your approval rules. However, if you need to add a new condition, you can do so via app or plugin.

## Plugin

Each condition is represented by a class that extends the abstract class `Shopware\Commercial\B2B\OrderApproval\Domain\ApprovalRule\Rule\OrderApprovalRule` class. To add a new condition, you need to create a new class that extends the `OrderApprovalRule` class and implements the `match` and `getConstraints` methods. The `match` method is used to determine if the condition is met, and the `getConstraints` method is used to define the field, value or operator constraints that can be used in the condition.

Example:

```PHP
<?php declare(strict_types=1);

namespace YourPluginNameSpace;

use Shopware\Commercial\B2B\OrderApproval\Domain\ApprovalRule\Rule\OrderApprovalRule;

class CartAmountRule extends OrderApprovalRule
{
    final public const RULE_NAME = self::PREFIX . 'cart-amount';

    public const AMOUNT = 1000;

    protected float $amount;

    /**
     * @internal
     */
    public function __construct(
        protected string $operator = self::OPERATOR_GTE,
        ?float $amount = self::AMOUNT
    ) {
        parent::__construct();
        $this->amount = (float) $amount;
    }

    /**
     * @throws UnsupportedOperatorException
     */
    public function match(RuleScope $scope): bool
    {
        if (!$scope instanceof CartRuleScope) {
            return false;
        }

        return RuleComparison::numeric($scope->getCart()->getPrice()->getTotalPrice(), $this->amount, $this->operator);
    }

    public function getConstraints(): array
    {
        return [
            'amount' => RuleConstraints::float(),
            'operator' => RuleConstraints::numericOperators(false),
        ];
    }

    public function getConfig(): RuleConfig
    {
        return (new RuleConfig())
            ->operatorSet(RuleConfig::OPERATOR_SET_NUMBER)
            ->numberField('amount');
    }
}
```

And then tag your class with the `shopware.approval_rule.definition` tag:

```XML
 <service id="YourPluginNameSpace\CartAmountRule" public="true">
    <tag name="shopware.approval_rule.definition"/>
 </service>
```

## App

We have not yet added support for extending custom `OrderApprovalRules` for the app.