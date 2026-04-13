---
nav:
  title: Customize Payment Provider
  position: 20

---

# Customize Payment Provider

## Overview

This guide covers how to customize an existing payment provider. In this example we are customizing a synchronous payment flow, but the procedure also applies to an asynchronous approach.

## Prerequisites

Review the [Plugin base guide](../../plugin-base-guide). The guides for [adding a custom payment method](add-payment-plugin) and [adjusting a service](../../services/adjusting-service.md), which provides information about decorating services, are also helpful.

## Customize the payment provider

First, we create a new class that extends from the provider we want to customise.
In this example we customise the class `Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment` and name our class `ExampleDebitPayment`.
The constructor has to accept an instance of `OrderTransactionStateHandler` like the original service and additionally an instance of `DebitPayment` that we want to decorate.

After we've created our customized payment provider class, we have to register it to the DI-container via the `services.php`.

::: code-group

```php [ExampleDebitPayment.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment;
use Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Struct\Struct;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\Request;

class ExampleDebitPayment extends DebitPayment
{
    private DebitPayment $decorated;

    public function __construct(OrderTransactionStateHandler $transactionStateHandler, DebitPayment $decorated)
    {
        parent::__construct($transactionStateHandler);
        $this->decorated = $decorated;
    }

    public function getDecorated(): DebitPayment
    {
        return $this->decorated;
    }

    public function pay(Request $request, PaymentTransactionStruct $transaction, Context $context, ?Struct $validateStruct): ?RedirectResponse
    {
        // do some custom stuff here

        $this->transactionStateHandler->process($transaction->getOrderTransaction()->getId(), $salesChannelContext->getContext());
    }
}
```

```php [services.php]
<?php declare(strict_types=1);

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment;
use Swag\BasicExample\Service\ExampleDebitPayment;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ExampleDebitPayment::class)
        ->decorate(DebitPayment::class)
        ->args([
            service(OrderTransactionStateHandler::class),
            service('.inner'),
        ]);
};
```

:::
