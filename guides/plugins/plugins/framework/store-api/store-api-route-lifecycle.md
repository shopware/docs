---
nav:
  title: Store API route lifecycle
  position: 15
---

# Store API route lifecycle

A Store API route crosses several independent boundaries:

```text
route/response classes → routes.php import → service registration → router → authentication/context → execution
```

For implementation, see [Add Store API Route](./add-store-api-route.md).

## Discovery

Use the Symfony router to prove Shopware discovered the route:

```bash
bin/console debug:router | grep your-route
```

A route appearing here does not prove that its service can be constructed or that a Store API request can execute.

## Authentication and execution

Make a real Store API request to test the next boundary. A response requiring `sw-access-key` means the request reached Store API authentication; it is not evidence that the route is missing.

```text
404 / route absent → route attributes or routes.php import
container error → service registration or dependencies
401 requiring sw-access-key → routing succeeded; authentication is now the boundary
endpoint-specific response/error → route implementation
```

Admin API and Store API helpers use different authentication models, so do not substitute one for the other when verifying a Store API route.

Generated PHP files are therefore only the first check. Verify router discovery and a real authenticated request as separate acceptance steps.
