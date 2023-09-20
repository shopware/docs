---
nav:
  title: Routing
  position: 110

---

# Routing

* Storefront routes must always have the prefix `frontend` in the name.
* A route that should only be used by logged-in customers \(including guest accounts\) must have the `@LoginRequired` flag.
* Every route must have the `Shopware\Core\Framework\Routing\Annotation\Since` annotation.
* Each core route must have a schema defined under `src/Core/Framework/Api/ApiDefinition/Generator/Schema`.
