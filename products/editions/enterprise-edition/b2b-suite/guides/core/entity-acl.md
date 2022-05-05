# Entity based ACL

## Table of contents

*   [Introduction](#introduction)
*   [Architecture](#architecture)
*   [Naming](#naming)
*   [Data structure](#data-structure)
*   [Usage](#usage)
*   [Extending the ACL](#extending-the-acl)
*   [Security](#security)

## Introduction

One of the core concepts of the B2B-Suite is that all entities can be restricted through ACL settings. 
Therefore, the package contains a component named ACL which provides a common base implementation for access restriction.

To guarantee a high level of flexibility the acl component has next to no dependencies to other parts of the framework. 
**At its core ACL are an implementation of an M:N relation management** in the database. 
They provide the means of creating the tables, storing and removing the relation and reading the information. This is implemented in a way that multiple relations (e.g. user and role) can be resolved to a single `true`/`false` result or joined in a query.

## Architecture

In Order to understand the design decisions of the ACL component we first take a look at the different requirements imposed on ACL. 
As you can see in the graphic below access control is basically a concern of every technical layer of the application.

![acl addresses](../../../../../../.gitbook/assets/acl-architecture.svg)

The base ACL component, which is described in this document provides functionality for repository filtering and service checks. 
The [authentication component](https://docs.enterprise.shopware.com/b2b-suite/technical/store-front-authentication/) provides the context for the currently logged in user and the [acl route](https://docs.enterprise.shopware.com/b2b-suite/technical/acl-routes/) component then provides the ability to secure routes and means of inspection for allowed routes.

## Naming

| Name    |             Description             |
|---------|:-----------------------------------:|
| Context |          The user or role           |
| Subject | The entity that is allowed / denied |


## Data structure

### Description

The ACL are represented as M:N relation tables in the database and always look like this:

```sql
CREATE TABLE `b2b_acl_*` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `entity_id` INT(11) NOT NULL, 
    `referenced_entity_id` INT(11) NOT NULL,
    `grantable` TINYINT(4) NOT NULL DEFAULT '0',
    
    [...]
);
```

| Case              |                                Description                                |
|-------------------|:-------------------------------------------------------------------------:|
| No record exists  |       The referenced entity is not accessible for the given context       |
| A record exists   |         The referenced entity is accessible for the given context         |
| Grantable is `1`  | The context may grant access to the referenced entity for other contexts  | 


### Address ACL example

As an example let's take a look at the schema part that is responsible for storing the address access rights.

![acl addresses](../../../../../../.gitbook/assets/acl-address-schema.svg)

As you can see the addresses (subject) can be allowed in two distinct contexts. 
Either through a _role_ or through a _contact_. So in between these entities there are two acl tables holding the M:N relations. 
On the left you see the _ContactRole_ table. This table holds the information which contact is assigned to what roles.

This allows for a single query to select all allowed addresses of a particular user combined from role and direct assignments.

## Usage

### Description

For this part we stay at the address example. Since the ACL are directly implemented through the storage layer there is no service 
but just a repository for access and data manipulation. So we need an instance of `Shopware\B2B\Acl\Framework\AclRepository`. 
The address ACL repository can be retrieved through the DIC by the `b2b_address.acl_repository` key.

The repository then provides the following methods. If you are already familiar with other ACL implementations most methods will look quite familiar.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Acl\Framework;

use Shopware\B2B\Acl\Framework\AclUnsupportedContextException;
use Shopware\B2B\Common\IdValue;

class AclRepository
{
    /**
     * @throws AclUnsupportedContextException
     */
    public function allow($context, IdValue $subjectId, bool $grantable = false): void
    { 
        [...] 
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     */
    public function allowAll($context, array $subjectIds, bool $grantable = false): void 
    { 
        [...] 
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     */
    public function deny($context, IdValue $subjectId): void
    {
        [...]
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     */
    public function denyAll($context, array $subjectIds): void
    {
        [...]
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     */
    public function isAllowed($context, IdValue $subjectId): bool 
    { 
        [...] 
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     */
    public function isGrantable($context, IdValue $subjectId): bool 
    { 
        [...] 
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     * @return IdValue[]
     */
    public function getAllAllowedIds($context): array 
    { 
        [...] 
    }

    /**
     * @param object $context
     * @throws AclUnsupportedContextException
     */
    public function fetchAllGrantableIds($context): array 
    {
        [...] 
    }

    /**
     * @param $context
     * @throws AclUnsupportedContextException
     */
    public function fetchAllDirectlyIds($context): array 
    { 
        [...] 
    }

    /**
     * @param object $context
     * @throws \Shopware\B2B\Acl\Framework\AclUnsupportedContextException
     */
    public function getUnionizedSqlQuery($context): AclQuery 
    { 
        [...] 
    }
}
```

Important commonalities are:

All methods act on a context. This context must be one of the following types:

*   `Shopware\B2B\Contact\Framework\ContactEntity`
*   `Shopware\B2B\StoreFrontAuthentication\Framework\Identity`
*   `Shopware\B2B\StoreFrontAuthentication\Framework\OwnershipContext`
*   `Shopware\B2B\Role\Framework\RoleEntity`
*   `Shopware\B2B\Role\Framework\RoleAclGrantContext`
*   `Shopware\B2B\Contact\Framework\ContactAclGrantContext`

The AclGrantContext and it's accompanied AclContextProvider allows a component to use and select arbitrary ACL targets without 
depending on the explicit implementation.

Depending on the provided context the methods decide whether they utilize both tables or just one.

*   Reading usually utilizes both.
*   Writing utilizes only the directly related table.

If the provided context is not supported a `Shopware\B2B\Acl\Framework\AclUnsupportedContextException` is thrown.

*   Debtors for example are unknown to the ACL, so all debtor identities will trigger the exception.

### Modifying entity access

A standard use case is to allow records to a user, this can be done by this simple code snippet:

```php
$aclAddressRepository = $this->container->get('b2b_address.acl_repository');
$contactRepository = $this->container->get('b2b_contact.repository');

$contact = $contactRepository->fetchOneById(1);

$aclAddressRepository->allow(
    $contact, // the contact 
    22, // the id of the address
    true // whether the contact may grant access to other contacts
);
```

We can then deny tha access just by this

```php
$aclAdressRepository->deny(
    $contact, // the contact 
    22, // the id of the address
);
```

or just set it not grantable, by

```php
$aclAdressRepository->allow(
    $contact, // the contact 
    22, // the id of the address
    false // whether the contact may grant access to other contacts
);
```

### Reading entity access

If you want to know whether a certain contact can access an entity you can call `isAllowed`.

```php
$aclAdressRepository->isAllowed(
    $contact, // the contact 
    22, // the id of the address
);
```

Or you just want to check whether an entity can be granted by a contact.

```php
$aclAdressRepository->isGrantable(
    $contact, // the contact 
    22, // the id of the address
);
```

One of the more complex problems you might face is that you want to filter a query by acl assignments (frontend listing). 

This can be achieved by this snippet:

```php
<?php declare(strict_types=1);

use Doctrine\DBAL\Query\QueryBuilder;
use Shopware\B2B\Acl\Framework\AclUnsupportedContextException;
use Shopware\B2B\StoreFrontAuthentication\Framework\OwnershipContext;

protected function applyAcl(OwnershipContext $context, QueryBuilder $query): void
{
    try {
        $aclQuery = $this->aclRepository->getUnionizedSqlQuery($context);

        $query->innerJoin(
            self::TABLE_ALIAS,
            '(' . $aclQuery->sql . ')',
            'acl_query',
            self::TABLE_ALIAS . '.id = acl_query.referenced_entity_id'
        );

        foreach ($aclQuery->params as $name => $value) {
            $query->setParameter($name, $value);
        }
    } catch (AclUnsupportedContextException $e) {
        // nth
    }
}
```

The `getUnionizedSqlQuery` method returns a `Shopware\B2B\Acl\Framework\AclQuery` instance that can then be used as a join in the DBAL `QueryBuilder`. 
If you want to inspect the query yourself be warned: It might look a little strange due to some performance tuning for MySQL.

## Extending the ACL

### Add a new Subject

The most common use case will be that you want to extend the ACL to span around your own entity. 
How this is done can be observed in many places throughout the B2B Suite. 
So let's take a look at the addresses again.

The first thing you need is to define the relations from role and contact to your entity. 
This is achieved by creating small classes that contain the particular information:

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Address\Framework;

use Shopware\B2B\Acl\Framework\AclTable;
use Shopware\B2B\Contact\Framework\AclTableContactContextResolver;

class AddressContactAclTable extends AclTable
{
    /**
     * {@inheritdoc}
     */
    public function __construct()
    {
        parent::__construct(
            'contact_address', // name suffix
            'b2b_debtor_contact', // context table
            'id', // context primary key
            's_user_addresses', // subject table name
            'id' // subject primary key
        );
    }

    /**
     * {@inheritdoc}
     */
    protected function getContextResolvers(): array
    {
        return [
            new AclTableContactContextResolver(),
        ];
    }
}
```

This is the implementation utilized to set up the `contact<->address` relation. In `__construct` we set up the table and relation properties. 
The `getContextResolver` method returns a utility class that is responsible for extracting the `id` from different context objects.
See further down below for additional information on this interface.

An identical class exists for the `role<->address` relation.

Now we need to tell the B2B-Suite to create the necessary tables. In Shopware this must be done during the plugin installation process. 
Because the container is not yet set up with the B2B-Suite services, we use a static factory method in the following code:

```php
use Shopware\B2B\Acl\Framework\AclDdlService;
use Shopware\B2B\Address\Framework\AddressContactTable;

AclDdlService::create()->createTable(new AddressContactTable());
```

Now the table exists, but we must still make the table definition accessible through the DIC, so the ACL component can set up appropriate repositories. 
This is achieved through a tag in the service definition:

```xml
<service id="b2b_address.contact_acl_table" class="Shopware\B2B\Address\Framework\AddressContactAclTable">
    <tag name="b2b_acl.table"/>
</service>
```

Finally, we need to register the service in the DIC. This is done by this xml snippet:

```xml
<service id="b2b_address.acl_repository" class="Shopware\B2B\Acl\Framework\AclRepository">
    <factory service="b2b_acl.repository_factory" method="createRepository"/>
    <argument type="string">s_user_addresses</argument>
</service>
```

Et voilà the addresses are an acl-ified entity!

### Add a new context

Since the ACL are so loosely coupled with the B2B Suite it is possible to create your own complete subset of restrictions based on 
other contexts then contact and role. For this you have to create a different `Shopware\B2B\Acl\Framework\AclContextResolver`. 
An `AclContextResolver` is responsible for extracting the primary key out of a given context object and produces a query that joins the main acl table. 
This is done by implementing `getQuery`, `isMainContext` and `extractId`.

```php
class MyContextResolver extends AclContextResolver
{
    public function getQuery(string $aclTableName, int $contextId, QueryBuilder $queryContext): AclQuery
    {
       // your implementation here
    }

    public function extractId($context): int
    {
        // your implementation here    
    }

    public function isMainContext(): bool
    {
        // your implementation here    
    }
}
```

A rather generic implementation for `getQuery` that just filters for a given context id looks like this:

```php
public function getQuery(string $aclTableName, int $contextId, QueryBuilder $queryBuilder): AclQuery
{
    $mainPrefix = $this->getNextPrefix();

    $queryBuilder
        ->select($mainPrefix . '.*')
        ->from($aclTableName, $mainPrefix)
        ->where($mainPrefix . '.entity_id = :p_' . $mainPrefix)
        ->setParameter('p_' . $mainPrefix, $contextId);

    return (new AclQuery())->fromQueryBuilder($queryBuilder);
}
```

Notice the `getMainPrefix` call. This allows the ACL component to be joined without conflicting SQL aliases.

An implementation of extract id usually looks like this:

```php
public function extractId($context): int
{
    if ($context instanceof ContactIdentity) {
        return $context->getId();
    }

    if ($context instanceof OwnershipContext && is_a($context->identityClassName, ContactIdentity::class, true)) {
        return $context->identityId;
    }

    if ($context instanceof ContactEntity && $context->id) {
        return $context->id;
    }

    throw new AclUnsupportedContextException();
}
```

Make sure to throw a `UnsupportedContextException` if no id can be produced.

The `isMainContext` method finally just returns true or false. Since it is possible to have more than one ContextResolver that can extract a valid id, one context resolver must be responsible for the writes, this is the flag that notifies the `AclRepository`.

## Security

The nature of this implementation is that you as a developer have the greatest degree of freedom in using the ACL. 
This of course means that you are responsible for securing the workflow yourself. 

The ACL component is just a collection of commonly used functions not an automatically wired security layer! 
The core suite secures the workflows through it's test suite, we appreciate and look forward your contributions :).
