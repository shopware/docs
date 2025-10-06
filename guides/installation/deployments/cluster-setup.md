---
nav:
  title: Cluster Setup
  position: 5

---

# Cluster Setup

The setup of multiple app servers / instances is a common requirement for high-availability and high-traffic scenarios. In this guide we provide best practices and recommendations for such setups.

## Typical architecture

```mermaid
flowchart LR
  %% Client
  B[Browser]

  %% Entry / Load Balancer with TLS termination
  subgraph LB[Load Balancer]
    HA[HAProxy]
  end

  %% App tier
  subgraph APP[App Server]
    direction TB
    A1[App-1]
    A2[App-2]
  end

  %% Data/infra services
  subgraph REDIS[Redis Cluster]
    direction TB
    R1[(Redis-1)]
    R2[(Redis-2)]
  end

  subgraph RMQ[RabbitMQ Cluster]
    direction TB
    Q1[(RabbitMQ-1)]
    Q2[(RabbitMQ-2)]
  end

  subgraph ES[Elasticsearch Cluster]
    direction TB
    E1[(ES-1)]
    E2[(ES-2)]
  end

  %% New: MySQL cluster
  subgraph MYSQL[MySQL Cluster]
    direction TB
    M1[(MySQL-1)]
    M2[(MySQL-2)]
  end

  %% Routing
  B -->|HTTPS :443| HA
  HA -->|HTTP| A1
  HA -->|HTTP| A2

  %% App → Redis
  A1 <-->|TCP 6379| R1
  A2 <-->|TCP 6379| R2

  %% App → RabbitMQ
  A1 -->|AMQP :5672| Q1
  A2 -->|AMQP :5672| Q2

  %% App → Elasticsearch
  A1 -->|REST :9200| E1
  A2 -->|REST :9200| E2

  %% App → MySQL
  A1 -->|MySQL :3306| M1
  A2 -->|MySQL :3306| M2

  %% Styles
  classDef lb fill:#f6d365,stroke:#333,stroke-width:1px;
  classDef app fill:#d4f1f4,stroke:#333,stroke-width:1px;
  classDef redis fill:#ffd6e7,stroke:#333,stroke-width:1px;
  classDef rmq fill:#e7f6d5,stroke:#333,stroke-width:1px;
  classDef es fill:#f0e6ff,stroke:#333,stroke-width:1px;
  classDef mysql fill:#fff2cc,stroke:#333,stroke-width:1px;
  classDef client fill:#e8e8e8,stroke:#333,stroke-width:1px;

  class HA lb;
  class A1,A2,A3 app;
  class R1,R2,R3 redis;
  class Q1,Q2,Q3 rmq;
  class E1,E2,E3 es;
  class M1,M2,M3 mysql;
  class B client;
```

::: info
If you use an external cache server like Varnish / Fastly, that would be placed between the client and the load balancer.
:::

## Shopware configuration

To configure Shopware for a cluster setup, you have to set the following configuration in your shopware.yaml file:

```yaml
shopware:
    deployment:
        # Cache clearing only deletes object cache files, no Symfony cache files on node
        cluster_setup: true
        # Disables the extension management in the administration
        runtime_extension_management: false
    auto_update:
        # Disables updates via the administration
        enabled: false
```

This option prevents Shopware from running operations locally (meaning only on one node in a cluster), that potentially can corrupt the state of the cluster by having the state of the nodes diverge from each other, e.g. clearing symfony cache files at runtime.

## Sharing services

In a clustered environment, it is important to share certain services across all nodes to ensure consistency and reliability. This includes:

- **Cache**: Implement a distributed cache solution (e.g. Redis) to share cached data between nodes.
- **File storage**: Use a shared file storage solution (e.g. S3) to ensure all nodes have access to the same files.
- **Sessions**: Store sessions in a shared storage (e.g. Redis) to allow users to maintain their sessions across different nodes.

## Database cluster

If you need high availability for your database, you can set up a database cluster. This typically involves setting up multiple database instances with replication and failover mechanisms.

<PageRef page="../configurations/database-cluster" />

## Performance tweaks

Besides the generally sharing of services, there are some performance tweaks that can be applied in a clustered environment:

<PageRef page="../configurations/performance-tweaks" />
