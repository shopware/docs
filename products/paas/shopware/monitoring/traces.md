---
nav:
  title: Traces
  position: 30
---

# Traces

## Application Traces

Shopware PaaS Native allows you to view your application's traces for a given environment via Grafana.

To access Grafana, run the following command:

```bash
sw-paas open grafana
```

This command will provide you with the Grafana URL, username, and password.

Once logged in to Grafana:

1. Go to the **Explore** tab.
2. Select **Tempo** as the data source.
3. Ensure query type is **Search**
4. Filter traces by setting the Service Name to the value `shopware`.
5. Run the query to view your application traces.

## Trace Retention

Shopware PaaS Native keeps your latest traces available for review. Traces older than 14 days are automatically removed.
