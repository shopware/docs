---
nav:
  title: Not allowed store behaviors
  position: 20
---

# Not allowed behaviors in the Shopware Store

This page summarizes which kinds of changes are **not** acceptable in Store extensions—and which extension patterns **are** allowed instead.

## Basic rule

Extensions must not make any direct changes to the existing Shopware structure. This includes in particular:

- Direct manipulation of the database (for example, executing SQL queries from the Administration).
- Changes to the core table structure.
- Writing, overwriting, or deleting files within the Shopware core or the existing directory structure.
- Circumventing designated APIs, DAL, events, or services.

### What is permitted

- Extending via the mechanisms provided by Shopware (DAL, migrations, events, decorator pattern, subscribers, services).
- Copying existing structures (for example, templates, configurations, assets) and adapting the copy without changing the original.
- Creating your own tables, entities, configuration values, or directories, provided these are clearly assigned to the extension.

## Additional prohibitions (security and law)

In addition, extensions are not permitted that:

- Undermine security-related protection mechanisms (for example, rights and role concepts, CSRF protection, validations).
- Enable uncontrolled system interventions by the shop operator or end customer (for example, arbitrary SQL execution, file access, or shell commands via the Administration UI).
- Circumvent or override legal requirements, such as:
  - Data protection and consent mechanisms.
  - Logging, documentation, or verification obligations.
  - Mandatory information or legally prescribed processes.

## Why these rules exist

Shopware is deliberately designed so that extensions remain stable, update-proof, and legally compliant. Direct interventions in the database or file system may seem pragmatic, but they pose real risks:

- **Security risk:** Unrestricted SQL or file access can enable data leaks, manipulation, or escalation of user rights.
- **Update failure:** Core structures are not a stable contract. What works today may break shops after the next update.
- **Liability risk:** Extensions that undermine legal protection mechanisms create problems for merchants and for the ecosystem.
- **Quality standard:** The Store stands for trust. Extensions must behave like good guests: they may use the space, but must not remove load-bearing walls.

In short, a feature is only possible through direct SQL, core file manipulation, or bypassing intended interfaces, that is a sign the approach should change—not that the rules are too strict.
