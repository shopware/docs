# Set up Elasticsearch

## Overview

As soon as several thousand data sets are used in a project, it makes sense to deal with Elasticsearch. The Elasticsearch integration for Shopware is in the [shopware/elasticsearch](https://github.com/shopware/elasticsearch) bundle. If this is not available in your project you can simply add it via `composer require shopware/elasticsearch`. In this documentation we will provide you a short overview about the functionalities of Elasticsearch on your server and the configuration, activation and indexing process in Shopware for live and test environments.

## Requirements

* Opensearch >= 1.0 or Elasticsearch >= 7.8
* [Running message queue workers in background](message-queue.md)

## Server basics

Elasticsearch installation and configuration greatly depends on your operating system and hosting provider. You will find extensive documentation online regarding the installation and configuration of Elasticsearch on most common Linux distributions. Some hosting providers might also provide specific documentation regarding this subject. Installation on Mac OSX or Windows is also possible, but not officially supported.

The current Shopware 6 integration is designed to work with the out-of-the-box configuration of Elasticsearch. This does not mean, of course, that these are the best settings for a production environment. Although they will affect performance and security, the settings you choose to use on your Elasticsearch setup will be mostly transparent to your Shopware installation. The best setting constellation for your shop will greatly depend on your server setup, number and structure of products, replication requirements , to name a few. In this document we can not give you specific examples for your setup, but hints and basics you might need to choose your perfect setup. More detailed information can be found on the official [Elasticsearch documentation page](https://www.elastic.co/guide/index.html)

### Elasticsearch Server Setup

Elasticsearch is meant to be used as a cluster setup so it can scale properly and provide you reliability.
In this cluster you can choose how many nodes you want to use and which different type each node in the cluster shall have.
A one node cluster is only meant for development or test environments because it can not scale at all and does not give you any more reliability.
Reliability is given when you have at least 3 nodes because of the process of election of the master node. This will be explained in more detail in the [Master Node paragraph](#master-node).
From our experience the best way is to have a cluster with 5 nodes so you can have the 3 needed master-eligible nodes and two nodes which are only data.nodes and do not proceed in the election process.
Which cluster is really needed in your setup and fits your needs best is up to you.

Most configuration of the Elasticsearch cluster can be done in the elasticsearch.yml file you find in the [config folder](https://www.elastic.co/guide/en/elasticsearch/reference/master/settings.html#config-files-location).
This file configures for example the name of your cluster (`cluster.name`) and node (`node.name`), which nodes know each other (`discovery.seed_hosts`), as well as the type of the node (`node.master`, `node.data`, `node.ingest`) and the host (`network.host`) and port (`network.host`).
Sometimes it makes sence to configure your [JVM](https://www.elastic.co/guide/en/elasticsearch/reference/master/advanced-configuration.html#set-jvm-options) as well, you should only do changes here if you exactly know what you do. Most hosting partners will provide you with a fitting setup, that will not require many changes here.
The data files of the index will be found in the data directory later on. Another important folder is the logs folder. If not configured differently you will find the different logfiles for your cluster in here in case you ever need to check an error or slowlog.

### Nodes

Every instance of Elasticsearch is starting a node. A collection of connected nodes are called a cluster. All nodes can handle HTTP and transport traffic.
Depending on your setup and the needed performance and reliability you might want to have dedicated nodes of the following types in your cluster.

#### Master Nodes

Master nodes are in charge of the cluster-wide settings and changes like CRUD-Operations of indices including mappings and settings of those, adding and removing nodes and allocating the shards to the nodes.
A productive cluster of Elasticsearch should always contain 3 nodes that are all master-eligible nodes, set by the node.master property in the elasticsearch.yml file. The master node is chosen by an election process which only the master-eligible nodes are part of. In an election process you have to mind a quorum of master-eligible nodes so you get a specific result of the election, so you should have N/2+1 master-eligible nodes. 3 is the minimum number for this because then the currently elected master node fails you can still have a correct election process for a new master. The setting "cluster.initial_master_nodes: ["masternode1","masternode2","masternode3"]" should be provided on each of those master-eligible nodes on start.

#### Ingest Nodes

Ingest nodes provide the ability to pre-process a document before it gets indexed.
The ingest node intercepts bulk and index requests, applies transformations and then passes the documents back to the index or bulk APIs.
All nodes are ingest nodes by default which can be changed by the node.ingest property in the elasticsearch.yml file.

#### Data Nodes

Data nodes have two main features. They hold the shards that contain the documents/elements you have indexed and they execute data related operations like CRUD, search and aggregations.
By default all nodes are data nodes, which can be changed by using the node.data property in the elasticsearch.yml file.
Data nodes are very resource intensive so you definitely want to monitore the resources and add more data nodes if they are overloaded.

### Shards

A shard is a worker unit that holds the data of the index and can be assigned to a node. There are two types of shards, primary and replica. A primary shard contains the original data, while a replica is the copy of a primary shard.
The number of replica shards is up to you and the reliability you need in your cluster. The more replica shards you have the more nodes can fail before the data in the shard becomes unavailable.
But reliability is not the only usage of a replica shard. Queries like search can be performed either on a primary or replica so if you have replicas of your shards you can better scale your data and cluster resources.
A replica is only created when there are enough nodes, because a replica can never be created in the same node as its primary or another replica of its primary.
The master node determines where the shard is distributed.
Normally a shard in Elasticsearch can hold at least tens of gigabytes so you might want to keep this in mind when setting your number of shards and replicas.

## Prepare Shopware for Elasticsearch

### Variables in your .env

| Variable | Possible values | Description |
| ---------|-----------------|-------------|
| `APP_ENV`| `prod` / `dev` | This variable is important if you want to activate the debug mode and see possible errors of Elasticsearch. You have to set the variable to dev for debug mode and prod if you want to use elasticsaerch in a productive system.|
| `SHOPWARE_ES_HOSTS`| `localhost:9200` | A comma separated list of Elasticsearch hosts. You can find the possible formats [here](https://www.elastic.co/guide/en/elasticsearch/client/php-api/current/host-config.html#inline-host-config)|
| `SHOPWARE_ES_INDEXING_ENABLED`| `0` / `1` |  This variable activates the indexing to Elasticsearch|
| `SHOPWARE_ES_ENABLED`| `0` / `1` | This variable activates the usage of Elasticsearch for your shop|
| `SHOPWARE_ES_INDEX_PREFIX`| `sw_myshop` | This variable defines the prefix for the Elasticsearch indices|
| `SHOPWARE_ES_THROW_EXCEPTION`| `0` / `1` | This variable activates the debug mode for Elasticsearch, without this variable as = 1 you will get a fallback to mysql without any error message if Elasticsearch is not working|

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
SHOPWARE_ES_THROW_EXCEPTION=1
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

### Example for changing index configuration

Shopware will use in default 3 shards and 3 replicas for the created index. This configuration can be overwritten with a new config file in `config/packages/elasticsearch.yml`

{% hint style="info" %}
This configuration is available since Shopware version 6.4.12.0
{% endhint %}

```yml
elasticsearch:
  index_settings:
    number_of_shards: 1
    number_of_replicas: 0
```

## Indexing

Before indexing you should might want to clear your cache with `bin/console cache:clear` so the changes from your .env can be processed.

### Basic Elasticsearch indexing

Normally you can index by executing the command `bin/console es:index`.

### Indexing the whole shop

Sometimes you want to reindex your whole shop including Elasticsearch, seo-urls, product index and more.
For a reindex of the whole shop, you can use the command `bin/console dal:refresh:index --use-queue`. Please mind using the `--use-queue` option because you will have too many products to index without the [message queue](/docs/guides/hosting/infrastructure/message-queue) involved.

### Alias creation

Some systems require you to manually execute `bin/console es:create:alias` after the indexing was processed completely.
Try that command if your index was created fully without errors and you still do not see products in your storefront.

### What happens when indexing

When you are indexing the data is written in bulks to the message queue and the respective table enqueue.
If a messenger process is active the entries of that table are processed one by one.
In case a message runs into an error it is written into the `dead_messages` table and will be processed again after a specific timeframe.

You can start multiple messenger consumer processes by using the command `bin/console messenger:consume` and also add output to the processed messages by adding the parameter `bin/console messenger:consume -vv`.
In an productive environment you want to deactivate the admin messenger which is started automatically when opening a session in your administration view by following this [documentation](/docs/guides/plugins/plugins/framework/message-queue/add-message-handler#the-admin-worker).

Our experience has shown that up to three worker processes are normal and useful for a production environment.
If you want or need more than that a tool like [RabbitMq](/docs/guides/hosting/infrastructure/message-queue#transport-rabbitmq-example) to handle the queue is needed so your database will not become a bottleneck.

## Configuration

Keep in mind that the search configuration of Shopware has no effect when you are using Elasticsearch.
To be able to configure which fields and elements are searchable when using Elasticsearch, you will have to install the enterprise accellerator extension [Enterprise Search](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search).
