# Field Configuration

With the [relevance](relevance.md), the enterprise search offers the possibilities to customize the searched fields.

Here, we want to give you brief information about the internal usage of the different Elasticsearch functionalities, which are used for the full text search of the enterprise search.

## Filter

The Enterprise Search adds some additional filters, which will be used by the [analyzer](field-config.md#analyzer).

1. **Numeric-Char-Filter \(`sesNumericCharFilter`\)**

   The numeric char filter separates strings and numbers and it normalize the different spelling issues mostly found in shops.

   With help of this filter a partial hit can be better found.

   Example:

   Input: `10KG`

   Output: `10 KG`

   It uses the regex `(\d*)([^\d]*)` and replace it with `$1 $2`

2.**Character Filter \(`sesCharFilter`\)**

The char filter separates strings from special characters \(supported special chars: `-,.\®"/`\).

When words are separated by one of these characters, the special character is removed and replaced by a whitespace.

1. **N-Gram Filter \(`ses_ngram`\)**

   This n-gram filter uses the elastic search default [n-gram filter](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-ngram-tokenizer.html) with the parameters 3 for minimum and 27 for maximum value.

2. **Shingle \(`ses_shingle`\)**

   This shingle filter uses the elastic search default [shingle](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/analysis-shingle-tokenfilter.html)

   The parameters for this analyzer are:

   * Minimum shingle size -&gt; 2
   * Maximum shingle size -&gt; 3
   * Output Unigrams -&gt; false

3. **Synonym \(`ses_synonym`\)**

   In the Enterprise Search you can define synonyms, these [synonyms](synonyms.md) were used by the search analyzer.

## Analyzer

In addition to the Shopware Elasticsearch default analyzer, the Enterprise Search adds some additional analyzer. Each analyzer uses a different set of filters. Here is a List of all used custom analyzers in the Enterprise Search:

1. `sesAnalyzer`

   Is the default [analyzer](https://www.elastic.co/guide/en/elasticsearch/reference/current/analyzer.html) for the content.

   Filters which were used: `sesCharFilter`, `sesNumericCharFilter`

2. `sesNgramAnalyzer`

   Each string field which is indexed has an internal mapping for an extra field with the suffix `.ngram`.

   You can configure which field should be used in the [administration module](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search?category=shopware-6-en/enterprise-extensions#Configuration).

   Filters which were used: `ses_ngram`, `sesCharFilter`, `sesNumericCharFilter`

3. `sesShingleAnalyzer`

   Each string field which is indexed has an internal mapping for an extra field with the suffix `.ngram`.

   You can configure which field should be used in the [administration module](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search?category=shopware-6-en/enterprise-extensions#Configuration).

   Filters which were used: `ses_shingle`, `sesCharFilter`, `sesNumericCharFilter`

4. `sesSearchAnalyzer`

   Is the default [search analyzer](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-analyzer.html) for the search words.

   Filters which were used: `synonym`

