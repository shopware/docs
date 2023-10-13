# B2B permissions

Use permissions to restrict access to certain information or functionalities within the B2B Components. For example, the B2B supervisor can restrict which employee can manage the company's employee accounts.

## Groups
Permissions are divided into individual groups that have a logical relationship to each other.

## Dependencies
A permission can be dependent on another permission, without which this permission cannot be used. For example, if a role is created with the permission to edit employee accounts, this role must also have the permission to view employee accounts. This is because the `employee.edit` permission depends on the `employee.read` permission.

## Shopware base permissions
The following permissions are already included and used in the B2B Employee Management component. More "base" permissions will be duly added with future B2B Components.

|Group|Permission|Dependencies|
|---|---|---|---|
|employee|employee.read| |
|employee |employee.edit|employee.read|
|employee |employee.create|employee.read, employee.edit|
|employee |employee.delete|employee.read, employee.edit |
|order|order.read.all|
