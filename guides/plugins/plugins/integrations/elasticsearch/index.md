---
nav:
  title: Elasticsearch
  position: 10

---

# Elasticsearch

By extending fields of an entity to the Elasticsearch engine, you expand the search capabilities of Shopware, allowing users to search based on additional attributes or metadata. This enhances the overall search experience and enables more targeted and precise search results for customers.

## Configuring search relevance

Several aspects of the product search relevance can be configured without custom code.

### Minimum score

`core.search.minScore` (since 6.7.12.0) is a system configuration value (per sales channel, default `0.0`). When greater than `0.0`, product-search hits scoring below the threshold are dropped, which trims the long tail of weak matches. Leave it at `0.0` to disable the cutoff.

There is no universally correct value — the effective score range depends on field weights, analyzer configuration, and catalog size — so start low and increase it gradually while watching how noisy queries behave. Set it through the Administration, the Admin API, or the console:

```bash
bin/console system:config:set core.search.minScore 5.0
```

### Multi-field tie-breaker

When a query matches a product in more than one field, the per-field scores are combined with a `dis_max` query. The `tie_breaker` (since 6.7.12.0, default `0.2`, range `0.0`–`1.0`) controls how much the non-best field matches contribute to the final score. Override it in `config/packages/elasticsearch.yaml`:

```yaml
elasticsearch:
    search:
        dismax_tie_breaker: 0.3
```

### Other search settings

The `elasticsearch.search` section holds further settings you can override in `config/packages/elasticsearch.yaml`:

```yaml
elasticsearch:
    search:
        timeout: 5s                     # request timeout per search
        term_max_length: 300            # search terms longer than this are truncated
        search_type: query_then_fetch   # OpenSearch search type
        # precision_threshold: 40000    # cardinality accuracy for grouped product counts (higher = more memory)
```

### Analyzer settings

Analyzer behavior is controlled through environment variables, including `SHOPWARE_ES_DIMENSION_NORMALIZE`, `SHOPWARE_ES_NGRAM_MIN_GRAM` / `SHOPWARE_ES_NGRAM_MAX_GRAM`, and `SHOPWARE_ES_USE_LANGUAGE_ANALYZER` — see [Environment Variables](../../../../hosting/configurations/shopware/environment-variables.md). Changing any analyzer setting requires a full reindex with `bin/console es:index`.

### Direct redirect for exact code matches

The storefront search redirects straight to the product page when a search returns a single product whose `productNumber`, `ean`, or `manufacturerNumber` exactly matches the query. This applies regardless of the search backend (Elasticsearch or the database). The fields that trigger the redirect are controlled by the `shopware.storefront.redirect_on_single_hit_fields` parameter (default `['productNumber', 'ean', 'manufacturerNumber']`) — override it to restrict the behavior, or set it to an empty list to disable the redirect. The `ean` and `manufacturerNumber` fields were added to the default since 6.7.12.0.
