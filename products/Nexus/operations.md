---
nav:
    title: Nexus
    position: 5
---

# Workflow Operations

This section covers how to operate, monitor, and manage workflows in Shopware Nexus after they are created.

## Workflow States

| State | Description | Available Actions |
|-------|------------|------------------|
| Draft | Editing | Save, Publish |
| Published | Built | Execute |
| Active | Running | Undeploy |
| Deploying | Creating | Wait |

## Monitoring Workflows

Shopware Nexus provides execution monitoring to track workflow performance and diagnose issues.

### Execution Metrics

- Status (Success / Failed / Running)
- Execution duration
- Messages processed per node
- Error counts and latency

## Current Monitoring Limitations

- No per-node execution logs
- Limited payload inspection
- Manual refresh required
