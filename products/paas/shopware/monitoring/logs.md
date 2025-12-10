---
nav:
  title: Logs
  position: 20
---

# Logs

## Application Logs

Shopware PaaS Native allows you to view your application’s logs for a given environment via Grafana.

To access Grafana, run the following command:

```bash
sw-paas open grafana
```

This command will provide you with the Grafana URL, username, and password.

Once logged in to Grafana:

1. Open the **Explore** tab.
2. Select **Loki** as the data source.
3. Filter logs by setting the `component` label to the service you want to inspect.
4. Run the query to view the logs for that component.

## Tips

In the Explore view, you can refine results using the search box:
- Line contains — matches the exact string.
- Line contains case insensitive — recommended, as it matches the string regardless of letter case.

A predefined dashboard named Logs Dashboard is available.
It displays log ingestion volume and includes a built-in case-insensitive search box.

## Log retention

Shopware PaaS Native keeps your latest logs available for review. Logs older than 14 days are automatically removed.
