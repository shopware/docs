---
nav:
  title: Webhooks
  position: 55

---

# Webhooks

A webhook sends a `POST` request to a URL of your choice whenever a given event happens in Shopware, for example `product.written`.
This guide covers webhooks you create through the Admin API as a user or an integration.
Apps register their webhooks in their manifest instead, see [App webhooks](../../plugins/apps/lifecycle/webhook.md).

## Create a webhook

Send a `POST` request to `/api/webhook`.
The caller needs the `webhook:create` privilege.

```http
POST /api/webhook
Content-Type: application/json

{
    "name": "Product sync",
    "eventName": "product.written",
    "url": "https://example.com/hooks/product",
    "onlyLiveVersion": true
}
```

| Field             | Description                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | A name to recognize the webhook.                                                                                                        |
| `eventName`       | The event to subscribe to, see the [webhook events reference](../../../resources/references/app-reference/webhook-events-reference.md). |
| `url`             | Where Shopware sends the request.                                                                                                       |
| `onlyLiveVersion` | Only send entity writes of the live version, not of drafts such as order edits. Defaults to `false`.                                    |
| `aclRoleIds`      | Optional. Limits the webhook to some of its owner's roles, see [Limit a webhook to some roles](#limit-a-webhook-to-some-roles).         |

## Who owns a webhook

Every webhook has an owner, and the owner decides what the webhook may receive.
Shopware records the owner from the API session that creates the webhook: the user or the integration you authenticated as.
You can't set or change the owner through the API.

If an app creates a webhook through the Admin API with its own integration, the app's integration owns it.
Such a webhook is not delivered while the app is inactive, and it is deleted when the app is uninstalled.

## What a webhook receives

A webhook only receives events its owner is allowed to read:

* An administrator owner receives every event it subscribes to.
* Any other owner only receives events it has the read privileges for, for example `product:read` for `product.written`.

Privileges are checked when an event is sent, not only when the webhook is created.
If the owner loses a privilege later, the webhook stops receiving the matching events.

### Which events you can subscribe to

Shopware checks the `eventName` when a webhook is created or updated, and rejects it with a `400` when:

* webhooks can't receive the event at all, for example app lifecycle events such as `app.activated`, which are only sent to apps (`FRAMEWORK__WEBHOOK_EVENT_NOT_PERMITTED`).
* the owner lacks a privilege the event requires (`FRAMEWORK__WEBHOOK_EVENT_PRIVILEGES_MISSING`).

### Limit a webhook to some roles

By default, a webhook uses all roles of its owner.
To give a webhook less access than its owner, list the roles it may use in `aclRoleIds`:

```json
{
    "name": "Product sync",
    "eventName": "product.written",
    "url": "https://example.com/hooks/product",
    "aclRoleIds": ["0193b1c2d3e47f5a8b9c0d1e2f3a4b5c"]
}
```

The webhook then only receives events whose privileges are covered by these roles.
The list must not be empty or contain empty entries, every role must exist, and the owner must hold every listed role unless the owner is an administrator.
Otherwise, the write fails with `FRAMEWORK__WRITE_CONSTRAINT_VIOLATION` on `aclRoleIds`.

## Change or delete a webhook

Only the owner or an administrator can update or delete a webhook.
Anyone else gets a `400` with `FRAMEWORK__WEBHOOK_NOT_OWNED`, even with the `webhook:update` or `webhook:delete` privilege.

Webhooks registered by an app's manifest can't be changed through the API (`FRAMEWORK__APP_WEBHOOK_NOT_MODIFIABLE`).
The only exception: an administrator may set `active`, for example to switch a webhook back on after it was switched off for failing deliveries.

Webhooks can't be cloned through `POST /api/_action/clone/webhook/{id}`.

A user or integration that still owns webhooks can't be deleted (`409`, `FRAMEWORK__DELETE_RESTRICTED`).
Delete its webhooks first.

## Allowed target URLs

By default, the `url` must use HTTPS and resolve only to public IP addresses.
Shopware checks this when the webhook is written and again before every request and every redirect.
Operators can allow HTTP or specific internal IP addresses through `shopware.app_system.allow_unencrypted_traffic` and `shopware.app_system.allowed_private_ip_addresses` in `shopware.yaml`.

## Receive a webhook

Shopware sends the event as JSON in the request body:

```json
{
    "data": {
        "payload": [
            {
                "entity": "product",
                "operation": "update",
                "primaryKey": "7b04ebe416db4ebc93de4d791325e1d9",
                "updatedFields": ["stock"],
                "versionId": "0fa91ce3e96a4bc2be4bd9ce752c3425"
            }
        ],
        "event": "product.written"
    },
    "source": {
        "url": "https://shop.example.com",
        "eventId": "7b04ebe416db4ebc93de4d791325e1d9"
    },
    "timestamp": 1760950000
}
```

The payload only contains what the webhook may read.
Use `timestamp` to reject old requests.

## Webhooks created before 6.7.17.0

Webhooks created through the API before the update have no recorded creator.
The update assigns them to a new administrator integration labelled "Legacy webhooks" and prefixes their names with `[Legacy] `.
They keep receiving every event they subscribe to.

After updating, review them and recreate the ones that should run with fewer privileges as the user or integration they belong to.
To find them, search for the name prefix:

```http
POST /api/search/webhook
Content-Type: application/json

{
    "filter": [{ "type": "prefix", "field": "name", "value": "[Legacy] " }]
}
```

The "Legacy webhooks" integration can only be deleted after its webhooks.
