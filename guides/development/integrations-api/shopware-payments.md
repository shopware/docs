---
nav:
  title: Shopware Payments External API
  position: 70
---

# Integrate the Shopware Payments External API

This guide connects your backend to existing Shopware Payments transactions. It covers authentication, transaction lookup, capture, cancellation, refunds, and safe retries. For the purpose and boundaries of the API, see the [Shopware Payments concept](../../../concepts/framework/shopware-payments.md).

## Prerequisites

- Shopware Payments is installed or activated, with an account assigned to the relevant sales channel. See the [setup instructions](https://docs.shopware.com/en/shopware-6-en/shopware-services/shopware-payments).
- You can manage integrations in the Shopware Payments settings.
- Your backend can reach the Shopware Payments service over HTTPS.
- You can retrieve the current order transaction ID from Shopware, for example through a separate [Admin API integration](./auth-api-requests.md).
- You have a test-mode transaction created through Shopware Payments. For capture and cancel tests, use a payment with an authorization; for refund tests, use a captured payment.

Use test-mode payments while developing and verifying the integration.

## 1. Create integration credentials

In the Shopware Administration, open **Shopware Payments > Settings > Integrations** and select **Create integration**. Enter a name that identifies your external system, then save the client ID and client secret in secret storage on your backend.

The client secret appears only once. Create a separate integration for each external system so you can revoke its access independently. Deleting an integration also invalidates its existing access tokens on subsequent requests.

These are Shopware Payments credentials. Credentials created under **Settings > System > Integrations** authenticate the Shopware Admin API instead.

## 2. Configure the service URL

Send requests to the Shopware Payments service for your environment, rather than to your shop's domain. The production service origin is `https://shopware-payments.services.shopware.io`; confirm that the External API is available there before using it.

The examples use these environment variables:

- `PAYMENTS_BASE_URL`: The Shopware Payments service origin, without a trailing slash. Replace *`PAYMENTS_HOST`* below with your environment's host.
- `PAYMENTS_CLIENT_ID` and `PAYMENTS_CLIENT_SECRET`: The credentials from step 1, supplied by your secret storage.
- `PAYMENTS_ACCESS_TOKEN`: The token returned in step 3.
- `ORDER_TRANSACTION_ID`: The current Shopware order transaction ID, set in step 4.

```bash
export PAYMENTS_BASE_URL='https://PAYMENTS_HOST'
```

On an environment exposing External API v1, the machine-readable OpenAPI document is available at `/api/integration/openapi/v1.json` on the same origin:

```bash
curl --fail-with-body --silent --show-error \
  "${PAYMENTS_BASE_URL}/api/integration/openapi/v1.json"
```

Use it for client generation and the complete schemas. Transaction endpoints use `/api/integration/v1`; the OAuth endpoint is shared across API major versions. Within v1, responses can gain fields and enum values, so clients must tolerate values they do not recognize.

## 3. Request an access token

Exchange the integration credentials using the OAuth client credentials grant. Send a `UTF-8`, form-encoded body, with each parameter appearing only once:

```bash
curl --fail-with-body --silent --show-error \
  --request POST "${PAYMENTS_BASE_URL}/api/integration/oauth/token" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode "client_id=${PAYMENTS_CLIENT_ID}" \
  --data-urlencode "client_secret=${PAYMENTS_CLIENT_SECRET}"
```

A successful response uses HTTP `200 OK`:

```json
{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 900
}
```

Set `PAYMENTS_ACCESS_TOKEN` to the returned `access_token`. Reuse the token for its lifetime of 900 seconds and obtain another token before it expires. No refresh token is issued. Keep secrets and tokens out of browser code, source control, and logs.

HTTP Basic authentication is also supported. If you use it, form-encode the client ID and secret separately, join them with a colon, and Base64-encode the result. Send only `grant_type` in the form body. Combining Basic authentication with body credentials returns `400 invalid_request`.

The token endpoint uses OAuth errors, such as `invalid_client` for invalid credentials, rather than the transaction error envelope described below. If a request returns `429 Too Many Requests`, respect `Retry-After`; avoid requesting a new token for every API call.

## 4. Look up the transaction

Retrieve the order's current primary transaction from Shopware through the Admin API. Use its `order_transaction.id`: a lowercase, 32-character hexadecimal string without hyphens. An order ID, order number, or provider payment ID cannot replace it.

Set `ORDER_TRANSACTION_ID` to that ID. For example:

```bash
export ORDER_TRANSACTION_ID='0191234567897123890123456789abcd'

curl --fail-with-body --silent --show-error \
  "${PAYMENTS_BASE_URL}/api/integration/v1/transactions/${ORDER_TRANSACTION_ID}" \
  --header "Authorization: Bearer ${PAYMENTS_ACCESS_TOKEN}"
```

An illustrative response for a EUR 100.00 authorization is:

```json
{
  "orderTransactionId": "0191234567897123890123456789abcd",
  "shopwareTransactionStatus": "authorized",
  "authorizations": [
    {
      "authorizationId": "0VF52814937998046",
      "status": "created",
      "amount": "100.00",
      "currency": "EUR",
      "capturable": "100.00",
      "createdAt": "2026-11-16T10:00:00+00:00",
      "updatedAt": "2026-11-16T10:00:00+00:00"
    }
  ],
  "captures": [],
  "correlationId": "a12b34c56d",
  "error": null
}
```

Use the returned `authorizationId` for capture and cancel requests, or a returned `captureId` for refunds. Treat these provider identifiers as opaque strings.

The lookup returns the Shopware transaction's technical state and the provider's current payment information. `capturable` and `refundable` describe remaining amounts; `null` means the resource accepts no further capture or cancel, or no further refund, respectively. Timestamps can also be `null`. A status of `unrecognized` requires reconciliation rather than an automatic payment action.

An empty array means no corresponding payments exist. A failed lookup returns an error and `null` data fields; do not interpret a failed lookup as an empty payment history.

## 5. Submit a payment operation

All payment operations require:

- The bearer token in `Authorization`.
- `Content-Type: application/json`.
- An `Idempotency-Key` header containing a UUID generated for this business operation.
- A JSON body using identifiers from the transaction lookup.

Persist the operation's integration, transaction ID, route, UUID, original body, and first-attempt time **before** sending it. The UUIDs below are examples; generate your own and reuse one only when retrying that same operation. See [safe retries](#retry-safely).

Send positive amounts as decimal strings, with a period as the decimal separator and no more decimal places than the currency allows. Use the resource's uppercase ISO 4217 currency code. The API rejects unknown JSON fields and invalid amounts.

### Capture authorized funds

For a full capture, send the authorization ID and omit `amount` and `currency`. The capture is final:

```json
{
  "authorizationId": "0VF52814937998046"
}
```

For a partial capture, send `amount`, `currency`, and an explicit `isFinal`. This example captures EUR 40.00 and keeps the authorization open for further captures:

```bash
curl --fail-with-body --silent --show-error \
  --request POST "${PAYMENTS_BASE_URL}/api/integration/v1/transactions/${ORDER_TRANSACTION_ID}/capture" \
  --header "Authorization: Bearer ${PAYMENTS_ACCESS_TOKEN}" \
  --header 'Content-Type: application/json' \
  --header 'Idempotency-Key: 3a991378-17eb-4daf-bc89-e0b9a6f8c501' \
  --data '{"authorizationId":"0VF52814937998046","amount":"40.00","currency":"EUR","isFinal":false}'
```

Set `isFinal: true` when no further captures should follow. A final partial capture closes the authorization and releases the remainder. `isFinal: false` requires an amount below the authorized amount. The provider determines whether the authorization's current status and remaining balance permit the operation.

### Cancel an authorization

Cancel releases the remaining authorization. It does not refund previously captured funds or cancel the Shopware order:

```bash
curl --fail-with-body --silent --show-error \
  --request POST "${PAYMENTS_BASE_URL}/api/integration/v1/transactions/${ORDER_TRANSACTION_ID}/cancel" \
  --header "Authorization: Bearer ${PAYMENTS_ACCESS_TOKEN}" \
  --header 'Content-Type: application/json' \
  --header 'Idempotency-Key: b8b8c9a0-92f6-4e78-b823-03d52fe213dc' \
  --data '{"authorizationId":"0VF52814937998046"}'
```

### Refund captured funds

Select a capture from the lookup and specify the amount to refund. For a full refund, send its entire refundable amount. This example refunds EUR 20.00 from a capture:

```bash
curl --fail-with-body --silent --show-error \
  --request POST "${PAYMENTS_BASE_URL}/api/integration/v1/transactions/${ORDER_TRANSACTION_ID}/refund" \
  --header "Authorization: Bearer ${PAYMENTS_ACCESS_TOKEN}" \
  --header 'Content-Type: application/json' \
  --header 'Idempotency-Key: b5087cc3-48b9-49e9-bf91-f8ca82561c30' \
  --data '{"captureId":"3C679366HH908993F","amount":"20.00","currency":"EUR"}'
```

Replace the example resource IDs with those returned for your transaction. Multiple captures require separate refund operations. Capture and refund also accept an optional `noteToPayer` of 1–255 characters, shown to the payer.

## 6. Handle the outcome

A successful capture can return:

```json
{
  "operationStatus": "succeeded",
  "authorizationId": "0VF52814937998046",
  "captureId": "3C679366HH908993F",
  "correlationId": "a12b34c56d",
  "error": null
}
```

For capture, `captureId` identifies the created capture when known. For refund, it identifies the selected capture; `authorizationId` is `null`. Cancel returns the selected `authorizationId` and a `null` `captureId`.

Evaluate the HTTP status, `operationStatus`, and `error.stage` together:

| Operation status | Meaning                                         | Integration action                                                     |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| `succeeded`      | The provider confirms the operation.            | Record the result and reconcile the Shopware state asynchronously.     |
| `pending`        | The provider accepts the operation as pending.  | Keep it pending and check subsequent payment information.              |
| `failed`         | The provider rejects or declines the operation. | Record the rejection; review it before initiating another operation.   |
| `unknown`        | The provider does not confirm the outcome.      | Retry the identical request with the same key within the retry window. |
| `not_executed`   | The request is rejected before submission.      | Inspect the error and resolve its cause before trying again.           |

HTTP `200 OK` can mean `succeeded` or `pending`. Shopware synchronization is scheduled after either outcome, so `shopwareTransactionStatus` can lag behind provider information. Do not mark a pending operation as completed or change Shopware's payment state just because your HTTP request succeeded.

### Handle errors

Transaction errors include a machine-readable code, processing stage, and public message. For example, a capture timeout after submission can return HTTP `502 Bad Gateway`:

```json
{
  "operationStatus": "unknown",
  "authorizationId": "0VF52814937998046",
  "captureId": null,
  "correlationId": "a12b34c56d",
  "error": {
    "code": "EXTERNAL_API__PROVIDER_UNAVAILABLE",
    "stage": "execution",
    "message": "The payment provider did not confirm the outcome. Retry the identical request within the provider retry window."
  }
}
```

Use codes and stages for decisions, rather than matching message text:

| HTTP status  | Error or condition                                                 | Handling                                                                                                     |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `400`, `415` | `EXTERNAL_API__INVALID_REQUEST`                                    | Correct the ID, UUID header, JSON body, or content type.                                                     |
| `401`        | `EXTERNAL_API__UNAUTHORIZED`                                       | Obtain a new token. If credentials were revoked, resolve access first. Preserve the operation key and body.  |
| `403`, `404` | Merchant unavailable or transaction not found                      | Check the integration's shop and the transaction. Do not retry blindly.                                      |
| `409`        | Invalid payment context or `EXTERNAL_API__TRANSACTION_NOT_CURRENT` | Reconcile the order's current transaction and stored payment context.                                        |
| `422`        | `EXTERNAL_API__OPERATION_REJECTED`                                 | The provider rejects the operation; its status is `failed`. Review the payment before taking further action. |
| `502`        | Shop or provider unavailable                                       | Check the stage: `validation` precedes submission; `execution` with `unknown` requires an unchanged retry.   |
| `503`        | `EXTERNAL_API__AUTHORIZATION_UNAVAILABLE`                          | Retry with backoff, preserving the operation identity.                                                       |
| `503`        | `EXTERNAL_API__SCHEDULING_FAILED`                                  | Preserve the known payment outcome and retry the same operation to schedule synchronization.                 |

::: warning
HTTP `503 Service Unavailable` at stage `scheduling` preserves `succeeded` or `pending`: the provider has already confirmed or accepted the operation. An HTTP error is not evidence that no funds moved. Do not replace the `Idempotency-Key` to work around an error.
:::

The examples use curl's `--fail-with-body` so error responses remain visible even when curl exits with a nonzero status. Handle transport failures, missing bodies, and unexpected responses as potentially uncertain outcomes for submitted operations. Store the returned `correlationId` or `X-Correlation-Id` for support, together with redacted operation metadata.

### Retry safely

1. Generate a UUID once per business operation and persist the original request before sending it.
2. Retry using the **same integration, key, HTTP route, transaction ID, and body**, including after token renewal or a lost response. Preserve omitted fields as well as explicit values.
3. Apply bounded backoff and respect `Retry-After` when present. A pending result is not a reason to create another charge or refund.
4. Retry within **seven days of the first request**. Track that deadline in your integration.
5. After that window, reconcile an uncertain outcome with the provider's payment information and your operation records before submitting another operation.

Keys are scoped to the integration. Switching to newly created integration credentials changes the operation identity, even if you reuse the UUID. The API does not provide a stored-operation lookup endpoint; use transaction lookup and reconciliation to follow payment state. A lookup shows payment resources, not proof that a particular uncertain request did or did not execute.

## Verify the integration

Before enabling production operations, verify these cases with test-mode payments:

- Token reuse, expiry, renewal, and revoked credentials.
- Lookup of a current transaction and rejection of a transaction from another shop or a superseded payment attempt.
- Full capture, partial capture with an open authorization, and final capture.
- Cancellation of an authorization before and after a partial capture.
- Partial and full refunds of the selected capture.
- Repeated delivery of an identical operation with the same key, including after token renewal.
- Recovery from a lost response or timeout without creating a second operation.
- Handling of pending payments and delayed Shopware synchronization.

Keep order fulfillment decisions consistent with the confirmed payment outcome. Coordinate operations from the ERP and the Administration so that concurrent captures, cancellations, or refunds are reconciled against the current payment information.
