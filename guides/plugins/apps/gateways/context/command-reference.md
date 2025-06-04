# Context Gateway Command Reference

## Available commands

| Command                            | Description                                                                                           | Payload                                                 | Since   |
|:-----------------------------------|:------------------------------------------------------------------------------------------------------|:--------------------------------------------------------|:--------|
| `context_add-customer-message`     | Adds an error message to be displayed to the customer in the Storefront via FlashBag messages.        | `{"message": "string"}`                                 | 6.7.1.0 |
| `context_change-billing-address`   | Changes the billing address of a customer to the specified address ID.                                | `{"addressId": "string"}`                               | 6.7.1.0 |
| `context_change-shipping-address`  | Changes the shipping address of a customer to the specified address ID.                               | `{"addressId": "string"}`                               | 6.7.1.0 |
| `context_change-currency`          | Changes the active currency for a customer to the currency with the specified ISO 4217 currency code. | `{"iso": "string"}`                                     | 6.7.1.0 |
| `context_change-language`          | Changes the active language for a customer to the language with the specified BCP 47 language tag.    | `{"iso": "string"}`                                     | 6.7.1.0 |
| `context_change-payment-method`    | Changes the active payment method for a customer to the method with the specified technical name.     | `{"technicalName": "string"}`                           | 6.7.1.0 |
| `context_change-shipping-method`   | Changes the active shipping method for a customer to the method with the specified technical name.    | `{"technicalName": "string"}`                           | 6.7.1.0 |
| `context_change-shipping-location` | Changes the active shipping location for a customer to the specified country / country state.         | `{"countryIso": "string", "countryStateIso": "string"}` | 6.7.1.0 |
| `context_login-customer`           | Logs in an existing customer with the specified email.                                                | `{"customerEmail": "string"}`                           | 6.7.1.0 |
| `context_register-customer`        | Register a new customer with the specified data and log them in.                                      | `{"data": "object (s. RegisterCustomerCommand)"}`       | 6.7.1.0 |

## Available data for RegisterCustomerCommand

These properties are available to set in the custom `data` object of the `context_register-customer` command.

| Field                    | Type   | Required                  | Description                                                                                                                   |
|:-------------------------|:-------|:--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `title`                  | string |                           | The title of the customer, e.g. "Mr." or "Mrs."                                                                               |
| `accountType`            | string |                           | The type of account, either "private" or "business"                                                                           |
| `firstName`              | string | Yes                       | The first name of the customer                                                                                                |
| `lastName`               | string | Yes                       | The last name of the customer                                                                                                 |
| `email`                  | string | Yes                       | The email address of the customer                                                                                             |
| `salutationId`           | string |                           | The ID of the salutation to use for the customer                                                                              |
| `guest`                  | bool   |                           | Whether the customer is a guest (default: true)                                                                               |
| `storefrontUrl`          | string | Yes                       | The storefront URL of the sales channel (You find available domains in the sales channel context -> sales channel -> domains) |
| `requestedGroupId`       | string |                           | The ID of the customer group to assign to the customer                                                                        |
| `affiliateCode`          | string |                           | The affiliate code to assign to the customer                                                                                  |
| `campaignCode`           | string |                           | The campaign code to assign to the customer                                                                                   |
| `birthdayDay`            | int    |                           | The day of the customer's birthday                                                                                            |
| `birthdayMonth`          | int    |                           | The month of the customer's birthday                                                                                          |
| `birthdayYear`           | int    |                           | The year of the customer's birthday                                                                                           |
| `password`               | string | (for non-guest customers) | The password for the customer (plain text, will be hashed by shop before stored)                                              |
| `billingAddress`         | object | Yes                       | The billing address of the customer, s. `AddressResponseStruct` for available fields                                          |
| `shippingAddress`        | object |                           | The shipping address of the customer, s. `AddressResponseStruct` for available fields                                         |
| `vatIds`                 | array  |                           | An array of VAT IDs for the customer                                                                                          |
| `acceptedDataProtection` | bool   |                           | Whether the customer has accepted the data protection policy (default: false)                                                 |

### AddressResponseStruct

This structure is used for the `billingAddress` and `shippingAddress` fields in the `RegisterCustomerCommand`.

| Field                    | Type   | Required | Description                                           |
|:-------------------------|:-------|:---------|:------------------------------------------------------|
| `title`                  | string |          | The title of the address, e.g. "Mr." or "Mrs."        |
| `firstName`              | string | Yes      | The first name of the address owner                   |
| `lastName`               | string | Yes      | The last name of the address owner                    |
| `salutationId`           | string |          | The ID of the salutation to use for the address owner |
| `street`                 | string | Yes      | The street of the address                             |
| `zipcode`                | string | Yes      | The ZIP code of the address                           |
| `city`                   | string | Yes      | The city of the address                               |
| `company`                | string |          | The company name for the address                      |
| `department`             | string |          | The department name for the address                   |
| `countryStateId`         | string |          | The ID of the country state for the address           |
| `countryId`              | string | Yes      | The ID of the country for the address                 |
| `additionalAddressLine1` | string |          | Additional address line 1                             |
| `additionalAddressLine2` | string |          | Additional address line 2                             |
| `phoneNumber`            | string |          | The phone number for the address                      |
