---
nav:
  title: Role and Permission Mapping
  position: 20

---

# Role and Permission Mapping

This section documents the role mappings from B2B Suite to B2B Commercial, detailing how permissions and roles are transformed during the migration. Roles define the permissions assigned to employees within the B2B Commercial, and dependencies ensure that related permissions are included to maintain functionality. This reference is essential for developers to understand how roles and permissions are structured in the new system.

## Permission Mapping

Below is the mapping of permissions from B2B Suite to B2B Commercial. Each permission from B2B Suite is mapped to a corresponding permission in B2B Commercial.

::: info
Some permissions in B2B Suite do not actually exist in B2B Commercial, because some features are not available in B2B Commercial. In this case, the permission would be mapped to nearest equivalent permission in B2B Commercial.
:::

| B2B Suite Role          | B2B Commercial Role                         | Dependencies                                                                                       | Category        |
|-------------------------|---------------------------------------------|----------------------------------------------------------------------------------------------------|-----------------|
| `address_assign`        | `organization_unit.shipping_address.create` | `organization_unit.billing_address.create`, `organization_unit.create`, `organization_unit.update` | Address         |
| `address_create`        | `organization_unit.shipping_address.create` | `organization_unit.billing_address.create`, `organization_unit.create`, `organization_unit.update` | Address         |
| `address_delete`        | `organization_unit.shipping_address.delete` | `organization_unit.billing_address.delete`                                                         | Address         |
| `address_detail`        | `organization_unit.shipping_address.update` | `organization_unit.billing_address.update`, `organization_unit.create`, `organization_unit.update` | Address         |
| `address_list`          | `organization_unit.read`                    | `organization_unit.create`, `organization_unit.update`                                             | Address         |
| `address_update`        | `organization_unit.shipping_address.update` | `organization_unit.create`, `organization_unit.update`                                             | Address         |
| `budget_assign`         | `approval_rule.create`                      | None                                                                                               | Budget          |
| `budget_create`         | `approval_rule.create`                      | None                                                                                               | Budget          |
| `budget_delete`         | `approval_rule.delete`                      | None                                                                                               | Budget          |
| `budget_detail`         | `approval_rule.read`                        | None                                                                                               | Budget          |
| `budget_list`           | `approval_rule.read`                        | None                                                                                               | Budget          |
| `budget_update`         | `approval_rule.update`                      | None                                                                                               | Budget          |
| `company_list`          | `organization_unit.read`                    | None                                                                                               | Company         |
| `contact_create`        | `employee.create`                           | `employee.read`, `employee.edit`, `role.read`                                                      | Contact         |
| `contact_delete`        | `employee.delete`                           | `employee.read`, `employee.edit`, `role.read`                                                      | Contact         |
| `contact_detail`        | `employee.read`                             | None                                                                                               | Contact         |
| `contact_list`          | `employee.read`                             | None                                                                                               | Contact         |
| `contact_update`        | `employee.edit`                             | `employee.read`, `role.read`                                                                       | Contact         |
| `contingent_assign`     | `approval_rule.create`                      | None                                                                                               | Contingent      |
| `contingent_create`     | `approval_rule.create`                      | None                                                                                               | Contingent      |
| `contingent_delete`     | `approval_rule.delete`                      | None                                                                                               | Contingent      |
| `contingent_detail`     | `approval_rule.read`                        | None                                                                                               | Contingent      |
| `contingent_list`       | `approval_rule.read`                        | None                                                                                               | Contingent      |
| `contingent_update`     | `approval_rule.update`                      | None                                                                                               | Contingent      |
| `contingentrule_create` | `approval_rule.create`                      | None                                                                                               | Contingent Rule |
| `contingentrule_delete` | `approval_rule.delete`                      | None                                                                                               | Contingent Rule |
| `contingentrule_detail` | `approval_rule.read`                        | None                                                                                               | Contingent Rule |
| `contingentrule_list`   | `approval_rule.read`                        | None                                                                                               | Contingent Rule |
| `contingentrule_update` | `approval_rule.update`                      | None                                                                                               | Contingent Rule |
| `fastorder_create`      | `quote.request`                             | None                                                                                               | Order           |
| `offer_create`          | `quote.request`                             | None                                                                                               | Order           |
| `offer_delete`          | `quote.decline`                             | None                                                                                               | Order           |
| `offer_detail`          | `quote.read.all`                            | None                                                                                               | Order           |
| `offer_list`            | `quote.read.all`                            | `organization_unit.quote.read`                                                                     | Order           |
| `offer_update`          | `quote.request_change`                      | `quote.accept`                                                                                     | Order           |
| `order_create`          | `organization_unit.order.read`              | None                                                                                               | Order           |
| `order_delete`          | `pending_order.approve_decline_all`         | `pending_order.read_all`, `pending_order.approve_decline`                                          | Order           |
| `order_detail`          | `order.read.all`                            | None                                                                                               | Order           |
| `order_list`            | `order.read.all`                            | None                                                                                               | Order           |
| `order_update`          | `order.read.all`                            | None                                                                                               | Order           |
| `role_assign`           | `role.create`                               | `role.read`, `role.edit`                                                                           | Role            |
| `role_create`           | `role.create`                               | `role.read`, `role.edit`                                                                           | Role            |
| `role_delete`           | `role.delete`                               | `role.read`, `role.edit`                                                                           | Role            |
| `role_detail`           | `role.edit`                                 | `role.read`                                                                                        | Role            |
| `role_list`             | `role.read`                                 | None                                                                                               | Role            |
| `role_update`           | `role.edit`                                 | `role.read`                                                                                        | Role            |
| `route_assign`          | `role.create`                               | `role.read`, `role.edit`                                                                           | Route           |
| `route_detail`          | `role.edit`                                 | `role.read`                                                                                        | Route           |
| `route_list`            | `role.read`                                 | None                                                                                               | Route           |

:::info
In case you want to override the default mapping, either to add new permissions or change existing ones, you can do so by subscribing to the `Shopware\Commercial\B2B\B2BSuiteMigration\Core\Domain\Event\B2BMigrationPermissionEvent` event. This allows you to customize permission mapping according to your specific requirements.
:::

## Role Mapping

B2B Suite and B2B Commercial have different approaches to role assignments, impacting how roles are migrated:

- **B2B Suite**: An employee can be assigned multiple roles, each with specific permissions, and may also have individual permissions not tied to a role.
- **B2B Commercial**: An employee is assigned a single role that contains all their permissions.

To handle this difference, the migration process uses the following cases to assign roles to employees in B2B Commercial:

1. **Single Role in B2B Suite**  
   If an employee in B2B Suite has only one role, that role is migrated to B2B Commercial as is, retaining its permissions and dependencies as defined in the role mapping table below.

2. **Multiple Roles in B2B Suite**  
   If an employee has multiple roles, these roles are merged into a single role in B2B Commercial. The new role includes all permissions from the original roles (including their dependencies). The role name is a combination of the original role names, joined with underscores.  
   **Example**: An employee with roles `role1`, `role2`, and `role3` will have a new role named `role1_role2_role3` in B2B Commercial, containing all permissions from these roles.

3. **Multiple Roles with Specific Permissions in B2B Suite**  
   If an employee has multiple roles and additional specific permissions not tied to a role, these are merged into a single role in B2B Commercial. The new role includes all permissions from the roles and the specific permissions. The role name is a combination of the original role names and the employee’s email address, joined with underscores.  
   **Example**: An employee with email `foo@gmail.com`, roles `role1` and `role2`, and specific permissions will have a new role named `role1_role2_foo@gmail.com` in B2B Commercial.

:::info
After migration, you can rename roles in B2B Commercial to more meaningful names, but the permissions will remain unchanged.
:::
