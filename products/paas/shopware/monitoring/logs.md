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

1. Go to the **Explore** tab.
2. Select **Loki** as the data source.
3. Filter logs by setting the label `service` to the value `shopware`.
4. Run the query to view your application logs.

## Log retention

Shopware PaaS Native keeps your latest logs available for review. Logs older than 14 days are automatically removed.
