---
nav:
  title: Environment and Database
  position: 16

---

# Environment Setup and Database Requirements

## Database requirements

Deployment Helper requires a working MySQL/MariaDB database that is:

- **Accessible** at the `DATABASE_URL` before the helper runs
- **Writable** with permissions to create tables and insert data
- **Compatible** with the Shopware version being deployed

Deployment Helper does not require an existing schema; if the database is empty, it runs `system:install` and then the initial setup described under [What gets created on fresh install](#what-gets-created-on-fresh-install).

Detection: Shopware is considered "installed" if all three exist:

- `system_config` table (with content)
- At least one row in `user` table
- At least one row in `sales_channel` table

If the database has the schema but no users or sales channels, DH treats it as not installed and runs `system:install` again.

## What gets created on fresh install

When Deployment Helper installs Shopware on a fresh database, it runs `system:install` (it creates the schema, applies the shop locale and currency, and runs core setup such as migrations, asset installation and theme compilation) and then creates the following with separate console commands:

- One admin user with credentials from environment variables:
  - Username: `INSTALL_ADMIN_USERNAME` (default: `admin`)
  - Password: `INSTALL_ADMIN_PASSWORD` (default: `shopware`; change this!)
  - Email: `INSTALL_ADMIN_EMAIL` (optional, defaults to empty)
- One Storefront sales channel (customer-facing shop, only if the Storefront is installed and no sales channel with that URL exists yet):
  - Name: `Storefront`
  - URL: `SALES_CHANNEL_URL` or `APP_URL`; if neither is set, an empty URL is passed to `sales-channel:create:storefront`
- Default theme assignment (Shopware's Storefront theme, only if the Storefront is installed)
- Messenger transport tables and queues
- All configured plugins and apps (unless excluded)

Note: You need to create additional admin users, sales channels, or custom configurations manually after installation (via Admin UI or `bin/console` commands). Deployment Helper sets up only the minimal required structure.

## Environment variables

Configure the Shopware installation and Deployment Helper via environment variables. On Shopware PaaS, use the [Vault](../../../../../products/paas/shopware/guides/secrets-vault-guide.md) for sensitive values (email, password, tokens).

### Installation and initial setup

These variables are read by Deployment Helper, not by `bin/console system:install` itself, and apply only on a **fresh installation**. Deployment Helper passes `INSTALL_LOCALE` and `INSTALL_CURRENCY` on to `system:install` as the `--shop-locale` and `--shop-currency` options. For the other options of the command, see the [commands reference](../../../../../resources/references/core-reference/commands-reference.md#system):

| Variable                 | Default            | Purpose                                                       |
| ------------------------ | ------------------ | ------------------------------------------------------------- |
| `INSTALL_LOCALE`         | `en-GB`            | Locale for the shop (e.g., `de-DE`, `fr-FR`)                  |
| `INSTALL_CURRENCY`       | `EUR`              | Default currency of the shop (`--shop-currency`)              |
| `INSTALL_ADMIN_USERNAME` | `admin`            | Username of the initial admin user                            |
| `INSTALL_ADMIN_PASSWORD` | `shopware`         | Password for the initial admin user                           |
| `INSTALL_ADMIN_EMAIL`    | *(empty)*          | Email address of the admin user                               |
| `SALES_CHANNEL_URL`      | *(not set)*        | URL of the Storefront sales channel; `APP_URL` if unset       |
| `APP_URL`                | *(not set)*        | Fallback URL for Storefront if `SALES_CHANNEL_URL` is not set |

:::warning
Change `INSTALL_ADMIN_PASSWORD` from the default immediately. The default is a security risk in production.
:::

### Database connection

| Variable                               | Required | Purpose                                                                  |
| -------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`                         | **Yes**  | Database connection string (e.g., `mysql://user:pass@host:3306/shop`)    |
| `DATABASE_SSL_CA`                      | No       | Path to TLS CA certificate for DB connection                             |
| `DATABASE_SSL_CERT`                    | No       | Path to TLS client certificate                                           |
| `DATABASE_SSL_KEY`                     | No       | Path to TLS client key                                                   |
| `DATABASE_SSL_DONT_VERIFY_SERVER_CERT` | No       | Set to any value to skip server-certificate verification (dev/test only) |

See [SSL/TLS Setup](../../../infrastructure/database.md#ssltls-connection) for certificate details.

### Deployment control

| Variable                              | Values                   | Purpose                                                                            |
| ------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `SHOPWARE_DEPLOYMENT_TIMEOUT`         | Seconds (default: `300`) | Max time a single deployment step can run; set to `null` to disable                |
| `SHOPWARE_DEPLOYMENT_FORCE_REINSTALL` | `1` or unset             | Set to `1` to force fresh install with `--drop-database` (destroys existing data!) |
| `SHOPWARE_DEPLOYMENT_STAGING`         | `1` or unset             | Set to `1` to enable staging mode on every deployment                              |
| `SHOPWARE_PROJECT_CONFIG_FILE`        | File path                | Custom project configuration path (absolute or relative to project root)           |

### Store authentication

Required if installing apps. Optional if you only use plugins (custom code in `custom/plugins`).

| Variable                          | Alternative                  | Purpose                                                                      |
| --------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `SHOPWARE_STORE_ACCOUNT_EMAIL`    | `SHOPWARE_STORE_SHOP_SECRET` | Email for Shopware Account (use one or the other)                            |
| `SHOPWARE_STORE_ACCOUNT_PASSWORD` | `SHOPWARE_STORE_SHOP_SECRET` | Password for Shopware Account (use one or the other)                         |
| `SHOPWARE_STORE_SHOP_SECRET`      | `EMAIL`+`PASSWORD`           | Pre-configured shop secret (PaaS Native only; alternative to email/password) |
| `SHOPWARE_STORE_LICENSE_DOMAIN`   | YAML config                  | The license domain (overrides `deployment.store.license-domain` in YAML)     |

Choose one auth method:

- **Email + Password**: `SHOPWARE_STORE_ACCOUNT_EMAIL` + `SHOPWARE_STORE_ACCOUNT_PASSWORD`
- **Shop Secret**: `SHOPWARE_STORE_SHOP_SECRET` (PaaS Native only)

### Usage and compliance

| Variable                      | Values                  | Purpose                                                                                                                                                         |
| ----------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHOPWARE_USAGE_DATA_CONSENT` | `accepted` or `revoked` | Enable/disable Shopware Usage Data collection (overrides Admin setting). Note: Shopware cannot collect data from its own hosted environments for legal reasons. |
| `DO_NOT_TRACK`                | Any value               | Opt out of Deployment Helper telemetry                                                                                                                          |

### Fastly integration

| Variable                        | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `FASTLY_API_TOKEN`              | API token for Fastly (required to deploy VCL snippets)           |
| `FASTLY_SERVICE_ID`             | Fastly Service ID (required to deploy VCL snippets)              |
| `FASTLY_DISABLE_SNIPPET_UPDATE` | Set to `1` to disable automatic VCL snippet updates during `run` |
