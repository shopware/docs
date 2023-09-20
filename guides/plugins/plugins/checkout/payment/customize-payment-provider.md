# Customize Payment Provider

## Overview

In this guide you'll learn how to customize an existing payment provider. In this example we are customizing a `SynchronousPaymentHandler`, but the procedure also applies to `AsynchronousPaymentHandler`.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that. It is helpful to have looked at the guide about [adding a custom payment method](add-payment-plugin) beforehand. Furthermore, decorating a service is also not explained here, but it's covered in our guide about [adjusting a service](../../plugin-fundamentals/adjusting-service), so having this open in another tab won't hurt.

## Customize the payment provider

First, we create a new class that extends from the provider we want to customise. In this example we customise the class `Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment` and name our class `ExampleDebitPayment`. The constructor has to accept an instance of `OrderTransactionStateHandler` like the original service and additionally an instance of `DebitPayment` that we want to decorate.

```php
// <plugin root>/src/Service/ExampleDebitPayment.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment;
use Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

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

    public function pay(SyncPaymentTransactionStruct $transaction, RequestDataBag $dataBag, SalesChannelContext $salesChannelContext): void
    {
        // do some custom stuff here

        $this->transactionStateHandler->process($transaction->getOrderTransaction()->getId(), $salesChannelContext->getContext());
    }
}
```

After we've created our customized payment provider class, we have to register it to the DI-container.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleDebitPayment" decorates="Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment">
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
            <argument type="service" id="Swag\BasicExample\Service\ExampleDebitPayment.inner"/>
        </service>
    </services>
</container>
```
