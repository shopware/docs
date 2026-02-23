---
nav:
  title: Platform Domains
  position: 90

---

# Platform Domains

* The `Core` domain must not have any dependency on any of the other domains. This means that neither classes nor assets from `Storefront`, `Administration` or `Elasticsearch` may be used within the `Core` domain.
* The `Administration` domain may have dependencies on the `Core` domain but not on the `Storefront` or `Elasticsearch` domain.
* The `Elasticsearch` domain may have dependencies on the `Core` domain but not on the `Storefront` or `Administration` domain.
* The `Storefront` domain may have dependencies on the `Core` domain, but not on the `Administration` or `Elasticsearch` domain.
