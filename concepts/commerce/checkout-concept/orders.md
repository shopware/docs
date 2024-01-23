---
nav:
  title: Orders
  position: 20

---

# Orders

From a cart instance, an `Order` can be created. The whole structure of the cart is stored in the database. Contrary to the cart, a structure that allows a great degree of freedom and is *calculation optimized*, the order is *workflow optimized*.

## Design goals

### Denormalization

The order itself does not depend on the catalog or the products. The line item with all of its data, as well as all calculated prices, is persisted in the database. Orders only get recalculated when triggered explicitly through the API.

### Workflow dependant

The order state changes in a defined, predictable and configurable way - other state transitions are blocked.

## State management

::: tip
The state machines displayed in the following sections can actually be modified through the API, this is just the default setup.
:::

During the order placement, at least three distinct state machines are started as described in the below diagrams.

These can be used to track the progress during the order process and notify the customer about the current state of the order.

**The order state machine**

```mermaid
flowchart TD
START_STATE[Start state] --> 018c4a0eeaec71b7a0415b572e1a07f5

018c4a0eeaec71b7a0415b572e1a07f5(Open)
018c4a0eeaec71b7a0415b572e8c7a86(Done)
018c4a0eeaec71b7a0415b572e8c7a86 --> FINAL_STATE[Final state]
018c4a0eeaec71b7a0415b572f6990c5(In Progress)
018c4a0eeaec71b7a0415b572fa73aa1(Cancelled)
018c4a0eeaec71b7a0415b572fa73aa1 --> FINAL_STATE[Final state]

018c4a0eeaec71b7a0415b572e1a07f5 -- process --> 018c4a0eeaec71b7a0415b572f6990c5
018c4a0eeaec71b7a0415b572e1a07f5 -- cancel --> 018c4a0eeaec71b7a0415b572fa73aa1
018c4a0eeaec71b7a0415b572f6990c5 -- cancel --> 018c4a0eeaec71b7a0415b572fa73aa1
018c4a0eeaec71b7a0415b572f6990c5 -- complete --> 018c4a0eeaec71b7a0415b572e8c7a86
018c4a0eeaec71b7a0415b572fa73aa1 -- reopen --> 018c4a0eeaec71b7a0415b572e1a07f5
018c4a0eeaec71b7a0415b572e8c7a86 -- reopen --> 018c4a0eeaec71b7a0415b572e1a07f5
```

**The order transaction state machine**

```mermaid
flowchart TD
START_STATE[Start state] --> 018c4a0eeba171db8f885b1b74f5895f

018c4a0eeba171db8f885b1b74f5895f(Open)
018c4a0eeba171db8f885b1b75b3a3e3(Paid)
018c4a0eeba171db8f885b1b760cc537(Paid partially)
018c4a0eeba171db8f885b1b76166310(Cancelled)
018c4a0eeba171db8f885b1b76cb7f9c(Reminded)
018c4a0eeba171db8f885b1b77a3112c(Refunded)
018c4a0eeba171db8f885b1b77a3112c --> FINAL_STATE[Final state]
018c4a0eeba171db8f885b1b7833adb3(Refunded partially)
018c4a0eff2670648f1f92d85efca4dd(In Progress)
018c4a0eff2670648f1f92d85f9cd806(Failed)
018c4a0f109d7034995df01ceddd9b6a(Authorized)
018c4a0f10bc7230939f1a53ffc3ad22(Chargeback)
018c4a0f2f00710bb4227243818b33ad(Unconfirmed)

018c4a0eeba171db8f885b1b74f5895f -- pay --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eeba171db8f885b1b74f5895f -- pay_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eeba171db8f885b1b74f5895f -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b74f5895f -- remind --> 018c4a0eeba171db8f885b1b76cb7f9c
018c4a0eeba171db8f885b1b76cb7f9c -- pay --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eeba171db8f885b1b76cb7f9c -- pay_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eeba171db8f885b1b76cb7f9c -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b760cc537 -- remind --> 018c4a0eeba171db8f885b1b76cb7f9c
018c4a0eeba171db8f885b1b760cc537 -- pay --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eeba171db8f885b1b760cc537 -- refund_partially --> 018c4a0eeba171db8f885b1b7833adb3
018c4a0eeba171db8f885b1b760cc537 -- refund --> 018c4a0eeba171db8f885b1b77a3112c
018c4a0eeba171db8f885b1b760cc537 -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b75b3a3e3 -- refund_partially --> 018c4a0eeba171db8f885b1b7833adb3
018c4a0eeba171db8f885b1b75b3a3e3 -- refund --> 018c4a0eeba171db8f885b1b77a3112c
018c4a0eeba171db8f885b1b75b3a3e3 -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b7833adb3 -- refund --> 018c4a0eeba171db8f885b1b77a3112c
018c4a0eeba171db8f885b1b7833adb3 -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b76166310 -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eeba171db8f885b1b76166310 -- refund --> 018c4a0eeba171db8f885b1b77a3112c
018c4a0eeba171db8f885b1b76166310 -- refund_partially --> 018c4a0eeba171db8f885b1b7833adb3
018c4a0eff2670648f1f92d85efca4dd -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eff2670648f1f92d85efca4dd -- fail --> 018c4a0eff2670648f1f92d85f9cd806
018c4a0eff2670648f1f92d85efca4dd -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eff2670648f1f92d85efca4dd -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eff2670648f1f92d85efca4dd -- paid_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eff2670648f1f92d85efca4dd -- pay_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eff2670648f1f92d85f9cd806 -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eff2670648f1f92d85f9cd806 -- do_pay --> 018c4a0eff2670648f1f92d85efca4dd
018c4a0eff2670648f1f92d85f9cd806 -- pay --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eff2670648f1f92d85f9cd806 -- fail --> 018c4a0eff2670648f1f92d85f9cd806
018c4a0eff2670648f1f92d85f9cd806 -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eff2670648f1f92d85f9cd806 -- paid_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eff2670648f1f92d85f9cd806 -- pay_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eeba171db8f885b1b74f5895f -- do_pay --> 018c4a0eff2670648f1f92d85efca4dd
018c4a0eeba171db8f885b1b74f5895f -- fail --> 018c4a0eff2670648f1f92d85f9cd806
018c4a0eeba171db8f885b1b76cb7f9c -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eeba171db8f885b1b76cb7f9c -- do_pay --> 018c4a0eff2670648f1f92d85efca4dd
018c4a0eeba171db8f885b1b760cc537 -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eeba171db8f885b1b760cc537 -- do_pay --> 018c4a0eff2670648f1f92d85efca4dd
018c4a0eeba171db8f885b1b75b3a3e3 -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eeba171db8f885b1b7833adb3 -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
018c4a0eeba171db8f885b1b74f5895f -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eeba171db8f885b1b74f5895f -- paid_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0eff2670648f1f92d85efca4dd -- authorize --> 018c4a0f109d7034995df01ceddd9b6a
018c4a0eeba171db8f885b1b74f5895f -- authorize --> 018c4a0f109d7034995df01ceddd9b6a
018c4a0eeba171db8f885b1b76cb7f9c -- authorize --> 018c4a0f109d7034995df01ceddd9b6a
018c4a0f109d7034995df01ceddd9b6a -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0f109d7034995df01ceddd9b6a -- paid_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0f109d7034995df01ceddd9b6a -- fail --> 018c4a0eff2670648f1f92d85f9cd806
018c4a0f109d7034995df01ceddd9b6a -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b75b3a3e3 -- chargeback --> 018c4a0f10bc7230939f1a53ffc3ad22
018c4a0eeba171db8f885b1b760cc537 -- chargeback --> 018c4a0f10bc7230939f1a53ffc3ad22
018c4a0f10bc7230939f1a53ffc3ad22 -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0f10bc7230939f1a53ffc3ad22 -- paid_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0f10bc7230939f1a53ffc3ad22 -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0eeba171db8f885b1b76166310 -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0eeba171db8f885b1b74f5895f -- process_unconfirmed --> 018c4a0f2f00710bb4227243818b33ad
018c4a0eeba171db8f885b1b76cb7f9c -- process_unconfirmed --> 018c4a0f2f00710bb4227243818b33ad
018c4a0eff2670648f1f92d85f9cd806 -- process_unconfirmed --> 018c4a0f2f00710bb4227243818b33ad
018c4a0eeba171db8f885b1b76166310 -- process_unconfirmed --> 018c4a0f2f00710bb4227243818b33ad
018c4a0eeba171db8f885b1b760cc537 -- process_unconfirmed --> 018c4a0f2f00710bb4227243818b33ad
018c4a0f2f00710bb4227243818b33ad -- paid --> 018c4a0eeba171db8f885b1b75b3a3e3
018c4a0f2f00710bb4227243818b33ad -- paid_partially --> 018c4a0eeba171db8f885b1b760cc537
018c4a0f2f00710bb4227243818b33ad -- fail --> 018c4a0eff2670648f1f92d85f9cd806
018c4a0f2f00710bb4227243818b33ad -- cancel --> 018c4a0eeba171db8f885b1b76166310
018c4a0f2f00710bb4227243818b33ad -- authorize --> 018c4a0f109d7034995df01ceddd9b6a
018c4a0f2f00710bb4227243818b33ad -- reopen --> 018c4a0eeba171db8f885b1b74f5895f
```

**The order delivery state machine**

```mermaid
flowchart TD
START_STATE[Start state] --> 018c4a0eeb3872679d76fd8c1d89ef09

018c4a0eeb3872679d76fd8c1d89ef09(Open)
018c4a0eeb3872679d76fd8c1df019d8(Cancelled)
018c4a0eeb3872679d76fd8c1df019d8 --> FINAL_STATE[Final state]

018c4a0eeb3872679d76fd8c1eceaecb(Shipped)
018c4a0eeb3872679d76fd8c1ef13dd7(Shipped partially)
018c4a0eeb3872679d76fd8c1f8af9a3(Returned)
018c4a0eeb3872679d76fd8c1f8af9a3 --> FINAL_STATE[Final state]

018c4a0eeb3872679d76fd8c1fd26398(Returned partially)
018c4a0eeb3872679d76fd8c1d89ef09 -- ship --> 018c4a0eeb3872679d76fd8c1eceaecb
018c4a0eeb3872679d76fd8c1d89ef09 -- ship_partially --> 018c4a0eeb3872679d76fd8c1ef13dd7
018c4a0eeb3872679d76fd8c1d89ef09 -- cancel --> 018c4a0eeb3872679d76fd8c1df019d8
018c4a0eeb3872679d76fd8c1eceaecb -- retour --> 018c4a0eeb3872679d76fd8c1f8af9a3
018c4a0eeb3872679d76fd8c1eceaecb -- retour_partially --> 018c4a0eeb3872679d76fd8c1fd26398
018c4a0eeb3872679d76fd8c1eceaecb -- cancel --> 018c4a0eeb3872679d76fd8c1df019d8
018c4a0eeb3872679d76fd8c1ef13dd7 -- retour --> 018c4a0eeb3872679d76fd8c1f8af9a3
018c4a0eeb3872679d76fd8c1ef13dd7 -- retour_partially --> 018c4a0eeb3872679d76fd8c1fd26398
018c4a0eeb3872679d76fd8c1ef13dd7 -- ship --> 018c4a0eeb3872679d76fd8c1eceaecb
018c4a0eeb3872679d76fd8c1ef13dd7 -- cancel --> 018c4a0eeb3872679d76fd8c1df019d8
018c4a0eeb3872679d76fd8c1df019d8 -- reopen --> 018c4a0eeb3872679d76fd8c1d89ef09
018c4a0eeb3872679d76fd8c1eceaecb -- reopen --> 018c4a0eeb3872679d76fd8c1d89ef09
018c4a0eeb3872679d76fd8c1ef13dd7 -- reopen --> 018c4a0eeb3872679d76fd8c1d89ef09
018c4a0eeb3872679d76fd8c1f8af9a3 -- reopen --> 018c4a0eeb3872679d76fd8c1d89ef09
018c4a0eeb3872679d76fd8c1fd26398 -- reopen --> 018c4a0eeb3872679d76fd8c1d89ef09
018c4a0eeb3872679d76fd8c1fd26398 -- retour --> 018c4a0eeb3872679d76fd8c1f8af9a3
```
