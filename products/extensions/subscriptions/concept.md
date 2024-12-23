# Concepts

To use subscriptions, you will need to be familiar with two core concepts in subscription models.

## Plans

A plan is a set of rules that define the subscription. This includes the billing interval and the product that the customer will receive. Multiple intervals can be assigned to a single plan. Plans can be created and managed in the Shopware administration.

## Intervals

An interval is the time between each delivery cycle. For example, a delivery can be monthly, quarterly, or annually. Billing is triggered each time a delivery cycle repeats. The interval is defined in the plan and can be set to any time frame. This is also created and managed in the Shopware administration.

Intervals can be of three different types:

### Relative

A relative interval is an interval that is determined by a previous interval. For example, if a customer subscribes to a monthly plan, the next interval will be one month after the first delivery. These intervals are determined by using PHP's `DateInterval` class.

### Absolute

An absolute interval is an interval that is determined by a fixed date. For example, if a customer subscribes to a monthly plan, the next interval will be on a fixed day like the 1st or 15th of each month. These work with cron expressions.

### Mixed

A mix of the two types above. For instance, a customer subscribes to a plan that delivers every 12 weeks, but only on a Friday. These intervals are determined by using PHP's `DateInterval` class in combination with cron expressions.

## Further reading

You can read more about the setup of plans and intervals in the [Shopware documentation](https://docs.shopware.com/en/shopware-6-en/settings/shop/subscriptions).
