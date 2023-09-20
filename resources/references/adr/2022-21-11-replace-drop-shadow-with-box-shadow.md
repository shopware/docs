---
title: Replace drop-shadow with box-shadow
date: 2022-21-11
area: storefront
tags: [safari, performance, storefront]
--- 

# Replace drop-shadow with box-shadow

::: info
This document represents an architecture decision record (ADR) and has been mirrored from the ADR section in our Shopware 6 repository.
You can find the original version [here](https://github.com/shopware/platform/blob/trunk/adr/2022-21-11-replace-drop-shadow-with-box-shadow.md)
:::

## Context
Safari has drastic performance issues with drop-shadow.

## Decision
Changing it to box-shadow solves all the performance issues.

## Consequences
The design and optic of the drop-shadow is slightly different. It is not as perfect as before. But it looks almost the same
and is much faster.
