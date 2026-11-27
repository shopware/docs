---
nav:
  title: Elasticsearch
  position: 40
---

# Elasticsearch

This guide covers Elasticsearch integration and configuration in Shopware, including error handling and search indexing behavior.

## Related guides

* [Debugging and Troubleshooting Elasticsearch](./elasticsearch-debugging.md)

## Common Error Handling

### Enabling `SHOPWARE_ES_THROW_EXCEPTION`

It is recommended to set the environment variable `SHOPWARE_ES_THROW_EXCEPTION=0` in **production environments** and enable it (`=1`) in **development environments**. This setting helps prevent unexpected interruptions to other processes caused by Elasticsearch or OpenSearch issues.

Some common scenarios include:

* ***Search server is not reachable**:
  If the OpenSearch or Elasticsearch server is temporarily unavailable, keeping this option disabled (`=0`) allows Shopware to automatically fall back to the default MySQL-based search. This ensures that search functionality remains available.
  A similar fallback also applies when updating products in the Administration, where data synchronization with the search server might fail intermittently.

* **System updates causing expected errors**:
  During updates—whether through the web UI or via the CLI (`bin/console system:update:finish`)—index mappings may change, requiring a reindex. These expected errors should not block system updates in production, which is why exceptions should remain disabled in such environments.

## Adjusting N-gram Settings for search precision

When a search field is marked as *searchable* and the **“Split search term”** option is enabled, Shopware uses an **n-gram tokenizer** to index and search that field. By default, Shopware uses the following configuration:

```bash
SHOPWARE_ES_NGRAM_MIN_GRAM=4
SHOPWARE_ES_NGRAM_MAX_GRAM=5
```

With this configuration, a term like `"shopware"` is tokenized into the following n-grams:

```bash
["shop", "hopw", "opwa", "pwar", "ware", "shopw", "hopwa", "opwar", "pware"]
```

This allows search results to match even if only part of the search term is entered—for example, searching for `"ware"` will still find `"shopware"`.

If you want to make the search more flexible (fuzzier) or more precise (stricter), you can adjust the environment variables:

```bash
SHOPWARE_ES_NGRAM_MIN_GRAM=<value>
SHOPWARE_ES_NGRAM_MAX_GRAM=<value>
```

After modifying these values, a full Elasticsearch reindex is required to apply the new configuration:

```bash
bin/console es:index
```

## Limiting the number of search words

Since Shopware 6.7.17.0, searches over Elasticsearch or OpenSearch use only the first 10 distinct words of a search term.
Each word adds query clauses for every searchable field and language.
Without a limit, long search terms make OpenSearch reject the query with `too_many_nested_clauses`.
Change the limit with `elasticsearch.search.term_max_words` in `config/packages/elasticsearch.yaml`:

```yaml
elasticsearch:
    search:
        term_max_words: 10
```

Raise the value only when your cluster allows more clauses through `indices.query.bool.max_clause_count`.
Lower it when searches with fewer words still fail with `too_many_nested_clauses`, for example, because the shop has many searchable fields or languages.
The setting applies at search time, so no reindex is required.
