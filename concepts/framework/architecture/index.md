---
nav:
  title: Architecture
  position: 10

---

# Shopware Architecture

Shopware follows a modular, API-first architecture built on top of Symfony and modern frontend technologies. The platform separates concerns into clearly defined layers, allowing storefront experiences, administrative tooling, and core business logic to evolve independently while sharing a common backend foundation.

At a high level, the system consists of three primary domains:

* **Core** — the backend foundation containing business logic, data abstraction, APIs, and extension mechanisms.
* **Storefront** — the customer-facing presentation layer responsible for rendering sales channels and interacting with the Store API.
* **Administration** — the management interface used by merchants and operators to configure, manage, and operate the platform.

These domains are unified through a shared API layer and a consistent plugin system, enabling extensibility without tightly coupling features to presentation layers.

## Architectural principles

The Shopware architecture is guided by several core principles:

* **API-first design** — all functionality is exposed via APIs, enabling headless and composable commerce scenarios.
* **Separation of concerns** — frontend experiences (storefront/admin) are decoupled from backend logic.
* **Extensibility** — plugins integrate through events, services, and extension points rather than modifying core code.
* **Asynchronous processing** — background tasks (indexing, messaging, integrations) are handled via message queues and workers.
* **Domain-driven structure** — business logic is organized around commerce domains rather than UI features.

## Core components

The architecture centers around the Shopware Core, which provides:

* Data Abstraction Layer (DAL) for database interaction
* Business services and domain logic
* Sales Channel and Store APIs
* Plugin and event system
* Messaging and scheduled task infrastructure

The Storefront and Administration layers consume these services rather than duplicating logic, ensuring consistency across channels.

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
      MESS[Symfony Messenger (Async)]
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
    SCHED --> MESS
    BL --> MESS
  end

  %% Infrastructure dependencies
  DB[(MySQL / MariaDB)] <--> DAL
  CACHE[(Redis: Cache / Sessions / Locks)] <--> SW
  SEARCH[(Elasticsearch / OpenSearch)] <--> SW
  FS[(Media Storage: Local FS / NFS / S3)] <--> SW

  %% Async processing
  MQ[(Async Transport: Redis / RabbitMQ / DB)] <--> MESS
  MESS --> W[Workers / Consumers]
  W --> DB
  W --> SEARCH
  W --> FS

  %% External integrations
  EXT[External Services\nPayment / Shipping / ERP / PIM / Tax / Email] <--> API
  EXT <--> W

  RP --> SW
```
