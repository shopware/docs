---
nav:
  title: Hosting and Integrations
  position: 22

product: shopware
lifecycle: deployment
---

# Hosting Integration and Deployment

## Platform.sh (Upsun)

Deployment Helper has explicit support for Platform.sh (now Upsun). When Platform.sh is detected, the helper handles platform-specific behaviors:

- Automatic environment detection (production vs staging)
- Staging setup automatic execution when in a non-production environment
- Vault-backed secrets for `SHOPWARE_STORE_ACCOUNT_EMAIL`, `SHOPWARE_STORE_ACCOUNT_PASSWORD`, etc.
- Automatic Fastly VCL snippet deployment (if configured)

No additional configuration is required; the helper detects Platform.sh from the environment and adapts automatically.

## PaaS Native

PaaS Native environments invoke Deployment Helper during the deploy step of your CI/CD pipeline. Simply configure your `.shopware-project.yml` as usual and DH will execute with the same flow as Platform.sh or manual deployments.

## Kubernetes / Operators

When using [Shopware's Kubernetes operator](https://github.com/shopware/shopware-operator), deployment is triggered via a one-time job that invokes Deployment Helper. The operator does not run DH directly; it spawns it as a pod job. Configure your `.shopware-project.yml` and Deployment Helper will behave as normal.

## Fastly integration

The Deployment Helper can also deploy [Fastly VCL Snippets](../../../../../products/paas/shopware/cdn/fastly-snippets.md) and keep them up to date. After installing the Deployment Helper, install the [Fastly meta package](https://github.com/shopware/fastly-meta):

```bash
composer require shopware/fastly-meta
```

After that, make sure that environment variables `FASTLY_API_TOKEN` and `FASTLY_SERVICE_ID` are set and the Fastly VCL Snippets will be deployed with Deployment Helper's regular deployment process. Automatic deployment only runs when **both**:

- A `config/fastly` directory exists in the project, **and**
- `FASTLY_DISABLE_SNIPPET_UPDATE` is **not** set to `1`

See [`FastlyServiceUpdater`](https://github.com/shopware/deployment-helper/blob/main/src/Integration/Fastly/FastlyServiceUpdater.php) for implementation details.

To disable automatic Fastly management and handle VCL snippets yourself, set:

```bash
export FASTLY_DISABLE_SNIPPET_UPDATE=1
```

The Deployment Helper also has three commands to manage the Fastly VCL Snippets manually:

- `./vendor/bin/shopware-deployment-helper fastly:snippet:list` - List all VCL snippets that are currently deployed
- `./vendor/bin/shopware-deployment-helper fastly:snippet:deploy` - Deploy all Fastly VCL snippets manually
- `./vendor/bin/shopware-deployment-helper fastly:snippet:remove <name>` - Remove a Fastly VCL snippet by name
