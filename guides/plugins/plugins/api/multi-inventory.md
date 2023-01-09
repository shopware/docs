# Multi-Inventory

## Pre-requisites and setup

As Customer-specific Pricing is part of the Commercial plugin, it requires an existing Shopware 6 installation and the activated Shopware 6 Commercial plugin on top. This plugin Commercial plugin can be installed as per the familiar [install instructions](../../../../guides/plugins/plugins/plugin-base-guide#install-your-plugin). In addition, the Custom Prices feature needs to be activated within the relevant merchant account.

____

- Quickstart
    - License setup (SHOULD be covered by Commercial) CHECK
    - Plugin installation + migration
    - Demo data generator
        - Will require a valid license (Throws exception)
    - Admin build (Necessary for Commercial?) CHECK

## Concept

//TBA

____

- Concept
    - ERP as single-source-of-truth
        - Intended to be used via API and custom-built adapter
        - Recommended update frequency?
    - Product availability
        - Products, WarehouseGroups & Rules
        - WarehouseGroup priorities
    - Warehouse stocks
        - Products & Warehouses
    - Reducing stocks after order placement
        - Warehouse priorities
        - Order state changes
            - Returns, Cancellation

## Working with the API

To create, alter and/or delete warehouse groups, warehouses and other things related to multi-inventory, you can the API endpoints mentioned in the following paragraphs. As like with any other admin request in Shopware, you first need to authenticate yourself. Therefore, please head over to the
[authentication guide](https://shopware.stoplight.io/docs/admin-api/ZG9jOjEwODA3NjQx-authentication) for details.

Otherwise, the Customer-specific Pricing API interface models itself upon the interface of the sync API, so you will
be able to package your requests similarly, see our [API documentation](https://shopware.stoplight.io/docs/admin-api).

### Creating a warehouse group and warehouses

### Updating stocks

____

- API Usage
    - Example setup for creating entities and associations
        - WarehouseGroup
        - Warehouse
        - ProductWarehouse
    - Example for updating ProductWarehouse stocks

## Known caveats or issues

When working with the multi-inventory feature, there are currently some caveats or issues to keep in mind:

* We decided to remove the functionality of available stock from the Multi Inventory. The stock of products will now be reduced as soon as the order has been placed. It is no longer necessary (for products, that have warehouse groups) to set any order state to reduce the stock field.
* We will no longer recalculate the stock of products (with assigned warehouse groups) when editing existing orders. Cancelling the order or adjusting the amount of line items afterwards - when editing the order in the admin - will no longer cause a recalculation. The whole stock handling in this regard needs to be done by the external ERP system.

_____ 

- Caveats
    - What happens to Orders / Order cancellations, if you uninstall the plugin and/or delete data?