# Relevance

The relevance is calculated per [Dis max query​](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/query-dsl-dis-max-query.html). The [Tie break](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html#tie-breaker) is constant and set to `0.4`, which is the recommended value by Elasticsearch.

## Indexing

In addition to the default indexing, the Advanced Search indexes every field of the Entity definition with additional [Sub-fields](field-config) to Elasticsearch by default. This is done because it is possible to [define in the Administration](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search) which field should be searched and how searches on that field should perform. On the one hand, indexing everything supports usability. You can make changes to the configuration and you don't need to reindex everything. But on the other hand, the created index could be huge.

## Fuzziness

Elasticsearch supports by default a [Fuzzy search](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html). In the Advanced Search the fuzziness depends on the type of a field. The fuzziness for a numeric term is 0, and the `auto` value is taken for other terms.
