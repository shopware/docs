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
