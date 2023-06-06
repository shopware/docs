# System Architecture

The B2B Suite is a collection of loosely coupled, mostly uniform components packaged with a small example plugin and a common library.

## Component layering

A single component with all layers and the maximum of allowed dependencies looks like this:

![image](../../../../.gitbook/assets/b2b-architecture-component.png)

The responsibilities from bottom to top:

| Layer       | Description                                                                                                                                                                                                      |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Shop-Bridge | Bridges the broad Shopware interfaces to the specific framework requirements <ul><li>Implements interfaces provided by the framework</li><li>Subscribes to Shopware events and calls framework services</li></ul> |
| Framework   | Contains the B2B specific Domain Requirements <ul><li>CRUD and assignment service logic</li><li>The specific use cases of the component</li></ul>                                                                  |
| REST-API    | REST access to the services                                                                                                                                                                                      |
| Frontend    | Controller as a service for frontend access                                                                                                                                                                      |
| B2B plugin  | Storefront access to the services                                                                                                                                                                               |

> Please notice: Apart from the framework, all other layers and dependencies are optional.

## Component dependencies

At the time of this writing, there were 39 different components, all built with the same structure. We sorted these components into four different complexes:

### Common - The one exception

There is a small library of shared functionality. It contains a few commonly used technical implementations shared between most components like exception classes, repository helpers, a dependency manager, or a REST-API router.

### User management

The user management is based on the `StoreFrontAuthentication` component and then provides `Contact` and `Debtor` entities which have `Address`es and `Role`s. These entities are mostly informational and CRUD based. Other parts of the system only depend on the `StoreFrontAuthentication` component but not the specific implementations as *Debtor* or *Contact*.

![image](../../../../.gitbook/assets/b2b-architecture-users.png)

### ACL

The `acl` implementation is connected to most other entities provided by the B2B Suite.

![image](../../../../.gitbook/assets/b2b-architecture-acl.png)

### Order and contingent management

`ContingentGroups`s are connected to `Debtor`s and can have `acl` settings based on `Role`s or `Contact`s. `Order`s are personalized through the `StoreFrontAuthentication`.

![image](../../../../.gitbook/assets/b2b-architecture-order.png)

### The whole picture

Most dependencies are directly derived from requirements. So, the dependency flow of the components should follow the basic business needs. There are a few exceptions, mainly the M:N assignment components, each representing a reset in complexity where a complex feature resolves itself into a context object for another use case. You can think of it like that.

* A Debtor can be created and updated through a service **=>** _The debtor is an **entity**_
* A Debtor may be an entity connected to many workflows by its id **=>** _The Debtor is just the **context**_

So, for the sake of completeness, this is the whole picture:

![image](../../../../.gitbook/assets/b2b-architecture-components-complete.png)

Everything you should get from that is that there is a left to right propagation of dependencies. The components on the left side can be useful entirely without the components on the right side.
