---
nav:
  title: Secret Rotation & Recovery
  position: 45

---

# App Secret Rotation & Recovery

## Overview

This guide covers how to **rotate** an app's secret and how to **recover** an app when a secret rotation or first registration does not complete — using the `app:secret:rotate` and `app:install` commands.

App registration shares a secret that Shopware uses to sign every request to the app's backend. Renewing that secret — and the first registration itself — takes two steps: the app generates a new secret during the handshake, then starts using it only once it has processed Shopware's confirmation request.

If that confirmation is interrupted — a crash, a lost response, a timeout, or an HTTP `5xx` — the app may have switched to the new secret while Shopware never recorded it. The two sides are then out of sync: a registered app rejects any re-registration it cannot authenticate, so Shopware can no longer reach it. Shopware keeps the unconfirmed secret so the two sides can be re-synced, as described below.

::: info
This page is for operators and core developers. For the **app-side** protocol — validating the signatures and generating a new secret on re-registration — see [App Registration & Backend Setup](app-registration-setup.md#secret-rotation-and-shop-url-changes) and [Signing & Verification in the App System](app-signature-verification.md).
:::

## The secret state model

Shopware tracks two values per app:

- **`app_secret`** — the committed, active secret. The one Shopware currently signs requests with.
- **`unconfirmed_app_secrets`** — a list of secrets generated during a handshake but **not yet confirmed**, newest first. These are the secrets the app *might* already hold that Shopware has not committed.

A (re-)registration moves them as follows:

| step or outcome | `app_secret` | `unconfirmed_app_secrets` |
|---|---|---|
| handshake (app generates a secret), **before** confirm | unchanged | the new secret is added at the front |
| confirm returns **2xx** (confirmed) | set to the new secret | cleared |
| confirm returns **4xx** (app rejected it) | unchanged | the rejected secret is removed |
| confirm returns an HTTP **5xx** or times out (unknown) | unchanged | left as-is — kept for recovery |

::: info
`unconfirmed_app_secrets` is `NULL` whenever there is nothing pending. A non-null value means a rotation or install did not get a clear answer, and the app may already hold one of the listed secrets — that is the signal recovery acts on.
:::

A list (rather than a single value) matters because recovery can itself be interrupted: each attempt adds a freshly generated secret ahead of the ones it is still trying. The list is capped at five entries, and the oldest one always survives that cap — in a repeatedly interrupted loop it is the secret the app most likely still holds.

## Rotating a secret — `app:secret:rotate`

```bash
# Rotate one app's secret
bin/console app:secret:rotate <app-name>

# Rotate every active app
bin/console app:secret:rotate
```

Rotation re-registers the app with a freshly generated secret; the new secret becomes active only once the app confirms it. If the confirmation is interrupted, the new secret is retained in `unconfirmed_app_secrets` and the rotation reports a failure, leaving the active secret untouched.

A pending unconfirmed secret does **not** block a later rotation. Rotation reconciles it instead of rotating over it: the pending secrets become signing candidates, exactly as they do for `app:install`. So `app:secret:rotate <app-name>` is itself a recovery path: the candidate order and the outcomes described below apply to both commands.

::: warning
Rotation **refuses to run** on an app whose installation never finished — a manifest with a `<setup>` block, and either no committed secret or a secret still parked in `deleted_apps`. It reports `FRAMEWORK__APP_INSTALLATION_INCOMPLETE`, because committing a secret would clear the only marker that tells `app:install` an installation is left to resume. Run `bin/console app:install <app-name>` instead: that finishes the installation and repairs the credentials in one step.
:::

### Self-service rotation over the API

An app that detects it is out of sync can rotate without an operator, as long as its integration credentials still work:

```text
POST /api/_action/app-system/secret/rotate
```

The route resolves the app from the **caller's own app integration**, so a token issued to a user or to any other integration is rejected. Shopware queues a `RotateAppSecretMessage` and answers `202 Accepted`; the rotation then runs in the worker. The CLI command runs the same rotation synchronously and reports the result directly.

## Recovering a stranded app — re-run `app:install`

When a rotation or install whose confirmation was interrupted leaves an unconfirmed secret, **re-run the install**:

```bash
bin/console app:install <app-name>
```

It is safe on an app that is already installed, and safe to repeat: a failed attempt commits nothing and discards no secret, so the app stays recoverable. An installation that never finished is completed. An app that was fully installed before its rotation broke has only its credentials repaired — its install lifecycle is not replayed and its configuration is untouched.

Expect your app server to see several registration attempts in a row, one per secret Shopware still holds for it. Shopware cannot know which secret your app kept, so it tries each until one is accepted.

Re-running `app:install <app-name>` on a pending app — or `app:secret:rotate <app-name>` — results in one of:

| result | what it means | next step |
|---|---|---|
| **Recovered and completed** | a secret the app still trusts was found, so both sides are re-synced; a half-finished install is finished | done |
| **Already installed** | no unconfirmed secret left to recover (or a concurrent run already recovered it) | — |
| **No candidate was accepted** | `FRAMEWORK__APP_SECRET_RECOVERY_FAILED`. Either the app trusts none of Shopware's secrets, or no attempt got a clear answer. Every candidate is kept | re-run the command; if it keeps failing, take a new shop identity as described below |

Shopware cannot tell those last two causes apart: an app that refuses a signature answers with a server error just as readily as an app that is simply unreachable. So a failed candidate always walks on to the next one, and a run that exhausts them all reports the same outcome either way — which is why the first response to it is a retry, not a shop-ID change.

### Timeline — recoverable (the common case)

| step | what happens |
|---|---|
| 1 | An operator rotates *MyApp*; the new secret is saved as unconfirmed; the confirmation times out. |
| 2 | Re-run `bin/console app:install MyApp`; it signs with the unconfirmed secret, then the previous one, until MyApp accepts. |
| 3 | A fresh secret is committed, and both sides are back **in sync**. |

## When recovery isn't possible — `app:shop-id:change`

A recovery that keeps reporting **no candidate was accepted** against a healthy app server means the app trusts none of the secrets Shopware holds, so no re-registration Shopware can sign will be accepted. The usual cause is a **shop clone**:

| step | what happens |
|---|---|
| 1 | Production *Shop A* is cloned to *staging* — the clone copies Shop A's shop ID **and** its app secrets. |
| 2 | Staging rotates the secret for MyApp; the app now binds that shop ID to *staging's* new secret. |
| 3 | Shop A re-runs `app:install MyApp`, but the app trusts only staging's secret, so every candidate is rejected. |
| 4 | Recovery reverts cleanly and reports **no candidate was accepted**, so Shop A runs `bin/console app:shop-id:change reinstall-apps` to take a fresh, distinct identity and re-register. |

This case is genuinely unrecoverable, not a defect: the app keys registration by **shop ID**, and the clone now legitimately owns that ID's secret. No secret Shop A holds can reclaim it — the only correct move is to give Shop A its own identity.

::: warning
A cloned shop (for example, a staging instance restored from a production dump) shares the original's shop ID and app secrets. Run `bin/console app:shop-id:change` on the clone on first boot so it takes a distinct identity. See [Creating a staging instance](../../../hosting/installation-updates/creating-a-staging-instance.md).
:::

## Uninstall, reinstall, and the deleted-apps store

Separate from install-based recovery, Shopware carries an app's secrets across an uninstall and reinstall on the same shop: on uninstall it stashes both the committed secret and any unconfirmed ones in the `deleted_apps` table, and on reinstall it replays them to sign the re-registration. A reinstall therefore succeeds whether or not the app acts on the `app.deleted` (uninstall) webhook:

| step | what happens |
|---|---|
| 1 | The app is installed; Shopware and the app share committed secret `S1`. On uninstall, Shopware stashes `S1` in `deleted_apps`. |
| 2a | **The app acts on `app.deleted`** (forgets `S1`): the reinstall is a fresh registration — no prior shop record, so no signature is demanded and the reinstall is accepted. |
| 2b | **The app ignores `app.deleted`** (still holds `S1`): the reinstall replays `S1`, and the app's double-signature check validates against it, so the reinstall is accepted. Without the stash, Shopware would sign with a secret the app never saw, and the reinstall would be rejected. |
| 3 | Either way, a fresh secret is committed and both sides are back in sync. |

The stash carries the unconfirmed secrets too, so an app caught **mid-rotation** survives an uninstall as well:

| step | what happens |
|---|---|
| 1 | A rotation was interrupted; the new secret `S2` is unconfirmed and the app has adopted it. |
| 2 | The operator uninstalls the app. Shopware stashes the committed `S1` **and** the unconfirmed `S2`. |
| 3 | `bin/console app:install` re-creates the app row from the stash and re-registers, trying `S2` before `S1`. The app accepts `S2`, a fresh secret is committed, and both sides are back in sync. |

::: info
Because the stashed unconfirmed secrets mark the installation as unfinished, a reinstall of such an app always takes the recovery path rather than being treated as a fresh install.
:::
