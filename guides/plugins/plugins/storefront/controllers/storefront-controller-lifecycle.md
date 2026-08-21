---
nav:
  title: Storefront Controller Lifecycle
  position: 30

---

# Storefront Controller Lifecycle

A Storefront controller becomes a working URL only after several independent pieces agree: the controller class, its route attributes, a routing import, a service definition, and a cleared container.

```text
controller class → route attributes → routes.php import → service registration → router → cache → request
```

For implementation, see [Add Custom Controller](./add-custom-controller.md).

## What each stage proves

A controller class on disk proves nothing about reachability. Shopware discovers Storefront routes through the plugin's routing configuration, and a freshly created plugin does not have one. Its `src/Resources/config` directory typically contains `services.php`, `services.xml`, and `config.xml`, but no `routes.php` until a generator or the developer adds it.

Prove route discovery with the Symfony router:

```bash
bin/console debug:router | grep your-route
```

A discovered route still does not prove that the controller can be constructed. Storefront controllers are services, so the route resolves but the request fails until the controller is registered in the plugin's service configuration.

## Troubleshooting by boundary

```text
route absent from debug:router → route attributes or missing routes.php import
route discovered, HTTP 500 with no container → controller not registered as a service
service registered, container error → missing service() import or wrong class reference
route reachable, wrong output → controller implementation or Twig template
```

Clear the cache after changing routing or service configuration:

```bash
bin/console cache:clear
```

Each boundary produces a different symptom, so identify the failing boundary before changing controller code. A missing routing import and an unregistered service both look like "my controller does not work", but they fail at different stages and need different fixes.

## Working with generated controllers

The `--create-storefront-controller` scaffold generates the controller, its template, the service definition, and the `routes.php` entry together. When you add a controller by hand or copy one between plugins, check each of those four pieces separately rather than assuming the class is enough.

When adding a controller to a plugin that already has routing configuration, extend the existing `routes.php` and service definitions rather than replacing them.
