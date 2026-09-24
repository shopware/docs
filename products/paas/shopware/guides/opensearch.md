---
nav:
  title: How to set up OpenSearch
  position: 60
---

## Before you start

:::warning
If your application runs with `APP_ENV=dev`, you must add the following under `when@dev:` in `config/packages/web_profiler.yaml` **before** you deploy. If you skip this step, the deployment will fail.

```yaml
services:
    Shopware\Elasticsearch\Profiler\DataCollector:
        arguments:
            $enabled: false
            $adminEnabled: false
```

:::

## Enable OpenSearch

To use OpenSearch with your Shopware instance, set `services.opensearch.enabled` to `true` in your [`application.yaml`](../fundamentals/application-yaml.md) file:

```yaml
services:
  opensearch:
    enabled: true
```

Once that is done, commit this change and push it to your git repository. Now you need to update your application, see [here](../fundamentals/applications.md#update-your-application).

## Post-enablement actions

After you enable OpenSearch and update your application, you need to index your application. You can do this as follows:

- Open an interactive session: `sw-paas exec --new`
- Once the exec session is ready, run the following command: `bin/console dal:refresh:index --use-queue`

:::info
The deployment reports success before the index is built. Search returns no results until the indexing command above has run.
:::
