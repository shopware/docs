---
nav:
  title: Plugin Base Guide
  position: 2

---

# Plugin Base Guide

This guide outlines the typical development flow when creating a Shopware plugin, using the recommended static plugin approach. Core concepts apply to all plugin types. Not every plugin requires all steps.

## Typical Plugin Development Flow

1. [Create the plugin structure](creating-plugins)  
2. [Install and activate the plugin](install-activate)
3. [Understand the plugin lifecycle](plugin-fundamentals/plugin-lifecycle)  
4. [Add plugin configuration](plugin-fundamentals/add-plugin-configuration)  
5. [Register services and use dependency injection](plugin-fundamentals/dependency-injection)  
6. [Listen to events or decorate services](plugin-fundamentals/listening-to-events)  
7. Extend the platform (either or both):
   * [Storefront](storefront/index.md)  
   * [Administration](administration/index.md)  
8. [Add database migrations](plugin-fundamentals/database-migrations) (if required)  
9. [Add scheduled tasks or CLI commands](scheduled-task) (if required)  
10. Add configuration (if required)
  * [npm](using-npm-dependencies)
  * [Composer](using-composer-dependencies)
11. [Write tests](testing/index.md)
  * CI and upgrade safety: Configure [CI](../../testing/ci.md) to run static analysis, tests, and produce reproducible artifacts to avoid upgrade regressions.
12. Add [diagnostics](logging.md)

## Upgrade readiness

Design plugins so that:

* Migrations are idempotent
* Lifecycle logic is minimal and predictable
* Domain logic is encapsulated behind services

Upgrades are easier when the plugin surface area is small and well-structured.

## Getting Started

The first step is to [create the plugin structure](creating-plugins.md).
