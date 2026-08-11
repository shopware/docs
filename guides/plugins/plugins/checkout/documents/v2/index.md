---
nav:
  title: v2
  position: 10
---

# Document System (v2)

::: warning This page documents the new Document System (v2)
The reworked document generation is an experimental feature. Activate it with the `DOCUMENT_GENERATION_REWORK` feature flag. Its API can change until it becomes the default with Shopware 6.8.
:::

These guides show how to extend the Document System (v2) as a plugin developer.

**Prerequisites**: a running plugin (see the [plugin base guide](../../../plugin-base-guide)) and the `DOCUMENT_GENERATION_REWORK` feature flag enabled for testing.

## Add a document type

Create a new kind of document: a type class, a data provider, a Twig template, and the number range that numbers it.

<PageRef page="./add-a-document-type" title="Add a document type" />

## Add a format renderer

Output a new file format, or replace a built-in renderer through tag priority.

<PageRef page="./add-a-format-renderer" title="Add a format renderer" />

## Customize document data and templates

Add data to documents you did not create, and override the Twig templates that render them.

<PageRef page="./customize-document-data-and-templates" title="Customize document data and templates" />
