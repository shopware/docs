# Storefront Controller

## Controller

* Each controller action has to be declared with a `@Since` tag
* Each controller action requires a `@Route` annotation
* The name of the route should be starting with "frontend"
* Each route should define the corresponding HTTP Method \(GET, POST, DELETE, PATCH\)
* The function name should be concise
* Each function should define a return type hint
* A route should have a single purpose
* Use Symfony flash bags for error reporting
* Each storefront functionality has to be available inside the store-api too
* A storefront controller should never contain business logic
* The class requires the annotation: `@RouteScope(scopes={"storefront"})`
* Depending services has to be injected over the class constructor
* Depending services has to be defined in the DI-Container service definition
* Depending services has to be assigned to a private class property
* A storefront controller has to extend the `\Shopware\Storefront\Controller\StorefrontController`

## Read operations inside Storefront controllers

* A storefront controller should never use a repository directly, the data should be fetched over a route or page loader
* Routes that should load a full storefront page, should use a page loader class to load all corresponding data
* Pages that contain data that are the same for all customers, should have the `@HttpCache` annotation

## Write operations inside Storefront controllers

* Write operations should create their response with the `createActionResponse` function to allow different forwards and redirects
* Each write operation has to call a corresponding store-api route

