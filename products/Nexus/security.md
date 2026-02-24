---
nav:
    title: Nexus
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
