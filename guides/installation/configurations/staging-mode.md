---
nav:
  title: Staging mode
  position: 10

---

# Staging mode

Shopware has an integrated staging mode. This mode prepares the shop to be used in a staging environment. This means the shop is prepared to be used in a test environment, where changes can be made without affecting the live shop.

## The workflow

The staging mode is designed to modify data only inside the Shopware instance. This means the staging mode does not duplicate the current installation, copy the database, or copy the files. It only changes the data inside the Shopware instance.

So, the real-world use case would be something like this:

### Creating the second Shopware instance

The recommended way to create a second Shopware instance would be to deploy from your Git repository to the new environment. This way, you ensure the codebase is equal to the live environment.

An alternative way would be to copy the files from the live environment to the staging environment.

### Copying the database

::: info
Ensure that the `mysqldump` and `mysql` binary are from the same major version and vendor. If you use `mysqldump` from MariaDB, you should also use `mysql` from MariaDB. The same applies to MySQL.
:::

To have the staging environment similar to the live environment, it's recommended that the database be duplicated. You can use the `mysqldump` command to export the database and import it into the staging environment.

::: info
`shopware-cli` is a separate Go command line application that contains a lot of useful commands for Shopware. [Checkout the docs](../../../../products/cli/installation) to learn how to install it.
:::

We recommend using `shopware-cli project dump` to create a dump of the database and import it with the regular mysql command. Shopware cli also has a flag to anonymize the data, so you can be sure that no personal data is in the staging environment.

```bash
# creating a regular dump, the clean parameter will not dump the data of cart table
shopware-cli project dump --clean --host localhost --username db_user --password db_pass --output shop.sql shopware

# create a dump with anonymize data
shopware-cli project dump --clean --anonymize --host localhost --username db_user --password db_pass --output shop.sql shopware
```

You can configure the dump command with a `.shopware-project.yml`. This file allows you to specify tables that should be skipped, define additional fields for anonymization, and more. Check out the [CLI](../../../../products/cli/project-commands/mysql-dump) for more information.

### Configuration

::: info
It is not recommended to share resources like MySQL, Redis, ElasticSearch/OpenSearch between the live and staging environments. This could lead to data corruption when the configuration is not done correctly. Also, the performance of the live environment could be affected by the staging environment.
:::

After importing the database, you should modify the `.env` to use the staging database. If you use ElasticSearch/OpenSearch, you should set a `SHOPWARE_ES_INDEX_PREFIX` to avoid conflicts with the live environment.

### Activate the staging mode

After the database is imported and the configuration is done, you can activate the staging mode. This can be done using:

```bash
./bin/console system:setup:staging
```

This command will modify the database to be used in a staging environment. You can pass `--no-interaction --force` to the command to avoid the interactive questions.

### Protecting the staging environment

The staging environment should be protected from unauthorized access. It is advisable to employ protective measures like password protection, IP restriction, or OAuth authentication.

The simplest way to protect the staging environment is utilizing `.htaccess` for  Apache or `auth_basic` for Nginx. You can also use a firewall to restrict access to the staging environment based on IP addresses.

Example configuration for Apache:

```apache
# <project-root>/public/.htaccess
SetEnvIf Request_URI /api noauth=1
<RequireAny>
Require env noauth
Require env REDIRECT_noauth
Require valid-user
</RequireAny>
```

An alternative way could be to use an Application Proxy before the staging environment like:

- [Cloudflare Access](https://www.cloudflare.com/teams/access/)
- [Azure Application Gateway](https://azure.microsoft.com/en-us/services/application-gateway/)
- [Generic oauth2 proxy](https://oauth2-proxy.github.io/oauth2-proxy/)

## Staging mode

The staging mode is designed to be used in a test environment. This means the shop is prepared to be used in a test environment, where changes can be made without affecting the live shop.

### What staging mode does?

- Deletes all apps that have an active connection to an external service and the integrations in Shopware.
- Resets the instance ID used for registration of apps.
- It turns off the sending of emails.
- Rewrites the URLs to the staging domain (if configured).
- Checks that the ElasticSearch/OpenSearch indices do not exist yet.
- Shows a banner in the administration and storefront to indicate that the shop is in staging mode.

### What staging mode does not?

- Doesn't duplicate the current installation.
- Doesn't copy database or files.
- Doesn't modify the live environment.

### Configuration

The staging mode is fully configurable with `config/packages/staging.yaml`. You can configure the following options:

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

One of the most important options is the `domain_rewrite`. This option allows you to rewrite the URLs to the staging domain. This allows multiple ways to rewrite the URLs:

- Using direct match (`equal`)

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

This compares the Sales Channel URLs. When it's equal to `https://my-live-store.com`, it will be replaced with `https://my-staging-store.com`.

- Replace using prefix (`prefix`)

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

The difference here to the `equal` type is that it will only replace the URL when it starts with `https://my-live-store.com`, so all paths to that beginning will be replaced. For example, `https://my-live-store.com/en` will be replaced with `https://my-staging-store.com/en`

- Replace using regex (`regex`)

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

This will use the regex to replace the URL. The match and replace are regular expressions. In this example, `https://my-live-store.com` will be replaced with `http://my-live-store.local`.

### Usage of apps

The staging command will delete all apps that have an active connection to an external service. This will be done to avoid data corruption or leaks in the live environment, as the staging environment is a copy of the live environment, so they keep a connection. After executing the command, you can install the app again, creating a new instance ID, so the app will think it's an entirely different shop. In this way, the app installation is completely isolated from the live environment.

## Integration into plugins

The `system:setup:staging` is dispatching an Event which all plugins can subscribe to `Shopware\Core\Maintenance\Staging\Event\SetupStagingEvent` and modify the database for them to be in staging mode.

Example of a subscriber for a payment provider to turn on the test mode:

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
