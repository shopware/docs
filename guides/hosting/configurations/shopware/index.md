---
nav:
  title: Shopware
  position: 10

---

# Shopware Configurations

## Overview

The following section guides you on the security, performance or structural configurations specific to Shopware 6.

## How Shopware configuration works

Shopware configuration can come from different places, depending on whether the value is operational, environment-specific, or meant to be changed by shop administrators.

| Mechanism | Use it for | Where it lives |
| --- | --- | --- |
| Database-backed system configuration | Shop settings that can be changed in the Administration, through Admin API, or by app/plugin code | Stored in the database and read through Shopware's system configuration |
| Static system configuration | Settings that must be fixed, versioned, or controlled per environment | `config/packages/*.yaml` under `shopware.system_config` |
| Symfony / bundle configuration | Technical runtime configuration for Shopware, Symfony, or bundles | `config/packages/*.yaml`, including environment-specific folders such as `config/packages/prod/` |
| Environment variables | Secrets, infrastructure values, and deployment-specific values | `.env`, `.env.local`, server/container environment, or deployment platform |
| CLI commands | Reading, writing, or inspecting configuration during development, deployment, or maintenance | `bin/console` / `shopware-cli project console` |

As a rule of thumb: use Administration or database-backed system configuration for shop settings that merchants may change, static system configuration for values that should be fixed or version-controlled, and environment variables or Symfony configuration for deployment and infrastructure settings.

Static system configuration is an overlay on top of database-loaded system configuration. If the same key is configured in both places, the value from `config/packages` wins and the setting can no longer be changed in the Administration.

For details, see [Static System Configuration](./static-system-config.md).
