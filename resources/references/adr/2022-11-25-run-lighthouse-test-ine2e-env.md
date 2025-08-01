---
title: Run Lighthouse tests in E2E env
date: 2022-11-25
area: storefront
tags: [lighthouse, performance, storefront]
---

# Run Lighthouse tests in E2E env

::: info
This document represents an architecture decision record (ADR) and has been mirrored from the ADR section in our Shopware 6 repository.
You can find the original version [here](https://github.com/shopware/shopware/blob/trunk/adr/2022-11-25-run-lighthouse-test-ine2e-env.md)
:::

## Context
The Lighthouse test ran in the `APP_ENV=prod`, this meant that also AdminQueueWorker was active, which is recommended to not be used in real prod setups.

## Decision
Use `APP_ENV=e2e` for lighthouse tests, to deactivate the admin worker. After removing enqueue lighthouse ran int o timeouts when the admin worker was used, this solves this problem also.
Besides that it should lead to much more realistic results.

## Consequences
This means that the lighthouse tests won't run in the real `prod` env anymore, but the main difference between the two envs is that in `e2e` env the admin worker is deactivated, which is probably closer to "real" production setups.
The only other difference is that all rate limits are deactivated in the `e2e` env, but this is not relevant for the lighthouse tests.
