# Elasticsearch

As soon as several thousand data sets are used in a project it makes sense to deal with Elasticsearch. Elasticsearch 7.3 or newer is required.
The Elasticsearch integration for Shopware is in the [shopware/elasticsearch](https://github.com/shopware/elasticsearch) bundle. If this is not available in your project you can simply add it via `composer require shopware/elasticsearch`.

## Requirements

- Elasticsearch 7.3 or newer
- [Running message queue workers in background](./message-queue.md)

## Activating and first time Indexing

To activate Elasticsearch indexing the following environment variables have to be set:

- `SHOPWARE_ES_HOSTS`: A comma separated list of Elasticsearch hosts. You can find the possible formats [here](https://www.elastic.co/guide/en/elasticsearch/client/php-api/current/host-config.html#inline-host-config)
- `SHOPWARE_ES_INDEXING_ENABLED=1`: This variable activates the indexing to Elasticsearch
- `SHOPWARE_ES_INDEX_PREFIX=sw6`: This variable defines the prefix for the Elasticsearch indices

After changing the configuration, you should clear the cache using `bin/console cache:clear`.

To start the indexing you have to execute the following command: `bin/console es:index`.
Shopware creates the alias for the index by default when the expected alias is not there.

{% hint style="info" %}
`./bin/console dal:refresh:index --use-queue` triggers both the elasticsearch indexing process, but also other indexers which may take a while.
{% endhint %}

To see the current state of the indexing, you can check the count of documents in the Elasticsearch index or the state of the queue by looking into the `enqueue` table.

After the index is successfully built, we can enable the search on the index by setting environment variable `SHOPWARE_ES_ENABLED` to `1`. 

## Reindexing

The reindexing can be triggered by running `./bin/console es:index` again. The alias will change when the indexing process is completed. A scheduled task will check all 5 minutes if the index is fully indexed and switch it. The alias switch can also be triggered by using `./bin/console es:create:alias`.

## Index cleanup

On each indexing a new Elasticsearch index will be generated. To remove unused indices, you can execute the command: `./bin/console es:index:cleanup`.
