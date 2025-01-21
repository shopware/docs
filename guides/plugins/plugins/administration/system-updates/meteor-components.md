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

## Using Code mods for migration

To simplify the plugin migration process, we provide codemods that automatically replace old components with new Meteor Components.

### Prerequisites

- A development version of Shopware must be installed
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
   - Check for and update other deprecated code where possible
  