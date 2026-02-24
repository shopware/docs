---
nav:
    title: Nexus
    position: 2
---

# Getting Started

## Prerequisites

- Shopware 6.7 or newer  
- Active Shopware subscription  
- Beta access granted by Shopware  

## Accessing Nexus

1. Log in via Shopware SSO (Ory / OIDC)
2. After authentication, Nexus redirects to a demo workflow
3. The workflow becomes functional once your shop is connected

## Connecting Your Shopware Shop

Your shops are pulled from the Shopware Business Platform.

:::warning
Beta Limitation - Only the first company linked to your user account is used.
:::

## Creating Your First Workflow

### Step 1 – Create Workflow

- Click **New Workflow**
- Enter name and description
- Click **Create**

### Step 2 – Add Trigger

- Drag **Shopware Event Trigger**
- Select shop
- Choose event (e.g. `checkout.order.placed`)
- Click **Save**

### Step 3 – Add Action

- Drag **Send Slack Message**
- Connect trigger to action
- Configure channel & template using `{{expression}}`
- Click **Save**

### Step 4 – Publish

- Click **Save Workflow**
- Click **Publish**
- Click **Execute**

## Known Limitations - Beta-Specific

| Limitation | Workaround |
|------------|------------|
| No test mode | Use staging shops |
| Limited error details | Add Log nodes |
| No undo / redo | Save frequently |
| At-least-once delivery | Design idempotent workflows |
