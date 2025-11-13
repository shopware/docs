---
nav:
  title: Set up Elasticsearch
  position: 10

---

# Set up Elasticsearch

## Overview

When a project uses several thousand data sets, it's worth integrating Elasticsearch. Shopware's Elasticsearch integration is provided in the [shopware/elasticsearch](https://github.com/shopware/elasticsearch) bundle. If your project doesn't include it yet, you can add it via `composer require shopware/elasticsearch`. This documentation gives you an overview of Elasticsearch's functionalities on your server, as well as the configuration, activation, and indexing processes in Shopware for live and test environments.

::: info
Currently, the implementation for Elasticsearch/Opensearch works in the same way.
:::

## Requirements

* A supported OpenSearch (or Elasticsearch) server

<PageRef page="../../../installation/requirements#recommended-stack-and-supported-versions" />

* [Running message queue workers in the background](../message-queue)

## Server basics

Elasticsearch installation and configuration greatly depend on your operating system and hosting provider. You will find extensive documentation online regarding the installation and configuration of Elasticsearch on most common Linux distributions. Some hosting providers might also provide specific documentation regarding this subject. Installation on macOS or Windows is also possible but not officially supported.

The current Shopware 6 integration is designed to work with the out-of-the-box configuration of Elasticsearch. This does not mean, of course, that these are the best settings for a production environment. Although they will affect performance and security, the settings you choose to use on your Elasticsearch setup will be mostly transparent to your Shopware installation. The best setting constellation for your shop will greatly depend on your server setup, the number, and structure of products, and replication requirements, to name a few. In this document, we can't give you specific examples for your setup, but provide you with hints and basics you might need to choose your perfect setup. More detailed information can be found on the official [Elasticsearch](https://www.elastic.co/guide/index.html) documentation page.

### Elasticsearch server setup

Elasticsearch is meant to be used as a cluster setup so it can scale properly and provide you with reliability.
In this cluster, you can choose how many nodes you want to use and which different type each node in the cluster shall have.
A one-node cluster should only be used for development or test environments, because it can't scale and does not provide additional reliability.
Reliability is given when you have at least three nodes because of the process of election of the master node. This is further explained in more detail in the [Master Node](#master-node) section.
From our experience, the best way is to have a cluster with five nodes. You can have the three needed master-eligible nodes and 2 nodes which are data nodes and do not proceed in the election process.
Which cluster is really needed in your setup and fits your needs best is up to you.

Most configurations of the Elasticsearch cluster can be done in the elasticsearch.yml file you find in the [config folder](https://www.elastic.co/guide/en/elasticsearch/reference/master/settings.html#config-files-location).
This file configures, for example, the name of your cluster (`cluster.name`), the name of your node (`node.name`), nodes that know each other (`discovery.seed_hosts`), the type of the node (`node.master`, `node.data`, `node.ingest`), the host (`network.host`) and the port (`network.host`).
Sometimes it makes sense to configure your [JVM](https://www.elastic.co/guide/en/elasticsearch/reference/master/advanced-configuration.html#set-jvm-options) as well. You should only make changes here if you know exactly what you do. Most hosting partners will provide you with a fitting setup that will not require many changes here.
The data files of the index will be found in the data directory later on. Another important folder is the `logs` folder. If not configured differently, you will find the different logfiles for your cluster here in case you ever need to check an error or slowlog.

### Nodes

Every instance of Elasticsearch starts a node. A collection of connected nodes is called a cluster. All nodes can handle HTTP and transport traffic.
Depending on your setup, the necessary performance, and reliability, you might want to have dedicated nodes of the following types in your cluster.

#### Master nodes

Master nodes are in charge of the cluster-wide settings and changes like CRUD operations of indices, including mappings and settings of those, adding nodes, removing nodes, and allocating the [shards](#shards) to the nodes.
A productive cluster of Elasticsearch should always contain three nodes that are all master-eligible nodes set by the `node.master` property in the elasticsearch.yml file. The master node is chosen by an election process of which only the master-eligible nodes are part. In an election process, you have to mind a quorum of master-eligible nodes, so you get a specific result of the election, so you should have N/2+1 master-eligible nodes. Three is the minimum number for this because then the currently elected master node fails, you can still have a correct election process for a new master. The setting "cluster.initial_master_nodes: ["masternode1","masternode2","masternode3"]" should be provided on each of those master-eligible nodes on start.

#### Ingest nodes

Ingest nodes provide the ability to pre-process a document before it gets indexed.
The ingest node intercepts bulk and index requests, applies transformations, and then passes the documents back to the index or bulk APIs.
All nodes are Ingest nodes by default. This can be changed by the `node.ingest` property in the elasticsearch.yml file.

#### Data nodes

Data nodes have two main features: they hold the [shards](#shards) that contain the documents/elements you have indexed and execute data-related operations like CRUD, search, and aggregations.
By default, all nodes are Data nodes, which can be changed using the `node.data` property in the elasticsearch.yml file.
Data nodes are very resource-intensive, so you definitely want to monitor the resources and add more data nodes if they are overloaded.

### Shards

A shard is a worker unit that holds the data of the index and can be assigned to a node. There are two types of shards:

* **Primary**: A primary shard contains the original data.
* **Replica**: A replica is a copy of a primary shard.

The number of replica shards is up to you and the reliability you need in your cluster. The more replica shards you have, the more nodes can fail before the data in the shard becomes unavailable.
But reliability is not the only usage of a replica shard. Queries like search can be performed on a primary or replica. So if you have replicas of your shards, you can better scale your data and cluster resources.
A replica is only created when there are enough nodes because a replica can never be created in the same node as its primary or another replica of its primary.
The master node determines where the shard is distributed.
Normally a shard in Elasticsearch can hold at least tens of gigabytes, so you might want to keep this in mind when setting your number of shards and replicas.

## Prepare Shopware for Elasticsearch

### Variables in your *.env*

| Variable                       | Possible values  | Description                                                                                                                                                                                                                      |
|--------------------------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `APP_ENV`                      | `prod` / `dev`   | This variable is important if you want to activate the debug mode and see possible errors of Elasticsearch. You have to set the variable to dev for debug mode and prod if you want to use Elasticsearch in a productive system. |
| `OPENSEARCH_URL`               | `localhost:9200` | A comma separated list of Elasticsearch hosts. You can find the possible formats [here](https://www.elastic.co/guide/en/elasticsearch/client/php-api/current/host-config.html#inline-host-config)                                |
| `SHOPWARE_ES_INDEXING_ENABLED` | `0` / `1`        | This variable activates the indexing to Elasticsearch                                                                                                                                                                            |
| `SHOPWARE_ES_ENABLED`          | `0` / `1`        | This variable activates the usage of Elasticsearch for your shop                                                                                                                                                                 |
| `SHOPWARE_ES_INDEX_PREFIX`     | `sw_myshop`      | This variable defines the prefix for the Elasticsearch indices                                                                                                                                                                   |
| `SHOPWARE_ES_THROW_EXCEPTION`  | `0` / `1`        | This variable activates the debug mode for Elasticsearch. Without this variable as = 0 you will get a fallback to mysql without any error message if Elasticsearch is not working                                                |

### Example file for productive environments

```bash
APP_ENV=prod
APP_SECRET=1
INSTANCE_ID=1
DATABASE_URL=mysql://mysqluser:mysqlpassword@localhost:3306/shopwaredatabasename
APP_URL=http://localhost
MAILER_URL=smtp://localhost:1025
COMPOSER_HOME=/var/www/html/var/cache/composer

OPENSEARCH_URL="elasticsearchhostname:9200"
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

OPENSEARCH_URL="elasticsearchhostname:9200"
SHOPWARE_ES_ENABLED="1"
SHOPWARE_ES_INDEXING_ENABLED="1"
SHOPWARE_ES_INDEX_PREFIX="sw"
SHOPWARE_ES_THROW_EXCEPTION=1
```

### Example for changing index configuration

Shopware will use by default three shards and three replicas for the created index. This configuration can be overwritten with a new config file in `config/packages/elasticsearch.yml`

::: info
This configuration is available since Shopware version 6.4.12.0
:::

```yaml
elasticsearch:
  index_settings:
    number_of_shards: 1
    number_of_replicas: 0
```

## Indexing

Before indexing, you might want to clear your cache with `bin/console cache:clear` so the changes from your *.env* can be processed.

### Basic Elasticsearch indexing

Normally, you can index by executing the command `bin/console es:index`.

::: info
Elasticsearch common error handling and tips can refer to [elasticsearch troubleshooting](https://developer.shopware.com/docs/resources/guidelines/troubleshooting/elasticsearch.html).
:::

### Indexing the whole shop

Sometimes you want to reindex your whole shop, including Elasticsearch, SEO-URLs, product index, and more.
For a reindex of the whole shop, you can use the command `bin/console dal:refresh:index --use-queue`. Use the `--use-queue` option because you will have too many products to index without the [message queue](/docs/guides/hosting/infrastructure/message-queue) involved.

### Alias creation

Some systems require you to manually execute `bin/console es:create:alias` after the indexing is processed completely.
Try that command if your index was created fully without errors, and you still don't see products in your Storefront.

### What happens when indexing

When you are indexing, the data is written in bulks to the message queue and the respective table enqueue.
If a messenger process is active, the entries of that table are processed one by one.
In case a message runs into an error, it is written into the `dead_messages` table and will be processed again after a specific time frame.

You can start multiple messenger consumer processes by using the command `bin/console messenger:consume` and also add output to the processed messages by adding the parameter `bin/console messenger:consume -vv`.
In a production environment, you want to deactivate the admin messenger which is started automatically when opening a session in your Administration view by following this [documentation](/docs/guides/plugins/plugins/framework/message-queue/add-message-handler#the-admin-worker).

Our experience has shown that up to three worker processes are normal and useful for a production environment.
If you want more than that, a tool like [RabbitMQ](/docs/guides/hosting/infrastructure/message-queue#transport-rabbitmq-example) to handle the queue is needed so your database will not become a bottleneck.

## Configuration

Keep in mind that the search configuration of Shopware has no effect when using Elasticsearch.
To configure which fields and elements are searchable when using Elasticsearch, you must install the extension [Advanced Search](https://docs.shopware.com/en/shopware-6-en/enterprise-extensions/enterprise-search).

## Elasticsearch for Admin

Shopware 6.4.19.0 and above supports "AND/OR Search" functionality in Administration for more flexible search queries using either "AND" or "OR" operators.

Add the below config variables to set up Elasticsearch for Administration:

```bash
ADMIN_OPENSEARCH_URL=YOUR OPEN SEARCH URL
SHOPWARE_ADMIN_ES_ENABLED=1
SHOPWARE_ADMIN_ES_REFRESH_INDICES=1
SHOPWARE_ADMIN_ES_INDEX_PREFIX=sw-admin
```

Also, the CLI commands can be used as below:

```bash
bin/console es:admin:index
bin/console es:admin:reset
bin/console es:admin:test
```

::: info
Advanced admin users can refer to [elasticsearch reference guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html) for complex search queries.
:::
