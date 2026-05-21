# Google Analytics Integration Update: SKU as Item ID

## Executive Summary

This documentation provides an overview of the changes made to the Google Analytics integration in the Shopware platform. The primary change is the use of the SKU as the item ID instead of the internal Shopware product ID. This change aligns the Google Analytics integration with the schema.org markup and the default Google Shopping / Merchant Center integration, which already use the SKU as the product identifier.

## What Changed

### Google Analytics Event Tracking

The Google Analytics event tracking now uses the SKU as the item ID. This change affects the following events:

- `view_item`
- `add_to_cart`
- `remove_from_cart`
- `add_to_wishlist`
- `remove_from_wishlist`

### Product Card Analytics Data

The SKU is now passed in the product card analytics data.

### Hidden Line Item Data

The product number is now exposed in the hidden line item data for cart-related tracking.

## Impact Assessment

This change primarily affects the way Google Analytics tracks and identifies products. It aligns the Google Analytics integration with other Google services, making it easier to compare and reconcile tracking data across these services.

## Action Items for Users/Developers

Users and developers do not need to take any specific action in response to these changes. However, they should be aware of the change in the item ID used in Google Analytics tracking. If they have any custom integrations or reports that rely on the previous item ID (the internal Shopware product ID), they may need to update these to use the SKU instead.

## Migration Guide

No migration is necessary as a result of these changes. The changes are backward compatible and do not require any changes to existing setups.

## Support Information

If you encounter any issues or have any questions about these changes, please refer to the Shopware documentation or contact Shopware support.