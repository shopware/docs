---
nav:
    title: Security and Troubleshooting
    position: 6
---

# Security & Data Handling

- Authentication via Shopware SSO
- AES-256-GCM encryption using AWS KMS
- Tenant-isolated storage
- EU-based infrastructure (eu-central-1)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow stuck deploying | Redeploy |
| Unauthorized errors | Re-authenticate |
| Missing event data | Inspect payload with Log node |
| BC filter returns empty | Validate OData syntax |
| Slack message not sent | Re-authorize Slack |

### Activating the Nexus ingestion service

If runtime extension management is disabled (common on composer-managed installations), the **Shopware Nexus Event Ingestion Service** cannot be activated from the Administration. Activate it from the CLI instead:

```bash
bin/console app:activate ShopwareNexusIngestionService
```

Still stuck? Ask in the [Nexus club](https://hub.shopware.com/clubs/nexus).
