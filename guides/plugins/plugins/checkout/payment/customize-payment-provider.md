---
nav:
  title: Customize payment provider
  position: 20

---

# Customize Payment Provider

## Overview

In this guide you'll learn how to customize an existing payment provider.
In this example we are customizing a synchronous payment flow, but the procedure also applies to an asynchronous approach.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that.
It is helpful to have looked at the guide about [adding a custom payment method](add-payment-plugin) beforehand.
Furthermore, decorating a service is also not explained here, but it's covered in our guide about [adjusting a service](../../plugin-fundamentals/adjusting-service), so having this open in another tab won't hurt.

## Customize the payment provider

First, we create a new class that extends from the provider we want to customise.
In this example we customise the class `Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment` and name our class `ExampleDebitPayment`.
The constructor has to accept an instance of `OrderTransactionStateHandler` like the original service and additionally an instance of `DebitPayment` that we want to decorate.

With autowiring enabled, the `#[AsDecorator]` attribute on the class is sufficient to register the decorator. No explicit service configuration is needed.

```php
// <plugin root>/src/Service/ExampleDebitPayment.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\DebitPayment;
use Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Struct\Struct;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\AutowireDecorated;
use Symfony\Component\HttpFoundation\Request;

#[AsDecorator(decorates: DebitPayment::class)]
class ExampleDebitPayment extends DebitPayment
{
    private DebitPayment $decorated;

    public function __construct(OrderTransactionStateHandler $transactionStateHandler, #[AutowireDecorated] DebitPayment $decorated)
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
