# Elasticsearch

## Overview

As soon as several thousand data sets are used in a project, it makes sense to deal with Elasticsearch. Elasticsearch 7.8 or newer is required. The Elasticsearch integration for Shopware is in the [shopware/elasticsearch](https://github.com/shopware/elasticsearch) bundle. If this is not available in your project you can simply add it via `composer require shopware/elasticsearch`.

## Requirements

* Elasticsearch 7.8 or newer
* [Running message queue workers in background](message-queue.md)

## Serverbasics

Elasticsearch installation and configuration greatly depends on your operating system and hosting provider. You will find extensive documentation online regarding the installation and configuration of Elasticsearch on most common Linux distributions. Some hosting providers might also provide specific documentation regarding this subject. Installation on Mac OSX or Windows is also possible, but not officially supported.

The current Shopware 6 integration is designed to work with the out-of-the-box configuration of Elasticsearch. This does not mean, of course, that these are the best settings for a production environment. Although they will affect performance and security, the settings you choose to use on your Elasticsearch setup will be mostly transparent to your Shopware installation. The best setting constellation for your shop will greatly depend on your server setup, number and structure of products, replication requirements , to name a few. In this document we can not give you specific examples for your setup, but hints and basics you might need to choose your perfect setup. More detailed information can be found on the official Elasticsearch documentation page. <https://www.elastic.co/guide/index.html>

### Elastic Server Setup on Ubuntu

Elastic is meant to be used as a cluster setup so it can scale properly and provide you reliability.
In this cluster you can choose how many nodes you want to use and which different type each node in the cluster shall have.
A one node cluster is only meant for development or test environments because it can not scale at all and does not give you any more reliability.
Reliability is given when you have at least 3 nodes because of the process of election of the master node. This will be explained in more detail in the Master Node paragraph.
The best way is often to have a cluster with 5 nodes so you can have the 3 needed master-eligible nodes and two nodes which are only data.nodes and do not proceed in the election process.
Which cluster is really needed in your setup and fits your needs best is up to you.

Most configuration of the elastic cluster can be done in the elasticsearch.yml file you find the config folder.
This file configures for example the name of your cluster (`cluster.name`) and node (`node.name`), which nodes know each other (discovery.seed_hosts), as well as the type of the node(node.master, node.data, node.ingest) and the host (network.host) and port (network.host).
Another important file is the jdk file, while you should only do changes here if you exactly know what you do. Most hosting partners will provide you with a fitting setup, that will not require many changes here.
The data files of the index will be found in the data directory lateron. Another important folder is the logs folder. If not configured differently you fill find the different logfiles for your cluster in here in case you ever need to check an error or slowlog.

### Nodes

Every instance of Elasticsearch is starting a node. A collection of connected nodes are called a cluster. All nodes can handle HTTP and transport traffic.
Depending on your setup and the needed performance and reliability you might want to have dedicated nodes of the following types in your cluster.

#### Master Nodes

Master nodes is in charge of the cluster-wide settings and changes like CRUD-Operations of indices including mappings and settings of those, adding and removing nodes and allocating the shards to the nodes.
A productive cluster of elastic should always contain 3 nodes that are all master-eligible nodes, set by the node.master property in the elasticsearch.yml file. The master node is chosen by an election process which only the master-eligible nodes are part of. In an election process you have to mind a quorum of master-eligible nodes so you get a specific result of the election, so you should have N/2+1 master-eligible nodes. 3 is the minimum number for this because then the currently elected master node fails you can still have a correct election process for a new master. The setting "cluster.initial_master_nodes: ["masternode1","masternode2","masternode3"]" should be provided on each of those master-eligible nodes on start.

#### Ingest Nodes

Ingest nodes provide the ability to pre-process a document before it gets indexed.
The ingest node intercepts bulk and index requests, applies transformations and then passes the documents back to the index or bulk APIs.
All nodes are ingest nodes by default which can be changed by the node.ingest property in the elasticsearch.yml file.

#### Data Nodes

Data nodes have to main features. They hold the shards that contain the documents/elements you have indexed and they execute data related operations like CRUD, search and aggregations.
By default all nodes are data nodes, which can be changed by using the node.data property in the elasticsearch.yml file.
Data nodes are very resource intensive so you definitely want to monitore the resources and add more data nodes if they are overloaded.

### Shards

A shard is a worker unit that holds the data of the index and can be assigned to a node. There are two types of shards, primary and replica. A primary shard contains the original data, while a replica is the copy of a primary shard.
The number of replica shards is up to you and the reliability you need in your cluster. The more replicas of shards you have the more nodes can fail before the data in the shard becomes unavailable.
But reliability is not the only usage of a replica shard. Queries like search can be performed either on a primary or replica so if you have replicas of your shards you can better scale your data and cluster resources.
A replica is only created when there are enough nodes, because a replica can never be created in the same node as its primary or another replica of its primary.
The master node determines where the shard is distributed.
Normally a shard in Elasticsearch can hold at least 10s of gigabytes so you might want to keep this in mind when setting your number of shards and replicas.

## Prepare Shopware for Elasticsearch

### Variables in your .env

| Variable | Possible values | Description |
| ---------|-----------------|-------------|
| `APP_ENV=`| prod / dev | This variable is important if you want to activate the debug mode and see possible errors of elasticsearch. You have to set the variable to dev for debug mode and prod if you want to use elasticsaerch in a productive system.|
| `SHOPWARE_ES_HOSTS=`| localhost:9200 | A comma separated list of Elasticsearch hosts. You can find the possible formats [here](https://www.elastic.co/guide/en/elasticsearch/client/php-api/current/host-config.html#inline-host-config)|
| `SHOPWARE_ES_INDEXING_ENABLED=`| 0 / 1 |  This variable activates the indexing to Elasticsearch|
| `SHOPWARE_ES_ENABLED=`| 0 / 1 | This variable activates the usage of Elasticsearch for your shop|
| `SHOPWARE_ES_INDEX_PREFIX=`| sw_myshop | This variable defines the prefix for the Elasticsearch indices|
| `SHOPWARE_ES_THROW_EXCEPTION=`| 0 / 1 | This variable activates the debug mode for Elasticsearch, without this variable as = 1 you will get a fallback to mysql without any error message if elasticsearch is not working|

### Example file for productive environments

```bash
APP_ENV=prod
APP_SECRET=1
INSTANCE_ID=1
DATABASE_URL=mysql://mysqluser:mysqlpassword@localhost:3306/shopwaredatabasename
APP_URL=http://localhost
MAILER_URL=smtp://localhost:1025
COMPOSER_HOME=/var/www/html/var/cache/composer

SHOPWARE_ES_HOSTS="elasticsearchhostname:9200"
SHOPWARE_ES_ENABLED="1"
SHOPWARE_ES_INDEXING_ENABLED="1"
SHOPWARE_ES_INDEX_PREFIX="sw"
SHOPWARE_ES_THROW_EXCEPTION=0
```

### Example file for debug configuration

```bash
APP_ENV=dev
APP_SECRET=1
INSTANCE_ID=1
DATABASE_URL=mysql://mysqluser:mysqlpassword@localhost:3306/shopwaredatabasename
APP_URL=http://localhost
MAILER_URL=smtp://localhost:1025
COMPOSER_HOME=/var/www/html/var/cache/composer

SHOPWARE_ES_HOSTS="elasticsearchhostname:9200"
SHOPWARE_ES_ENABLED="1"
SHOPWARE_ES_INDEXING_ENABLED="1"
SHOPWARE_ES_INDEX_PREFIX="sw"
SHOPWARE_ES_THROW_EXCEPTION=1
```

## Indexing

Before indexing you should might want to clear your cache with `bin/console cache:clear` so the changes from your .env can be processed.

### Basic Elasticsearch indexing

Normally you can index by executing the command `bin/console es:index`.

### Indexing the whole shop

Sometimes you want to reindex your whole shop including Elasticsearch, seo-urls, product index and more.
You use the command `bin/console dal:refresh:index --use-queue`. Please mind to use the --use-queue option because you will have to many products to index without the message queue involved.

### Alias creation

Some systems require you to manually execute `bin/console es:create:alias` after the indexing was processed completely.
Try that command if your index was created fully without errors and you still do not see products in your storefront.

### What happens when indexing

When you are indexing the data is written in bulks to the message queue and the respective table enqueue.
If a messenger process is active the entries of that table are processed one by one.
In case a message runs into an error it is written into the dead_messages table and will be processed again after a specific timeframe.

You can start multiple messenger processes by using the command `bin/console messenger:consume` and also add output to the processed messages by adding the parameter `bin/console messenger:consume -vv`.
In an productive environment you want to deactivate the admin messenger which is started automatically when opening a session in your administration view by following this [documentation](https://developer.shopware.com/docs/guides/plugins/plugins/framework/message-queue/add-message-handler#the-admin-worker).

Our experience has shown that up to three worker processes are normal and usefull for a production environment.
If you want or need more than that a tool like [RabbitMq](https://developer.shopware.com/docs/guides/hosting/infrastructure/message-queue#transport-rabbitmq-example) to handle the queue is needed so your database will not become a bottleneck.

## Debugging

### Shopware 6 CLI Commands

#### Cache Clear

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

#### ES Index

`es:index` creates only the index for ES

```bash
bin/console es:index // Creates only the index for ES
```

**> No Output**

#### ES Create Alias

`es:create:alias`  When `es:index` is done, this command creates an alias, linking to the index. Normally this is done automatically, in older version this has to be done

```bash
bin/console es:create:alias 
```

**> No Output**

#### DAL Refresh Index

`dal:refresh:index --use-queue` creates a complete reindex from the Shopware DAL (ES/SEO/Media/Sitemap...) **ALWAYS** "`--use-queue`" since big request can outperform the server!

```bash​
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

#### Messenger Consume

`messenger:consume -vv` starts a messenger working on all tasks. This could be startet *X* times. When using more then 3 messengers, you will need something like RabbitMq to handle the data

```bash​
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

#### Index cleanup

`es:index:cleanup` to remove unused indices, because each indexing will generate a new Elasticsearch index.

```bash​
bin/console es:index:cleanup
```

### Helpfull Elasticsearch REST APIs

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

#### Cluster health API

Returns the health status of a cluster.

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

#### cat indices API

Returns high-level information about indices in a cluster, including backing indices for data streams.​

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

#### Delete index API

With `_all` it will delete all indices.

```bash
curl -X DELETE 'elasticsearch:9200/_all'
```

**> Output:**

```bash
{"acknowledged":true}
```

### Show the indexing status in the database

Returns the status of your indexing. The number of entries in the enqueue should match the sum of the sitze values in the message_queue_stats.
As long as there are entries in your enqueue, the indexing is in process and your messenger has to work those messages.

```sql
select * from message_queue_stats mqs ; 
select count(*) from enqueue e ; 
select count(*) from dead_message dm ; 
```

### Reset the indexing in the database

Sometimes your indexing has stuck or run into an error and you want to reset the indexing in your database.
You can do so with the following queries:

```sql
truncate enqueue ; 
truncate dead_message ;
truncate message_queue_stats ;
update scheduled_task set status = 'scheduled' where status = 'queued';
```

### Completely reset your Elasticsearch and reindex

This is mainly for debugging purposes and only meant for test and staging environments.
First execute the database reset:

```sql
truncate enqueue ; 
truncate dead_message ;
truncate message_queue_stats ;
update scheduled_task set status = 'scheduled' where status = 'queued';
```

Now delete the old Elasticsearch index, clear your cache, then reindex and ensure that the indexing process is finished:

```bash
curl -X DELETE 'elasticsearch:9200/_all'
bin/console cache:clear
bin/console es:index
bin/console messenger:consume -vv
```

After the last message has been processed your index should be found in your storefront, if not execute:

```bash
bin/console es:create:alias
```

### Logfiles and tipps

You normally can find the Elasticsearch logfiles at `/var/log/elasticsearch` to check for any issues when indexing.
Also tools like [Kibana](https://www.elastic.co/what-is/kibana) or [Cerebro](https://wissen.profihost.com/wissen/artikel/cerebro/) can help you better understand what is happening in your Elasticsearch.

## Configuration

Keep in mind that the search configuration of Shopware has no effect when you are using Elasticsearch.
To be able to configure which fields and elements are searchable when using Elasticsearch, you will have to install the enterprise accellerator extension [Enterprise Search](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search).
