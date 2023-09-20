---
nav:
  title: Store API
  position: 130

---

# Store API

## Routes

* Stop implementing the Sales Channel API. It will be deprecated in the 6.4 major release. Define API Controllers \(Routes\) as services. Use named Routes internally.
* The class or each API method requires the annotation: `@Route(defaults={"_routeScope"={"store-api"}})`.
* Decorator of response extends on `StoreApiResponse`.

## Page Loader

* Routes represent a single functionality.
* Controller/Pageloader only works with routes.
* Controller/Pageloader can call multiple routes.
* A route has to return a StoreApiResponse, to convert to JSON.
* A route response can only contain one object.
* The Storefront controller should never work with the repository again. It should be injected inside a route.
