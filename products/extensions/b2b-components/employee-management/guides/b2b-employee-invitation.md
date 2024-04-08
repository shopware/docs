---
nav:
  title: Employee Invitation
  position: 20
---

# Employee Invitation

Employees can be created via storefront, administration and store-api to get an invitation email. This has to be confirmed by the employee to set a password.

## Invitation via Storefront and Store-API

As a business partner, you can create and invite your employees in the storefront and via store-api. The invitation will be sent from the sales channel, you used for the creation.
For the storefront, login as the business partner and switch to the `employee` page. In this listing you have the opportunity to add a new employee.
In the store-api case, use the `/store-api/employee/create` endpoint as a logged in customer.

## Invitation via Administration

As a merchant, you can create and invite the employees via administration. Select the business partner customer, switch to the `company` tab and add a new employee account in edit mode.
Because the administration is not related to a sales channel, you can select the sales channel which is used for the invitation. This field is preselected and disabled if the business partner customer is bound to a sales channel.

## The URL for the Invitation Acceptance

The employees will get an invitation email, to set a password and to fulfill the registration. This process will also activate the employee for the business partners company.
The default URL for the acceptance is `/account/business-partner/employee/invite/%%RECOVERHASH%%`, the recovery hash is used as a unique identifier and is only valid for the invitation of one employee.

### How to override the Invitation URL

The default URL can be replaced with a custom URL. This is helpful if you want to provide a custom endpoint.
To override it, you need to insert the URL as a string into the key-value system config with the key `b2b.employee.invitationURL`.

You can find more information about the system config here: [System Config](/guides/plugins/apps/configuration.md).