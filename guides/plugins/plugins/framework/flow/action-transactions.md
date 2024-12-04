---
nav:
  title: Running actions inside transactions
  position: 30

---

# Action transactions

## Overview

In this guide, you will learn how to run your action code inside a transaction. This may be important for you if you want to graciously handle rollbacks in certain scenarios. We have implemented various abstractions to ease this process; however, you need to opt in.

For some more background, please see the ADR [Action Transactions](../../../../../resources/references/adr/2024-02-11-transactional-flow-actions).

## Prerequisites

In order to make your action run inside a database transaction, you will need an existing Flow Action. Therefore, you can refer to the [Add Flow Builder Action Guide.](./add-flow-builder-action)

## Run your action inside a transaction

All you have to do is to implement the `Shopware\Core\Content\Flow\Dispatching\TransactionalAction` interface. It does not have any methods to implement.

When your action implements the interface the Flow Dispatcher will wrap your action in a transaction. If an exception is thrown, it will be caught, the transaction will be rolled back, and an error is logged.

::: code-group

```php [{plugin root}/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php]
<?php declare(strict_types=1);

namespace Swag\CreateTagAction\Core\Content\Flow\Dispatching\Action;

use Shopware\Core\Content\Flow\Dispatching\Action\FlowAction;
use Shopware\Core\Content\Flow\Dispatching\TransactionalAction;

class CreateTagAction extends FlowAction implements TransactionalAction
{
    public function handleFlow(StorableFlow $flow): void
    {        
        //do stuff - will be wrapped in a transaction
    }  
}
```

:::

## Force a rollback

You can also force the Flow Dispatcher to roll back the transaction by throwing an instance of `\Shopware\Core\Content\Flow\Dispatching\TransactionFailedException`. You can use the static `because` method to create the exception from another one. Eg:

::: code-group

```php [{plugin root}/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php]
<?php declare(strict_types=1);

namespace Swag\CreateTagAction\Core\Content\Flow\Dispatching\Action;

use Shopware\Core\Content\Flow\Dispatching\Action\FlowAction;
use Shopware\Core\Content\Flow\Dispatching\TransactionalAction;

class CreateTagAction extends FlowAction implements TransactionalAction
{
    public function handleFlow(StorableFlow $flow): void
    {        
        try {
            //search for some record
            $entity = $this->repo->find(...);
        } catch (NotFoundException $e) {
            throw TransactionFailedException::because($e);
        }
    }  
}
```

## Under what circumstances will the transaction be rolled back?

The transaction will be rollback if either of the following are true:

1. If Doctrine throws an instance of `Doctrine\DBAL\Exception` during commit.
2. If the action throws an instance of `TransactionFailedException` during execution.
3. If another non-handled exception is thrown during the action execution.

If the transaction fails, then an error will be logged.

Also, if the transaction has been performed inside a nested transaction without save points enabled (which is the default in Shopware), the exception will be rethrown.
This is because the calling code knows something went wrong and is able to handle it correctly, by rolling back instead of committing. In this scenario, the connection will be marked as rollback only.
