---
nav:
  title: Plugin Base Guide
  position: 10

---

# Plugin Base Guide

## Overview

This guide outlines the typical development flow when creating a Shopware plugin, using the recommended static plugin approach. Core concepts apply to all plugin types. Not every plugin requires all steps.

## Typical plugin development flow

1. [Create the plugin structure](creating-plugins.md)  
2. [Install and activate the plugin](install-activate-plugin.md)
3. [Understand the plugin lifecycle](../plugins/plugin-fundamentals/plugin-lifecycle.md)  
4. [Add plugin configuration](../plugins/plugin-fundamentals/add-plugin-configuration.md)  
5. [Register services](../plugins/services/index.md) and use [dependency injection](../plugins/services/dependency-injection.md)  
6. [Listen to events](../plugins/framework/event/listening-to-events.md) or [decorate services](../plugins/services/adjusting-service.md#decorating-the-service)  
7. Extend the platform (either or both): [Storefront](../plugins/storefront/index.md), [Administration](../plugins/administration/index.md)
8. [Add database migrations](../plugins/database/database-migrations.md) (if required)
9. [Add scheduled tasks](../plugins/plugin-fundamentals/add-scheduled-task.md) or [CLI commands](../plugins/plugin-fundamentals/add-custom-commands.md) (if required)  
10. Add configuration: [npm](../plugins/dependencies/using-npm-dependencies.md), [Composer](../plugins/dependencies/using-composer-dependencies.md) (if required)
11. [Write tests](../../development/testing/index.md): CI and upgrade safety: Configure [CI](../../development/testing/ci.md) to run static analysis, tests, and produce reproducible artifacts to avoid upgrade regressions.
12. Add [diagnostics](../plugins/plugin-fundamentals/logging.md)

## Upgrade readiness

Design plugins so that:

* [Migrations](../../upgrades-migrations/index.md) are idempotent
* Lifecycle logic is minimal and predictable
* Domain logic is encapsulated behind services

Upgrades are easier when the plugin surface area is small and well-structured.

## Getting started

The first step is to [create the plugin structure](../plugins/creating-plugins.md).
