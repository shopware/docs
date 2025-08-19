---
nav:
  title: Add data to mails
  position: 10

---

# Add Data to Mails

## Overview

The mail templates in Shopware have access to a given set of data, e.g. the customer data, the order data, etc. Sometimes you want add your custom entity to that data set though, so you can use this data in your mail templates as well.

This guide will teach you how to add new data to the mail templates using your plugin.

## Prerequisites

This guide is built upon our [plugin base guide](../../plugin-base-guide), whose namespace is going to be used in the examples of this guide. However, you can use those examples with any plugin, you'll just have to adjust the namespace and the directory the files are located in.

Furthermore, you should know how to [decorate a service](../../plugin-fundamentals/adjusting-service).

## Adding data via decorator

In order to add new data to the mail templates, you'll have to decorate the [MailService](https://github.com/shopware/shopware/blob/trunk/src/Core/Content/Mail/Service/MailService.php).

To be precise, you have to extend the `send` method, whose last parameter is the `$templateData`, that we want to enrich.

So let's do that, here's an example of a decorated mail service:

::: code-group

```php [PLUGIN_ROOT/src/Service/AddDataToMails.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Content\Mail\Service\AbstractMailService;
use Shopware\Core\Framework\Context;
use Symfony\Component\Mime\Email;

class AddDataToMails extends AbstractMailService
{
    /**
     * @var AbstractMailService
     */
    private AbstractMailService $mailService;

    public function __construct(AbstractMailService $mailService)
    {
        $this->mailService = $mailService;
    }

    public function getDecorated(): AbstractMailService
    {
        return $this->mailService;
    }

    public function send(array $data, Context $context, array $templateData = []): ?Email
    {
        $templateData['myCustomData'] = 'Example data';

        return $this->mailService->send($data, $context, $templateData);
    }
}
```

:::

If you don't recognise the decoration pattern used here, make sure to have a look at our guide about [decorations](../../plugin-fundamentals/adjusting-service).

As always, we're passing in the original `MailService` as a constructor parameter, so we can return it in the `getDecorated` method, as well as use the original `send` method after having adjusted the `$templateData`.

In this example, we're adding `myCustomData` to the `$templateData`, so that one should be available then.

If we add <code v-pre>{{ myCustomData }}</code> to any mail template, it should then print "Example data". You can use any kind of data here, e.g. an array of data.

### Register your decorator

Of course you still have to register the decoration to the service container. Beware of the `decorates` attribute of our service.

Here's the respective example `services.xml`:

::: code-group

```xml [PLUGIN_ROOT/src/Resources/config/services.xml]
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\AddDataToMails" decorates="Shopware\Core\Content\Mail\Service\MailService">
            <argument type="service" id="Swag\BasicExample\Service\AddDataToMails.inner" />
        </service>
    </services>
</container>
```

:::

## Adding data via subscriber

In many cases, adding mail data via an event subscriber is a suitable solution. This way, you avoid the overhead of decorating the mail service. Simply create an event subscriber and listen to the `MailBeforeValidateEvent` event. There, you can safely add template or mail data.
Here is a small example:

::: code-group

```php [PLUGIN_ROOT/src/Subscriber/MyMailSubscriber.php]
<?php

declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Content\MailTemplate\Service\Event\MailBeforeValidateEvent;

class MyMailSubscriber implements EventSubscriberInterface
{

    public static function getSubscribedEvents(): array
    {
        return [
            MailBeforeValidateEvent::class => 'beforeMailValidate'
        ];
    }

    public function beforeMailValidate(
        MailBeforeValidateEvent $event
    ): void {
        $context = $event->getContext();
        $data = $event->getData(); // Get mail data
        $templateData = $event->getTemplateData(); // Get mail template data

        $event->addTemplateData('key', 'value'); // Example of adding data to the mail template
    }
}
```

:::
