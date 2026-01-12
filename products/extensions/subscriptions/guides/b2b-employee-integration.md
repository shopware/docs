---
nav:
  title: B2B Employee Integration
  position: 40

---

# B2B Employee Integration for Subscriptions

When using Subscriptions together with B2B Components Employee Management, subscriptions can be managed and tracked in a B2B employee context.

## Overview

The B2B Employee Integration extends subscription functionality to support employee-based workflows in B2B scenarios. This integration enables:

- **Permission-based subscription access** - Control which subscriptions employees can view based on their assigned permissions
- **Employee tracking** - Track which employee created each subscription for audit and reporting purposes
- **Organization context** - Maintain organization information in both initial and renewal subscription orders

## When to Use

This integration is relevant when you have:

- A B2B store with employee management enabled
- Subscriptions that should be managed by employees on behalf of their organization
- Requirements for permission-based access control to subscription data
- Need for tracking which employee initiated subscriptions

## Prerequisites

To use this integration, you need:

- Shopware 6.7 with the **Subscriptions** extension installed
- **B2B Components** with Employee Management module enabled
- Employees configured with appropriate roles and permissions

## Key Capabilities

### 1. Permission-Based Viewing

Employees can view subscriptions based on three permission levels:

- **`subscription.read.all`** - View all subscriptions in the system
- **`organization_unit.subscription.read`** - View subscriptions from their organization unit plus their own
- **No subscription permission** - View only subscriptions they personally created

### 2. Employee Context in Orders

When an employee creates a subscription:

- The **initial order** includes employee and organization data
- All **renewal orders** automatically maintain this context
- Employee information is preserved for reporting and compliance

### 3. Transparent Integration

The integration works seamlessly with existing subscription workflows:

- Works with both [separate checkout](./separate-checkout.md) and [mixed checkout](./mixed-checkout.md) flows
- No changes required to existing subscription products or plans
- Employee context is automatically added when an employee is logged in

## Technical Documentation

For detailed technical information including architecture, event flows, database schema, and developer integration points, see:

**[B2B Employee Subscription Integration Guide](../../b2b-components/employee-management/guides/subscription-integration.md)**

The technical guide covers:

- Architecture and integration patterns (decorators, event subscribers, entity extensions)
- Database schema for employee-subscription relationships
- Detailed flow diagrams for initial orders, renewals, and permission filtering
- Code examples for accessing employee data from subscriptions and orders
- Extension points for adding custom B2B logic

## Related Documentation

- [Subscription Concept](../concept.md) - Understanding subscription fundamentals
- [Mixed Checkout](./mixed-checkout.md) - Mixed cart checkout with subscriptions
- [Separate Checkout](./separate-checkout.md) - Separate subscription checkout flow
- [B2B Employee Management](../../b2b-components/employee-management/index.md) - Employee and role management basics
