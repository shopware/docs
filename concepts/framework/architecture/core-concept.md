---
nav:
  title: Core
  position: 25
---

# Core

The Core component represents the central backend foundation of Shopware. It provides the domain logic, data handling, APIs, and extensibility mechanisms that power both the Storefront and Administration components.

Conceptually, the Core sits at the center of the platform architecture. While the Storefront and Administration provide user interfaces, the Core exposes functionality through structured APIs and services. All business logic, domain modeling, and system integrations are implemented within the Core to ensure consistency across different presentation layers.

The Core is built on Symfony and follows modern backend design principles such as dependency injection, domain-driven organization, and event-based extensibility.

## Main concerns

The Core component is responsible for:

* Managing business logic and domain services
* Providing API interfaces (Store API and Admin API)
* Handling data persistence and abstraction
* Managing plugins and extensions
* Supporting asynchronous processing
* Providing integration points for external systems

## Domain-driven architecture

Shopware organizes the Core around commerce-related domains rather than technical layers. Examples include:

* Products
* Orders
* Customers
* Checkout
* Pricing
* Inventory

Each domain encapsulates its own services, entities, and business rules. This structure helps maintain clear boundaries and improves extensibility.

## Data abstraction layer (DAL)

The Data Abstraction Layer (DAL) provides a consistent way to access and manipulate database entities. Instead of working directly with database queries, developers interact with repositories and entity definitions.

Key responsibilities of the DAL include:

* Entity definitions and associations
* Validation and schema abstraction
* Versioning and inheritance handling
* Context-aware data access
* Event dispatching during entity lifecycle changes

The DAL ensures that all components access data consistently and enables powerful extension capabilities.

## APIs and communication

The Core exposes functionality through two primary APIs:

* **Store API** — Public-facing API used by storefront applications and headless frontends. It supports anonymous access and customer-authenticated requests depending on the endpoint.
* **Administration API** — OAuth 2.0 secured API used by the Administration SPA and external management integrations.

Both APIs communicate over HTTP and exchange structured JSON payloads, allowing decoupled frontend implementations.

## Plugin and extension system

Extensibility is a fundamental design principle of Shopware. The Core provides multiple extension mechanisms:

* Symfony event system
* Service decoration
* Entity extensions
* Custom API routes
* Dependency injection configuration

Plugins integrate into the system without modifying core code, enabling safe upgrades and customization.

## Messaging and asynchronous processing

Certain operations are executed asynchronously to improve performance and scalability. The Core uses Symfony Messenger for background processing tasks such as:

* Indexing and search updates
* Scheduled tasks
* Email sending
* Integration workflows

Message queues allow heavy operations to run outside the request lifecycle.

## Interaction with other components

The Core serves as the foundation for:

* **Storefront** — Uses the Store API and domain services to render customer-facing pages.
* **Administration** — Communicates via the Admin API to manage entities and configurations.

By centralizing logic in the Core, Shopware ensures consistent behavior regardless of how functionality is accessed.
