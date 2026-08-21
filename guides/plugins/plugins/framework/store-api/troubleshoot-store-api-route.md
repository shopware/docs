---
nav:
  title: Troubleshoot a Store API route
  position: 50
---

# Troubleshoot a Store API route

A Store API route has several independent framework boundaries. Check them separately instead of treating every HTTP error as a routing error.

```text
route class / response classes
    ↓
route import
    ↓
service registration + dependencies
    ↓
router discovery
    ↓
Store API authentication / SalesChannelContext
    ↓
route execution
```

## Check discovery first

```bash
bin/console debug:router | grep your-route
```

A route appearing here does not prove that its service can be constructed or that a real Store API request can execute.

## Then make a real request

Call the Store API endpoint and inspect the response boundary. Store API requests require Store API authentication context. For example, a response saying that the `sw-access-key` header is required means the request reached Shopware's Store API authentication layer. That is different from a `404` caused by an undiscovered route and different again from a container error constructing the route service.

```text
404 / route missing
    → route import or route attributes

container / constructor error
    → service registration or dependencies

401 requiring sw-access-key
    → routing succeeded; authentication is now the boundary

route-specific error after authentication
    → endpoint implementation
```

Do not use an Admin API helper as a substitute for a Store API request. They use different authentication models.

For generated routes, verify both router discovery and a real Store API request. Static file generation alone does not prove the feature is callable.
