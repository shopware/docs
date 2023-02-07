# Company

The company component acts as a container for role related entities by providing a minimalistic interface to the different components. This ensures shared functionality. The following graph shows components that are managed in this component:

![image](../../../../../.gitbook/assets/company-management.svg)

## Context

A shared context for entity creation and update is provided via the `AclGrantContext` concept. Therefore the components do not have to depend on roles directly but rather on the company context.

## Create entity

To create a new entity (managed in the company component), you have to pass the parameter `grantContext` with an identifier of an `AclGrantContext`. The newly created entity is automatically assigned to the passed role.

## Company filter

The `CompanyFilterStruct` is used by the company module to filter and search for entities. It extends the `SearchStruct` by the `companyFilterType` and `aclGrantContext`. The correct filter type can be applied by the `CompanyFilterHelper`. Possible filter types are in the list below:

| Filter name   |                        What it applies                         |
|:---------------:|:--------------------------------------------------------------:|
| acl           |  Shows only entities which are visible to this `grantContext`  |
| assignment    |      Shows only entities assigned to this `grantContext`       |
| inheritance   | Shows only entities which are visible to this or inherited `grantContext`s                          |
