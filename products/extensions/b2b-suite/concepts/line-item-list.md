# Line Item List

## Description

The LineItemList component is the central representation of product lists in the B2B Suite. The main design choices are:

* Central abstraction of product lists
* Minimal knowledge and inheritance of Shopware core services and data structures
* Persistable lists of products
* Guaranteed audit logging

The component is used across multiple different child components throughout the B2B Suite.

![image](../../../../.gitbook/assets/line-item-list-outer-dependencies.svg)

The yellow colored blocks represent components, while the smaller green ones are context objects that contain the component specific information.

## Internal data structure

The component provides `LineItemList` and `LineItemReference` as its central entities. As the name suggests, a `LineItemReference` references line items.
In most cases, these line items will be products but may include other types (e.g., vouchers) that are valid purchasable items.

To make this work with the Shopware cart, order, and product listing, the `LineItemReferences` themselves can be set up by different entities.
Schematically a list that is not yet ordered looks like this:

![image](../../../../.gitbook/assets/line-item-list-with-listing.svg)

Whereas an ordered list looks like this:

![image](../../../../.gitbook/assets/line-item-list-with-order.svg)

As you can see, each `LineItemReference` borrows data from Shopware data structures, but a user of these objects can solely
depend on the `LineItemReference` and `LineItemList` objects for unified access.

This basic pattern revolves against other data structures in the component as well.

![image](../../../../.gitbook/assets/line-item-list-with-order-context.svg)

As you can see, the specific data is abstracted away through the order context object.
An object that can either be generated during the Shopware checkout process or be created dynamically through the API.
The rule applies: *The B2B-Suite may store or provide ID's, without having an actual concept of what they refer to*.

These central data containers help provide a forward compatible structure for many B2B components.
