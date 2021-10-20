# Relevance

The relevance is calculated per [Dis Max Query​](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/query-dsl-dis-max-query.html). The [Tie Break](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html#tie-breaker) is constant and set to `0.4`, which is the recommended value by Elasticsearch.

## Indexing

In addition to the default indexing the Enterprise Search indexes every field of the Entity Definition with additional [sub fields](field-config.md) to elasticsearch by default. This is done, because it's possible to [define in the administration](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search) which field should be searched and how searches on that field should perform. On the one hand indexing everything supports the usability. You can make changes to the configuration and you don't need to reindex everything. But on the other hand, the created index could be very huge.

## Fuzziness

Elasticsearch supports by default a [fuzzy search](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html). In the Enterprise Search the fuzziness depends on the type of a field. The fuzziness for numeric term is 0, for other terms the `auto` value is taken.

