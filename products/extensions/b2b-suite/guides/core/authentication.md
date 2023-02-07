# Storefront Authentication

[Download](../example-plugins/B2bAuth.zip) a plugin showcasing how to add a provider. You can [download](../../../../../../docs/products/extensions/b2b-suite/guides/example-plugins/B2bLogin.zip) a plugin that exchange the login value.

## Description

The Storefront authentication component provides a common B2B interface for login, ownership, and authentication processes.
It extends the Shopware default authentication component and provides several benefits for developers:

* Use multiple different source tables for authentication
* Provide a unified Identity interface
* Provide a context for ownership

A schematic overview of the central usage of the Authentication component looks like this:

![image](../../../../../.gitbook/assets/authentication-overview.svg)

| Color  |   Type   |                                                                                  Description                                                                                  |
|--------|:--------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| Green  | Provider | Provides user identities. For example, a contact and a debtor are both valid B2B-Accounts that log in through the same user interface but do not share a common storage table |
| Yellow | Context  |                            Uses the `Identity` as a context to determine what data should be shown. Usually, a simple debtor or tenant-like filter                             |
| Blue |  Owner   |                                                          Uses the `Identity` to store the specific owner of a record                                                          |

## Working with the identity as a context

The `StoreFrontAuthentication` component provides an identity representing the currently logged-in user,
that can easily be retrieved and inspected through `Shopware\B2B\StoreFrontAuthentication\Framework\AuthenticationService`.

Typically, you want to use the identity as a global criterion to secure so that the data does not leak from one debtor to another.
Therefore, you should add a `context_owner_id` to your MySQL table design.

```sql
CREATE TABLE IF NOT EXISTS `b2b_my` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `context_owner_id` INT(11) NOT NULL,
  [...]

  PRIMARY KEY (`id`),

  INDEX `b2b_my_auth_owner_id_IDX` (`context_owner_id`),

  CONSTRAINT `b2b_my_auth_owner_id_FK` FOREIGN KEY (`context_owner_id`)
    REFERENCES `b2b_store_front_auth` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
)
```

This modifier column allows you to store the context owner independent of the actual source table of the context owner.
You can access the current context owner always through the identity.

```php
[...]

/** @var AuthenticationService $authenticationService */
$authenticationService = $this->container->get('b2b_front_auth.authentication_service');

if (!$authenticationService->isB2b()) {
    throw new \Exception('User must be logged in');
}

$ownershipContext = $authenticationService
    ->getIdentity()
    ->getOwnershipContext();

echo 'The context owner id ' . $ownershipContext->contextOwnerId . '\n';

[...]
```

You can even load the whole identity through the `AuthenticationService`.

```php
[...]

$ownerIdentity = $authenticationService->getIdentityByAuthId($contextOwnerId);

[...]
```

## Working with the identity as an owner

Sometimes you want to flag records to be owned by certain identities.

```sql
CREATE TABLE IF NOT EXISTS `b2b_my` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `auth_id` INT(11) NULL DEFAULT NULL,

    [...]

    PRIMARY KEY (`id`),

    CONSTRAINT `b2b_my_auth_user_id_FK` FOREIGN KEY (`auth_id`)
      REFERENCES `b2b_store_front_auth` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
)
```

To fill this column, we again access the current identity, but instead of the `contextOwnerId`, we access the `authId`.

```php
[...]

$ownershipContext = $authenticationService
    ->getIdentity()
    ->getOwnershipContext();

echo 'The common identity id ' . $ownershipContext->authId . '\n';

[...]
```

The B2B Suite views the context owner as some kind of admin that, from the perspective of the authentication component, it owns all individual users and their data *(Of course the ACL component may overwrite this)*.

Therefore, commonly used queries are:

```php
/** @var Connection $connection */
$connection = $this->container->get('dbal_connection');
/** @var Identity $identity */
$identity = $this->container->get('b2b_front_auth.authentication_service')
    ->getIdentity();

// get all records relative to the user
$connection->fetchAll(
    'SELECT * FROM b2b_my my WHERE my.auth_id = :authId',
    [
        'authId' => $identity->getOwnershipContext()->authId->getValue(),
    ]
);

// get all records relative to the user's context owner
$connection->fetchAll(
    'SELECT * FROM b2b_my my WHERE my.auth_id IN (SELECT auth_id FROM b2b_store_front_auth WHERE context_owner_id = :identityContextOwnerId)',
    [
        'identityContextOwnerId' => $identity->getOwnershipContext()->contextOwnerId->getValue(),
    ]
);

// get all records relative to the current user or if the owner is logged in to the owner
$connection->fetchAll(
    'SELECT * FROM b2b_my my WHERE my.auth_id IN (SELECT auth_id FROM b2b_store_front_auth WHERE auth_id = :authId OR context_owner_id = :identityContextOwnerId)',
    [
        'authId' => $identity->getOwnershipContext()->authId,
        'identityContextOwnerId' => $identity->getOwnershipContext()->authId,
    ]
);
```

## Working with the identity as a provider

If you need another type of user, you can follow the `Contact` and `Debtor` implementations.
This guide will show you which classes need to be extended.

### Implement your own identity

The B2B Suites `Shopware\B2B\StoreFrontAuthentication\Framework\Identity` is an interface which means that every user has to re-implement it.

The interface acts as a factory for different contexts that are used throughout the B2B Suite. It contains:

* B2B Suite ids and data (e.g., auth id, context owner)
* Shopware glue (e.g., customer group id, password hash)

Therefore, it can be seen as a man in the middle between Shopware and the B2B Suite.

Example implementations are either: `Shopware\B2B\Debtor\Framework\DebtorIdentity` or `Shopware\B2B\Contact\Framework\ContactIdentity`.

### Implement your own CredentialsBuilder

In the *CredentialsBuilder*, you create the *CredentialsEntity*, which is used for logging in the B2B Suite.

```php
    public function createCredentials(array $parameters): AbstractCredentialsEntity
    {
        $entity = new CredentialsEntity();
    
        $entity->email = $parameters['email'];
        $entity->salesChannelId = IdValue::create($this->contextProvider->getSalesChannelContext()->getSalesChannel()->getId());
        $entity->customerScope = $this->systemConfigService->get('core.systemWideLoginRegistration.isCustomerBoundToSalesChannel');

        return $entity;
    }
```

The *CredentialsEntity* represents the data that is used for logging.

### Implement your own AuthenticationIdentityLoader

Next, you have to provide the means to register your identity on login. This is done through implementing `Shopware\B2B\StoreFrontAuthentication\Framework\AuthenticationIdentityLoaderInterface`.

The *LoginContextService* is passed as an argument to help you retrieve and create the appropriate auth and
context owner ids. Notice that the interface is designed to be chained to create dependent auth ids on the fly.

```php
[...]
    public function fetchIdentityByCredentials(CredentialsEntity $credentialsEntity, LoginContextService $contextService, bool $isApi = false): Identity
    {
        if (!$credentialsEntity->email) {
            throw new NotFoundException('Unable to handle context');
        }
        
        $entity = $this->yourEntityRepository->fetchOneByEmail($email);

        /** @var DebtorIdentity $debtorIdentity */
        $debtorIdentity = $this->debtorRepository->fetchIdentityById($entity->debtor->id, $contextService);
        
        $authId = $contextService->getAuthId(YourEntityRepository::class, $entity->id, $debtorIdentity->getAuthId());
        
        $this->yourEntityRepository->setAuthId($entity->id, $authId);
        
        return new YourEntityIdentity($authId, (int) $entity->id, YourEntityRepository::TABLE_NAME, $entity, $debtorIdentity);
    }
[...]
```

Finally, you register your authentication provider (in our case a repository) as a tagged service through the DIC.

```xml
<service id="b2b_my.contact_authentication_identity_loader" class="Shopware\B2B\My\AuthenticationIdentityLoader">
    [...]

    <tag name="b2b_front_auth.authentication_repository" />
</service>
```

## Sales representative

Both sales representative identities extend the debtor identity.
The sales representative identity is to log in as clients (debtors).

After logging in, the sales representative gets the sales representative debtor's identity.
This structure allows the original sales representative identity to be identified when logged in as a client.

As a sales representative debtor, he is actually logged in as the client with additional possibilities.
