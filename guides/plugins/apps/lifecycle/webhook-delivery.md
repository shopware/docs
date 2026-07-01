---
nav:
  title: Webhook delivery contract
  position: 65

---

# Webhook delivery contract

This page documents what an app developer can rely on when receiving webhooks
from Shopware: how delivery is attempted, what happens on failure, when an
endpoint is considered unhealthy, and what guarantees Shopware does and does not
make about ordering and duplication.

For the manifest and payload format, see [Webhook](webhook.md). For the list of
events, see the
[Webhook events reference](../../../../resources/references/app-reference/webhook-events-reference.md).

## Purpose

Webhooks notify an app of events that happened inside a Shopware shop. Shopware
calls the URL declared in the app manifest with a signed `POST` request. The app
is expected to acknowledge receipt quickly and process the event on its own
infrastructure.

Endpoints fail. Shopware retries failed deliveries on a defined backoff and
disables endpoints that fail past a threshold.

## Delivery guarantees

| Property | Guarantee |
|:---|:---|
| Delivery | **At-least-once.** A single event may arrive more than once. |
| Ordering | **Best-effort FIFO per app.** First attempts are sent in the order the events occurred. A failed delivery is retried independently and may arrive after later events. |
| Duration | **Up to ~4.5 hours of retry** before an event is given up on (5 retries after the first attempt). |
| Authenticity | Every request carries an HMAC-SHA256 signature in `shopware-shop-signature`. |
| Identity | Every event has a stable `X-Shopware-Event-Id` that does not change across retries. |

Shopware does **not** guarantee:

- exactly-once delivery — apps must deduplicate by `X-Shopware-Event-Id`;
- strict global ordering — only first-attempt ordering per app is best-effort;
- delivery of events that occurred while the endpoint was disabled
  (see [Endpoint health](#endpoint-health)).

## Delivery headers

Every webhook request includes the following headers in addition to the
existing signature and version headers documented in [Webhook](webhook.md):

| Header | Purpose |
|:---|:---|
| `X-Shopware-Event-Id` | Stable event identifier. Same value across all retries of the same event. Use this as the idempotency key. |
| `X-Shopware-Sequence` | Monotonically increasing integer per shop. Higher means newer. Use for last-write-wins reconciliation when retries reorder events. |
| `X-Shopware-Attempt` | `0` for the first delivery attempt, `1` for the first retry, and so on. Informational — do not gate logic on it. |

The same `X-Shopware-Event-Id` is also available inside the payload under
`source.eventId` for backward compatibility.

### Recommended consumer pattern

```text
1. Read X-Shopware-Event-Id.
2. If the app has already processed this id → respond 200 and stop.
3. Otherwise process the event.
4. If X-Shopware-Sequence is older than the last processed sequence for the
   same resource → treat as stale (last-write-wins).
5. Record the event id as processed and respond 200.
```

## Retry behavior

A delivery counts as successful when the endpoint returns a `2xx` status code.
Anything else — any non-`2xx` response, a connection failure, a TLS error, or a
timeout — is treated as a failure and retried on the schedule below. After the
last retry the event is marked terminally `FAILED` and is not re-delivered.

> **TODO.** Per-status-code classification (transient vs permanent failures)
> is planned for a later phase of the rework and will be documented here once
> implemented. Today, Shopware does not distinguish — a `404` from a
> misconfigured route and a `503` from a busy backend are retried identically.

### Retry schedule

Retries follow an exponential backoff.

| Attempt | Delay before this attempt | Time since first attempt |
|:---|:---|:---|
| 1 (initial) | — | 0s |
| 2 | 5 s | ~5 s |
| 3 | 30 s | ~35 s |
| 4 | 5 min | ~5.5 min |
| 5 | 30 min | ~35 min |
| 6 | 4 hours | ~4.5 hours |

The schedule covers typical outages: deploys, certificate rotations, DNS
propagation, brief provider incidents.

### What a fast response means

An app must respond within the request timeout (a few seconds) with a `2xx`
status code. Long-running work should be queued by the app and processed out of
band. A slow response counts as a failure and is retried, which amplifies load
on an already struggling endpoint.

## Ordering

Within a single app, first-attempt deliveries are sent in the order the events
occurred in the shop. If every delivery succeeds, the app receives events in
order.

When an event fails and goes onto the retry queue, **later events for the same
app keep flowing**. The retried event arrives after them.

Concretely:

```text
order.placed      → delivered
order.paid        → 503, scheduled for retry in 5s
order.shipped     → delivered (5s later, before order.paid's retry)
order.paid        → delivered (retry succeeds)
```

The app sees: `placed`, `shipped`, `paid`. `X-Shopware-Sequence` lets the app
detect this and apply last-write-wins.

## Endpoint health

> **TODO.** The endpoint health model is being reworked. The current behavior
> (binary active/disabled flip after a fixed failure threshold, manual
> re-enable only) is not the long-term contract. A graded health model with
> automatic recovery is planned for a later phase. This section will be filled
> in once the final shape is settled — apps should not code against the
> current behavior beyond the basic rule below.

For now: any non-`2xx` response counts against a webhook's failure budget.
Enough failures and the webhook is disabled until an admin re-enables it.
Events that occur while a webhook is disabled are not queued — apps that need
to backfill missed events must reconcile via the admin API after recovery.

## Audit and visibility

Every delivery — both the initial attempt and any retries — is recorded in the
shop and visible to the shop admin: status, attempt count, response code, and
latency. This applies equally to synchronous and asynchronous webhooks. App
developers should expect shop admins to see failing deliveries and to ask about
them.

## Summary for consumers

If you are implementing a webhook endpoint, the short version is:

1. Verify the `shopware-shop-signature`.
2. Deduplicate on `X-Shopware-Event-Id`.
3. Use `X-Shopware-Sequence` for last-write-wins when retries reorder events.
4. Respond `2xx` fast on success. Any non-`2xx` is a failure that counts
   against the webhook's failure budget.
5. Assume at-least-once delivery and a retry window of up to ~4.5 hours.
6. Reconcile via the admin API if your endpoint was down long enough to be
   disabled.
