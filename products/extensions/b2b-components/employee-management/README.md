# Employee Management

Employee management, a feature of the B2B component that includes employee, role, and permission management. It is implemented into both Storefront and Administration and supports their respective APIs.

It allows the [business partner](#business-partner) to manage employees and their permissions as an extension to regular customer management at the company level rather than at individual level. So the employees representing the business partner company will act as customers on behalf of their company, e.g., placing orders. Accordingly, employees can make use of addresses that have been defined by the business partner for placing orders.

The business partner has the benefit of injecting company managed data into core processes without having to develop new employee processes from scratch or maintain multiple versions of these processes.

## Business Partner

A business partner is an employee of the partner company who manages the employee permissions, e.g., grant permission to place orders, create addresses, apply order limit etc. Here a customer's ID associates to an employee of the business partner company. Therefore, it is really easy to rely on Shopware's typical order relevant data like addresses. This allows retaining majority of the core implementations while selectively extending a few B2B related functionalities, e.g., to reference an employee's actions (say to place order).

## Role management

Employees are assigned roles that define their permissions and settings. These permissions can restrict or allow employees to perform certain actions, like ordering without approval or managing roles and employees. Refer to the guides section on how permissions can be extended [via app](../employee-management/guides/creating-own-permissions-via-app.md) or [via plugin](../employee-management/guides/creating-own-permissions-via-plugin.md).
