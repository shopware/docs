---
nav:
  title: Architecture
  position: 10

---

# Architecture

On a high level, Shopware consists of multiple modules that separate the entire code base into logical units. Some modules are independent, and some depend on others.

## Architectural overview

High-level architectural overview of Shopware’s core system layers and supporting infrastructure.

```mermaid
flowchart TB
  %% Entry
  U[User (Customer / Admin)] -->|HTTPS| RP[Reverse Proxy / Load Balancer]

  %% Application boundary
  subgraph SW[Shopware 6 Application]
    direction TB

    %% Top-level modules
    subgraph CORE[Core]
      direction TB
      DAL[Data Abstraction Layer (DAL)]
      BL[Business Logic / Services]
      API[Sales Channel API + Store API]
      PLUG[Plugin System + Events]
      SCHED[Scheduled Tasks]
      MESSAGE[Symfony Messenger (Async)]
    end

    subgraph ADMIN[Administration]
      direction TB
      ADMUI[Admin UI (Vue)]
      ADMAPI[Admin API (ACL / AuthZ)]
      BUILDADM[Build Tooling (npm/webpack)]
      ADMUI --> ADMAPI
    end

    subgraph STOREFRONT[Storefront]
      direction TB
      SFSSR[Storefront (Twig / Symfony Controllers)]
      SFAPI[Store API / Sales Channel API Client]
      BUILDSF[Build Tooling (npm/webpack)]
      SFSSR --> SFAPI
    end

    %% Internal interactions
    ADMIN --> API
    STOREFRONT --> API
    API --> DAL
    BL --> DAL
    PLUG --> BL
    SCHED --> MESSAGE
    BL --> MESSAGE
  end

  %% Infrastructure dependencies
  DB[(MySQL / MariaDB)] <--> DAL
  CACHE[(Redis: Cache / Sessions / Locks)] <--> SW
  SEARCH[(Elasticsearch / OpenSearch)] <--> SW
  FS[(Media Storage: Local FS / NFS / S3)] <--> SW

  %% Async processing
  MQ[(Async Transport: Redis / RabbitMQ / DB)] <--> MESSAGE
  MESSAGE --> W[Workers / Consumers]
  W --> DB
  W --> SEARCH
  W --> FS

  %% External integrations
  EXT[External Services\nPayment / Shipping / ERP / PIM / Tax / Email] <--> API
  EXT <--> W

  RP --> SW
```
