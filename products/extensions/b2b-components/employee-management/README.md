# Employee Management

A feature of the B2B components includes employee, role, and permission management. It is implemented into both Storefront and Administration and supports their respective APIs.

## Basic idea

Employee management, as one of the B2B components, is a feature that allows you to manage employees and their permissions as an extension to Shopware's account and customer management, but set into a company context. This means that employees are associated with a **company customer** and will act on behalf of that company, e.g., placing orders. Accordingly, employees can make use of addresses that have been defined by administrators of their company.

The **company customer** has the benefit of injecting company managed data into core processes without having to develop new employee processes from scratch or maintain multiple versions of these processes.

## Company customer

The company customer is a regular storefront customer but with a few additional properties. A customer's ID is used to associate employees with a company. Therefore, it is really easy to rely on Shopware's typical order relevant data like addresses. This allows us to keep using most core implementations, while only extending a few B2B related features, e.g., to reference an employee's actions.

## Role management

Employees are assigned roles that define their permissions and settings. These permissions can restrict or allow employees to perform certain actions, like ordering without approval or managing roles and employees. Refer to our guides section how permissions can be extended [via app](../employee-management/guides/creating-own-permissions-via-app.md) or [via plugin](../employee-management/guides/creating-own-permissions-via-plugin.md).
