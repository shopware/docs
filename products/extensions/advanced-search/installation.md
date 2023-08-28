# Installation

* Advanced Search 2.0 is a licensed feature of the Commercial package. It is available for `Evolve` and `Beyond` plan.
* Opensearch server is up and running.
* `Shopware\Elasticsearch\Elasticsearch` bundle is enabled in `config/bundles.php`.
* On-prem environment configuration:

```env
OPENSEARCH_URL=http://localhost:9200
ES_MULTILINGUAL_INDEX=1
SHOPWARE_ES_ENABLED=1
SHOPWARE_ES_INDEXING_ENABLED=1
SHOPWARE_ES_INDEX_PREFIX=sw
```
* Commercial plugin is installed and activated.
