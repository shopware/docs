---
nav:
  title: Store and License
  position: 17

product: shopware
lifecycle: deployment
---

# Store Authentication and License Domain

## License domain: what it is

A license domain is the primary domain associated with your Shopware Account. It identifies your shop in the Shopware Store and is required to:

- Install and update extensions
- Register apps (Shopware's official app registry)
- Verify licensing and entitlements

When you purchase a Shopware license or SaaS plan, you register a primary domain (e.g., `example.com`). That domain is your license domain.

## Why the Deployment Helper needs it

When Shopware installs or updates an [app](../../../../../concepts/extensions/apps-concept.md), it must register with the Shopware registration server. This registration handshake proves that you own the license domain and are authorized to use the app. The handshake requires:

1. Valid Shopware Account credentials (email + password, or shop secret)
2. The license domain for that account
3. A shop ID (unique per Shopware instance)

Without a license domain, app installation fails. If you only use [plugins](../../../../plugins/plugins/index.md), you don't need a license domain, but you cannot install any official Shopware apps.

## Configuring store credentials

Set these environment variables (do **not** commit them to Git; use your CI/CD secret store):

```bash
export SHOPWARE_STORE_ACCOUNT_EMAIL=your-account@example.com
export SHOPWARE_STORE_ACCOUNT_PASSWORD=your-account-password
export SHOPWARE_STORE_LICENSE_DOMAIN=example.com
```

Alternatively, for PaaS Native environments, use the shop secret instead of email/password:

```bash
export SHOPWARE_STORE_SHOP_SECRET=your-shop-secret
export SHOPWARE_STORE_LICENSE_DOMAIN=example.com
```

In `.shopware-project.yml`, you can hardcode the license domain (it's not secret):

```yaml
deployment:
  store:
    license-domain: 'example.com'
```

The environment variable `SHOPWARE_STORE_LICENSE_DOMAIN` overrides the YAML value if both are set.

## Store credentials across environments

Use the same Shopware Account credentials for all environments (production, staging, dev). The credentials are for your account; they don't change per environment.

What **does** change per environment is the license domain:

- **Production**: `example.com` (your live domain)
- **Staging**: `staging.example.com` or `example-staging.example.com` (a staging subdomain)
- **Dev**: `dev.example.com` (optional, for local testing)

Shopware license domains are optional for Shopware Community Edition but required for Plus/Enterprise editions. Set up multiple domains in your Shopware Account if you need them.

```bash
# .envrc or CI/CD secrets (same across all environments)
export SHOPWARE_STORE_ACCOUNT_EMAIL="your-account@example.com"
export SHOPWARE_STORE_ACCOUNT_PASSWORD="your-account-password"

# Environment-specific
export SHOPWARE_STORE_LICENSE_DOMAIN="example.com"           # prod
export SHOPWARE_STORE_LICENSE_DOMAIN="staging.example.com"  # staging
```

## In the Admin UI

When you open the Shopware Administration after deployment, you may see "not logged in" in the extension manager. This is expected. The Deployment Helper is logged in to the Store only during deployment for automated installation and updates. Each Administration user must log in manually in the UI. The two are separate concerns.
