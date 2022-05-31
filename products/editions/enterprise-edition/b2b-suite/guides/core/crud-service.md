# CRUD service

You can download a plugin showcasing the topic [here](../example-plugins/B2bAcl.zip).

## Table of contents

*   [The Pattern](#the-pattern)
*   [The Entity](#the-entity)
*   [The Repository](#the-repository)
*   [The Validation Service](#the-validation-service)
*   [The CRUD Service](#the-crud-service)

## The Pattern

A repeating pattern used throughout the B2B-Suite are CRUD services. 
The B2B-Suite ships with its own entities, and therefore provides the means to **cr**eate **u**pdate and **d**elete them. 
Although these entities may have special requirements, there is an exclusively used naming convention and pattern used to implement all CRUD operations.

The Diagram below shows the usually implemented objects with their outside dependencies.

![image](../../../../../../.gitbook/assets/crud-service.svg)

## The Entity

There always is an entity representing the data that has to be written. 
Entities are uniquely identifiable storage objects, with public properties and only a few convenience functions. 
An example entity looks like this:

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Role\Framework;

use Shopware\B2B\Common\CrudEntity;
use Shopware\B2B\Common\IdValue;
use function get_object_vars;
use function property_exists;

class RoleEntity implements CrudEntity
{
    public IdValue $id;

    public string $name;

    public IdValue $contextOwnerId;

    public int $left;

    public int $right;

    public int $level;

    public bool $hasChildren;

    public array $children = [];

    public function __construct()
    {
        $this->id = IdValue::null();
        $this->contextOwnerId = IdValue::null();
    }

    public function isNew(): bool
    {
        return $this->id instanceof NullIdValue;
    }

    public function toDatabaseArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'context_owner_id' => $this->contextOwnerId->getStorageValue(),
        ];
    }

    public function fromDatabaseArray(array $roleData): CrudEntity
    {
        $this->id = IdValue::create($roleData['id']);
        $this->name = (string) $roleData['name'];
        $this->contextOwnerId = IdValue::create($roleData['context_owner_id']);
        $this->left = (int) $roleData['left'];
        $this->right = (int) $roleData['right'];
        $this->level = (int) $roleData['level'];
        $this->hasChildren = (bool) $roleData['hasChildren'];

        return $this;
    }

    public function setData(array $data)
    {
        foreach ($data as $key => $value) {
            if (!property_exists($this, $key)) {
                continue;
            }

            $this->{$key} = $value;
        }
    }

    public function toArray(): array
    {
        $vars = get_object_vars($this);
        
        foreach ($vars as $key => $var) {
            if ($var instanceof IdValue) {
                $vars[$key] = $var->getValue();
            }
        }

        return $vars;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
```

The convenience interface `Shopware\B2B\Common\CrudEntity` is not required to assign context to the object. 
Furthermore, the definition whether an entity can be stored or retrieved from storage can only securely be determined 
if corresponding repository methods exist.

## The Repository

There always is a repository, that handles all storage and retrieval functionality. 
Contrary to Shopware default repositories they do not use the ORM and do not expose queries. 
A sample repository might look like this:

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Role\Framework;

use Doctrine\DBAL\Connection;
use Shopware\B2B\Acl\Framework\AclReadHelper;
use Shopware\B2B\Common\Controller\GridRepository;
use Shopware\B2B\Common\IdValue;
use Shopware\B2B\Common\Repository\CanNotInsertExistingRecordException;
use Shopware\B2B\Common\Repository\CanNotRemoveExistingRecordException;
use Shopware\B2B\Common\Repository\CanNotUpdateExistingRecordException;

class RoleRepository
{
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    /**
     * @throws NotFoundException
     */
    public function fetchOneById(int $id): CrudEntity
    {
        [...]
    }

    /**
     * @throws CanNotInsertExistingRecordException
     */
    public function addRole(RoleEntity $role): RoleEntity
    {
        [...]
    }

    /**
     * @throws CanNotUpdateExistingRecordException
     */
    public function updateRole(RoleEntity $role): RoleEntity
    {
        [...]
    }

    /**
     * @throws CanNotRemoveExistingRecordException
     */
    public function removeRole(RoleEntity $roleEntity): RoleEntity
    {
        [...]
    }
}
```

Since it seems to be a sufficient workload for a single object to just interact with the storage layer, 
here is no additional validation of any sort. Everything that is solvable in PHP only is not part of this object.
Notice that the exceptions are all typed and can be caught easily by the implementation code.

## The Validation Service

Every entity has a corresponding `ValidationService`

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Role\Framework;

use Shopware\B2B\Common\Validator\ValidationBuilder;
use Shopware\B2B\Common\Validator\Validator;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RoleValidationService
{
    private ValidationBuilder $validationBuilder;

    private ValidatorInterface $validator;

    public function __construct(
        ValidationBuilder $validationBuilder,
        ValidatorInterface $validator
    ) {
        $this->validationBuilder = $validationBuilder;
        $this->validator = $validator;
    }

    public function createInsertValidation(RoleEntity $role): Validator
    {

        [...]

    }

    public function createUpdateValidation(RoleEntity $role): Validator
    {

        [...]

    }
```

It provides assertions that can be evaluated by a controller and printed to the user.

## The CRUD Service

Services are the real entry point to an entity. They are reusable and not dependant of any specific I/O mechanism.

They are not allowed to depend on HTTP implementations directly, 
and therefore provide their own request classes that contain the source independent required raw data. 
Notice that they are also used to initially filter a possibly larger request, 
and they allow just the right data points to enter the service, 
although the contents is validated by the `ValidationService`.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Role\Framework;

use Shopware\B2B\Common\Service\AbstractCrudService;
use Shopware\B2B\Common\Service\CrudServiceRequest;

class RoleCrudService extends AbstractCrudService
{
    [...]

    public function createNewRecordRequest(array $data): CrudServiceRequest
    {
        return new CrudServiceRequest(
            $data,
            [
                'name',
                'contextOwnerId',
                'parentId',
            ]
        );
    }

    public function createExistingRecordRequest(array $data): CrudServiceRequest
    {
        return new CrudServiceRequest(
            $data,
            [
                'id',
                'name',
                'contextOwnerId',
            ]
        );
    }

    [...]
}
```

With a filled `CrudServiceRequest` you then call the actual action you want the service to perform. 
Keep in mind that there may be other parameters required. For example an `Identity` determining if the currently 
logged-in user may even access the requested data.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Role\Framework;

use Shopware\B2B\Common\Service\AbstractCrudService;
use Shopware\B2B\Common\Service\CrudServiceRequest;
use Shopware\B2B\Common\Validator\ValidationException

class RoleCrudService extends AbstractCrudService
{
    [...]

    /**
     * @throws ValidationException
     */
    public function create(CrudServiceRequest $request, OwnershipContext $ownershipContext): RoleEntity
    {
        [...]
    }

    /**
     * @throws ValidationException
     */
    public function update(CrudServiceRequest $request, OwnershipContext $ownershipContext): RoleEntity
    {
        [...]
    }

    public function remove(CrudServiceRequest $request, OwnershipContext $ownershipContext): RoleEntity
    {
        [...]
    }
    
    public function move(CrudServiceRequest $request, OwnershipContext $ownershipContext): RoleEntity
    {
        [...]
    }
}
```