---
nav:
  title: Add payment plugin
  position: 10

---

# Add Payment Plugin

::: warning
With Shopware 6.6.5.0, the payment handling was refactored.
Most of this documentation is deprecated and obsolete with 6.7.0.0.

The new payment handling is done via a single `AbstractPaymentHandler`.
Check out the new documentation here: [Add Payment Plugin (>6.7)](/docs/v6.7/guides/plugins/plugins/checkout/payment/add-payment-plugin.html).
:::

## Overview

Payments are an essential part of the checkout process.
That's why Shopware 6 offers an easy platform on which you can build payment plugins.

## Prerequisites

The examples mentioned in this guide are built upon our plugin base guide.

<PageRef page="../../plugin-base-guide.md" title="Plugin base guide"/>

If you want to understand the payment process in detail, head to our Payment Concept.

<PageRef page="../../../../../concepts/commerce/checkout-concept/payments" title="Payment Concept"/>

## Creating a custom payment handler

To create a payment method with your plugin, you have to add a custom payment handler.

Shopware provides you with a handy `Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler` abstract class for you to extend to get you started quickly.

### Registering the service

Before we're going to have a look at some examples, we need to register our new service to the [Dependency Injection](../../plugin-fundamentals/dependency-injection) container.
Please make sure to add the `shopware.payment.method` tag to your service definition, otherwise Shopware won't recognize your service as a payment handler.

We'll use a class called `MyCustomPaymentHandler` here.

```xml [<plugin root>/src/Resources/config/services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <tag name="shopware.payment.method"/>
        </service>
    </services>
</container>
```

Now, let's start with the actual examples.

### Example payment handlers

<Tabs>

<Tab title="Synchronous">

The following will be a synchronous example, so that no redirect will happen, and the payment can be handled in the shop.
Therefore, you don't have to return a `RedirectResponse` in the `pay` method; no `finalize` method is necessary either.

Therefore, changing the `stateId` of the order should already be done in the `pay` method since there will be no `finalize` method.
If you have to execute some logic that might fail, e.g., a call to an external API, you should throw a `PaymentException`.
Shopware 6 will handle this exception and set the transaction to the `failed` state.

::: code-group

```php [MyCustomPaymentHandler.php]
<?php declare(strict_types=1);

namespace Swag\PaymentPlugin\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PaymentHandlerType;
use Shopware\Core\Checkout\Payment\Cart\PaymentTransactionStruct;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Struct\Struct;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class MyCustomPaymentHandler extends AbstractPaymentHandler
{
    public function __construct(private readonly OrderTransactionStateHandler $transactionStateHandler)
    {
    }

    public function supports(PaymentHandlerType $type, string $paymentMethodId, Context $context): bool
    {
        // This payment handler does not support recurring payments nor refunds
        return false;
    }

    /**
     * This method is always called during the checkout.
     * You should process the payment here and return a RedirectResponse if the payment process requires an asynchronous approach.
     * In that case, the finalize method will be called additionally during checkout after the redirect.
     * If the payment process is synchronous, you should return null.
     */
    public function pay(Request $request, PaymentTransactionStruct $transaction, Context $context, ?Struct $validateStruct): ?RedirectResponse
    {
        // In here you should probably call your payment provider to precess the payment
        // $this->myPaymentProvider->processPayment($transaction);

        // afterward you should update the transaction with the new state
        $this->transactionStateHandler->process($transaction->getOrderTransactionId(), $context);

        return null;
    }
}
```

```xml [services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <tag name="shopware.payment.method"/>
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
        </service>
    </services>
</container>
```

:::

This payment handler does not do a lot in the current state but is a good starting point for your custom payment handler.

</Tab>

<Tab title="Asynchronous">

In the asynchronous example, the customer gets redirected to an external payment provider,
which then, in return, has to redirect your customer back to your shop.
Therefore, you must first redirect your customer to the payment provider by returning a `RedirectResponse`.

Also, you need a `finalize` method to properly handle your customer when he was returned to your shop.
This is where you check the payment state and set the order transaction state accordingly.

Let's have a look at an example implementation of your custom asynchronous payment handler:

::: code-group

```php [MyCustomPaymentHandler.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PaymentHandlerType;
use Shopware\Core\Checkout\Payment\Cart\PaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\PaymentException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Struct\Struct;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class MyCustomPaymentHandler extends AbstractPaymentHandler
{
    public function __construct(private readonly OrderTransactionStateHandler $transactionStateHandler)
    {
    }

    public function supports(PaymentHandlerType $type, string $paymentMethodId, Context $context): bool
    {
        // This payment handler does not support recurring payments nor refunds
        return false;
    }

    /**
     * This method is always called during the checkout.
     * You should process the payment here and return a RedirectResponse.
     * After redirect the finalize method will be called.
     */
    public function pay(Request $request, PaymentTransactionStruct $transaction, Context $context, ?Struct $validateStruct): ?RedirectResponse
    {
        // Method that sends the return URL to the external gateway and gets a redirect URL back
        try {
            $redirectUrl = $this->sendReturnUrlToExternalGateway($transaction->getReturnUrl());
        } catch (\Exception $e) {
            throw PaymentException::asyncProcessInterrupted(
                $transaction->getOrderTransactionId(),
                'An error occurred during the communication with external payment gateway' . PHP_EOL . $e->getMessage()
            );
        }

        // Redirect to external gateway
        return new RedirectResponse($redirectUrl);
    }

    /**
     * This method will be called after redirect from the external payment provider.
     */
    public function finalize(Request $request, PaymentTransactionStruct $transaction, Context $context): void
    {
        // Example check if the user canceled. Might differ for each payment provider
        if ($request->query->getBoolean('cancel')) {
            throw PaymentException::customerCanceled(
                $transaction->getOrderTransactionId(),
                'Customer canceled the payment on the PayPal page'
            );
        }

        // handle the payment state
        $this->transactionStateHandler->paid($transaction->getOrderTransactionId(), $context);
    }

    private function sendReturnUrlToExternalGateway(string $getReturnUrl): string
    {
        $paymentProviderUrl = '';

        // Do some API Call to your payment provider

        return $paymentProviderUrl;
    }
}
```

```xml [services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <tag name="shopware.payment.method"/>
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
        </service>
    </services>
</container>
```

:::

Let's start with the `pay` method. You'll have to start by letting your external payment provider know where he should redirect your customer in return when the payment is done.
This is usually done by making an API call and transmitting the return URL, which you can fetch from the passed `PaymentTransactionStruct` using the method `getReturnUrl`.
Since this is just an example, the method `sendReturnUrlToExternalGateway` is empty.
Fill in your logic in there in order to actually send the return URL to the external payment provider.
The last thing you need to do, is to redirect your customer to the external payment provider by returning a `RedirectResponse`.
Shopware handles the redirect for you automatically.

Once your customer is done at the external payment provider, he will be redirected back to your shop.
This is where the `finalize` method will be executed.
In here, you have to check whether the payment process was successful.
If e.g., the customer canceled the payment process, you'll have to throw a `PaymentException::customerCanceled` exception.

Otherwise, you can proceed to check if the payment status was successful.
If so, set the order's transaction state to `paid`.
If not, you could, e.g. reopen the order's transaction.

</Tab>

<Tab title="Prepared">

To improve the payment workflow on headless systems or reduce orders without payment, payment handlers can implement an additional method to support pre-created payments.
The client (e.g. a single-page application) can prepare the payment directly with the payment service (not through Shopware) and pass a transaction reference (token) to Shopware to complete the payment.

Two steps are necessary:
The handler has to validate the payment beforehand, or throw an exception, if the validation fails.
If the validation is successful, the payment handler has to capture the payment in the `pay` method.

Let's have a look at a simple example:

::: code-group

```php [MyCustomPaymentHandler.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PaymentHandlerType;
use Shopware\Core\Checkout\Payment\Cart\PaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\PaymentException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Struct\ArrayStruct;
use Shopware\Core\Framework\Struct\Struct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class MyCustomPaymentHandler extends AbstractPaymentHandler
{
    public function __construct(private readonly OrderTransactionStateHandler $transactionStateHandler)
    {
    }

    public function supports(PaymentHandlerType $type, string $paymentMethodId, Context $context): bool
    {
        // This payment handler does not support recurring payments nor refunds
        return false;
    }

    /**
     * This method will always be called during the checkout, but before order creation.
     * This is especially helpful for headless systems and single-page applications, that prepare payments not through Shopware.
     */
    public function validate(Cart $cart, RequestDataBag $dataBag, SalesChannelContext $context): ?Struct
    {
        // the payment is prepared here and most certainly you will receive a token from your PSP
        if (!$dataBag->has('my-payment-token')) {
            // this will fail the validation
            throw PaymentException::validatePreparedPaymentInterrupted('No token supplied');
        }

        $token = $dataBag->get('my-payment-token');

        // other checks could include comparing the cart value with the actual payload of your PSP

        // return the payment details: these will be given as $preOrderPaymentStruct to the capture method
        return new ArrayStruct(['my-payment-provider-transaction-token' => $token]);
    }

    /**
     * This method is always called during the checkout, but only after the validate method was called.
     * You should process the payment here and return a RedirectResponse if the payment process requires an asynchronous approach.
     * In that case, the finalize method will be called additionally during checkout after the redirect.
     * If the payment process is synchronous, you should return null.
     */
    public function pay(Request $request, PaymentTransactionStruct $transaction, Context $context, ?Struct $validateStruct): ?RedirectResponse
    {
        $validateData = $validateStruct->getVars();

        if (!isset($validateData['my-payment-provider-transaction-token'])) {
            // this will fail the payment process
            throw PaymentException::syncProcessInterrupted($transaction->getOrderTransactionId(), 'No payment token provided');
        }

        // In here you should probably call your payment provider to precess the payment and compare tokens
        if ($validateData['my-payment-provider-transaction-token'] !== 'hatoooken') {
            // this will fail the payment process
            throw PaymentException::syncProcessInterrupted($transaction->getOrderTransactionId(), 'Payment token mismatch');
        }

        // In here you should probably call your payment provider to precess the payment
        // $this->myPaymentProvider->processPayment($transaction);
        
        // afterward you should update the transaction with the new state
        $this->transactionStateHandler->process($transaction->getOrderTransactionId(), $context);

        return null;
    }
}
```

```xml [services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <tag name="shopware.payment.method"/>
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
        </service>
    </services>
</container>
```

:::

</Tab>

<Tab title="Refund">

To allow easy refund handling, your payment handler should return `true` in the supports method,
whenever the PaymentHandlerType is REFUND.

Let's look at a short example of how to implement a refund handlers.

::: code-group

```php [MyCustomPaymentHandler.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCaptureRefund\OrderTransactionCaptureRefundEntity;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCaptureRefund\OrderTransactionCaptureRefundStateHandler;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCaptureRefundPosition\OrderTransactionCaptureRefundPositionEntity;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PaymentHandlerType;
use Shopware\Core\Checkout\Payment\Cart\PaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\Cart\RefundPaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\PaymentException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Struct\Struct;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class MyCustomPaymentHandler extends AbstractPaymentHandler
{
    public function __construct(
        private readonly EntityRepository $refundRepository,
        private readonly OrderTransactionStateHandler $transactionStateHandler,
        private readonly OrderTransactionCaptureRefundStateHandler $refundStateHandler,
    ) {
    }

    public function supports(PaymentHandlerType $type, string $paymentMethodId, Context $context): bool
    {
        // this payment handler supports refunds
        return $type === PaymentHandlerType::REFUND;
    }

    /**
     * This method is always called during the checkout.
     * You should process the payment here and return a RedirectResponse if the payment process requires an asynchronous approach.
     * In that case, the finalize method will be called additionally during checkout after the redirect.
     * If the payment process is synchronous, you should return null.
     */
    public function pay(Request $request, PaymentTransactionStruct $transaction, Context $context, ?Struct $validateStruct): ?RedirectResponse
    {
        // In here you should probably call your payment provider to precess the payment
        // $this->myPaymentProvider->processPayment($transaction);

        // afterward you should update the transaction with the new state
        $this->transactionStateHandler->process($transaction->getOrderTransactionId(), $context);

        return null;
    }

    /**
     * As long as the supports method returns true for PaymentHandlerType::REFUND, this method will be called during the refund process.
     */
    public function refund(RefundPaymentTransactionStruct $transaction, Context $context): void
    {
        $refund = $this->getRefund($transaction->getRefundId(), $context);

        if (!$refund) {
            // this will stop the refund process and set the refunds state to `failed`
            throw PaymentException::refundInterrupted($transaction->getRefundId(), 'Refund not found');
        }

        // a refund can have multiple positions, with different order line items and amounts
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
                    throw PaymentException::refundInterrupted($refund->getId(), 'Something went wrong');
                }
            }
        }

        // let Shopware know, that the refund was successful
        $this->refundStateHandler->complete($refund->getId(), $context);
    }

    private function getRefund(string $refundId, Context $context): ?OrderTransactionCaptureRefundEntity
    {
        return $this->refundRepository->search(new Criteria([$refundId]), $context)->first();
    }

    private function callPSPForRefund(float $amount, string $reason, string $lineItemId): void
    {
        // call your PSP here
    }
}

```

```xml [services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <tag name="shopware.payment.method"/>
            <argument type="service" id="order_transaction_capture_refund.repository"/>
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransactionCapture\OrderTransactionCaptureStateHandler"/>
        </service>
    </services>
</container>
```

:::

As you can see, you have complete control over handling the refund request and which positions to refund.

</Tab>

<Tab title="Recurring">

Recurring payment handlers allow continuous charging of a customer's payment method.
This is especially useful for subscription-based services.

::: info
A full-fledged Subscriptions feature with recurring payments is available exclusively through our [paid plans](https://www.shopware.com/en/pricing/).
:::

::: info
Usually, a billing agreement between the customer and the payment provider is necessary to allow recurring payments.
:::

::: code-group

```php [MyCustomPaymentHandler.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PaymentHandlerType;
use Shopware\Core\Checkout\Payment\Cart\PaymentTransactionStruct;
use Shopware\Core\Checkout\Payment\PaymentException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Struct\Struct;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class MyCustomPaymentHandler extends AbstractPaymentHandler
{
    public function __construct(private readonly OrderTransactionStateHandler $transactionStateHandler)
    {
    }

    public function supports(PaymentHandlerType $type, string $paymentMethodId, Context $context): bool
    {
        // this payment handler supports recurring payments
        return $type === PaymentHandlerType::RECURRING;
    }

    /**
     * This method is in the case of recurring payments only called during the initial checkout.
     * You probably want to create a billing agreement between the customer and your PSP here.
     * Do not forget to capture the initial charge as well.
     */
    public function pay(Request $request, PaymentTransactionStruct $transaction, Context $context, ?Struct $validateStruct): ?RedirectResponse
    {
        // You can identify, that this is the intitial capture for a recurring payment by checking the `RecurringDataStruct` in the `PaymentTransactionStruct`
        if ($transaction->getRecurring()) {
            // In here you should probably call your payment provider to create a billing agreement
            // $this->myPaymentProvider->createBillingAgreement($transaction);
        }
        
        // Don't forget to capture the initial payment as well
        // $this->myPaymentProvider->processPayment($transaction);
        
        // afterward you should update the transaction with the new state
        $this->transactionStateHandler->process($transaction->getOrderTransactionId(), $context);

        return null;
    }
    
    /**
     * call your PSP here for capturing a recurring payment
     * a valid billing agreement between the customer and the PSP should usually already be in place
     * use on of the other payment handler methods to create such an agreement on checkout and capture the initial order once
     * you will probably receive a token from your PSP for the billing agreement, which you will need to capture a recurring payment
     */
    public function recurring(PaymentTransactionStruct $transaction, Context $context): void
    {
        try {
            $data = $transaction->getRecurring()?->getVars();

            if (!$data || !isset($data['pspBillingAgreementToken'])) {
                throw PaymentException::recurringInterrupted($transaction->getOrderTransactionId(), 'No token supplied');
            }

            //$this->callPSPForRecurringPayment($data['pspBillingAgreementToken']);
        } catch (\Throwable $e) {
            // throw a PaymentException::recurringInterrupted to set the transaction state to `failed`
            throw PaymentException::recurringInterrupted($transaction->getOrderTransactionId(), 'Something went wrong', $e);
        }
    }
}

```

```xml [services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <tag name="shopware.payment.method"/>
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
        </service>
    </services>
</container>
```

:::

</Tab>

</Tabs>

## Setting up the new payment method

The handler itself is not used yet, since there is no payment method actually using the handler created above.
In short: Your handler is not handling any payment method so far.
The payment method can be added to the system while installing your plugin.

An example for your plugin could look like this:

::: code-group

```php [SwagBasicExample.php]
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

        $pluginIdProvider = $this->container->get(PluginIdProvider::class);
        $pluginId = $pluginIdProvider->getPluginIdByBaseClass(get_class($this), $context);

        $examplePaymentData = [
            // payment handler will be selected by the identifier
            'handlerIdentifier' => MyCustomPaymentHandler::class,
            'name' => 'Example payment',
            'description' => 'Example payment description',
            'pluginId' => $pluginId,
            // if true, payment method will also be available after the order 
            // is created, e.g. if payment fails and the user wants to try again
            'afterOrderEnabled' => true,
            // the technicalName helps you to identify the payment method uniquely
            // it is best practice to use a plugin specific prefix to avoid conflicts
            'technicalName' => 'swag_example-example_payment',
        ];

        $paymentRepository = $this->container->get('payment_method.repository');
        $paymentRepository->create([$examplePaymentData], $context);
    }

    private function setPaymentMethodIsActive(bool $active, Context $context): void
    {
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
        $paymentRepository = $this->container->get('payment_method.repository');

        // Fetch ID for update
        $paymentCriteria = (new Criteria())->addFilter(new EqualsFilter('handlerIdentifier', ExamplePayment::class));
        return $paymentRepository->searchIds($paymentCriteria, Context::createDefaultContext())->firstId();
    }
}
```

:::

In the `install` method, you start by creating a new payment method, if it doesn't exist yet.
If you need to know what's happening in there, you might want to have a look at our guide regarding [Writing data](../../framework/data-handling/writing-data).

::: danger
**Do not** do the opposite in the `uninstall` method and remove the payment method.
This might lead to data inconsistency if the payment method was used in some orders.
Instead, only deactivate the method!
:::

The `activate` method and `deactivate` method just do that, activating and deactivating the payment method, respectively.

### Identify your payment

You can identify your payment by the entity property `formattedHandlerIdentifier`.
It shortens the original handler identifier \(php class reference\): `Custom/Payment/SEPAPayment` to `handler_custom_sepapayment`.
The syntax for the shortening can be looked up in [Shopware\Core\Checkout\Payment\DataAbstractionLayer\PaymentHandlerIdentifierSubscriber](https://github.com/shopware/shopware/blob/v6.3.4.1/src/Core/Checkout/Payment/DataAbstractionLayer/PaymentHandlerIdentifierSubscriber.php).

Otherwise, you can use your given technical name to uniquely identify your payment method.

## Migrating payment handlers from 6.6

If you are migrating a payment handler from a version before 6.7,
you need to move from the existing interfaces to the new abstract class and add your own order data loading..

### Payment handler interfaces removed

Instead of implementing multiple interfaces of `Shopware\Core\Checkout\Payment\Cart\PaymentHandler\PaymentHandlerInterface` in your payment handler,
extend the `Shopware\Core\Checkout\Payment\Cart\PaymentHandler\AbstractPaymentHandler` class and implement the necessary methods.

| Old interface                         | Method used in payment handler                                                                            | Checks for `supports` method    |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------|---------------------------------|
| `SynchronousPaymentHandlerInterface`  | `pay`: always called during checkout                                                                      | -                               |
| `AsynchronousPaymentHandlerInterface` | `finalize`: only called, if `pay` returns a `RedirectResponse`                                            | -                               |
| `PreparedPaymentHandlerInterface`     | `validate`: be aware that this method is always called and can be used to validate a cart during checkout | -                               |
| `RecurringPaymentHandlerInterface`    | `recurring`                                                                                               | `PaymentHandlerType::RECURRING` |
| `RefundPaymentHandlerInterface`       | `refund`                                                                                                  | `PaymentHandlerType::REFUND`    |

### New single tag for payment handlers

Your payment handler should now have a single tag in the service definition: `shopware.payment.method`.
Remove any other occurrences of the following tags:
`shopware.payment.method.sync`, `shopware.payment.method.async`, `shopware.payment.method.prepared`, `shopware.payment.method.recurring`, `shopware.payment.method.refund`.

::: code-group

```xml [services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\MyCustomPaymentHandler">
            <!-- this is the new tag for payment handlers -->
            <tag name="shopware.payment.method"/>

            <!-- remove any of these other tags -->
            <tag name="shopware.payment.method.sync"/>
            <tag name="shopware.payment.method.async"/>
            <tag name="shopware.payment.method.prepared"/>
            <tag name="shopware.payment.method.recurring"/>
            <tag name="shopware.payment.method.refund"/>
        </service>
    </services>
</container>
```

:::

### Prepared payments

In the past, you would have to implement the `validate` and `capture` methods when dealing with the `PreparedPaymentHandlerInterface`.

Now, you only have to implement the `validate` method.
Instead of the `capture` method, the streamlined `pay` method is used and has to be implemented.
