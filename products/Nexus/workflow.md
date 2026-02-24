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

## Workflow Builder Interface

| Element | Description |
|--------|-------------|
| Canvas | Visual workspace |
| Node Palette | Available nodes |
| Node Configuration | Params, Credentials, Notes, Debug |
| Toolbar | Save, Publish, Execute, Undeploy |
| Execution Tab | Run history and metrics |

## Workflow States

| State | Description | Available Actions |
|-------|------------|------------------|
| Draft | Editing | Save, Publish |
| Published | Built | Execute |
| Active | Running | Undeploy |
| Deploying | Creating | Wait |

## Node Types

### Trigger Nodes

| Node | Description | Configuration |
|------|------------|--------------|
| Shopware Event Trigger | React to entity events | Shop, event |
| Schedule Trigger | Time-based execution | Cron, timezone |

### Action Nodes

| Node | Description | Configuration |
|------|------------|--------------|
| Business Central | CRUD on BC entities | Entity, operation |
| Shopware API Call | Call any Shopware API | Method, endpoint |
| Send Slack Message | Slack notification | Channel, template |
| API Request | Generic HTTP | URL, headers |
| Send Shopware Email | Email via Shopware | Recipient, content |

### Transform Nodes

| Node | Description |
|------|------------|
| Filter | Filter array items |

### Condition Nodes

| Node | Description |
|------|------------|
| If | Conditional branching |

### Output Nodes

| Node | Description |
|------|------------|
| S3 Storage | Store payload |

## Expression Syntax

Expressions use `{{ }}` syntax in templates and mappings.

### Examples

```text
{{payload.order.orderNumber}}
{{bc_customers_response.value[0].id}}
{{customer.firstName}} {{customer.lastName}}
````

### Common Usage

* **Slack templates:** build readable notification messages
* **Mapping data:** pass values from trigger payload into action parameters
* **Branching:** drive `If` conditions based on payload values

```

---

## Workflow States

| State | Description | Available Actions |
|-------|------------|------------------|
| Draft | Editing | Save, Publish |
| Published | Built and ready | Execute |
| Active | Running | Undeploy |
| Deploying | Creating deployment | Wait |

Workflows move through these states from creation to active execution.

## Common Use Cases

### Order Sync: Shopware → Business Central

Typical flow:

1. Trigger: `checkout.order.placed`
2. Get Business Central customer by email
3. If customer exists → use it
4. Else → create customer
5. Create sales order in Business Central
6. Update Shopware order with BC reference
7. Send Slack notification

This ensures orders are synchronized and traceable across systems.

### Low Stock Alert

#### Approach 1 – Scheduled

1. Schedule trigger (daily at 9 AM)
2. Fetch Business Central items where inventory < 10
3. If items returned → send Slack message

#### Approach 2 – Event-Based

1. Listen to `checkout.order.placed`
2. Fetch Business Central items where inventory < 10
3. If items returned → send Slack message

**Difference:**

- Schedule-based → daily check  
- Event-based → immediate reaction  
