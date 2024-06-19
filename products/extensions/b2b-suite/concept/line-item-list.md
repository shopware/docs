---
nav:
  title: Line Item List
  position: 40

---

# Line Item List

## Description

The LineItemList component is the central representation of product lists in the B2B Suite. The main design choices are:

* Central abstraction of product lists
* Minimal knowledge and inheritance of Shopware core services and data structures
* Persistable lists of products
* Guaranteed audit logging

The component is used across multiple different child components throughout the B2B Suite.
![image](../../../../assets/b2bSuite-concept-lineItemListComponents.svg)

| Icon                                      |Description|
|---------------------------------------------|------------|
| <SwagIcon icon="layer-group" type="solid" /> | Represents component |
| <SwagIcon icon="database" type="solid" /> | Represent context objects that contain the component specific information |
| <SwagIcon icon="bars-square" type="solid" /> | Represents child components |

## Internal data structure

The component provides `LineItemList` and `LineItemReference` as its central entities. As the name suggests, a `LineItemReference` references line items.
In most cases, these line items will be products but may include other types (e.g., vouchers) that are valid purchasable items.

To make this work with the Shopware cart, order, and product listing, the `LineItemReferences` themselves can be set up by different entities.
Schematically a list that is not yet ordered looks like this:

![image](../../../../assets/b2bSuite-concept-lineItemListDataStructure.svg)

Whereas an ordered list looks like this:

![image](../../../../assets/b2bSuite-concept-lineItemInternalDataStructure.svg)

As you can see, each `LineItemReference` borrows data from Shopware data structures, but a user of these objects can solely
depend on the `LineItemReference` and `LineItemList` objects for unified access.

This basic pattern revolves against other data structures in the component as well.

![image](../../../../assets/b2bSuite-concept-lineItemFullDataStructure.svg)

As you can see, the specific data is abstracted away through the order context object.
An object that can either be generated during the Shopware checkout process or be created dynamically through the API.
The rule applies: *The B2B-Suite may store or provide ID's, without having an actual concept of what they refer to*.

These central data containers help provide a forward compatible structure for many B2B components.
