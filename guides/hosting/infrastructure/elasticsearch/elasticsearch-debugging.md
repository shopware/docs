---
nav:
  title: Debugging and Troubleshooting Elasticsearch
  position: 20

---

# Debugging and Troubleshooting Elasticsearch

## Overview

This guide shows you how to debug the status and indexing process of your Elasticsearch environment. Use this guide when Elasticsearch indexing, aliases, queues, or search results are not behaving as expected.

Ensure that the Debug-Mode is activated in your *.env* file.

## Shopware 6 CLI commands

### Cache clear

`cache:clear` clears the cache

```bash
bin/console cache:clear
```

**> Output:**

```bash
// Clearing the cache for the dev environment with debug
// true
​[OK] Cache for the "dev" environment (debug=true) was successfully cleared.
```

### ES index

`es:index` creates only the index for ES

```bash
bin/console es:index // Creates only the index for ES
```

**> No Output**

### ES create alias

`es:create:alias`  will create an alias linking to the index after `es:index` is done. Normally this is done automatically. In the older version, this has to be done.

```bash
bin/console es:create:alias
```

**> No Output**

### DAL refresh index

`dal:refresh:index --use-queue` creates a complete reindex from the Shopware DAL (ES/SEO/Media/Sitemap...) **ALWAYS** "`--use-queue`" since big request can outperform the server!

```bash
bin/console dal:refresh:index --use-queue
```

**> Output:**

```bash
[landing_page.indexer]
1/1 [============================] 100% < 1 sec/< 1 sec 38.5 MiB
​
[product.indexer]
22/22 [============================] 100% < 1 sec/< 1 sec 40.5 MiB
​
[customer.indexer]
2/2 [============================] 100% < 1 sec/< 1 sec 40.5 MiB
​
[sales_channel.indexer]
2/2 [============================] 100% < 1 sec/< 1 sec 40.5 MiB
​
[category.indexer]
9/9 [============================] 100% < 1 sec/< 1 sec 40.5 MiB
​
[...]
```

### Messenger consume

`messenger:consume -vv` starts a message consumer working on all tasks. This could be started *X* times. When using more than 3 message consumers, you will need something like RabbitMq to handle the data.

```bash
bin/console messenger:consume -vv
```

**> Output:**

```bash
[OK] Consuming messages from transports "default".
​​
// The worker will automatically exit once it has received a stop signal via the messenger:stop-workers command.
​
// Quit the worker with CONTROL-C.
​
09:47:28 INFO      [messenger] Received message Shopware\Elasticsearch\Framework\Indexing\ElasticsearchIndexingMessage ["message" => Shopware\Elasticsearch\Framework\Indexing\ElasticsearchIndexingMessage^ { …},"class" => "Shopware\Elasticsearch\Framework\Indexing\ElasticsearchIndexingMessage"]
​
[...]
```

### Index cleanup

`es:index:cleanup` to remove unused indices, because each indexing will generate a new Elasticsearch index.

```bash
bin/console es:index:cleanup
```

## Helpful Elasticsearch REST APIs

```bash
curl -XGET 'http://elasticsearch:9200/?pretty'
```

**> Output:**

```bash
{
  "name" : "TZzynG6",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "tHklOFWPSwm-j8Yn-8PRoQ",
  "version" : {
    "number" : "6.8.1",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "1fad4e1",
    "build_date" : "2019-06-18T13:16:52.517138Z",
    "build_snapshot" : false,
    "lucene_version" : "7.7.0",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

### API for cluster health

Returns the health status of a cluster:

```bash
curl -XGET 'http://elasticsearch:9200/_cluster/health?pretty'
```

**> Output:**

```bash
{
  "cluster_name" : "docker-cluster",
  "status" : "yellow",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 1210,
  "active_shards" : 1210,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 1210,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 50.0
}
```

### API for cat indices

Returns high-level information about indices in a cluster, including backing indices for data streams:​

```bash
curl -XGET 'http://elasticsearch:9200/_cat/indices/?pretty'
```

**> Output:**

```bash
yellow open sw1_manufacturer_20210906113224 AYKMT4NJS7eZgU29ww7z6Q 5 1  3 0  33.2kb  33.2kb
yellow open sw1_emotion_20210903165112      he19OP_UR3mMIAKI7ry2mg 5 1  1 0  11.6kb  11.6kb
yellow open sw1_emotion_20210903171353      jBzApKujRPu73CkKA79F7w 5 1  1 0  11.6kb  11.6kb
yellow open sw1_synonym_20210903175037      EexqHsXyTK202XsalUednQ 5 1  1 0     6kb     6kb
yellow open sw1_synonym_20210903170128      NRjlZZ3AQ0Wat1ILB_9L8Q 5 1  0 0   1.2kb   1.2kb
​
[...]
```

### API to delete the index

With `_all` it will delete all indices.

```bash
curl -X DELETE 'elasticsearch:9200/_all'
```

**> Output:**

```bash
{"acknowledged":true}
```

## Show the indexing status in the database

Returns the status of your indexing:

```sql
select count(*) from messenger_messages where headers like '%ElasticsearchIndexingMessage%' and queue_name <> 'failed' ;
select count(*) from messenger_messages where headers like '%ElasticsearchIndexingMessage%' and queue_name = 'failed' ;
```

The first query returns the indexing messages that are still waiting in the queue, the second one returns the indexing messages that failed. As long as there are waiting messages, the indexing is in process and your message consumer has to work those messages.

## What happens when a full reindex fails partway

There is no rollback. A full `es:index` run builds new indices next to the existing ones and does not undo them when it fails:

- If an alias already exists for the entity, the previous index stays live until the alias switches to the new index.
- On first indexing, the alias is put on the new index right away, so the partially filled index is live at once.
- Indices that never received the alias stay until `es:index:cleanup` removes them. `es:reset` removes all indices of the registered entities.
- A new full `es:index` run deletes all rows from `elasticsearch_index_task`. The alias handler no longer sees the indices of the earlier run, so it never switches the alias to them.

The following sections describe how progress is tracked and when the alias moves.

### New index and index task

- A full run first deletes all rows from the `elasticsearch_index_task` table.
- For each entity, a new index named `<alias>_<timestamp>` is created.
- If no alias exists yet for the entity (first indexing), the alias is put on the new index right away, and no `elasticsearch_index_task` row is written.
- If an alias already exists, an `elasticsearch_index_task` row is stored with the new index, the alias, and a `doc_count` set to the number of entities to index.

Handling an `ElasticsearchIndexingMessage` lowers `doc_count` of the message's index by the number of IDs in its batch. This happens before the check that the index exists and before the bulk request. A batch whose bulk request fails, or whose index does not exist, still lowers `doc_count`. A Messenger retry of a failing message lowers it again. The default `async` transport retries a message up to 3 times.

As a result, `doc_count` can reach 0 although documents are missing, and the alias can switch to an index that is missing documents.

`bin/console es:status` reads the `product` row of `elasticsearch_index_task` and shows the indexing as in progress while `doc_count` is greater than 0.

### Failed bulk items

When the bulk request for a batch reports errors, every item without status `200` or `201` is logged at error level. The indexing exception is then logged at critical level. It is thrown again only if `SHOPWARE_ES_THROW_EXCEPTION` is enabled (default `1`) or the environment is `test`.

With `es:index --no-queue`, a thrown exception aborts the command before the alias handler runs.

### Alias switch

The scheduled `CreateAliasTask` checks every `elasticsearch_index_task` row every 5 minutes by default. `bin/console es:create:alias` runs the same handler, and `es:index --no-queue` runs it after all batches are indexed. For each row, the handler:

1. Refreshes the new index and skips the row while `doc_count` is greater than 0.
2. Removes the alias from all other indices and adds it to the new index in a single `updateAliases` call. If the alias does not exist yet, it only adds the alias to the new index.
3. Sets `number_of_replicas` on the new index to the configured value and `refresh_interval` to `null`.
4. Deletes the `elasticsearch_index_task` row.

After the loop over the rows, `ElasticsearchIndexAliasSwitchedEvent` is dispatched with the indices switched in that run, which can be none. The handler does not delete the previous indices. `es:index:cleanup` removes indices matching `<alias>_*` of the registered entities that have no alias.

To start over, `bin/console es:reset` asks for confirmation, then deletes all indices matching `<alias>_*` of the registered entities, truncates `elasticsearch_index_task`, and deletes `ElasticsearchIndexingMessage` rows from the `messenger_messages` table.

## Reset the indexing in the database

Sometimes you want to reset the indexing in your database because your indexing is stuck or you run into an error.
If the database queue is used, third-party services will differ. You can do so with the following queries.

```sql
delete from messenger_messages where headers like '%ElasticsearchIndexingMessage%' ;
update scheduled_task set status = 'scheduled' where status = 'queued';
```

## Completely reset your Elasticsearch and reindex

This is mainly for debugging purposes and is only meant for testing and staging environments.
First, execute the database reset (only working for the database queue):

```sql
delete from messenger_messages where headers like '%ElasticsearchIndexingMessage%' ;
update scheduled_task set status = 'scheduled' where status = 'queued';
```

Now delete the old Elasticsearch index, clear your cache, reindex and ensure that the indexing process is finished:

```bash
curl -X DELETE 'elasticsearch:9200/_all'
bin/console cache:clear
bin/console es:index
bin/console messenger:consume -vv
```

After the last message has been processed, your index should be found in your Storefront else execute:

```bash
bin/console es:create:alias
```

## Logfiles and tips

You can usually find the Elasticsearch logfiles at [`/var/log/elasticsearch`](https://www.elastic.co/guide/en/elasticsearch/reference/master/settings.html#_config_file_format) to check for any issues when indexing.
Also, tools like [Kibana](https://www.elastic.co/kibana) or [Cerebro](https://help.profihost.com/hc/de/articles/18918050563729-Cerebro) can help you better understand what is happening in your Elasticsearch.
