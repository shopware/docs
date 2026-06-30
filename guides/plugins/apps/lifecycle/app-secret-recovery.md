---
nav:
  title: Secret Rotation & Recovery
  position: 45

---

# App Secret Rotation & Recovery

## Overview

This guide covers how to **rotate** an app's secret and how to **recover** an app when a secret rotation or first registration does not complete — using the `app:secret:rotate` and `app:secret:recover` console commands.

App registration shares a secret that Shopware uses to sign every request to the app's backend. Renewing that secret — and the first registration itself — takes two steps: the app generates a new secret during the handshake, then starts using it only once it has processed Shopware's confirmation request.

If that confirmation is interrupted — a crash, a lost response, a timeout, or an HTTP `5xx` — the app may have switched to the new secret while Shopware never recorded it. The two sides are then out of sync: a confirmed app rejects any re-registration it cannot authenticate, so Shopware can no longer reach it. Shopware keeps the unconfirmed secret so an operator can re-sync the two sides, as described below.

::: info
This page is for operators and core developers. For the **app-side** protocol — validating the dual signature and generating a new secret on re-registration — see [App Registration & Backend Setup](app-registration-setup.md#secret-rotation-and-shop-url-changes) and [Signing & Verification in the App System](app-signature-verification.md).
:::

## The secret state model

Shopware tracks two values per app:

- **`app_secret`** — the committed, active secret. The one Shopware currently signs requests with.
- **`unconfirmed_app_secrets`** — a list of secrets generated during a handshake but **not yet confirmed**, newest first. These are the secrets the app *might* already hold that Shopware has not committed.

A (re-)registration moves them as follows:

| step or outcome | `app_secret` | `unconfirmed_app_secrets` |
|---|---|---|
| handshake (app generates a secret), **before** confirm | unchanged | the new secret is prepended |
| confirm returns **2xx** (confirmed) | set to the new secret | cleared |
| confirm returns **4xx** (app rejected it) | unchanged | the rejected secret is removed |
| confirm returns an HTTP **5xx** or times out (unknown) | unchanged | left as-is — kept for recovery |

::: info
`unconfirmed_app_secrets` is `NULL` whenever there is nothing pending. A non-null value means a rotation or install did not get a clear answer, and the app may already hold one of the listed secrets — that is the signal recovery acts on.
:::

A list (rather than a single value) matters because recovery can itself be interrupted: each recovery attempt prepends a freshly generated secret, so keeping the whole list ensures a later retry still has every secret the app might trust.

## Rotating a secret — `app:secret:rotate`

```bash
# Rotate one app's secret
bin/console app:secret:rotate <app-name>

# Rotate every active app
bin/console app:secret:rotate
```

Rotation re-registers the app with a freshly generated secret; the new secret becomes active only once the app confirms it. If the confirmation is interrupted, the new secret is retained in `unconfirmed_app_secrets` and the rotation reports a failure — the active secret is left untouched, and the app is recovered with the command below.

::: warning
Rotation **refuses to run** if the app already has an unconfirmed secret (`appSecretRotationAlreadyPending`). Recover that secret first — rotating again would overwrite the only record of a secret the app may already hold.
:::

When triggered via the API, rotation is queued (`RotateAppSecretMessage`) and runs in the background; the CLI command runs it synchronously and reports the result directly.

## Recovering a stranded app — `app:secret:recover`

Use this after a rotation or install whose confirmation was interrupted left an unconfirmed secret.

```bash
# List every app that currently has an unconfirmed secret (the recovery worklist)
bin/console app:secret:recover

# Recover one app
bin/console app:secret:recover <app-name>
```

Recovery re-registers the app on a fresh integration, signing each attempt with a secret the app might still hold — the **unconfirmed secrets newest-first, then the committed secret** as a fallback. The first secret the app accepts wins; a fresh secret is then committed and both sides are back in sync. Recovery is operator-driven by design: nothing happens automatically, and the metric below flags apps that need it.

`app:secret:recover <app>` reports one of:

| outcome | what it means | next step |
|---|---|---|
| **Re-registered with a fresh secret** | a secret the app still trusts was found, so both sides are re-synced | done — reinstall the app to finish a half-completed install |
| **Nothing to recover** | no unconfirmed secret; the app is already in sync | — |
| **Outcome unknown** | an attempt timed out or returned an HTTP `5xx`; all state is kept intact | run `app:secret:recover` again |
| **Claimed by another party** | the app trusts none of Shopware's secrets, so recovery is not possible | run `app:shop-id:change` (see below) |
| **Recovery failed** | a hard error, such as the lock store being unavailable (HTTP `503`) or a missing manifest | fix the cause, then retry |

### Timeline — recoverable (the common case)

| step | what happens |
|---|---|
| 1 | An operator rotates *MyApp*; the new secret is saved as unconfirmed; the confirmation times out. |
| 2 | `bin/console app:secret:recover MyApp` signs with the unconfirmed secret, then the previous one, until MyApp accepts. |
| 3 | A fresh secret is committed, and both sides are back **in sync**. |

## When recovery isn't possible — `app:shop-id:change`

The **claimed** outcome means the app trusts none of the secrets Shopware holds, so no re-registration Shopware can sign will be accepted. The usual cause is a **shop clone**:

| step | what happens |
|---|---|
| 1 | Production *Shop A* is cloned to *staging* — the clone copies Shop A's shop ID **and** its app secrets. |
| 2 | Staging rotates MyApp's secret; the app now binds that shop ID to *staging's* new secret. |
| 3 | Shop A runs `app:secret:recover MyApp`, but the app trusts only staging's secret, so every candidate is rejected. |
| 4 | Recovery reverts cleanly and reports **claimed**, so Shop A runs `bin/console app:shop-id:change` to take a fresh, distinct identity, then re-registers. |

This is genuinely unrecoverable, not a defect: the app keys registration by **shop ID**, and the clone now legitimately owns that ID's secret. No secret Shop A holds can reclaim it — the only correct move is to give Shop A its own identity.

::: warning
A cloned shop (for example, a staging instance restored from a production dump) shares the original's shop ID and app secrets. Run `bin/console app:shop-id:change` on the clone on first boot so it takes a distinct identity. See [Creating a staging instance](../../../hosting/installation-updates/creating-a-staging-instance.md).
:::

## Uninstall, reinstall, and the deleted-apps store

Separate from `app:secret:recover`, Shopware carries an app's **committed** secret across an uninstall and reinstall on the same shop: on uninstall it stashes the committed secret in the `deleted_apps` table, and on reinstall it replays it to sign the re-registration. A reinstall therefore succeeds whether or not the app acts on the `app.deleted` (uninstall) webhook:

| step | what happens |
|---|---|
| 1 | The app is installed; Shopware and the app share committed secret `S1`. On uninstall, Shopware stashes `S1` in `deleted_apps`. |
| 2a | **The app acts on `app.deleted`** (forgets `S1`): the reinstall is a fresh registration — no prior shop record, so no signature is demanded and the reinstall is accepted. |
| 2b | **The app ignores `app.deleted`** (still holds `S1`): the reinstall replays `S1`, and the app's double-signature check validates against it, so the reinstall is accepted. Without the stash, Shopware would sign with a secret the app never saw, and the reinstall would be rejected. |
| 3 | Either way, a fresh secret is committed and both sides are back in sync. |

This carries only the **committed** secret. An app caught **mid-rotation** holds an *unconfirmed* secret the store never sees:

| step | what happens |
|---|---|
| 1 | A rotation was interrupted; the new secret `S2` is unconfirmed and the app has adopted it. |
| 2 | The operator uninstalls the app. The store keeps only the committed `S1`; the unconfirmed `S2` is discarded. |
| 3 | If the app kept its record, the reinstall replays `S1` but the app trusts only `S2`, so the reinstall is rejected and the app is stranded, with no record of `S2` anywhere. |

So **recover the live app first** with `app:secret:recover`, then uninstall if you still need to.

::: info
The two mechanisms are complementary: the `deleted_apps` store carries the **committed** secret across an uninstall automatically; `app:secret:recover` re-syncs the **unconfirmed** secret of an app that is still installed.
:::

## Limits

- **Recover the live app row.** Recover **before** you uninstall or run `app:shop-id:change` on an app that still has an unconfirmed secret. Uninstall discards the unconfirmed secret — only the *committed* secret is remembered for a reinstall — so an app whose only record is unconfirmed cannot be recovered once it is uninstalled.
- **Recovery is secret-only.** It re-syncs the secret but does not finish a half-completed install (the app stays inactive, its lifecycle handlers unrun). Complete such an install by reinstalling it; the recovered secret is replayed automatically.
- **Cross-instance locking.** Rotation and recovery serialize per app behind a lock. In a multi-server deployment, configure a shared `LOCK_DSN` (Redis or a database DSN) — the default `flock` is per-host and does not serialize across instances.

## Observability

::: info
These metrics are emitted through Shopware's **telemetry** integration, which is not enabled by default — they are only collected once a telemetry transport is configured. See [OpenTelemetry](../../../hosting/configurations/observability/opentelemetry.md).
:::

A periodic metric reports how many apps are stuck with an unconfirmed secret, alongside per-attempt outcome counters:

| metric | type | meaning |
|---|---|---|
| `app.unconfirmed_app_secrets.count` | gauge | apps currently holding an unconfirmed secret (a "stuck" rotation) |
| `app.registration.outcome.count` | counter | registration confirms, tagged `committed`, `rejected`, `ambiguous`, or `handshake_failed` |
| `app.secret_recovery.outcome.count` | counter | recovery attempts, tagged `recovered`, `claimed`, or `unknown` |

::: info
A rising `app.unconfirmed_app_secrets.count` means rotations or installs are not confirming. Run `bin/console app:secret:recover` with no argument to list the affected apps and recover them.
:::
