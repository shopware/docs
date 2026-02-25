---
nav:
    title: Getting Started
    position: 2
---

# Getting Started

## Prerequisites

- Shopware 6.7 or newer  
- Active Shopware subscription  
- Beta access granted by Shopware 
- Nexus service activated
- Active Shopware services
  - Accept Shopware Service T&C's
  - Activate Nexus service
  - Register shop in SBP if not already done

## Accessing Nexus

- Log in via Shopware SSO (Ory / OIDC)
- After authentication, Nexus redirects to a demo workflow
- The workflow becomes functional once your shop is connected

## Connecting Your Shopware Shop

Your shops are pulled from the Shopware Business Platform.

:::warning
Beta Limitation - Only the first company linked to your user account is used. As such, only shops linked to that first company will be available in Nexus.
:::

## Creating your first workflow

### Step 1 – Create workflow

- Click **New Workflow**
- Enter name and description
- Click **Create**

### Step 2 – Add trigger

- Drag **Shopware Event Trigger**
- Select shop
- Choose event (e.g. `checkout.order.placed`)
- Click **Save**

### Step 3 – Add action

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
