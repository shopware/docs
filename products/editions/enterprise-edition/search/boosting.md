# Boosting

​
With the Enterprise Search there are two types of boosting, the [Field Boosting](#field-boosting) and the [Explicit Boosting](#explicit-boosting).
With these configurations it's easy to boost some results, which than are ranked higher in the search.

## Field Boosting

With the field boosting, it's possible to boost values of a single field. It's easy to [configure in the administration](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search#searchable-information). It's just needed to set the configuration to `Prioritized`.
In the code this option is checked. If this field is set to prioritized, a little [boosting](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/mapping-boost.html) of `2` will be added, otherwise the value will be `1`.

## Explicit Boosting

Like the [Field Boosting](#field-boosting) the Explicit Boosting can be configured in the Administration. With this boosting you have more possibilities.
The `BoostingQueryBuilder` makes from all queries one big Should Query, which contains a [Constant Score Query](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/query-dsl-constant-score-query.html).
