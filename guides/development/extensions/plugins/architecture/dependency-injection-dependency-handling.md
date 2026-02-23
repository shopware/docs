---
nav:
  title: Dependency Injection & Dependency Handling
  position: 50

---

# Dependency Injection and Dependency Handling

Shopware separates responsibilities between domains (Core, Storefront, Administration).  
Plugins must respect these boundaries to ensure deterministic behavior, testability, and compatibility.

## Domain separation

The `Core` domain is framework-level logic. It must remain independent from HTTP state and presentation concerns.

The `Storefront` domain handles HTTP requests, sessions, and customer interaction.

## Core domain rules

* The Core domain must never access the PHP session.
* Core services must not rely on request state.
* Business logic must remain stateless and deterministic.
* Dependencies must be injected via the service container.

There is only one PHP session per storefront request. Session handling must be implemented in the Storefront domain and never inside Core services.

## Extension guidelines

When extending Core functionality:

* Inject dependencies via the constructor.
* Avoid reading request data directly in Core classes.
* Avoid session access inside services registered in Core.
* Keep domain logic independent from HTTP concerns.
* Use Store API routes or Storefront controllers to bridge between HTTP/session state and Core services.

Violating domain boundaries can lead to:

* Unpredictable behavior in background jobs
* Broken CLI execution
* Inconsistent cart or rule evaluation
* Reduced testability

Respecting these boundaries ensures stable, maintainable extensions.
