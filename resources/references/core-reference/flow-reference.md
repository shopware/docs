---
nav:
  title: Flow Reference
  position: 20

---

# Flow Reference

::: info
  This functionality is available starting with Shopware 6.4.6.0
:::

| Event                                                  | Description                                                                                       | Actions                                                        |
|--------------------------------------------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| checkout.customer.before.login                         | Triggers as soon as a customer logs in                                                            | No action                                                      |
| checkout.customer.login                                | Triggers as soon as a customer logs in                                                            | Add/remove tag                                                 |
| checkout.customer.logout                               | Triggers when a customer logs out                                                                 | Add/remove tag                                                 |
| checkout.customer.deleted                              | Triggers if a customer gets deleted                                                               | Add/remove tag, send mail                                      |
| user.recovery.request                                  | Triggers when a user created a password recovery request at admin                                 | Send mail                                                      |
| checkout.customer.changed-payment-method               | Triggers when a customer changes his payment method in the checkout process                       | Add/remove tag                                                 |
| checkout.order.placed                                  | Triggers when an order is placed                                                                  | Add/remove tag, send mail, generate document, set order status |
| checkout.order.payment_method.changed                  | Triggers when a user changed payment method during checkout process                               | No action                                                      |
| customer.recovery.request                              | Triggers when a customer recovers his password                                                    | Add/remove tag, send mail                                      |
| checkout.customer.double_opt_in_registration           | Triggers when a customer commits to his registration via double opt in                            | Add/remove tag, send mail                                      |
| customer.group.registration.accepted                   | Triggers when admin accepted a user who register to join a customer group                         | Add/remove tag, send mail                                      |
| customer.group.registration.declined<                  | Triggers when admin declined a user who register to join a customer group                         | Add/remove tag, send mail                                      |
| checkout.customer.register                             | Triggers when a new customer was registered                                                       | Add/remove tag, send mail                                      |
| checkout.customer.double_opt_in_guest_order            | Triggers as soon as double opt-in is accepted in a guest order                                    | Add/remove tag, send mail                                      |
| checkout.customer.guest_register                       | Triggers when a new guest customer was registered                                                 | Add/remove tag, send mail                                      |
| contact_form.send                                      | Triggers when a contact form is send                                                              | Send mail                                                      |
| mail.after.create.message                              | Triggers when a mail message/ content is created                                                  | No action                                                      |
| mail.before.send                                       | Triggers before a mail is send                                                                    | No action                                                      |
| mail.sent                                              | Triggers when a mail is send from Shopware                                                        | No action                                                      |
| newsletter.confirm                                     | Triggers when newsletter was confirmed by a user                                                  | Send mail                                                      |
| newsletter.register                                    | Triggers when user registered to subscribe to a sales channel newsletter                          | Send mail                                                      |
| newsletter.unsubscribe                                 | Triggers when user unsubscribe from a sales channel newsletter                                    | Send mail                                                      |
| newsletter.update                                      | Deprecated in 6.5.0                                                                               | Send mail                                                      |
| product_export.log                                     | Triggers when product export is executed                                                          | No action                                                      |
| state_enter.order_transaction.state.open               | Triggers when an order payment enters status "Open"                                               | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.open               | Triggers when an order payment leaves status "Open"                                               | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.paid               | Triggers when an order payment enters status "Paid"                                               | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.paid               | Triggers when an order payment leaves status "Paid"                                               | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.refunded_partially | Triggers when an order payment enters status "Refunded partially"                                 | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.refunded_partially | Triggers when an order payment leaves status "Refund partially"                                   | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.chargeback         | Triggers when an order payment enters status "In progress"                                        | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.chargeback         | Triggers when an order payment leaves status "Chargeback"                                         | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.paid_partially     | Triggers when an order payment enters status "Paid partially"                                     | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.paid_partially     | Triggers when an order payment leaves status "Paid partially"                                     |                                                                |
| state_enter.order_transaction.state.failed             | Triggers when an order payment enters status "Failed"                                             | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.failed             | Triggers when an order payment leaves status "Failed"                                             | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.reminded           | Triggers when an order payment enters status "Reminded"                                           | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.reminded<          | Triggers when an order payment leaves status "Reminded"                                           | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.authorized         | Triggers when an order payment enters status "Authorized"                                         | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.authorized         | Triggers when an order payment leaves status "Authorized"                                         | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.cancelled          | Triggers when an order payment enters status "Cancelled"                                          | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.cancelled          | Triggers when an order payment leaves status "Cancelled"                                          | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.refunded           | Triggers when an order payment enters status "Refunded"                                           | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.refunded           | Triggers when an order payment leaves status "Refunded"                                           | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.in_progress        | Triggers when an order payment enters status "In progress"                                        | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.in_progress        | Triggers when an order payment leaves status "In progress"                                        | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_delivery.state.returned_partially    | Triggers when an order delivery enters status "Return partially"                                  | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_delivery.state.returned_partially    | Triggers when an order delivery leaves status "Return partially"                                  | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_delivery.state.returned              | Triggers when an order delivery enters status "Returned"                                          | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_delivery.state.returned              | Triggers when an order delivery leaves status "Returned"                                          | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_delivery.state.cancelled             | Triggers when an order delivery enters status "Cancelled"                                         | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_delivery.state.cancelled             | Triggers when an order delivery leaves status "Cancelled"                                         | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_delivery.state.open                  | Triggers when an order delivery enters status "Open"                                              | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_delivery.state.open                  | Triggers when an order delivery leaves status "Open"                                              | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_delivery.state.shipped               | Triggers when an order delivery enters status "Shipped"                                           | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_delivery.state.shipped               | Triggers when an order delivery leaves status "Shipped"                                           | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_delivery.state.shipped_partially     | Triggers when an order delivery enters status "Shipped partially"                                 | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_delivery.state.shipped_partially     | Triggers when an order delivery status is changed from "Shipped partially" to from another status | Add/remove tag, send mail, generate document, set order status |
| state_enter.order.state.in_progress                    | Triggers when an order enters status "In progress"                                                | Add/remove tag, send mail, generate document, set order status |
| state_leave.order.state.in_progress                    | Triggers when an order leaves status "In progress"                                                | Add/remove tag, send mail, generate document, set order status |
| state_enter.order.state.completed                      | Triggers when an order enters status "Completed"                                                  | Add/remove tag, send mail, generate document, set order status |
| state_leave.order.state.completed                      | Triggers when an order leaves status "Completed"                                                  | Add/remove tag, send mail, generate document, set order status |
| state_enter.order.state.open                           | Triggers when an order enters status "Open"                                                       | Add/remove tag, send mail, generate document, set order status |
| state_leave.order.state.open                           | Triggers when an order leaves status "Open"                                                       | Add/remove tag, send mail, generate document, set order status |
| state_enter.order.state.cancelled                      | Triggers when an order enters status "Cancelled"                                                  | Add/remove tag, send mail, generate document, set order status |
| state_leave.order.state.cancelled                      | Triggers when an order leaves status "Cancelled"                                                  | Add/remove tag, send mail, generate document, set order status |
| state_enter.order_transaction.state.unconfirmed        | Triggers when an order payment enters status "Unconfirmed"                                        | Add/remove tag, send mail, generate document, set order status |
| state_leave.order_transaction.state.unconfirmed        | Triggers when an order payment leaves status "Unconfirmed"                                        | Add/remove tag, send mail, generate document, set order status |

## B2B

### Trigger interfaces

| Name          | Provided   |
|:--------------|:-----------|
| EmployeeAware | employeeId |

### Events

| Class                     | Description                                            | Component           |
|:--------------------------|:-------------------------------------------------------|:--------------------|
| collect.permission-events | Triggers when base permissions are created             | Employee Management |
| employee.invite.sent      | Triggers when an employee invitation has been sent     | Employee Management |
| employee.invite.accepted  | Triggers when an employee invitation has been accepted | Employee Management |
| employee.recovery.request | Triggers when an employee requests password recovery   | Employee Management |
| employee.status.changed   | Triggers when the status of an employee changes        | Employee Management |
| employee.role.changed     | Triggers when the role of an employee changes          | Employee Management |
| employee.order.placed     | Triggers when an employee places an order              | Employee Management |
