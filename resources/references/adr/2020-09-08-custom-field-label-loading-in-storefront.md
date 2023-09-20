---
title: CustomField label loading in storefront
date: 2020-09-08
area: storefront
tags:
  - custom-fields
  - storefront
  - snippets
nav:
  title: Custom field label loading in storefront
  position: 130

---

# CustomField label loading in storefront

::: info
This document represents an architecture decision record (ADR) and has been mirrored from the ADR section in our Shopware 6 repository.
You can find the original version [here](https://github.com/shopware/platform/blob/trunk/adr/2020-09-08-custom-field-label-loading-in-storefront.md)
:::

## Context

We want to provide the labels of custom fields in the storefront to third party developers.
On one hand we could add the labels to every loaded entity, but this will cause a heavy leak of performance and the labels
are often not used in the template.

## Decision

We implemented a subscriber, which listen on the `custom_field.written` event to add also snippets to all snippet sets with
the given label translations of the custom field. The `translationKey` of the snippets are prefixed with `customFields.`,
followed by the technical name of the custom field. Thus the snippets can be used in the storefront.

## Consequences

Inserting a custom field always creates new snippet with the given label translations.
