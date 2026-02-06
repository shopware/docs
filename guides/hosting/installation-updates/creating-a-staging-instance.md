---
nav:
  title: Creating a Staging Instance
  position: 30

---

# Creating a Staging Instance

This guide covers the complete workflow of creating a staging installation.

## Overview

Creating a staging environment allows you to test changes, updates, and new features without affecting your live shop. This process involves:

1. Setting up a separate Shopware instance
2. Duplicating the database from your live environment
3. Configuring the staging instance
4. Activating staging mode to prepare the environment for testing

## Creating the staging instance

### Setting up the separate Shopware installation

The recommended way to create a staging instance is to deploy from your Git repository to the new environment. This ensures the codebase matches your live environment exactly.

Alternatively, you can copy the files from the live environment to the staging environment.

It's highly recommended to use a separate Domain or Subdomain for the staging instance to avoid conflicts with the live environment. After changing the domain, make sure you have updated `APP_URL` in the `.env` file to reflect the new URL.

::: info
You should still use your **live domain** in Shopware Account > License Domain to avoid licensing issues.
:::

### Copying the database

To make your staging environment similar to the live environment, duplicate the database.

::: info
Ensure that the `mysqldump` and `mysql` binaries are from the same major version and vendor. If you use `mysqldump` from MariaDB, use `mysql` from MariaDB. The same applies to MySQL.
:::

We recommend using `shopware-cli project dump` to create a database dump and import it with the regular mysql command. The CLI also includes an anonymization flag to ensure no personal data is in the staging environment.

::: info
`shopware-cli` is a separate Go command line application with many useful commands for Shopware. [Learn how to install it](../../../../products/cli/installation).
:::

```bash
# Creating a regular dump (the clean parameter excludes cart table data)
shopware-cli project dump --clean --host localhost --username db_user --password db_pass --output shop.sql shopware

# Creating a dump with anonymized data
shopware-cli project dump --clean --anonymize --host localhost --username db_user --password db_pass --output shop.sql shopware
```

Configure the dump command with `.shopware-project.yml` to specify tables to skip, additional anonymization fields, and more. See the [CLI documentation](../../../../products/cli/project-commands/mysql-dump) for details.

## Configuring the staging instance

::: info
Do not share resources like MySQL, Redis, or ElasticSearch/OpenSearch between live and staging environments. This can lead to data corruption and performance issues for your live environment.
:::

After importing the database, modify the `.env` file to use the staging database. If you use ElasticSearch/OpenSearch, set a `SHOPWARE_ES_INDEX_PREFIX` to avoid conflicts with the live environment.

::: warning
If you don't use the included Staging Mode, make sure to disable email sending in the staging environment to avoid sending test emails to real customers and that you reset the app system by deleting "core.app.shopId" from the `system_config` table to avoid leaks of data between live and staging environments.
:::

## Setting up staging mode

Staging mode prepares the Shopware instance for safe testing by modifying the database to prevent unintended operations on the live environment.

### Activating staging mode

After the database is imported and configured, activate staging mode:

```bash
./bin/console system:setup:staging
```

This command modifies the database for staging use. Pass `--no-interaction --force` to avoid interactive questions.

### What staging mode does

The staging command makes the following changes to your instance:

- Deletes all apps with active connections to external services and their integrations
- Resets the instance ID used for app registration
- Disables email sending
- Rewrites URLs to the staging domain (if configured)
- Verifies that ElasticSearch/OpenSearch indices do not exist
- Displays a banner in the administration and storefront to indicate staging mode

### What staging mode does not do

- Does not duplicate the current installation
- Does not copy the database or files
- Does not modify the live environment

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

### App handling

The staging command deletes all apps with active external connections to prevent data corruption or leaks in the live environment. Since the staging instance is a copy of the live environment, apps would retain their original connections. After executing the command, reinstall apps to create new instance IDs, making the app installation completely isolated from the live environment.

## Protecting the staging environment

Protect your staging environment from unauthorized access using password protection, IP restriction, or OAuth authentication.

The simplest method uses `.htaccess` for Apache or `auth_basic` for Nginx. You can also use a firewall to restrict access based on IP addresses.

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
