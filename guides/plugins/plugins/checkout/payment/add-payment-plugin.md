# Add payment plugin

## Overview

Payments are an essential part of the checkout process. That's the reason why Shopware 6 offers an easy platform on which you can build payment plugins.

## Prerequisites

The examples mentioned in this guide are built upon our \[PLACEHOLDER-LINK: Plugin base guide\].

## Creating a custom payment handler

In order to create your own payment method with your plugin, you have to add a custom payment handler.

You can create your own payment handler by implementing one of the following interfaces:

| Interface | DI container tag | Usage |
| :--- | :--- | :--- |
| SynchronousPaymentHandlerInterface | shopware.payment.method.sync | Payment can be handled locally, e.g. pre-payment |
| AsynchronousPaymentHandlerInterface | shopware.payment.method.async | A redirect to an external payment provider is required, e.g. PayPal |

Depending on the interface, those two methods are required:

* `pay`: This method will be called after an order has been placed. You receive a `Shopware\Core\Checkout\Payment\Cart\AsyncPaymentTransactionStruct` or a `Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct` which contains the transactionId, order details, the amount of the transaction, a return URL, payment method information and language information. Please be aware, Shopware 6 supports multiple transactions and you have to use the amount provided and not the total order amount. If you're using the `AsynchronousPaymentHandlerInterface`, the `pay` method has to return a `RedirectResponse` to redirect the customer to an external payment provider. Note: The [AsyncPaymentTransactionStruct](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Payment/Cart/AsyncPaymentTransactionStruct.php) contains a return URL. This represents the URL that the external payment provider needs to know, so they can also redirect your customer back to your shop. If an error occurs while e.g. calling the API of your external payment provider, you should throw an `AsyncPaymentProcessException`. Shopware 6 will handle this exception and set the transaction to the `cancelled` state. The same happens if you are using the `SynchronousPaymentHandlerInterface`: throw a `SyncPaymentProcessException` in an error case.
* `finalize`: The `finalize` method is only required if you implemented the `AsynchronousPaymentHandlerInterface`, returned a `RedirectResponse` in your `pay` method and the customer has been redirected from the payment provider back to Shopware 6. You must check here if the payment was successful or not and update the order transaction state accordingly. Similar to the pay action you are able to throw exceptions if some error cases occur. Throw the `CustomerCanceledAsyncPaymentException` if the customer canceled the payment process on the payment provider site. If another general error occurs throw the `AsyncPaymentFinalizeException` e.g. if your call to the payment provider API fails. Shopware 6 will handle these exceptions and will set the transaction to the `cancelled` state.

Both methods get the `\Shopware\Core\System\SalesChannel\SalesChannelContext` injected. Please note, that this class contains properties, which are nullable. If you want to use these information, you have to ensure in your code that they are set and not `NULL`.

### Registering the service

Before we're going to have a look at both a synchronous, as well as an asynchronous example, we need to register our new service to the \[PLACEHOLDER-LINK: Dependency Injection\] container. We'll use a class called `ExamplePayment` here.

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```markup
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\PaymentPlugin\Service\ExamplePayment">
            <argument type="service" id="Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler"/>
            <tag name="shopware.payment.method.sync" />
<!--            <tag name="shopware.payment.method.async" />-->
        </service>
    </services>
</container>
```
{% endcode %}

It gets passed the `OrderTransactionStateHandler`, which is necessary to change an order's transaction state, e.g. to `paid`. Also the payment handler has to be marked as such, hence the tag `shopware.payment.method.sync` or `shopware.payment.method.async` respectively for a synchronous or an asynchronous payment handler.

Now let's start with the actual examples.

### Synchronous example

The following will be a synchronous example, so no redirect will happen and the payment can be handled in the shop itself. Therefore, you don't have to return a `RedirectResponse` in the `pay` method and no `finalize` method is necessary either.

Therefore, changing the `stateId` of the order should already be done in the `pay` method, since there will be no `finalize` method. If you have to execute some logic which might fail, e.g. a call to an external API, you should throw a `SyncPaymentProcessException`. Shopware 6 will handle this exception and set the transaction to the `cancelled` state.

{% code title="<plugin root>/src/Service/ExamplePayment.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\SynchronousPaymentHandlerInterface;
use Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class ExamplePayment implements SynchronousPaymentHandlerInterface
{
    /**
     * @var OrderTransactionStateHandler
     */
    private $transactionStateHandler;

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
{% endcode %}

All it does now is to set the state of the order transaction to `paid`.

### Asynchronous example

In the asynchronous example, the customer gets redirected to an external payment provider, which then in return has to redirect your customer back to your shop. Therefore, you first need to redirect your customer to the payment provider by returning a `RedirectResponse`.

Also you need a `finalize` method to properly handle your customer, when he was returned back to your shop. This is where you check the payment state and set the order transaction state accordingly.

Let's have a look at an example implementation of your custom asynchronous payment handler:

{% code title="<plugin root>/src/Service/ExamplePayment.php" %}
```php
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
    /**
     * @var OrderTransactionStateHandler
     */
    private $transactionStateHandler;

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
{% endcode %}

Let's start with the `pay` method. You'll have to start with letting your external payment provider know, where he should redirect your customer in return when the payment was done. This is usually done by making an API call and transmitting the return URL, which you can fetch from the passed `AsyncPaymentTransactionStruct` by using the method `getReturnUrl`. Since this is just an example, the method `sendReturnUrlToExternalGateway` is empty. Fill in your logic in there in order to actually send the return URL to the external payment provider. The last thing you need to do, is to redirect your customer to the external payment provider via a `RedirectResponse`.

Once your customer is done at the external payment provider, he will be redirected back to your shop. This is where the `finalize` method will be executed. In here you have to check whether or not the payment process was successful. If e.g. the customer cancelled the payment process, you'll have to throw a `CustomerCanceledAsyncPaymentException` exception.

Otherwise, you can proceed to check if the payment status was successful. If that's the case, set the order's transaction state to `paid`. If not, you could e.g. reopen the order's transaction.

## Setting up new payment method

The handler itself is not used yet, since there is no payment method actually using the handler created above. In short: Your handler is not handling any payment method so far. The payment method can be added to the system while installing your plugin.

An example for your plugin could look like this:

{% code title="<plugin root>/src/SwagBasicExample.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
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
        ];

        /** @var EntityRepositoryInterface $paymentRepository */
        $paymentRepository = $this->container->get('payment_method.repository');
        $paymentRepository->create([$examplePaymentData], $context);
    }

    private function setPaymentMethodIsActive(bool $active, Context $context): void
    {
        /** @var EntityRepositoryInterface $paymentRepository */
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
        /** @var EntityRepositoryInterface $paymentRepository */
        $paymentRepository = $this->container->get('payment_method.repository');

        // Fetch ID for update
        $paymentCriteria = (new Criteria())->addFilter(new EqualsFilter('handlerIdentifier', ExamplePayment::class));
        return $paymentRepository->searchIds($paymentCriteria, Context::createDefaultContext())->firstId();
    }
}
```
{% endcode %}

In the `install` method, you actually start by creating a new payment method, if it doesn't exist yet. If you don't know what's happening in there, you might want to have a look at our guide regarding \[PLACEHOLDER-LINK: Writing data\].

However, **do not** do the opposite in the `uninstall` method and remove the payment method. This might lead to data inconsistency, if the payment method was used in some orders. Instead, only deactivate the method!

The `activate` method and `deactivate` method just do that, activating and deactivating the payment method respectively.

### Identify your payment

You can identify your payment by the entity property `formattedHandlerIdentifier`. It shortens the original handler identifier \(php class reference\): `Custom/Payment/SEPAPayment` to `handler_custom_sepapayment` The syntax for the shortening can be looked up in [Shopware\Core\Checkout\Payment\DataAbstractionLayer\PaymentHandlerIdentifierSubscriber](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Payment/DataAbstractionLayer/PaymentHandlerIdentifierSubscriber.php).

## Next steps

You've now successfully set up your custom payment provider.

Maybe you now want to add custom line items to your cart, which is explained in this guide \[PLACEHOLDER-LINK: Add custom line items\].

