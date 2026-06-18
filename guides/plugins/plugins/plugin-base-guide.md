---
nav:
  title: Plugin Base Guide
  position: 10

---

# Plugin Base Guide

This guide outlines the typical development flow when creating a Shopware plugin, using the recommended static plugin approach. Core concepts apply to all plugin types. Not every plugin requires all steps.

## Typical plugin development flow

1. [Create the plugin structure](creating-plugins.md)  
2. [Install and activate the plugin](install-activate-plugin.md)
3. [Understand the plugin lifecycle](plugin-fundamentals/plugin-lifecycle.md)  
4. [Add plugin configuration](plugin-fundamentals/add-plugin-configuration.md)  
5. [Register services](services/index.md) and use [dependency injection](services/dependency-injection.md)  
6. [Listen to events](framework/event/listening-to-events.md) or [decorate services](services/adjusting-service.md#decorating-the-service)  
7. Extend the platform (either or both): [Storefront](storefront/index.md), [Administration](administration/index.md)
8. [Add database migrations](database/database-migrations.md) (if required)
9. [Add scheduled tasks](plugin-fundamentals/add-scheduled-task.md) or [CLI commands](plugin-fundamentals/add-custom-commands.md) (if required)  
10. Add dependencies: [npm](dependencies/using-npm-dependencies.md), [Composer](dependencies/using-composer-dependencies.md) (if required)
11. [Write tests](../../development/testing/index.md) and configure [CI](../../development/testing/ci.md)
12. Add [diagnostics](plugin-fundamentals/logging.md)

## Upgrade readiness

Design plugins so that:

* [Migrations](../../upgrades-migrations/index.md) are idempotent
* Lifecycle logic is minimal and predictable
* Domain logic is encapsulated behind services

Upgrades are easier when the plugin surface area is small and well-structured.
