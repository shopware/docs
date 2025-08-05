---
nav:
  title: Employee Invitation
  position: 20
---

# Employee Invitation

Employees can be created via Storefront, Store-api, and Administration.

- Storefront - Business partners can invite employees by logging-in to Storefront and navigating to the `employee` page. From there, they can add a new employee.
- Store API - One can utilize the `/store-api/employee/create` endpoint while logged in as a customer to invite employees.
- Administration - Merchants can invite employees by logging in to the administration interface. Selects the business partner customer, navigates to the `company` tab, and adds a new employee account in edit mode.

The invited employee receives an invitation mail that must be confirmed to set a password.

## The URL for the invitation acceptance

Upon invitation, the employee will receive an email requiring confirmation to set a password. This process will also activate the employee for the business partners company.
The default URL for the acceptance is `/account/business-partner/employee/invite/%%RECOVERHASH%%`, the recovery hash is used as a unique identifier and is only valid for the invitation of one employee.

### How to override the Invitation URL

The default URL can be replaced with a custom URL. This is helpful if you want to provide a custom endpoint.
To override it, you need to insert the URL as a string into the key-value system config with the key `b2b.employee.invitationURL`.

You can find more information about the system config here: [System Config](../../../../../guides/plugins/apps/configuration.md).
