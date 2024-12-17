---
nav:
  title: Custom routes
  position: 10

---

# Custom routes

## Overview

Your default routes in Shopware 6 are defined in the controllers of the core or your plugins. An example could be the wishlist route:

```php
<?php declare(strict_types=1);

#[Route(path: '/wishlist', name: 'frontend.wishlist.page', options: ['seo' => false], defaults: ['_noStore' => true], methods: ['GET'])]
public function index(Request $request, SalesChannelContext $context): Response
{
    $customer = $context->getCustomer();

    if ($customer !== null && $customer->getGuest() === false) {
        $page = $this->wishlistPageLoader->load($request, $context, $customer);
        $this->hook(new WishlistPageLoadedHook($page, $context));
    } else {
        $page = $this->guestPageLoader->load($request, $context);
        $this->hook(new GuestWishlistPageLoadedHook($page, $context));
    }

    return $this->renderStorefront('@Storefront/storefront/page/wishlist/index.html.twig', ['page' => $page]);
}
```

It defines that your wishlist page is available at `/wishlist`. This is fine for an english only shop, but for a multilanguage shop, you might want to have a different route for each language.

For example, you could have `/wishlist` for english and `/merkliste` for german.

## Configuration

To easily configure those routes, you can use the `routes.yaml` file in ROOT/config/routes/routes.yaml. This file is loaded by Symfony and allows you to define your custom routes.

```yaml
frontend.wishlist.page:
  path:
    en-GB: '/wishlist'
    de-DE: '/merkliste'
  controller: 'Shopware\Storefront\Controller\WishlistController::index'
  methods: ['GET']
  defaults:
    _noStore: true
    _routeScope: ['storefront']
  options:
    seo: false
```

If you want to learn more about routes in Symfony, check out the [Symfony documentation](https://symfony.com/doc/current/routing.html#creating-routes-as-attributes).
