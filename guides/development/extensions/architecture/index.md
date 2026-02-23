---
nav:
  title: Extension Architecture
  position: 1
---

# Extension Architecture

This section defines the architectural principles that govern how Shopware can be extended. It describes extension contracts, subsystem boundaries, and public API guarantees that apply to all extension types:

* Plugins
* Apps
* Project-level bundles
* Themes (where relevant)

Understanding these rules is essential to ensure stability, performance, and forward compatibility.

## Architectural Foundations

Shopware’s extension model is built on:

* Clear domain separation (Core, Storefront, Administration)
* Deterministic subsystem behavior
* Strict public API boundaries
* Controlled extension patterns (decoration, events, factories, adapters)

Extensions must respect these principles to avoid:

* Non-deterministic behavior
* Broken background jobs or CLI commands
* Performance regressions
* Upgrade incompatibilities

## Public API and stability

When extending Shopware, it is critical to understand what is part of the stable Public API and what is not:

* [Public API and @internal Annotation](internal.md)
* [@final and @internal Annotations](final-and-internal.md)

These guides define what extension developers can rely on and what may change without notice.

## Extendability concepts

For a broader architectural overview of how Shopware is designed to be extended, see [Extendability](extendability.md). This section focuses on the architectural philosophy behind Shopware’s extension model.

These guides define what extension developers can rely on and what may change without backward compatibility guarantees.
