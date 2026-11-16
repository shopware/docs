---
nav:
  title: Not allowed store behaviors
  position: 20
---

# Not allowed behaviors in the Shopware Store

This page outlines which types of changes are **not permitted** in Store extensions and highlights the **permitted** extension patterns you should use instead.

## Basic rule

Extensions must not make any direct changes to the existing Shopware structure. This includes in particular:

- Exposing unrestricted SQL execution, or bypassing the permissions, validation and lifecycle behavior required for business-entity changes
- Changes to the core table structure
- Adding files to core directories, or overwriting or deleting core files or files owned by the merchant or another extension
- Circumventing designated APIs, DAL, events, or services

### Additional prohibitions (security and law)

In addition, extensions are not permitted that:

- Undermine security-related protection mechanisms (for example, rights and role concepts, CSRF protection, validations).
- Enable uncontrolled system interventions by the shop operator or end customer (for example, arbitrary SQL execution, file access, or shell commands via the Administration UI)
- Circumvent or override legal requirements, such as:
  - Data protection and consent mechanisms
  - Logging, documentation, or verification obligations
  - Mandatory information or legally prescribed processes

## What is permitted

- Extending via the mechanisms provided by Shopware (DAL, migrations, events, decorator pattern, subscribers, services).
- Copying existing structures (for example, templates, configurations, assets) and adapting the copy without changing the original.
- Creating your own tables, entities, configuration values, or directories, provided these are clearly assigned to the extension.

## Database and filesystem boundaries

Use DAL repositories and supported services for ordinary business-entity reads and writes so validation, permissions, events and indexing remain effective.
SQL in a schema migration or a justified specialized aggregation is not the same as exposing arbitrary SQL through the Administration.
Where an operation cannot reasonably use the DAL, explain the reason and preserve its required scoping, integrity and lifecycle effects.
Bind query parameters and constrain any identifiers that cannot be parameterized.

Use the supported filesystem and media services for runtime storage, including installations using remote storage adapters.
Reading an extension's own shipped template is different from writing into a deployed plugin directory or modifying core files.
Limit cleanup to resources the extension owns.
See [Uninstallation and data cleanup](./installation-and-cleanup.md) and [Security and permissions](./security-and-permissions.md).

## Why these rules exist

Shopware is deliberately designed so that extensions remain stable, update-proof, and legally compliant. Direct interventions in the database or file system may seem pragmatic, but they pose real risks:

- **Security risk:** Unrestricted SQL or file access can enable data leaks, manipulation, or escalation of user rights
- **Update failure:** Core structures are not a stable contract. What works today may break shops after the next update
- **Liability risk:** Extensions that undermine legal protection mechanisms create problems for merchants and for the ecosystem
- **Quality standard:** The Store stands for trust. Extensions must behave like good guests: they may use the space, but must not remove load-bearing walls

If a feature requires bypassing authorization, modifying core files or exposing uncontrolled system access, redesign it around supported extension mechanisms.
