---
nav:
  title: Cart concurrency
  position: 40

---

# Cart concurrency

This page describes cart locking in the Shopware 6.7 core and explains where the `CHECKOUT__CART_LOCKED` error originates.

## Routes that lock the cart

The following core routes wrap their cart changes in `CartLocker::locked()`:

* `CartItemAddRoute` (`POST /store-api/checkout/cart/line-item`)
* `CartItemUpdateRoute`
* `CartItemRemoveRoute`
* `CartDeleteRoute`
* `CartOrderRoute`

`CartLocker` is marked `@internal`. This page describes its behavior and the resulting error, not an API to call directly.

## How the lock works

`CartLocker` creates a lock through the `lock.factory` service and passes a time to live of 5 seconds to `LockFactory::createLock()`. How long the lock actually lasts depends on the configured lock store. The lock key is `cart-lock` followed by the context token, so requests with the same token use the same key and requests with different tokens use different keys.

If acquiring a new lock returns `false`, `CartLocker` throws `CartException::cartLocked()`. The exception uses HTTP status 409 and the error code `CHECKOUT__CART_LOCKED`. Its message template is `Cart with token {{ token }} is locked due to concurrent write operation. Please try again later.`, with the context token filled in. The throw follows the failed `acquire()` call directly; `CartLocker` itself does not retry.

If the context already holds an acquired lock, `locked()` runs the callback without acquiring a second lock. For a newly acquired lock, `CartLocker` calls `release()` in a `finally` block when the callback returns or throws. `CartLocker` contains no logic that reverts what the callback already wrote.

## Lock store

The core ships `framework.lock: '%env(LOCK_DSN)%'` and injects the `lock.factory` service into `CartLocker`. That setting reads the `LOCK_DSN` environment variable, which defaults to `flock`.

The [lock store guide](../../../guides/hosting/performance/lock-store.md) recommends a remote store for cluster setups.

## What the lock does not cover

* **Loading the cart.** `CartItemAddRoute::add()` receives the cart as the `$cart` argument and calls `locked()` inside the method body. The closure adds to that `$cart` object, calculates and saves it. The route does not load the cart again after the lock is acquired. For the Store API routes, `CartValueResolver` fills the `Cart` argument through `CartService::getCart()` with the context token.
* **Reading the cart.** `CartLoadRoute` is not given a `CartLocker` in its service definition. It calls `calculateByToken()` only when no cart was resolved or the resolved cart has a different token.
* **Persistence.** The MySQL cart persister writes the whole payload, with either `INSERT ... ON DUPLICATE KEY UPDATE` or `UPDATE ... WHERE token = :token`. Neither statement compares a version or the previously stored payload.
* **Repeated adds.** When a line item with the same ID and type is already in the cart, `LineItemCollection::add()` tries to set the quantity of the existing item to the sum of both quantities. A type mismatch throws an exception, and `setQuantity()` can reject a non-stackable item.

## Handling the error

When `CartLocker` throws `CHECKOUT__CART_LOCKED`, the locked callback has not run for that request. Cart or context changes made before the lock attempt can still have been saved. The message asks to try again later. The platform source doesn't define a retry interval or a retry limit.
