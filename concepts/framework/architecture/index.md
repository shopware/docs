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
