# Store API

## Routes

* Stop implementing the Sales Channel API, it will be deprecated in the 6.4 major release. Define API Controllers \(Routes\) as services. Use named Routes internally.
* RouteScope “store-api” has to be presented.
* The class or each API method requires the annotation: `@RouteScope(scopes={"store-api"})`
* OpenApi doc is required \(`@OA`\)
* Decorator of response extends on `StoreApiResponse`

## Page Loader

* Routes represent a single functionally
* Controller / Pageloader only work with Routes
* Controller / Pageloader can call multiple routes
* A route has to return a StoreApiResponse, to convert to JSON
* A route response can only contain one object
* The storefront controller should never work with repository again. It should be injected inside a route

