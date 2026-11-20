---
nav:
  title: Shopware Payments
  position: 100
---

# Shopware Payments

Shopware Payments processes payments and makes payment management available in the Shopware Administration. For installation, account setup, and sales channel assignment, see the [Shopware Payments user documentation](https://docs.shopware.com/en/shopware-6-en/shopware-services/shopware-payments).

The External API connects external business systems to existing Shopware Payments transactions. It lets you read payment information, capture authorized funds, release an authorization, and refund captured funds.

## Who is the External API for?

The API is intended for backend integrations, such as enterprise resource planning (ERP) and order management systems (OMS), that manage payments as part of order processing.

For example, an ERP can capture an authorized payment when goods are ready for shipment or refund a capture after processing a return.

## When should you use it?

Use the External API when a payment already exists in Shopware Payments and your external system needs to perform one of these operations:

- **Look up a transaction:** Read the current Shopware transaction status and the payment provider's authorizations and captures.
- **Capture an authorization:** Collect the full authorized amount or a specified partial amount.
- **Cancel an authorization:** Release the amount that remains authorized. Captured funds remain captured.
- **Refund a capture:** Return all or part of the refundable amount of a specific capture.

Checkout, customer authentication, and initial payment creation remain part of your checkout integration. Use the [Admin API](../api/admin-api.md) to retrieve order data from Shopware and the [Store API](../api/store-api.md) for customer-facing commerce flows.

## Where does the integration run?

Your backend calls the Shopware Payments service over HTTPS. The External API has its own integration credentials and OAuth token endpoint, separate from the APIs hosted by your Shopware installation.

An administrator creates the credentials in the Shopware Payments settings. These credentials authorize access for the associated shop. Keep credentials and access tokens on your backend.

The integration uses three types of identifiers:

- The **Shopware order transaction ID** selects the transaction in the URL.
- An **authorization ID** from the lookup selects the authorization to capture or cancel.
- A **capture ID** from the lookup selects the capture to refund.

The API checks that the transaction belongs to the authenticated shop and remains the order's current transaction. A transaction replaced by another payment attempt is no longer eligible, including for lookup and refunds.

## How do payment results reach Shopware?

The External API sends the operation to the payment provider and returns its known outcome. After a successful or pending result, Shopware Payments schedules synchronization with Shopware. The Shopware transaction status can therefore lag behind the provider's payment status.

Your integration must distinguish a completed operation, a pending operation, and an unknown outcome. A timeout or an HTTP error after submission does not establish whether funds moved. Persist each operation with its `Idempotency-Key` and original request so that you can retry it safely.

For setup, request examples, response handling, and the retry rules, continue with the integration guide:

<PageRef page="../../guides/development/integrations-api/shopware-payments" />
