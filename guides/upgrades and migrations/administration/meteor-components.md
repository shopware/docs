---
nav:
  title: Upgrading to Meteor Components
  position: 260
---

# Future Development Roadmap: Upgrading to Meteor Components

> **Note:** The information provided in this article, including timelines and specific implementations, is subject to change.
> This document serves as a general guideline for our development direction.

## Introduction

With the release of Shopware 6.7, we will replace several current administration components with components from the [Meteor Component Library](https://meteor-component-library.vercel.app/).

## Why Meteor Components?

The Meteor Component Library is Shopware's official collection of reusable components used across multiple Shopware projects and built on the Shopware Design System.

Using a shared component library offers several advantages:

- **Consistent Design**: All components follow the Shopware Design System guidelines.
- **Consistent Behavior**: All components share standardized behavior patterns and API conventions.
- **Reusability**: Components can be seamlessly integrated across different projects and apps.
- **Maintenance**: Updates and improvements to components are managed centrally and automatically propagate to all projects using the component library.

## Migration guide

For each component being replaced, we provide a detailed upgrade guide that explains the migration process from the old component to the new Meteor Component. You can find these guides in the technical upgrade documentation for the release.

## Using Codemods for migration

To simplify the plugin migration process, we provide codemods that automatically replace old components with new Meteor Components.

### Prerequisites

- A [development installation of Shopware](https://github.com/shopware/shopware) must be installed
- Your plugin must be located in the `custom/plugins` folder

### Running the Migration Tool

1. Execute the following composer command:

   ```bash
   # Main command which also outputs the help text
   composer run admin:code-mods

   ## Example with arguments
   # composer run admin:code-mods -- --plugin-name example-plugin --fix -v 6.7
   ```

2. Provide your plugin name and target Shopware version for migration
3. The tool will:
   - Automatically replace compatible components with Meteor Components
   - Add guidance comments for components that require manual migration
   - Fixes some other deprecated code where possible

## Supporting Extension Developers

To support extension developers and ensure compatibility between Shopware 6.6 and Shopware 6.7, a new prop called `deprecated` has been added to Shopware components.

- **Prop Name**: `deprecated`
- **Default Value**: `false` (uses the new Meteor Components by default)
- **Purpose**:
  - When `deprecated` is set to `true`, the component will render the old (deprecated) version instead of the new Meteor Component.
  - This allows extension developers to maintain a single codebase compatible with both Shopware 6.6 and 6.7 without being forced to immediately migrate to Meteor Components.

Example:

```html
<!-- Uses mt-button in 6.7 and sw-button-deprecated in 6.6 -->
<template>
  <sw-button />
</template>


<!-- Uses sw-button-deprecated in 6.6 and 6.7 -->
<template>
  <sw-button deprecated />
</template>
```

> **Important:** Although the old components can still be used with the `deprecated` prop, we highly recommend migrating to Meteor Components whenever possible to align with future Shopware development.
