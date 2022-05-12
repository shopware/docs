# Company

## Table of contents

*   [Introduction](#introduction)
*   [The Context](#the-context)
*   [Create entity](#create-entity)
*   [Company filter](#company-filter)

## Introduction

The company component acts as a container for role related entities by providing a minimalistic interface to the different components. This ensures shared functionality. The following graph shows components which are managed in this component:

![image](/.gitbook/assets/company-management.svg)

## The Context

A shared context for entity creation and update is provided via the `AclGrantContext` concept. Therefore the components do not have to depend on roles directly but rather on the company context. (see [acl](/b2b-suite/technical/acl/))

## Create entity

To create a new entity (which is managed in the company component), you have to pass the parameter `grantContext` with an identifier of an `AclGrantContext`. The newly created entity is automatically assigned to the passed role.

## Company filter

The `CompanyFilterStruct` is used by company module to filter and search for the entities. It extends the `SearchStruct` by the `companyFilterType` and `aclGrantContext`. The correct filter type can be applied by the `CompanyFilterHelper`, possible filter types see in the list below.


| Filter name   |                        What it applies                         |
|---------------|:--------------------------------------------------------------:|
| acl           |  shows only entities which are visible to this `grantContext`  |
| assignment    |      shows only entities assigned to this `grantContext`       |
| inheritance   |                         shows only entities which are visible to this or inherited `grantContext`s                          |
