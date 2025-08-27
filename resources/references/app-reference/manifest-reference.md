---
nav:
  title: Manifest Reference
  position: 10

---

# Manifest Reference

## Meta information (required)

Meta-information about your app.

<<< @/docs/snippets/config/app/meta.xml

:::info
The following configurations are all optional.
:::

## Setup

Can be omitted if no communication between Shopware and your app is needed. For more follow the [app base guide](../../../guides/plugins/apps/app-base-guide#registration-request).

<<< @/docs/snippets/config/app/setup.xml

## Storefront

Can be omitted if your app template needs higher load priority than other plugins/apps. For more follow the [storefront guide](../../../guides/plugins/apps/storefront/index).

<<< @/docs/snippets/config/app/storefront.xml

## Permissions

_Optional_, can be omitted if your app does not need permissions. For more follow the [app base guide](../../../guides/plugins/apps/app-base-guide).

You can use individual permission elements (`read`, `create`, `update`, `delete`) or the `<crud>` shortcut element which automatically grants all four CRUD permissions for an entity:

- `<crud>product</crud>` is equivalent to `<read>product</read>`, `<create>product</create>`, `<update>product</update>`, `<delete>product</delete>`

:::info
The `<crud>` shortcut element is available since version 6.7.3.0. If your app needs to support earlier Shopware versions, use the individual permission elements instead.
:::


::: code-group

<<< @/docs/snippets/config/app/granular-permissions.xml [Granular permissions]

<<< @/docs/snippets/config/app/full-permissions.xml [Full permissions]

:::

## Allowed hosts

A list of all external endpoints your app communicates with (since `6.4.12.0`)

<<< @/docs/snippets/config/app/allowed-hosts.xml

## Webhooks

Register webhooks you want to receive, keep in mind that the name needs to be unique. For more follow the [app webhook guide](../../../guides/plugins/apps/webhook).

<<< @/docs/snippets/config/app/webhooks.xml

## Admin extension

Only needed if the Administration should be extended. For more follow the [add custom module guide](../../../guides/plugins/apps/administration/add-custom-modules).

<<< @/docs/snippets/config/app/admin.xml

## Custom fields

Add your custom fields easily via the manifest.xml. For more follow the [custom fields app guide](../../../guides/plugins/apps/custom-data/custom-fields).

<<< @/docs/snippets/config/app/custom-fields.xml

## Cookies

Add a single cookie to the consent manager. For more follow the [cookies with apps guide](../../../guides/plugins/apps/storefront/cookies-with-apps).

<<< @/docs/snippets/config/app/cookies.xml

Add a cookie group to the consent manager. For more follow the [cookies with apps guide](../../../guides/plugins/apps/storefront/cookies-with-apps).

<<< @/docs/snippets/config/app/cookies-group.xml

## Payments

Add your payment methods via payments and handle your synchronous and asynchronous via an external app-server. For more follow the [app payment guide](../../../guides/plugins/apps/payment).

<<< @/docs/snippets/config/app/payments.xml

## Shipping methods

Add your shipping methods via shipping-methods and handle your synchronous and asynchronous via an external app-server. For more follow the [shipping methods guide](../../../guides/plugins/apps/shipping-methods).

<<< @/docs/snippets/config/app/shipping-methods.xml

## Rule conditions

The identifier of the rule condition must be unique should not change. Otherwise a separate rule condition is created, and uses of the old one are lost. For more follow the [rule conditions guide](../../../guides/plugins/apps/rule-builder/add-custom-rule-conditions).

<<< @/docs/snippets/config/app/rule-conditions.xml

## Tax

Add an external tax provider to your app that is calculating your taxes on the fly for complex tax setups. For more follow the [tax provider guide](../../../guides/plugins/apps/tax-provider).

<<< @/docs/snippets/config/app/tax.xml
