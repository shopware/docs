# Add Payment Plugin

## Overview

Payments are an essential part of the checkout process. That's the reason why Shopware 6 offers an easy platform on which you can build payment plugins.

## Prerequisites

The examples mentioned in this guide are built upon our [Plugin base guide](../../plugin-base-guide).

If you want to understand the payment process in detail, head to our [Payment Concept](../../../../../concepts/commerce/checkout-concept/payments).

::: info
Refer to this video on **[Introduction to payment handlers](https://www.youtube.com/watch?v=K58--Pxvudk)** that details you about payment extensions and payment handlers. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Creating a custom payment handler

In order to create your own payment method with your plugin, you have to add a custom payment handler.

You can create your own payment handler by implementing one of the following interfaces:

| Interface | DI container tag | Usage |
| :--- | :--- | :--- |
| SynchronousPaymentHandlerInterface | `shopware.payment.method.sync` | Payment can be handled locally, e.g. pre-payment |
| AsynchronousPaymentHandlerInterface | `shopware.payment.method.async` | A redirect to an external payment provider is required, e.g. PayPal |
| PreparedPaymentHandlerInterface | `shopware.payment.method.prepared` | The payment was prepared beforehand and will only be validated and captured by your implementation |
| RefundPaymentHandlerInterface | `shopware.payment.method.refund` | The payment allows refund handling |

Depending on the interface, those methods are required:

* `pay`: This method will be called after an order has been placed. You receive a `Shopware\Core\Checkout\Payment\Cart\AsyncPaymentTransactionStruct` or a `Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct` which contains the transactionId, order details, the amount of the transaction, a return URL, payment method information and language information. Please be aware, Shopware 6 supports multiple transactions, and you have to use the amount provided and not the total order amount. If you're using the `AsynchronousPaymentHandlerInterface`, the `pay` method has to return a `RedirectResponse` to redirect the customer to an external payment provider. Note: The [AsyncPaymentTransactionStruct](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Payment/Cart/AsyncPaymentTransactionStruct.php) contains a return URL. This represents the URL that the external payment provider needs to know, so they can also redirect your customer back to your shop. If an error occurs while e.g. calling the API of your external payment provider, you should throw an `AsyncPaymentProcessException`. Shopware 6 will handle this exception and set the transaction to the `cancelled` state. The same happens if you are using the `SynchronousPaymentHandlerInterface`: throw a `SyncPaymentProcessException` in an error case.
* `finalize`: The `finalize` method is only required if you implemented the `AsynchronousPaymentHandlerInterface`, returned a `RedirectResponse` in your `pay` method and the customer has been redirected from the payment provider back to Shopware 6. You must check here if the payment was successful or not and update the order transaction state accordingly. Similar to the pay action you are able to throw exceptions if some error cases occur. Throw the `CustomerCanceledAsyncPaymentException` if the customer canceled the payment process on the payment provider site. If another general error occurs throw the `AsyncPaymentFinalizeException` e.g. if your call to the payment provider API fails. Shopware 6 will handle these exceptions and will set the transaction to the `cancelled` state.
* `validate`: This method will be called before an order was placed and should check, if a given prepared payment is valid. The payment handler has to verify the given payload with the payment service, because Shopware cannot ensure that the transaction created by the frontend is valid for the current cart. Throw an `ValidatePreparedPaymentException` to fail the validation in your implementation.
* `capture`: This method will be called after an order was placed, but only if the validation did not fail and stop the payment flow before. At this point, the order was created and the payment handler will be called again to charge the payment. When the charge was successful, the payment handler should update the transaction state to `paid`. The user will be forwarded to the finish page. Throw an `CapturePreparedPaymentException` on any errors to fail the capture process and the after order process will be active, so the customer can complete the payment again.
* `refund`: This method is called, whenever a successful transaction is claimed to be refunded. The implementation of the refund handler should validate the legitimacy of the refund and call the PSP to refund the given transaction. Throw a `RefundException` to let the refund fail.

All methods get the `\Shopware\Core\System\SalesChannel\SalesChannelContext` injected. Please note, that this class contains properties, which are nullable. If you want to use this information, you have to ensure in your code that they are set and not `NULL`.

### Registering the service

Before we're going to have a look at some examples, we need to register our new service to the [Dependency Injection](../../plugin-fundamentals/dependency-injection) container. We'll use a class called `ExamplePayment` here.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\ExamplePayment">
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
            <tag name="shopware.payment.method.sync" />
<!--        <tag name="shopware.payment.method.async" />-->
<!--        <tag name="shopware.payment.method.prepared" />-->
<!--        <tag name="shopware.payment.method.refund" />-->
        </service>
    </services>
</container>
```

We inject the `OrderTransactionStateHandler` in this example, as it is helpful for changing an order's transaction state, e.g. to `paid`. The payment handler has to be marked as such as well, hence the tag `shopware.payment.method.sync`, `shopware.payment.method.async` or `shopware.payment.method.prepared` respectively for a synchronous, an asynchronous or a prepared payment handler.

Now let's start with the actual examples.

### Synchronous example

The following will be a synchronous example, so no redirect will happen and the payment can be handled in the shop itself. Therefore, you don't have to return a `RedirectResponse` in the `pay` method and no `finalize` method is necessary either.

Therefore, changing the `stateId` of the order should already be done in the `pay` method, since there will be no `finalize` method. If you have to execute some logic which might fail, e.g. a call to an external API, you should throw a `SyncPaymentProcessException`. Shopware 6 will handle this exception and set the transaction to the `cancelled` state.

```php
// <plugin root>/src/Service/ExamplePayment.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\SynchronousPaymentHandlerInterface;
use Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class ExamplePayment implements SynchronousPaymentHandlerInterface
{
    private OrderTransactionStateHandler $transactionStateHandler;

    public function __construct(OrderTransactionStateHandler $transactionStateHandler)
    {
        $this->transactionStateHandler = $transactionStateHandler;
    }

    public function pay(SyncPaymentTransactionStruct $transaction, RequestDataBag $dataBag, SalesChannelContext $salesChannelContext): void
    {
        $context = $salesChannelContext->getContext();
        $this->transactionStateHandler->paid($transaction->getOrderTransaction()->getId(), $context);
    }
}
```

All it does now is to set the state of the order transaction to `paid`.

### Asynchronous example

In the asynchronous example, the customer gets redirected to an external payment provider, which then in return has to redirect your customer back to your shop. Therefore, you first need to redirect your customer to the payment provider by returning a `RedirectResponse`.

Also you need a `finalize` method to properly handle your customer, when he was returned back to your shop. This is where you check the payment state and set the order transaction state accordingly.

Let's have a look at an example implementation of your custom asynchronous payment handler:

```php
// <plugin root>/src/Service/ExamplePayment.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Payment\Cart\AsyncPaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AsynchronousPaymentHandlerInterface;
use Shopware\Core\Checkout\Payment\Exception\AsyncPaymentProcessException;
use Shopware\Core\Checkout\Payment\Exception\CustomerCanceledAsyncPaymentException;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class ExamplePayment implements AsynchronousPaymentHandlerInterface
{
    private OrderTransactionStateHandler $transactionStateHandler;

    public function __construct(OrderTransactionStateHandler $transactionStateHandler) {
        $this->transactionStateHandler = $transactionStateHandler;
    }

    /**
     * @throws AsyncPaymentProcessException
     */
    public function pay(AsyncPaymentTransactionStruct $transaction, RequestDataBag $dataBag, SalesChannelContext $salesChannelContext): RedirectResponse
    {
        // Method that sends the return URL to the external gateway and gets a redirect URL back
        try {
            $redirectUrl = $this->sendReturnUrlToExternalGateway($transaction->getReturnUrl());
        } catch (\Exception $e) {
            throw new AsyncPaymentProcessException(
                $transaction->getOrderTransaction()->getId(),
                'An error occurred during the communication with external payment gateway' . PHP_EOL . $e->getMessage()
            );
        }

        // Redirect to external gateway
        return new RedirectResponse($redirectUrl);
    }

    /**
     * @throws CustomerCanceledAsyncPaymentException
     */
    public function finalize(AsyncPaymentTransactionStruct $transaction, Request $request, SalesChannelContext $salesChannelContext): void
    {
        $transactionId = $transaction->getOrderTransaction()->getId();

        // Example check if the user cancelled. Might differ for each payment provider
        if ($request->query->getBoolean('cancel')) {
            throw new CustomerCanceledAsyncPaymentException(
                $transactionId,
                'Customer canceled the payment on the PayPal page'
            );
        }

        // Example check for the actual status of the payment. Might differ for each payment provider
        $paymentState = $request->query->getAlpha('status');

        $context = $salesChannelContext->getContext();
        if ($paymentState === 'completed') {
            // Payment completed, set transaction status to "paid"
            $this->transactionStateHandler->paid($transaction->getOrderTransaction()->getId(), $context);
        } else {
            // Payment not completed, set transaction status to "open"
            $this->transactionStateHandler->reopen($transaction->getOrderTransaction()->getId(), $context);
        }
    }

    private function sendReturnUrlToExternalGateway(string $getReturnUrl): string
    {
        $paymentProviderUrl = '';

        // Do some API Call to your payment provider

        return $paymentProviderUrl;
    }
}
```

Let's start with the `pay` method. You'll have to start with letting your external payment provider know, where he should redirect your customer in return when the payment was done. This is usually done by making an API call and transmitting the return URL, which you can fetch from the passed `AsyncPaymentTransactionStruct` by using the method `getReturnUrl`. Since this is just an example, the method `sendReturnUrlToExternalGateway` is empty. Fill in your logic in there in order to actually send the return URL to the external payment provider. The last thing you need to do, is to redirect your customer to the external payment provider via a `RedirectResponse`.

Once your customer is done at the external payment provider, he will be redirected back to your shop. This is where the `finalize` method will be executed. In here you have to check whether or not the payment process was successful. If e.g. the customer cancelled the payment process, you'll have to throw a `CustomerCanceledAsyncPaymentException` exception.

Otherwise, you can proceed to check if the payment status was successful. If that's the case, set the order's transaction state to `paid`. If not, you could e.g. reopen the order's transaction.

### Prepared payments example

To improve the payment workflow on headless systems or reduce orders without payment, payment handlers can implement an additional interface to support pre-created payments. The client (e.g. a single page application) can prepare the payment directly with the payment service (not through Shopware) and pass a transaction reference (token) to Shopware to complete the payment.

This comes in two steps: The handler has to validate the payment beforehand, or throw an exception, if the validation fails. After completing the checkout, Shopware calls the handler again, to actually charge the payment.

Let's have a look at a simple example:

```php
// <plugin root>/src/ExamplePayment.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PreparedPaymentHandlerInterface;
use Shopware\Core\Checkout\Payment\Cart\PreparedPaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\Exception\CapturePreparedPaymentException;
use Shopware\Core\Checkout\Payment\Exception\ValidatePreparedPaymentException;
use Shopware\Core\Framework\Struct\ArrayStruct;
use Shopware\Core\Framework\Struct\Struct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class ExamplePayment implements PreparedPaymentHandlerInterface
{
    private OrderTransactionStateHandler $stateHandler;

    public function __construct(OrderTransactionStateHandler $stateHandler)
    {
        $this->stateHandler = $stateHandler;
    }

    public function validate(
        Cart $cart,
        RequestDataBag $requestDataBag,
        SalesChannelContext $context
    ): Struct {
        if (!$requestDataBag->has('my-payment-token')) {
            // this will fail the validation
            throw new ValidatePreparedPaymentException('No token supplied');
        }

        $token = $requestDataBag->get('my-payment-token');
        $paymentData = $this->getPaymentDataFromProvider($token);

        if (!$paymentData) {
            // no payment data simulates an error response from our payment provider in this example
            throw new ValidatePreparedPaymentException('Unkown payment for token ' . $token);
        }

        // other checks could include comparing the cart value with the actual payload of your PSP

        // return the payment details: these will be given as $preOrderPaymentStruct to the capture method
        return new ArrayStruct($paymentData);
    }

    public function capture(
        PreparedPaymentTransactionStruct $transaction,
        RequestDataBag $requestDataBag,
        SalesChannelContext $context,
        Struct $preOrderPaymentStruct
    ): void {

        // you can find all the order specific information in the PreparedPaymentTransactionStruct
        $order = $transaction->getOrder();
        $orderTransaction = $transaction->getOrderTransaction();

        // call you PSP and capture the transaction as usual
        // do not forget to change the transaction's state here:
        $this->stateHandler->paid($orderTransaction->getId(), $context->getContext());
        
        // or in case of an error:
        $this->stateHandler->fail($orderTransaction->getId(), $context->getContext());
        throw new CapturePreparedPaymentException($orderTransaction->getId(), 'Capture failed.')
    }

    private function getPaymentDataFromProvider(string $token): array
    {
        // call your payment provider instead and return your real payment details
        return [];
    }
}
```

### Refund example

To allow easy refund handling, Shopware introduced a centralized way of handling refund for transactions.

For this, have your payment handler implement the `RefundPaymentHandlerInterface`.

Let's have a look at a short example, on how to implement such payment handlers.

```php
// <plugin root>/src/ExamplePayment.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCaptureRefund\OrderTransactionCaptureRefundEntity;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCaptureRefund\OrderTransactionCaptureRefundStateHandler;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCaptureRefundPosition\OrderTransactionCaptureRefundPositionEntity;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\RefundPaymentHandlerInterface;
use Shopware\Core\Checkout\Payment\Exception\RefundException;
use Shopware\Core\Framework\Context;

class ExamplePayment implements RefundPaymentHandlerInterface
{
    private OrderTransactionCaptureRefundStateHandler $stateHandler;

    public function __construct(OrderTransactionCaptureRefundStateHandler $stateHandler)
    {
        $this->stateHandler = $stateHandler;
    }

    public function refund(OrderTransactionCaptureRefundEntity $refund, Context $context): void
    {
        if ($refund->getAmount() > 100.00) {
            // this will stop the refund process and set the refunds state to `failed`
            throw new RefundException($refund->getId(), 'Refunds over 100 € are not allowed');
        }

        // a refund can have multiple positions, with different order line items and amounts
        /** @var OrderTransactionCaptureRefundPositionEntity $position */
        foreach ($refund->getPositions() as $position) {
            $amount = $position->getAmount()->getTotalPrice();
            $reason = $position->getReason();
            $lineItem = $position->getOrderLineItem();

            // let's say, you allow a position, which was delivered, however broken
            if ($reason === 'malfunction') {
                // you can call your PSP here to refund

                try {
                    $this->callPSPForRefund($amount, $reason, $lineItem->getId());
                } catch (\Exception $e) {
                    // something went wrong at PSP side, throw a refund exception
                    // this will set the refund state to `failed`
                    throw new RefundException($refund->getId(), 'Something went wrong');
                }
            }
        }

        // let Shopware know, that the refund was successful
        $this->stateHandler->complete($refund->getId(), $context);
    }

    private function callPSPForRefund(float $amount, string $reason, string $id): void
    {
        // call you PSP here and process the response
        // throw an exception to stop the refund process
    }
}
```

As you can see, you have full control on how to handle the refund request and which positions to refund.

## Setting up new payment method

The handler itself is not used yet, since there is no payment method actually using the handler created above. In short: Your handler is not handling any payment method so far. The payment method can be added to the system while installing your plugin.

An example for your plugin could look like this:

```php
// <plugin root>/src/SwagBasicExample.php
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\ActivateContext;
use Shopware\Core\Framework\Plugin\Context\DeactivateContext;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Shopware\Core\Framework\Plugin\Util\PluginIdProvider;
use Swag\BasicExample\Service\ExamplePayment;

class SwagBasicExample extends Plugin
{
    public function install(InstallContext $context): void
    {
        $this->addPaymentMethod($context->getContext());
    }

    public function uninstall(UninstallContext $context): void
    {
        // Only set the payment method to inactive when uninstalling. Removing the payment method would
        // cause data consistency issues, since the payment method might have been used in several orders
        $this->setPaymentMethodIsActive(false, $context->getContext());
    }

    public function activate(ActivateContext $context): void
    {
        $this->setPaymentMethodIsActive(true, $context->getContext());
        parent::activate($context);
    }

    public function deactivate(DeactivateContext $context): void
    {
        $this->setPaymentMethodIsActive(false, $context->getContext());
        parent::deactivate($context);
    }

    private function addPaymentMethod(Context $context): void
    {
        $paymentMethodExists = $this->getPaymentMethodId();

        // Payment method exists already, no need to continue here
        if ($paymentMethodExists) {
            return;
        }

        /** @var PluginIdProvider $pluginIdProvider */
        $pluginIdProvider = $this->container->get(PluginIdProvider::class);
        $pluginId = $pluginIdProvider->getPluginIdByBaseClass(get_class($this), $context);

        $examplePaymentData = [
            // payment handler will be selected by the identifier
            'handlerIdentifier' => ExamplePayment::class,
            'name' => 'Example payment',
            'description' => 'Example payment description',
            'pluginId' => $pluginId,
            // if true, payment method will also be available after the order 
            // is created, e.g. if payment fails and the user wants to try again
            'afterOrderEnabled' => true,
        ];

        /** @var EntityRepository $paymentRepository */
        $paymentRepository = $this->container->get('payment_method.repository');
        $paymentRepository->create([$examplePaymentData], $context);
    }

    private function setPaymentMethodIsActive(bool $active, Context $context): void
    {
        /** @var EntityRepository $paymentRepository */
        $paymentRepository = $this->container->get('payment_method.repository');

        $paymentMethodId = $this->getPaymentMethodId();

        // Payment does not even exist, so nothing to (de-)activate here
        if (!$paymentMethodId) {
            return;
        }

        $paymentMethod = [
            'id' => $paymentMethodId,
            'active' => $active,
        ];

        $paymentRepository->update([$paymentMethod], $context);
    }

    private function getPaymentMethodId(): ?string
    {
        /** @var EntityRepository $paymentRepository */
        $paymentRepository = $this->container->get('payment_method.repository');

        // Fetch ID for update
        $paymentCriteria = (new Criteria())->addFilter(new EqualsFilter('handlerIdentifier', ExamplePayment::class));
        return $paymentRepository->searchIds($paymentCriteria, Context::createDefaultContext())->firstId();
    }
}
```

In the `install` method, you actually start by creating a new payment method, if it doesn't exist yet. If you don't know what's happening in there, you might want to have a look at our guide regarding [Writing data](../../framework/data-handling/writing-data).

However, **do not** do the opposite in the `uninstall` method and remove the payment method. This might lead to data inconsistency, if the payment method was used in some orders. Instead, only deactivate the method!

The `activate` method and `deactivate` method just do that, activating and deactivating the payment method respectively.

### Identify your payment

You can identify your payment by the entity property `formattedHandlerIdentifier`. It shortens the original handler identifier \(php class reference\): `Custom/Payment/SEPAPayment` to `handler_custom_sepapayment`. The syntax for the shortening can be looked up in [Shopware\Core\Checkout\Payment\DataAbstractionLayer\PaymentHandlerIdentifierSubscriber](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Payment/DataAbstractionLayer/PaymentHandlerIdentifierSubscriber.php).
