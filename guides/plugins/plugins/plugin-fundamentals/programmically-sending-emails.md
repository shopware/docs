# Programmically sending Emails

In this guide you'll learn how to send Emails programmically using the `Mailservice` provided in Shopware v6.4.x.

## Prerequisites

In order to add the MailService for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md) and [how to add a custom controller](./add-custom-controller)

## Registering the service

Before we're working with the `MailSerivce` we need to register our controller to the [Dependency Injection](../../plugin-fundamentals/dependency-injection.md) container and inject the service `MailService` into our controller. We'll use a class called `ExampleController` here.

{% code title="<plugin root>/src/Resources/config/services.xml" %}

```markup
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <!-- Controller -->
        <service id="Swag\Mail\Storefront\Controller\ExampleController" public="true">
            <argument type="service" id="Shopware\Core\Content\Mail\Service\MailService"/>

            <call method="setContainer">
                <argument type="service" id="service_container"/>
            </call>
        </service>
    </services>
</container>
```

{% endcode %}

We're injecting the `MailService` as an argument to the controller. This is the recommend way to programmatically send Emails. The service throws events and provides the ability to use templates instead
of basic strings for the content.

## Preparing & sending an Email

Now we have the `MailService` available in our controller we can start preparing the Email to be send out. Please be aware that the `send()` method of the service is using a data validator which requires the following properties to be given in the `$data` array which we provide as the first argument:

-   `recipients`
-   `salesChannelId`
-   `contentHtml`
-   `contentPlain`
-   `subject`
-   `senderName`

If one of these property is getting omitted we're running in a `ConstraintViolationException`. Based on these properties we can construct the necessary `$data` array for the method as the following:

```markup
public function send(SalesChannelContext $salesChannelContext): ?Response
{
    $salesChannelId = $salesChannelContext->getSalesChannelId();
    $context = $salesChannelContext->getContext();

    $content = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr';
    $data = [
        'salesChannelId' => $salesChannelId,
        'recipients' => ['example@test.com' => 'readable name'],
        'subject' => 'Programmatically sent mail',
        'senderName' => 'admin@example.com',
        'contentPlain' => $content,
        'contentHtml' => $content
    ];

    $this->mailService->send($data, $context);

    return $this->redirectToRoute('frontend.home.page');
}
```

Please note that the controller action redirects to the home page after the Email was sent out successfully.

### Customize the Email subject and sender name using twig variables

The subject and the sender name will be parsed using a string template render which allows us to customize the these properties using Twig variables which we can provide as the third argument of the `send()` method.

```markup
 $templateData = [
    'exampleVariable' => 'Example customer name'
];
$data = [
    'salesChannelId' => $salesChannelId,
    'recipients' => ['example@test.com' => 'readable name'],
    'subject' => 'Hey {{ exampleVariable }}',
    'senderName' => 'Test Email from sales channel {{ salesChannel.name }}',
    'contentPlain' => $content,
    'contentHtml' => $content
];

$this->mailService->send($data, $context, $templateData);
```

### Customize the Email content using a Twig template

We can take the customization of the Email one step further when we're using the `$this->render()` method to render a Twig template and using it as the content for the Email.

```markup
$templateData = [
    'exampleVariable' => 'Example customer name'
];

$content = $this->renderView('@SwagMailPlugin/documents/example-document.html.twig', $templateData);
$plainContent = strip_tags($content);

$data = [
    'salesChannelId' => $salesChannelId,
    'recipients' => ['example@test.com' => 'readable name'],
    'subject' => 'Hey {{ exampleVariable }}',
    'senderName' => 'Test Email from sales channel {{ salesChannel.name }}',
    'contentPlain' => $plainContent,
    'contentHtml' => $content
];

$this->mailService->send($data, $context, $templateData);
```
