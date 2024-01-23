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
START_STATE[Start state] --> 020c4a0eeaec71b7a0415b572e1a07f5

020c4a0eeaec71b7a0415b572e1a07f5(Open)
020c4a0eeaec71b7a0415b572e8c7a86(Done)
020c4a0eeaec71b7a0415b572e8c7a86 --> FINAL_STATE[Final state]
020c4a0eeaec71b7a0415b572f6990c5(In Progress)
020c4a0eeaec71b7a0415b572fa73aa1(Cancelled)
020c4a0eeaec71b7a0415b572fa73aa1 --> FINAL_STATE[Final state]

020c4a0eeaec71b7a0415b572e1a07f5 -- process --> 020c4a0eeaec71b7a0415b572f6990c5
020c4a0eeaec71b7a0415b572e1a07f5 -- cancel --> 020c4a0eeaec71b7a0415b572fa73aa1
020c4a0eeaec71b7a0415b572f6990c5 -- cancel --> 020c4a0eeaec71b7a0415b572fa73aa1
020c4a0eeaec71b7a0415b572f6990c5 -- complete --> 020c4a0eeaec71b7a0415b572e8c7a86
020c4a0eeaec71b7a0415b572fa73aa1 -- reopen --> 020c4a0eeaec71b7a0415b572e1a07f5
020c4a0eeaec71b7a0415b572e8c7a86 -- reopen --> 020c4a0eeaec71b7a0415b572e1a07f5
```

**The order transaction state machine**

```mermaid
flowchart TD
START_STATE[Start state] --> 020c4a0eeba171db8f885b1b74f5895f

020c4a0eeba171db8f885b1b74f5895f(Open)
020c4a0eeba171db8f885b1b75b3a3e3(Paid)
020c4a0eeba171db8f885b1b760cc537(Paid partially)
020c4a0eeba171db8f885b1b76166310(Cancelled)
020c4a0eeba171db8f885b1b76cb7f9c(Reminded)
020c4a0eeba171db8f885b1b77a3112c(Refunded)
020c4a0eeba171db8f885b1b77a3112c --> FINAL_STATE[Final state]
020c4a0eeba171db8f885b1b7833adb3(Refunded partially)
020c4a0eff2670648f1f92d85efca4dd(In Progress)
020c4a0eff2670648f1f92d85f9cd806(Failed)
020c4a0f109d7034995df01ceddd9b6a(Authorized)
020c4a0f10bc7230939f1a53ffc3ad22(Chargeback)
020c4a0f2f00710bb4227243818b33ad(Unconfirmed)

020c4a0eeba171db8f885b1b74f5895f -- pay --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eeba171db8f885b1b74f5895f -- pay_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eeba171db8f885b1b74f5895f -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b74f5895f -- remind --> 020c4a0eeba171db8f885b1b76cb7f9c
020c4a0eeba171db8f885b1b76cb7f9c -- pay --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eeba171db8f885b1b76cb7f9c -- pay_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eeba171db8f885b1b76cb7f9c -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b760cc537 -- remind --> 020c4a0eeba171db8f885b1b76cb7f9c
020c4a0eeba171db8f885b1b760cc537 -- pay --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eeba171db8f885b1b760cc537 -- refund_partially --> 020c4a0eeba171db8f885b1b7833adb3
020c4a0eeba171db8f885b1b760cc537 -- refund --> 020c4a0eeba171db8f885b1b77a3112c
020c4a0eeba171db8f885b1b760cc537 -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b75b3a3e3 -- refund_partially --> 020c4a0eeba171db8f885b1b7833adb3
020c4a0eeba171db8f885b1b75b3a3e3 -- refund --> 020c4a0eeba171db8f885b1b77a3112c
020c4a0eeba171db8f885b1b75b3a3e3 -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b7833adb3 -- refund --> 020c4a0eeba171db8f885b1b77a3112c
020c4a0eeba171db8f885b1b7833adb3 -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b76166310 -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eeba171db8f885b1b76166310 -- refund --> 020c4a0eeba171db8f885b1b77a3112c
020c4a0eeba171db8f885b1b76166310 -- refund_partially --> 020c4a0eeba171db8f885b1b7833adb3
020c4a0eff2670648f1f92d85efca4dd -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eff2670648f1f92d85efca4dd -- fail --> 020c4a0eff2670648f1f92d85f9cd806
020c4a0eff2670648f1f92d85efca4dd -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eff2670648f1f92d85efca4dd -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eff2670648f1f92d85efca4dd -- paid_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eff2670648f1f92d85efca4dd -- pay_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eff2670648f1f92d85f9cd806 -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eff2670648f1f92d85f9cd806 -- do_pay --> 020c4a0eff2670648f1f92d85efca4dd
020c4a0eff2670648f1f92d85f9cd806 -- pay --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eff2670648f1f92d85f9cd806 -- fail --> 020c4a0eff2670648f1f92d85f9cd806
020c4a0eff2670648f1f92d85f9cd806 -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eff2670648f1f92d85f9cd806 -- paid_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eff2670648f1f92d85f9cd806 -- pay_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eeba171db8f885b1b74f5895f -- do_pay --> 020c4a0eff2670648f1f92d85efca4dd
020c4a0eeba171db8f885b1b74f5895f -- fail --> 020c4a0eff2670648f1f92d85f9cd806
020c4a0eeba171db8f885b1b76cb7f9c -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eeba171db8f885b1b76cb7f9c -- do_pay --> 020c4a0eff2670648f1f92d85efca4dd
020c4a0eeba171db8f885b1b760cc537 -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eeba171db8f885b1b760cc537 -- do_pay --> 020c4a0eff2670648f1f92d85efca4dd
020c4a0eeba171db8f885b1b75b3a3e3 -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eeba171db8f885b1b7833adb3 -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
020c4a0eeba171db8f885b1b74f5895f -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eeba171db8f885b1b74f5895f -- paid_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0eff2670648f1f92d85efca4dd -- authorize --> 020c4a0f109d7034995df01ceddd9b6a
020c4a0eeba171db8f885b1b74f5895f -- authorize --> 020c4a0f109d7034995df01ceddd9b6a
020c4a0eeba171db8f885b1b76cb7f9c -- authorize --> 020c4a0f109d7034995df01ceddd9b6a
020c4a0f109d7034995df01ceddd9b6a -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0f109d7034995df01ceddd9b6a -- paid_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0f109d7034995df01ceddd9b6a -- fail --> 020c4a0eff2670648f1f92d85f9cd806
020c4a0f109d7034995df01ceddd9b6a -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b75b3a3e3 -- chargeback --> 020c4a0f10bc7230939f1a53ffc3ad22
020c4a0eeba171db8f885b1b760cc537 -- chargeback --> 020c4a0f10bc7230939f1a53ffc3ad22
020c4a0f10bc7230939f1a53ffc3ad22 -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0f10bc7230939f1a53ffc3ad22 -- paid_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0f10bc7230939f1a53ffc3ad22 -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0eeba171db8f885b1b76166310 -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0eeba171db8f885b1b74f5895f -- process_unconfirmed --> 020c4a0f2f00710bb4227243818b33ad
020c4a0eeba171db8f885b1b76cb7f9c -- process_unconfirmed --> 020c4a0f2f00710bb4227243818b33ad
020c4a0eff2670648f1f92d85f9cd806 -- process_unconfirmed --> 020c4a0f2f00710bb4227243818b33ad
020c4a0eeba171db8f885b1b76166310 -- process_unconfirmed --> 020c4a0f2f00710bb4227243818b33ad
020c4a0eeba171db8f885b1b760cc537 -- process_unconfirmed --> 020c4a0f2f00710bb4227243818b33ad
020c4a0f2f00710bb4227243818b33ad -- paid --> 020c4a0eeba171db8f885b1b75b3a3e3
020c4a0f2f00710bb4227243818b33ad -- paid_partially --> 020c4a0eeba171db8f885b1b760cc537
020c4a0f2f00710bb4227243818b33ad -- fail --> 020c4a0eff2670648f1f92d85f9cd806
020c4a0f2f00710bb4227243818b33ad -- cancel --> 020c4a0eeba171db8f885b1b76166310
020c4a0f2f00710bb4227243818b33ad -- authorize --> 020c4a0f109d7034995df01ceddd9b6a
020c4a0f2f00710bb4227243818b33ad -- reopen --> 020c4a0eeba171db8f885b1b74f5895f
```

**The order delivery state machine**

```mermaid
flowchart TD
START_STATE[Start state] --> 020c4a0eeb3872679d76fd8c1d89ef09

020c4a0eeb3872679d76fd8c1d89ef09(Open)
020c4a0eeb3872679d76fd8c1df019d8(Cancelled)
020c4a0eeb3872679d76fd8c1df019d8 --> FINAL_STATE[Final state]

020c4a0eeb3872679d76fd8c1eceaecb(Shipped)
020c4a0eeb3872679d76fd8c1ef13dd7(Shipped partially)
020c4a0eeb3872679d76fd8c1f8af9a3(Returned)
020c4a0eeb3872679d76fd8c1f8af9a3 --> FINAL_STATE[Final state]

020c4a0eeb3872679d76fd8c1fd26398(Returned partially)
020c4a0eeb3872679d76fd8c1d89ef09 -- ship --> 020c4a0eeb3872679d76fd8c1eceaecb
020c4a0eeb3872679d76fd8c1d89ef09 -- ship_partially --> 020c4a0eeb3872679d76fd8c1ef13dd7
020c4a0eeb3872679d76fd8c1d89ef09 -- cancel --> 020c4a0eeb3872679d76fd8c1df019d8
020c4a0eeb3872679d76fd8c1eceaecb -- retour --> 020c4a0eeb3872679d76fd8c1f8af9a3
020c4a0eeb3872679d76fd8c1eceaecb -- retour_partially --> 020c4a0eeb3872679d76fd8c1fd26398
020c4a0eeb3872679d76fd8c1eceaecb -- cancel --> 020c4a0eeb3872679d76fd8c1df019d8
020c4a0eeb3872679d76fd8c1ef13dd7 -- retour --> 020c4a0eeb3872679d76fd8c1f8af9a3
020c4a0eeb3872679d76fd8c1ef13dd7 -- retour_partially --> 020c4a0eeb3872679d76fd8c1fd26398
020c4a0eeb3872679d76fd8c1ef13dd7 -- ship --> 020c4a0eeb3872679d76fd8c1eceaecb
020c4a0eeb3872679d76fd8c1ef13dd7 -- cancel --> 020c4a0eeb3872679d76fd8c1df019d8
020c4a0eeb3872679d76fd8c1df019d8 -- reopen --> 020c4a0eeb3872679d76fd8c1d89ef09
020c4a0eeb3872679d76fd8c1eceaecb -- reopen --> 020c4a0eeb3872679d76fd8c1d89ef09
020c4a0eeb3872679d76fd8c1ef13dd7 -- reopen --> 020c4a0eeb3872679d76fd8c1d89ef09
020c4a0eeb3872679d76fd8c1f8af9a3 -- reopen --> 020c4a0eeb3872679d76fd8c1d89ef09
020c4a0eeb3872679d76fd8c1fd26398 -- reopen --> 020c4a0eeb3872679d76fd8c1d89ef09
020c4a0eeb3872679d76fd8c1fd26398 -- retour --> 020c4a0eeb3872679d76fd8c1f8af9a3
```
