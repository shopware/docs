---
nav:
    title: Nexus
    position: 3
---

# Workflow Builder

This page covers the fundamentals of building workflows in Shopware Nexus:
- workflow structure and states
- available node types
- expression syntax for mapping and templates

## Workflow Concepts

A workflow is built from nodes connected on a canvas.

Typical structure:

1. **Trigger** (starts the workflow)
2. **Actions** (do something, e.g. API calls, ERP writes, notifications)
3. **Transforms** (shape/filter data)
4. **Conditions** (branch logic)
5. **Outputs** (store results)

## Workflow builder interface

| Element | Description |
|--------|-------------|
| Canvas | Visual workspace |
| Node Palette | Available nodes |
| Node Configuration | Params, Credentials, Notes, Debug |
| Toolbar | Save, Publish, Execute, Undeploy |
| Execution Tab | Run history and metrics |

## Workflow states

| State | Description | Available Actions |
|-------|------------|------------------|
| Draft | Editing | Save, Publish |
| Published | Built and ready | Execute |
| Active | Running | Undeploy |
| Deploying | Creating deployment | Wait |

Workflows move through these states from creation to active execution.

### Execution Metrics

- Status (Success / Failed / Running)
- Execution duration
- Messages processed per node
- Error counts and latency

## Current Monitoring Limitations

- No per-node execution logs
- Limited payload inspection
- Manual refresh required

## Node types

### Trigger nodes

| Node | Description | Configuration |
|------|------------|--------------|
| Shopware Event Trigger | React to entity events | Shop, event |
| Schedule Trigger | Time-based execution | Cron, timezone |

### Action nodes

| Node | Description | Configuration |
|------|------------|--------------|
| Business Central | CRUD on BC entities | Entity, operation |
| Shopware API Call | Call any Shopware API | Method, endpoint |
| Send Slack Message | Slack notification | Channel, template |
| API Request | Generic HTTP | URL, headers |
| Send Shopware Email | Email via Shopware | Recipient, content |

### Transform nodes

| Node | Description |
|------|------------|
| Filter | Filter array items |

### Condition nodes

| Node | Description |
|------|------------|
| If | Conditional branching |

### Output nodes

| Node | Description |
|------|------------|
| S3 Storage | Store payload |

## Expression syntax

Expressions use `{{ }}` syntax in templates and mappings.

### Examples

```text
{{payload.order.orderNumber}}
{{bc_customers_response.value[0].id}}
{{customer.firstName}} {{customer.lastName}}
```

### Common usage

* **Slack templates:** build readable notification messages
* **Mapping data:** pass values from trigger payload into action parameters
* **Branching:** drive `If` conditions based on payload values

Refer to user docs for [common use cases](https://docs.shopware.com/en/shopware-6-en/shopware-services/shopware-nexus?category=shopware-6-en/insider-previews#common-use-cases)



