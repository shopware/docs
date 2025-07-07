---
nav:
  title: Technical Terms and Concepts
  position: 30

---

# Technical Terms and Concepts

This section defines key technical terms and concepts used in the migration process from B2B Suite to B2B Commercial, providing clarity for developers navigating the migration.

## Component

A **component** is a distinct module within the B2B Commercial system, such as `B2B Commercial Employee Management`, `B2B Commercial Quote Management`, or `B2B Commercial Shopping List`. Each component encapsulates a specific set of functionalities and associated data structures.

:::info
Components organize related entities and their migrations, ensuring modularity and maintainability.
:::

## Entity

An **entity** represents a specific type of data within a component. For example, within the `B2B Commercial Employee Management` component, entities include `Employee`, `Role`, and `Permission`. Each entity has its own attributes and behaviors, defined by its schema in the source and target tables.

## Configurator

A **configurator** is a PHP class that defines the migration process for a component’s entities. It specifies:

- Field mappings between source and target tables (see [Field Mapping Configuration](../development/adding-component.md#field-mapping-configuration)).
- Migration processes, conditions, default values, and fallback values (see [Migration Conditions and Values Configuration](../development/adding-component.md#define-conditions)).
- The XML configuration file path for mappings.

Configurators extend classes like `AbstractB2BMigrationConfigurator` or `AbstractB2BExtensionMigrationConfigurator` for base or extended migrations, respectively.

:::info
Configurators provide a structured way to customize and control the migration process for each component.
:::

## Handler

A **handler** is a PHP class that implements custom logic to transform data for specific fields during migration. Handlers are used when complex transformations are needed beyond simple mappings, ensuring data integrity and compatibility with B2B Commercial’s format. They are defined in the XML configuration and implemented via the `transform` method, as detailed in [Handler-Based Transformation](../development/adding-component.md#handler-based-transformation).

:::info
Handlers are critical for handling complex data transformations, such as reformatting or combining multiple source fields.
:::
