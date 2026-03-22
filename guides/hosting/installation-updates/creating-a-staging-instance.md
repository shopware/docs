---
nav:
  title: Creating Staging Instance
  position: 30

---

# Staging

Use a staging copy of your shop to test changes, updates, and new features without affecting production. Since Shopware 6.6.1.0, you can enable **staging mode** on that copy. That feature is separate from creating the copy—see [Staging environment vs staging mode](#staging-environment-vs-staging-mode).

## Staging environment vs staging mode

- **Staging environment** — A non-production copy of the shop: separate hosting, domain, database, and (where applicable) its own Redis, ElasticSearch/OpenSearch index prefix, and `.env` settings. Building this environment is deployment and operations work on your side.
- **Staging mode** — A Shopware mechanism you activate with `./bin/console system:setup:staging` (and optional settings in `config/packages/staging.yaml`). It adjusts data and behavior **inside** that instance so it does not email customers, leak app connections to production, keep live sales channel URLs, and so on.

Creating the environment is your deployment work; activating staging mode is a command you run on that environment after the database is in place.

## Overview

**Phase 1 – Staging environment** (steps 1–3 in [Creating the staging instance](#creating-the-staging-instance)): provision a separate Shopware installation, duplicate the live database into it, and point the instance at staging-specific configuration. Staging mode does not clone servers or databases—this phase is entirely separate from the console command.

**Phase 2 – Staging mode** (step 4): run `system:setup:staging` on the staging instance. Optionally tune behavior in [`staging.yaml`](#configuring-staging-mode).

Checklist:

1. Setting up a separate Shopware instance
2. Duplicating the database from your live environment
3. Configuring the staging instance
4. Activating staging mode on that instance

## Creating the staging instance

### 1. Setting up the separate Shopware installation

The recommended way to create a staging instance is to deploy from your Git repository to the new environment. This ensures the codebase matches your live environment exactly.

Alternatively, you can copy the files from the live environment to the staging environment.

It's highly recommended to use a separate Domain or Subdomain for the staging instance to avoid conflicts with the live environment. After changing the domain, make sure you have updated `APP_URL` in the `.env` file to reflect the new URL.

::: info
You should still use your **live domain** in `Shopware Account > License Domain` to avoid licensing issues.
:::

### 2. Duplicating the database from the live environment

To make your staging environment similar to the live environment, duplicate the database. You can use the `mysqldump` command to export the database and import it into the staging environment.

::: info
Ensure that the `mysqldump` and `mysql` binaries are from the same major version and vendor. If you use `mysqldump` from MariaDB, use `mysql` from MariaDB. The same applies to MySQL.
:::

We recommend using `shopware-cli project dump` to create a database dump, then importing it with the regular MySQL command. The CLI also includes an anonymization flag to ensure no personal data is in the staging environment.

::: info
`shopware-cli` is a separate Go command-line application with many useful commands for Shopware. [Learn how to install it](../../../../docs/products/cli/installation.md).
:::

```bash
# Creating a regular dump (the clean parameter excludes cart table data)
shopware-cli project dump --clean --host localhost --username db_user --password db_pass --output shop.sql shopware

# Creating a dump with anonymized data
shopware-cli project dump --clean --anonymize --host localhost --username db_user --password db_pass --output shop.sql shopware
```

Configure the dump command with `.shopware-project.yml` to specify tables to skip, additional anonymization fields, and more. See the [CLI documentation](../../../../docs/products/cli/project-commands/mysql-dump.md) for details.

### 3. Configuring the staging instance

::: info
Do not share resources like MySQL, Redis, or ElasticSearch/OpenSearch between live and staging environments. This can lead to data corruption and performance issues for your live environment.
:::

After importing the database, modify the `.env` file to use the staging database. If you use ElasticSearch/OpenSearch, set a `SHOPWARE_ES_INDEX_PREFIX` to avoid conflicts with the live environment.

::: warning
If you don't use the included Staging Mode, make sure to disable email sending in the staging environment to avoid sending test emails to real customers, and that you reset the app system by deleting "core.app.shopId" from the `system_config` table to avoid leaks of data between live and staging environments.
:::

### 4. Activating staging mode

After the database is imported and configured, run staging mode on **this** staging instance. It updates the database and related state so the copy is safer to use for testing (see [Staging mode: scope and limitations](#staging-mode-scope-and-limitations)).

```bash
./bin/console system:setup:staging
```

This command modifies the database for staging use. Pass `--no-interaction --force` to avoid interactive questions.

## Staging mode: scope and limitations

| Category | Behavior |
|----------|----------|
| **What the staging mode does** | Deletes all apps with active connections to external services and their integrations |
|  | Resets the instance ID used for app registration |
|  | Disables email sending |
|  | Rewrites URLs to the staging domain (if configured) |
|  | Verifies that ElasticSearch/OpenSearch indices do not exist |
|  | Displays a banner in the administration and storefront to indicate staging mode |
| **What the staging mode does not do** | Does not duplicate the current installation |
|  | Does not copy the database or files |
|  | Does not modify the live environment |

### Configuring staging mode

Staging mode is fully configurable with `config/packages/staging.yaml`:

```yaml
# <shopware-root>/config/packages/staging.yaml
shopware:
    staging:
        mailing:
            # Disables the sending of mails (default: true)
            disable_delivery: true
        storefront:
            # Shows a banner in the storefront when staging mode is active (default: true)
            show_banner: true
        administration:
            # Shows a banner in the administration when staging mode is active (default: true)
            show_banner: true
        sales_channel:
            domain_rewrite:
                # See below for more information
        elasticsearch:
            # Checks that no indices are existing yet (default: true)
            check_for_existence: true
```

### URL rewriting

The `domain_rewrite` option allows you to rewrite URLs to the staging domain. This supports three methods:

**Direct match (`equal`)**

```yaml
# <shopware-root>/config/packages/staging.yaml
shopware:
    staging:
        sales_channel:
            domain_rewrite:
                - type: equal
                  match: https://my-live-store.com
                  replace: https://my-staging-store.com
                - # ... second rule
```

Compares Sales Channel URLs. When equal to `https://my-live-store.com`, it's replaced with `https://my-staging-store.com`.

**Prefix replacement (`prefix`)**

```yaml
# <shopware-root>/config/packages/staging.yaml
shopware:
    staging:
        sales_channel:
            domain_rewrite:
                - type: prefix
                  match: https://my-live-store.com
                  replace: https://my-staging-store.com
                - # ... second rule
```

Replaces URLs starting with `https://my-live-store.com`. For example, `https://my-live-store.com/en` becomes `https://my-staging-store.com/en`.

**Regex replacement (`regex`)**

```yaml
# <shopware-root>/config/packages/staging.yaml
shopware:
    staging:
        sales_channel:
            domain_rewrite:
                - type: regex
                  match: '/https?:\/\/(\w+)\.(\w+)$/m'
                  replace: 'http://$1-$2.local'
                - # ... second rule
```

Uses regular expressions for advanced URL rewriting. In this example, `https://my-live-store.com` becomes `http://my-live-store.local`.

## App handling

The staging command deletes all apps with active external connections to prevent data corruption or leaks in the live environment. Since the staging instance is a copy of the live environment, apps would retain their original connections. After executing the command, reinstall apps to create new instance IDs, making the app installation completely isolated from the live environment.

## Protecting the staging environment

Protect your staging environment from unauthorized access using password protection, IP restriction, or OAuth authentication.

The simplest method uses `.htaccess` for Apache or `auth_basic` for Nginx. You can also use a firewall to restrict access by IP address.

**Apache example:**

```apache
# <project-root>/public/.htaccess
SetEnvIf Request_URI /api noauth=1
<RequireAny>
Require env noauth
Require env REDIRECT_noauth
Require valid-user
</RequireAny>
```

Alternative application proxy solutions:

- [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/)
- [Azure Application Gateway](https://azure.microsoft.com/en-us/products/application-gateway/)
- [Generic oauth2 proxy](https://oauth2-proxy.github.io/oauth2-proxy/)

## Integration into plugins

The `system:setup:staging` command dispatches a `Shopware\Core\Maintenance\Staging\Event\SetupStagingEvent` event that plugins can subscribe to modify the database for staging mode.

**Example subscriber for a payment provider:**

```php
<?php

namespace Swag\PaymentProvider\Subscriber;

use Shopware\Core\Maintenance\Staging\Event\SetupStagingEvent;

class StagingSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
 {
        return [
            SetupStagingEvent::class => 'onSetupStaging'
 ];
 }

    public function onSetupStaging(SetupStagingEvent $event): void
 {
        // modify the database to turn on the test mode
 }
}
```
