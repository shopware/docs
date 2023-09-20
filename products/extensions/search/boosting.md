# Boosting

## Overview

With the Advanced Search there are two types of boosting:

* [Field Boosting](boosting#field-boosting)
* [Explicit Boosting](boosting#explicit-boosting)

These configurations allow boosting of specific search results.

## Field boosting

With *field boosting*, it's possible to boost the values of a single field. It is easy to [configure in the Administration](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search#searchable-information). It is just needed to set the configuration to `Prioritized`. In the code, this option is checked. If this field is set to `prioritized`, a little [Boosting](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/mapping-boost.html) of `2` will be added; otherwise, the value will be `1`.

## Explicit boosting

Like the *field boosting*, the *explicit boosting* can be configured in the Administration. With this boosting, you have more possibilities. The `BoostingQueryBuilder` assembles all queries into one [Should Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html#query-dsl-bool-query), which contains a [Constant Score Query](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/query-dsl-constant-score-query.html).
