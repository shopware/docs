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

## Create workflow

To create a workflow, follow the instructions in the [user documentation](https://docs.shopware.com/en/shopware-6-en/shopware-services/shopware-nexus?category=shopware-6-en/insider-previews).

## Known Limitations - Beta-Specific

| Limitation | Workaround |
|------------|------------|
| No test mode | Use staging shops |
| Limited error details | Add Log nodes |
| No undo / redo | Save frequently |
| At-least-once delivery | Design idempotent workflows |
