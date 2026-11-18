---
nav:
  title: Security and permissions
  position: 35
---

# Security and permissions

Review the complete path from a request to the data it reads or changes.
A hidden button, an authenticated user or a valid UUID does not by itself establish permission to perform an operation.
For plugins, the checks below cover custom routes and DAL access.
For apps, apply the same ownership and validation principles in your backend and use the [app signing and verification mechanisms](../../../plugins/apps/lifecycle/app-signature-verification.md).

## Administration permissions

Custom Admin API operations must enforce privileges appropriate to their effects.
Reading statistics, deleting statistics, sending customer emails and importing products are different capabilities.
Do not grant a write operation through an unrelated viewer privilege or broad configuration-read permission.

Register assignable Administration roles and map them to the entity privileges the feature needs.
Keep navigation, page access and buttons consistent with those roles, while enforcing authorization on the server.
Use [Administration permissions](../../../plugins/plugins/administration/permissions-error-handling/add-acl-rules.md) for the implementation details.

When reviewing a suspected bypass, trace the actual context and downstream DAL permission checks.
A mismatched route guard may make a feature unusable to restricted users while the repository still refuses unauthorized writes.
Conversely, direct SQL or an elevated context can bypass protections you expected the DAL to provide.
Check standard entity API operations as well as custom action routes.

**Verify:** test an unauthenticated request, an unrelated viewer, the intended read-only role, the intended writer and a full administrator.
Call the endpoint directly as well as through the UI.
Missing service definitions or broken route registration must be fixed before runtime behavior can be verified.

## Customer and sales-channel ownership

Resolve the current customer and sales channel from a trusted context.
Validate ownership and eligibility before acting on submitted order, address, media, review or other resource IDs.
An ID being well-formed does not make that resource accessible to the caller.
Guest orders can have a customer ID; check the customer's guest state rather than treating a non-null ID as proof of a registered account.

For guest links, downloads and previews, define an explicit access mechanism, such as an expiring, operation-specific signed token.
A client-controlled query parameter or cookie must not grant access to drafts or privileged editor features.
Keep private files in appropriate private storage and authorize every download.

**Verify:** substitute another customer's resource ID, switch sales channels, and test guest, registered, expired-token and invalid-token cases.

## Input, output and commercial values

Validate input on the server, even when the UI already validates it.
Check scalar versus array shapes, UUIDs, allowed enum values, lengths, dates, numeric ranges and upload limits.
Use typed request accessors where supported, followed by validation of the value's meaning.

Compute prices, discounts and balances from trusted server-side data.
Moving a calculation into PHP does not make it trustworthy if the client still supplies the price or surcharge used in that calculation.
Respect the active currency, tax state, rounding and applicable rules.

Escape values for their output context.
Plain text settings must not become executable HTML through `raw` or equivalent rendering.
For intentional rich text, use a suitable sanitization and rendering strategy rather than silently removing supported formatting.
Constrain user-influenced file paths and outbound requests, including redirect destinations, and retain TLS verification.

**Verify:** submit malformed arrays, oversized values, unexpected IDs and modified price payloads.
Return a controlled validation response instead of an uncaught exception, and ensure rejected requests do not partially change data.

## Credentials and callbacks

Do not ship shared working credentials or permit missing or empty secrets to authorize access.
Use per-installation credentials or require secure configuration before enabling the integration.
Keep passwords, tokens and sensitive data out of logs, frontend configuration and exports.
For nested or legacy export payloads, verify that credential fields are excluded there too.

Use the authentication mechanism appropriate to the integration.
If a custom protocol is necessary, document its scope and verify its protections; disabling core authentication does not replace those checks.
Validate payment and webhook signatures before changing state, and match callbacks to the intended resource, channel and amount where applicable.
Handle repeated callbacks and retries without duplicating financial or other external side effects.

**Verify:** missing, invalid and default credentials; invalid signatures; wrong resource or amount; repeated callbacks; and remote success followed by a failed local write.

## HTTP methods and confirmations

Keep download and confirmation landing pages read-only for business operations.
Use an appropriate mutation method and the request protections supported by the targeted Shopware version for actions such as sending mail, redeeming a code or confirming an operation.
Email scanners, crawlers and browser prefetching can visit GET links without a deliberate customer action.

Incidental request logging or view analytics are different from a business confirmation.
Assess their retention, duplication and abuse controls separately rather than treating every logging write as the same defect.

**Verify:** visiting or prefetching a link does not perform the business action; the intended authorized submission performs it once.
Do not add legacy CSRF APIs that are unavailable in the supported Shopware version.
