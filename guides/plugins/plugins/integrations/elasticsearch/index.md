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

### Match type boosts

A search word can match a field in several ways, and each match type has its own boost (since 6.7.14.0).
Override the boosts in `config/packages/elasticsearch.yaml`:

```yaml
elasticsearch:
    search:
        boost:
            exact: 2.0     # the whole word matches
            phrase: 4.0    # the words of a multi-word search appear close together
            fuzzy: 0.4     # the word matches with typos
            prefix: 0.4    # the word matches the start of an indexed word
            partial: 0.4   # the word shares n-gram fragments with an indexed word ("Split search term" fields only)
```

Each boost must be `0.0` or higher.
The ranking of a search field is multiplied on top of these boosts.
Keep `exact` and `phrase` above the other boosts, otherwise a looser match can outrank a whole-word or whole-phrase match.
Changing a boost does not require a reindex.

### Field-length normalization

Since 6.7.12.0, product indices score matches without field-length normalization (`b: 0`).
A short product name therefore does not rank above a descriptive one only because it is shorter.
The `description`, `metaDescription`, and `customSearchKeywords` fields use the `sw_length_norm` similarity with the standard normalization (`b: 0.75`), because their length is a relevance signal.
Both similarities are defined in `elasticsearch.index_settings.similarity`:

```yaml
elasticsearch:
    index_settings:
        similarity:
            default:
                type: BM25
                b: 0
            sw_length_norm:
                type: BM25
                b: 0.75
```

An override replaces the whole `similarity` setting, so always define both similarities.
Changing a similarity requires a full reindex with `bin/console es:index`.

### Other search settings

The `elasticsearch.search` section holds further settings you can override in `config/packages/elasticsearch.yaml`:

```yaml
elasticsearch:
    search:
        timeout: 5s                     # request timeout per search
        term_max_length: 300            # search terms longer than this are truncated
        term_max_words: 10              # only the first N distinct words of a search term are searched
        search_type: query_then_fetch   # OpenSearch search type
        # precision_threshold: 40000    # cardinality accuracy for grouped product counts (higher = more memory)
```

`term_max_words` (since 6.7.17.0, default `10`, minimum `1`) limits the number of words that a search sends to Elasticsearch.
Before the term query is built, the search term is cut to its first N distinct words.
Punctuation-only words and one-letter words do not count.
Words after the limit are not searched.
The limit keeps long search terms from exceeding the cluster's clause limit, see [Limiting the number of search words](../../../../hosting/infrastructure/elasticsearch/elasticsearch.md#limiting-the-number-of-search-words).

### Administration search settings

The Administration search has its own settings in `elasticsearch.administration.search`:

```yaml
elasticsearch:
    administration:
        search:
            timeout: 5s                     # request timeout per search
            term_max_length: 300            # search terms longer than this are truncated
            search_type: query_then_fetch   # OpenSearch search type
```

They apply when the Administration search uses OpenSearch, see [Elasticsearch for Admin](../../../../hosting/infrastructure/elasticsearch/elasticsearch-setup.md#elasticsearch-for-admin).
The `elasticsearch.search` settings on this page, such as `term_max_words`, the boosts, and the tie-breaker, do not apply to the Administration search.
The Administration indices also have their own `index_settings`, including `similarity`, under `elasticsearch.administration`.

### Analyzer settings

Analyzer behavior is controlled through environment variables, including `SHOPWARE_ES_DIMENSION_NORMALIZE`, `SHOPWARE_ES_NGRAM_MIN_GRAM` / `SHOPWARE_ES_NGRAM_MAX_GRAM`, and `SHOPWARE_ES_USE_LANGUAGE_ANALYZER` — see [Environment Variables](../../../../hosting/configurations/shopware/environment-variables.md). Changing any analyzer setting requires a full reindex with `bin/console es:index`.

### Direct redirect for exact code matches

The storefront search redirects straight to the product page when a search returns a single product whose `productNumber`, `ean`, or `manufacturerNumber` exactly matches the query. This applies regardless of the search backend (Elasticsearch or the database). The fields that trigger the redirect are controlled by the `shopware.storefront.redirect_on_single_hit_fields` parameter (default `['productNumber', 'ean', 'manufacturerNumber']`) — override it to restrict the behavior, or set it to an empty list to disable the redirect. The `ean` and `manufacturerNumber` fields were added to the default since 6.7.12.0.
