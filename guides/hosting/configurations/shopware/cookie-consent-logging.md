---
nav:
  title: Cookie consent logging
  position: 60

---

# Cookie Consent Logging

::: info
This feature is available since Shopware 6.7.16.0.
:::

## Overview

The built-in Shopware cookie banner can record every consent decision on the server, together with the banner that the visitor saw. Logging is off by default.

::: warning
Shop owners are responsible for using the consent log in line with the GDPR and other applicable data protection regulations.
:::

For the cookie banner itself, see [Cookie Consent Management](../../../../concepts/commerce/content/cookie-consent-management.md).

## What is recorded

The storefront sends every decision to the server in the background. This includes the cookie banner (accept all, only required, own selection) and the consent dialog of single features, such as the wishlist. The banner does not wait for this request.

The browser only reports raw facts: a random consent ID, the action, and the names of the cookies that the visitor accepted. The server derives everything else from its own cookie configuration.

| Field             | Content                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `consentId`       | Random token that the browser creates on the first decision and keeps in the `cookie-consent-id` cookie                 |
| `consentAction`   | `accept_all`, `accept_required` or `accept_selected`                                                                    |
| `groupDecisions`  | Decision per cookie group, keyed by the technical name of the group: `accepted`, `partial` or `rejected`                |
| `acceptedCookies` | Names of the accepted cookies that need consent. Names that the cookie configuration does not know are ignored          |
| `configHash`      | Hash of the banner configuration that the visitor saw                                                                   |
| `salesChannelId`  | Sales channel of the decision                                                                                           |
| `languageId`      | Language of the banner that the visitor saw                                                                             |
| `createdAt`       | Time of the decision                                                                                                    |

Technically required groups are always `accepted`. Any other group is `accepted` only when the visitor accepted every cookie that they could select in it. A group without selectable cookies is `rejected`.

### Banner snapshots

Shopware stores the banner configuration once per configuration hash, as a snapshot. The snapshot contains the cookie groups with their texts, as the visitor saw them. The texts are part of the hash, so every language has its own snapshot. Every decision refers to its snapshot through `configHash`.

Snapshots contain only the banner configuration, no visitor data. The cleanup task does not delete them.

### Withdrawals

A visitor can open the banner again and accept less. This writes a second record with the same consent ID and the narrower decision. All records of one consent ID show the history of the decisions of one browser.

## Enable logging

Select a storage in your `shopware.yaml`, for example in `config/packages/z-shopware.yaml`:

```yaml
shopware:
    cookie_consent:
        # none (default), database, filesystem or the name of a custom storage
        log_storage: database
        # Days a recorded decision is kept, 120 by default
        retention_days: 365
```

Clear the cache after the change.

While logging is on:

- The storefront sets the cookie `cookie-consent-id`. The banner lists it as a technically required cookie. Its lifetime is `retention_days`, and every decision renews it.
- The banner configuration changes when you turn logging on or off. Visitors see the banner once more, so their decision gets logged.

While logging is off, the storefront sends no request and sets no `cookie-consent-id` cookie.

## Storages

Select the storage that fits the traffic of your shop. The setting applies to the whole installation, not per sales channel.

### Database

The `database` storage writes to the tables `cookie_consent_log` and `cookie_consent_config_snapshot`. These tables exist in every shop and stay empty until you select this storage.

Sales channel and language are stored as IDs, without foreign keys. The records stay when you delete a sales channel or a language.

### Filesystem

The `filesystem` storage writes one JSON file per decision to the private filesystem (`shopware.filesystem.private`), below `cookie-consent/`. The directories group the decisions by year, month, day and hour (UTC). The consent ID is part of the file name, so a file search finds all decisions of one visitor. The banner snapshots are in `cookie-consent/snapshots/`.

Point the private filesystem to object storage, such as Amazon S3, to keep a high-volume log out of the shop database.

### Custom storage

A plugin can add its own storage. Implement `Shopware\Core\Content\Cookie\ConsentLog\CookieConsentLogStorageInterface`:

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\ConsentLog;

use Shopware\Core\Content\Cookie\ConsentLog\CookieConsentConfigSnapshot;
use Shopware\Core\Content\Cookie\ConsentLog\CookieConsentLogStorageInterface;
use Shopware\Core\Content\Cookie\ConsentLog\CookieConsentRecord;

class ExampleConsentLogStorage implements CookieConsentLogStorageInterface
{
    public function log(CookieConsentRecord $record): void
    {
        // Store one decision
    }

    public function snapshot(CookieConsentConfigSnapshot $snapshot): void
    {
        // Store the banner configuration. A known hash keeps its first snapshot.
    }

    public function cleanup(\DateTimeInterface $before): void
    {
        // Delete the decisions recorded before $before
    }

    public function iterate(\DateTimeInterface $from, \DateTimeInterface $to, ?string $salesChannelId = null): iterable
    {
        // Return the decisions from $from (inclusive) to $to (exclusive), oldest first
        return [];
    }
}
```

Tag the service with `shopware.cookie_consent.log_storage` and give it a `storage` name:

```xml
<service id="Swag\BasicExample\ConsentLog\ExampleConsentLogStorage">
    <tag name="shopware.cookie_consent.log_storage" storage="example"/>
</service>
```

Then select it by this name:

```yaml
shopware:
    cookie_consent:
        log_storage: example
```

## Retention and cleanup

The daily scheduled task `cookie_consent_log.cleanup` deletes the decisions that are older than `retention_days`. The `filesystem` storage deletes whole hour directories, so it is accurate to one hour.

The retention period is a decision of the shop owner.

::: warning
When you change the storage, the records in the previous storage are not moved. The cleanup task only runs on the selected storage, so delete the old records yourself.
:::

## Rate limiting

The consent log routes are rate limited per client IP address. The limiter `cookie_consent_log` allows 60 requests per 60 seconds, as a sliding window. The IP address is only the key of the limiter. Shopware does not store it with the decision.

Behind a CDN, a load balancer or a reverse proxy, configure the [trusted proxies](../../infrastructure/reverse-http-cache.md#trusted-proxies). Without it, all visitors get the IP address of the proxy and share one limit. Decisions over the limit are lost without a notice.

To change the limit, override the limiter in your `shopware.yaml`:

```yaml
shopware:
    api:
        rate_limiter:
            cookie_consent_log:
                enabled: true
                policy: 'sliding_window'
                limit: 120
                interval: '60 seconds'
```

## Export

Export the log with this command. It writes JSON or CSV to standard output:

```bash
bin/console cookie:consent:export --from=2026-01-01 --to=2026-07-01 --format=csv > consents.csv
```

| Option               | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `--from`             | Decisions recorded at or after this date and time, `1970-01-01` by default |
| `--to`               | Decisions recorded before this date and time, now by default               |
| `--sales-channel-id` | Only decisions of this sales channel                                       |
| `--format`           | `json` (default) or `csv`                                                  |

The command writes errors to standard error, so they do not end up in the exported file.

The export contains the decisions. To show the banner that a visitor saw, find the snapshot with the `configHash` of the decision: in the table `cookie_consent_config_snapshot`, or in `cookie-consent/snapshots/<configHash>.json`.

## Extension events

The Store API route publishes the extension `cookie-consent-log-route.log` with the payload, the request and the sales channel context. Plugins can react to it before and after a decision is logged.

<PageRef page="../../../plugins/plugins/framework/extension/index" />
