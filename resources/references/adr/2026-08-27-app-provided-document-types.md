---
title: App provided document types and the `app_provided` sentinel
date: 2026-08-27
area: after-sales
tags: [documents, app-system]
---

# App provided document types and the `app_provided` sentinel

::: info
This document represents an architecture decision record (ADR) and has been mirrored from the ADR section in our Shopware 6 repository.
You can find the original version [here](https://github.com/shopware/shopware/blob/trunk/adr/2026-08-27-app-provided-document-types.md)
:::

## Context

DocumentV2 registers document types as code strings, not database rows. Apps can now register their own types through the manifest `<documents>` block.

But `document.document_type_id` stays `NOT NULL` until 6.9. So every app document still needs a real `document_type` row to point at, even though app types get no rows of their own.

## Decision

A migration seeds one shared `document_type` row named `app_provided`. Every app document points its `document_type_id` at it. The real app identifier lives in `document.config.documentType`.

Alternatives we dropped:

- Make `document_type_id` nullable now. That schema change belongs to 6.9 and would break v1 surfaces that read the column.
- One `document_type` row per app identifier. That rebuilds the per-type table we are deleting.

`app_provided` is reserved. Apps cannot claim it as an identifier and nothing generates documents of that type. It only exists to fill the foreign key.

Everything here (the sentinel, the seed migration, the `DocumentType::APP_PROVIDED` case, the validation guard) is `@deprecated tag:v6.9.0` and gets removed with the legacy `document_type` table.

## Consequences

- No schema change during 6.7 and 6.8. Every app document has a valid foreign key without new per-type rows.
- App document numbers use a global number range seeded per identifier, created once and never removed.
- In v2 always reads the real identifier from the config.
- Identifiers are unique across core and all apps at persist time.
- The reservation lives in one enum. Do not reuse the string `app_provided` for anything else while the legacy table exists.
