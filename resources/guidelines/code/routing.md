# Routing

* Storefront routes must always have the prefix `frontend` in the name.
* A route that should only be used by logged in customers \(including guest accounts\) must have the `@LoginRequired` flag.
* Every route must have the `Shopware\Core\Framework\Routing\Annotation\Since` annotation
* Each Store API route must have an `OpenApi\Annotations` annotation

