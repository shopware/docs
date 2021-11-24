# Add custom flow trigger

## Overview

In this guide you'll learn how to create custom flow action in Shopware. Actions are used by the flow builder.

This example will introduce a new custom action, which creates tags. The shop owner is then able to create tags via flow builder.

# Prerequisites

In order to add your own custom flow action for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide.](../../plugin-base-guide.md)

You also should be familiar with the [Dependency Injection container](../../plugin-fundamentals/dependency-injection) as this is used to register your custom flow action and [Listening to events]../../plugins/plugin-fundamentals/listening-to-events#creating-your-own-subscriber) to create a subscriber class.

It might be helpful to gather some general understanding about the concept of flow builder as well.

# Existing triggers and actions

You can refer to the [Overview Events and Actions](https://shopware.atlassian.net/wiki/spaces/~m.friedmann/pages/18987974805/Flow+Builder+-+Overview+Events+and+Actions) to read triggers and actions detail.

# Create custom flow action

To create a custom flow action, firstly you have to create a plugin and install it, you can refer to the [Plugin Base Guide](../../plugin-base-guide) to do it. I will create a plugin named `AddTagPlugin`. we have to implement both backend (PHP) code and a user interface in the administration to manage it. Let's start with the PHP part first, which basically handles the main logic of our action. After that, there will be an example to actually show your new action in the administration.

## Creating flow action in PHP

### Create new Aware interface

 First of all, we need to define an aware interface for your own action, I intended to create the `CreateTagAction`, so I need to create a related aware named `TagAware`, will be placed in directory `<plugin root>/src/Core/Framework/Event`. Our new interface has to extend from interfaces `Shopware\Core\Framework\Event\FLowEventAware`:

```php
<?php declare(strict_types=1);

namespace Swag\AddTagPlugin\Core\Framework\Event;

use Shopware\Core\Framework\Event\FlowEventAware;

interface TagAware extends FlowEventAware
{
}
```

### Create new action

In this example, we will name it `CreateTagAction`. It will be placed in the directory `<plugin root>/src/Core/Content/Flow/Dispatching/Action`. Our new class has to extend from the abstract class `Shopware\Core\Framework\Event\FLowEvent`. Below you can find an example implementation:

```php
<?php declare(strict_types=1);

namespace Swag\AddTagPlugin\Core\Content\Flow\Dispatching\Action;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\Event\TagAware;
use Shopware\Core\Framework\Event\FlowEvent;

class CreateTagAction extends FlowAction
{
    private EntityRepositoryInterface $tagRepository;

    public function __construct(EntityRepositoryInterface $tagRepository)
    {
        // you would need this repository to create a tag
        $this->tagRepository = $tagRepository;
    }

    public static function getName(): string
    {
        // your own action name
        return 'action.create.tag';
    }

    public static function getSubscribedEvents(): array
    {
        return [
            self::getName() => 'handle',
        ];
    }

    public function requirements(): array
    {
        return [TagAware::class];
    }

    public function handle(FlowEvent $event): void
    {
        // config is the config data when created a flow sequence
        $config = $event->getConfig();

        // make sure your tags data is exist
        if (!\array_key_exists('tags', $config)) {
            return;
        }

        $baseEvent = $event->getEvent();

        $tags = $config['tags'];

        // just a step to make sure you're dispatching correct action
        if (!$baseEvent instanceof TagAware || empty($tags)) {
            return;
        }

        $tagData = [];
        foreach ($tags as $tag) {
            $tagData[] = [
                'id' => Uuid::randomHex(),
                'name' => $tag,
            ];
        }

        // simply create tags
        $this->tagRepository->create($tagData, $baseEvent->getContext());
    }
}
```

As you can see, several methods are already implemented:

- `__constructor`: This only defines the default expected value. This is overwritten at runtime with the actual value, that the shop owner set in the administration.
- `getName`: Returns a unique technical name for your action.
- `requirements`: This defined which interfaces that the action belongs to.
- `handle`: Use this method to handle your action stuff.

And we also need to register this action in the container as a service, make sure you have defined a tag `<tag name="flow.action" priotity="600">` at `<pluglin root> src/Resources/config/services.xml`, that your action would be added to response of *`/api/_info/flow-actions.json`* API and `priority` will decide the order of action of API response:

```php
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\FlowBuilderProfessional\Core\Content\Flow\Dispatching\Action\TagAwareAction">
            <argument type="service" id="tag.repository" />
            <tag name="kernel.event_subscriber"/>
            <tag name="flow.action" priority="600"/>
        </service>
    </services>
</container>
```

Great, your own action is created completely, let's go to next step.

### Define action scope

 At this step you will know how to define your action scope, for `CreateTagAction`, I intended it would be available for all events, let see the code below:

```php
<?php declare(strict_types=1);

namespace Swag\AddTagPlugin\Core\Content\Flow\Subscriber;

use Shopware\Core\Framework\Event\BusinessEventCollectorEvent;
use Swag\FlowBuilderProfessional\Core\Framework\Event\TagAware;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class BusinessEventCollectorSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            BusinessEventCollectorEvent::NAME => 'addTagAware',
        ];
    }

    public function addTagAware(BusinessEventCollectorEvent $event): void
    {
        foreach ($event->getCollection()->getElements() as $definition) {
            $definition->addAware(TagAware::class);
        }
    }
}
```

And don't forget to register your subscriber to the container at `<pluglin root> src/Core/Content/Flow/DependencyInjection/flow.xml`

```xml
<service id="Swag\FlowBuilderProfessional\Core\Content\Flow\Subscriber\BusinessEventCollectorSubscriber">
	<tag name="kernel.event_subscriber"/>
</service>
```

Well done, you are successfully created your own custom action in BE in PHP.

## Add custom action in Administrator

- Define action name in `swag-basic-example.constant.js`

```jsx
export const ACTION = Object.freeze({
    CREATE_TAG: 'action.create.tag',
});

export default {
    ACTION,
};
```

- Override `sw-flow-sequence-action`

```jsx
import './sw-flow-sequence-action.scss';
import { ACTION } from '../../constant/swag-basic-example.constant';

const { Component } = Shopware;

Component.override('sw-flow-sequence-action', {
    computed: {
        modalName() {
            if (this.selectedAction === ACTION.CREATE_TAG) {
                return 'swag-flow-builder-create-tag-modal';
            }

            return this.$super('modalName');
        },

        actionDescription() {
            const actionDescriptionList = this.$super('actionDescription');

            return {
                ...actionDescriptionList,
                [ACTION.CALL_WEBHOOK] : (config) => this.getWebhookDescription(config),
            };
        },
    },

    methods: {
        getWebhookDescription(config) {
            let description = this.$tc('swag-flow-builder.action.descriptionWebhook', 0, {
                method: config.method,
                baseUrl: config.baseUrl,
            });

            if (config.description) {
                description = description.concat(`<div class='sw-flow-sequence-action__webhook-description'>
                    ${this.$tc('swag-flow-builder.modal.general.labelDescription')}: ${config.description}
                    </div>`);
            }

            return description;
        },

        getActionTitle(actionName) {
            if (actionName === ACTION.CREATE_TAG {
                return {
                    value: actionName,
                    icon: 'default-web-link',
                    label: this.$tc('swag-basic-example.action.titleCallWebhook'),
                }
            }

            return this.$super('getActionTitle', actionName);
        },
    },
});
```

- Create a custom modal to set action configuration

<div data-gb-custom-block data-tag="hint" data-style='info'>
  This functionality is available starting with Shopware 6.4.6.0.
</div>
