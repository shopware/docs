---
nav:
  title: Cart concurrency
  position: 40

---

# Cart concurrency

This page explains why Shopware locks cart writes, which operations use the lock, and what happens when requests contend for the same cart.

## Why cart locking exists

Cart locking was introduced in Shopware 6.7.1.0 to avoid race conditions in cart-mutating routes. Competing acquisitions against the same lock store are rejected while the lock remains held.

## What the lock covers

The `CartItemAddRoute`, `CartItemUpdateRoute`, `CartItemRemoveRoute`, `CartDeleteRoute`, and `CartOrderRoute` routes run their cart changes through `CartLocker`. `CartService` calls those same routes for its `add()`, `update()`, `remove()`, `removeItems()`, `deleteCart()`, and `order()` methods, so Storefront controllers that use these methods also use the lock.

The add, update, remove, and order routes receive their cart before attempting acquisition; they don't reload it after acquiring the lock. `CartDeleteRoute` takes only the context and deletes the cart by its token.

## Client behavior during contention

Acquisition is non-blocking: a request attempting to acquire an already-held lock receives the conflict immediately. When acquisition fails, that request's callback doesn't run. For Store API calls, the conflict response uses HTTP 409 and the `CHECKOUT__CART_LOCKED` error code. Storefront controllers can catch `CartException` and show an error instead; for example, `CheckoutController::order()` catches it and adds a flash message.

`CartException::cartLocked()` supplies the token-interpolated message `Cart with token {{ token }} is locked due to concurrent write operation. Please try again later.` The standard offcanvas add-to-cart path does not retry conflicts. With offcanvas opening disabled, the built-in error fallback can resend the add request; this is not a conflict-specific retry policy.

## What the lock does not guarantee

The add, update, remove, and order routes receive their cart before attempting acquisition. If request B loads a cart before request A saves it, A can save and release its lock before B acquires the lock. B can then save its stale cart and remove A's item. The lock only turns competing acquisitions against a held lock into a conflict; it doesn't make cart loading, modification, and saving one atomic operation or compare cart versions.

`CartValueResolver` supplies Store API `Cart` arguments through `CartService::getCart()` using the context token. `CartLoadRoute` itself takes no cart lock and calls `calculateByToken()` only when no cart was supplied or its token differs from the requested token. Loading can still save the cart: `CartRuleLoader` persists it when line item data or errors change, including during the load before an add route attempts acquisition.

Other write paths don't use `CartLocker`. `CartService::recalculate()` calculates and saves the cart directly. `StorefrontCartFacade` also saves a recalculated cart when it switches blocked payment or shipping methods. `CartLocker` doesn't roll back writes that a callback completes before it throws, and it defines no retry interval or retry limit. When the same line item ID and type already exist, `LineItemCollection::add()` adds the quantities; a type mismatch throws, and increasing the quantity of a non-stackable item can be rejected.

The lock key is `cart-lock` followed by the context token, so different tokens use different keys. The five-second time to live can expire before a callback finishes when the store expires locks, such as Redis. `CartLocker` doesn't renew an expired lock, so another callback can start before the first finishes. With the default `flock` store, the five-second time to live has no effect: the lock lasts until released. The default store is local to each host, so requests reaching different application servers aren't serialized. Configure a shared remote store for clusters.

## Operator configuration

Shopware configures `framework.lock` through the `LOCK_DSN` environment variable, which defaults to `flock`. The [lock store guide](../../../guides/hosting/performance/lock-store.md) recommends a remote store for cluster setups.

## Extension developers

`CartLocker` is marked `@internal`. When a callback already holds the lock in its `SalesChannelContext`, a nested cart write in that context runs without acquiring a second lock. This allows an event subscriber called during a locked cart operation to use `CartService` without trying to reacquire the lock. For a newly acquired lock, `release()` runs in a `finally` block whether the callback returns or throws.
