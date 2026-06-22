---
nav:
  title: Language analyzers
  position: 50

---

# Add / Modify language analyzers, stopwords, stemmer

With the introduction of the multi-language index, support for built-in [Elasticsearch language analyzers](https://www.elastic.co/docs/reference/text-analysis/analysis-lang-analyzer) was also introduced.

This would help language-based fields have different analyzers for each language's specific features, like stopwords, stemmers, and normalization, out of the box.

You can also add more or customize the language analyzer by overriding the analyzer parameter in `custom/plugins/SwagCommercial/src/AdvancedSearch/Resources/config/packages/advanced_search.yaml`

For example:

```yaml
advanced_search:
    analysis:
        analyzer:
            sw_your_custom_language_analyzer:
                type: custom
                tokenizer: standard
                filter: ['lowercase', 'my_stopwords_filter', 'my_stemmer_filter']
    filter:
        my_stopwords_filter:
            type: 'stop'
            stopwords: ['foo', 'bar']
        my_stemmer_filter:
            type: 'stemmer'
            language: 'english'
    # It's important to map your analyzer with the language iso code
    language_analyzer_mapping:
        custom_iso: sw_your_custom_language_analyzer
```

## Compound-word decomposition

German catalogs often contain closed compound nouns (for example `Lederjacke` or `Akkubohrer`). Without decomposition, a search for `Jacke` does not match a product named `Lederjacke`.

Since Commercial 7.12.0, Advanced Search ships a `dictionary_decompounder` filter that splits compound words into their parts at index time, using an editable, per-language dictionary. A curated German root-word dictionary is seeded by default. Decomposition is applied at index time only, on the technical-term index analyzer (`sw_<iso>_technical_term_index_analyzer`); the search query itself is never expanded into its parts.

The dictionaries are stored as entities and can be managed through the Admin API:

* `advanced_search_compound_dictionary` — the `wordList` of root words used to split compounds.
* `advanced_search_stopword_dictionary` — custom `stopwords`, which are stripped at both index and search time.

After editing a dictionary, run `bin/console es:index` so the updated analyzer configuration is applied to the index.
