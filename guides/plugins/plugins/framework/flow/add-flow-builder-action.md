# Add custom flow Action

::: info
  This functionality is available starting with Shopware 6.4.6.0
:::

## Overview

In this guide, you'll learn how to create custom flow action in Shopware. The flow builder uses actions to perform business tasks. This example will introduce a new custom action called `create tags`.

## Prerequisites

In order to add your own custom flow action for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide.](../../plugin-base-guide.md)

You also should be familiar with the [Dependency Injection container](../../plugin-fundamentals/dependency-injection.md) as this is used to register your custom flow action and [Listening to events](../../plugin-fundamentals/listening-to-events.md#creating-your-own-subscriber) to create a subscriber class.

It might be helpful to gather some general understanding about the [concept of Flow Builder](../../../../../concepts/framework/flow-concept.md) as well.

## Existing triggers and actions

You can refer to the [Flow reference](../../../../../resources/references/core-reference/flow-reference.md) to read triggers and actions detail.

## Create custom flow action

To create a custom flow action, firstly you have to make a plugin and install it, you can refer to the [Plugin Base Guide](../../plugin-base-guide.md) to do it. I will create a plugin named `ExamplePlugin`. We have to implement both backend (PHP) code and a user interface in the Administration to manage it. Let's start with the PHP part first, which handles the main logic of our action. After that, there will be an example to show your new actions in the Administration.

## Creating flow action in PHP

### Create new Aware interface

 First of all, we need to define an aware interface for your own action. I intended to create the `CreateTagAction`, so I need to create a related aware named `TagAware`, will be placed in directory `<plugin root>/src/Core/Framework/Event`. Our new interface has to extend from interfaces `Shopware\Core\Framework\Event\FLowEventAware`:

```php
// <plugin root>/src/Core/Framework/Event/TagAware.php
<?php declare(strict_types=1);
namespace Swag\ExamplePlugin\Core\Framework\Event;
use Shopware\Core\Framework\Event\FlowEventAware;

interface TagAware extends FlowEventAware
{
    ...

    public const TAG = 'tag';

    public const TAG_ID = 'tagId';

    public function getTag();

    ...
}
```

### Create new action

::: warning
Starting with the next major version (6.5.0.0), we are introducing changes in how to create new flow actions, please follow the instructions corresponding to your current version.
:::

In this example, we will name it `CreateTagAction`. It will be placed in the directory `<plugin root>/src/Core/Content/Flow/Dispatching/Action`. Below you can find an example implementation:

::: info
  Available starting with Shopware 6.4.6.0
:::

Our new class has to extend from the abstract class `Shopware\Core\Framework\Event\FLowEvent`.

```php
// <plugin root>/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php
<?php declare(strict_types=1);

namespace Swag\ExamplePlugin\Core\Content\Flow\Dispatching\Action;

use Shopware\Core\Content\Flow\Dispatching\Action\FlowAction;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Uuid\Uuid;
use Swag\ExamplePlugin\Core\Framework\Event\TagAware;
use Shopware\Core\Framework\Event\FlowEvent;

class CreateTagAction extends FlowAction
{
    private EntityRepository $tagRepository;

    public function __construct(EntityRepository $tagRepository)
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
        // config is the "Configuration data" you get after you create a flow sequence
        $config = $event->getConfig();

        // make sure your "tags" data exists
        if (!\array_key_exists('tags', $config)) {
            return;
        }

        $baseEvent = $event->getEvent();

        $tags = $config['tags'];

        // just a step to make sure you are dispatching the correct action
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

- `__constructor`: This only defines the default expected value. This is overwritten at runtime with the actual value, that the shop owner set in the Administration.
- `getName`: Returns a unique technical name for your action.
- `requirements`: This defines which interfaces that the action belongs to.
- `handle`: Use this method to handle your action stuff.

::: info
  Available starting with Shopware 6.5.0.0
:::

```php
// <plugin root>/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php
<?php declare(strict_types=1);

namespace Swag\ExamplePlugin\Core\Content\Flow\Dispatching\Action;

use Shopware\Core\Content\Flow\Dispatching\Action\FlowAction;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Uuid\Uuid;
use Swag\ExamplePlugin\Core\Framework\Event\TagAware;
use Shopware\Core\Content\Flow\Dispatching\StorableFlow;

class CreateTagAction extends FlowAction
{
    private EntityRepository $tagRepository;

    public function __construct(EntityRepository $tagRepository)
    {
        // you would need this repository to create a tag
        $this->tagRepository = $tagRepository;
    }

    public static function getName(): string
    {
        // your own action name
        return 'action.create.tag';
    }

    public function requirements(): array
    {
        return [TagAware::class];
    }

    public function handleFlow(StorableFlow $flow): void
    {
        // config is the config data when created a flow sequence
        $config = $flow->getConfig();

        // make sure your tags data is exist
        if (!\array_key_exists('tags', $config)) {
            return;
        }

        $tags = $config['tags'];

        // just a step to make sure you're dispatching correct action
        if (!$flow->hasStore(TagAware::TAG_ID) || empty($tags)) {
            return;
        }

        // get tag id
        $tagId = $flow->getStore(TagAware::TAG_ID);

        // get tag
        $tag = $flow->getData(TagAware::TAG);

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

- `__constructor`: This only defines the default expected value. This is overwritten at runtime with the actual value, that the shop owner set in the Administration.
- `getName`: Returns a unique technical name for your action.
- `requirements`: This defines which interfaces the action belongs to.
- `handleFlow`: Use this method to handle your action stuff.
    - Use `$flow->getStore($key)` if you want to get the data from aware interfaces. E.g: `tag_id` in `TagAware`, `customer_id` from `CustomerAware` and so on.
    - Use `$flow->getData($key)` if you want to get the data from original events or additional data. E.g: `tag`, `customer`, `contactFormData` and so on.

And we also need to register this action in the container as a service, make sure you have defined a tag `<tag name="flow.action" priority="600">` at `<plugin root>/src/Resources/config/services.xml`, that your action would be added to response of *`/api/_info/flow-actions.json`* API and `priority` will decide the order of action of API response:

::: info
  Available starting with Shopware 6.4.6.0
:::

```xml
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\ExamplePlugin\Core\Content\Flow\Dispatching\Action\CreateTagAction">
    <argument type="service" id="tag.repository" />
    <tag name="kernel.event_subscriber"/>
    <tag name="flow.action" priority="600"/>
</service>
```

::: info
  Available starting with Shopware 6.5.0.0
:::

```xml
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\ExamplePlugin\Core\Content\Flow\Dispatching\Action\CreateTagAction">
    <argument type="service" id="tag.repository" />
    <tag name="kernel.event_subscriber"/>
    <tag name="flow.action" priority="600" key="action.create.tag"/>
</service>
```

Great, your own action is created completely. Let's go to the next step.

### Define action scope

 At this step, you will know how to define your action scope, for `CreateTagAction`, I intended it would be available for all events. Let's see the code below:

```php
// <plugin root>/src/Core/Content/Flow/Subscriber/BusinessEventCollectorSubscriber.php
<?php declare(strict_types=1);

namespace Swag\ExamplePlugin\Core\Content\Flow\Subscriber;

use Shopware\Core\Framework\Event\BusinessEventCollectorEvent;
use Swag\ExamplePlugin\Core\Framework\Event\TagAware;
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
            $className = \explode('\\', TagAware::class);
            $definition->addAware(\lcfirst(\end($className)));
        }
    }
}
```

And don't forget to register your subscriber to the container at `<plugin root>/src/Resources/config/services.xml`.

```xml
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\ExamplePlugin\Core\Content\Flow\Subscriber\BusinessEventCollectorSubscriber">
    <tag name="kernel.event_subscriber"/>
</service>
```

Well done, you are successfully created your custom action in Backend in PHP.

::: info
  This functionality is available starting with Shopware 6.4.6.0
:::

## Add custom action in Administration

After we are done with the PHP code, `action.create.tag` is received from the response of `/api/_info/flow-actions.json`. However, the custom action displays in the action list without label. These further steps in Administration will help you show the action label and add configuration for it.

To see action list, we select a Trigger, for example [Example\Event] from the Trigger drop-down in the Flow tab. After that, we choose option `ACTION (THEN)`. A action component appears with action list.

![Flow Builder trigger](../../../../../.gitbook/assets/flow-builder-trigger-drop.png)

![Flow Builder action then](../../../../../.gitbook/assets/flow-builder-action-then.png)

![Flow Builder trigger](../../../../../.gitbook/assets/flow-builder-action-no-label.png)

### Step 1: Show action label in action list

First, we need to define some information like `icon`, `label`, `actionName` of action in `main.js`. To be consistent with the custom action defined in our PHP code, also create an action name called `CREATE_TAG` to represent `action.create.tag`, which gets from the response of `/api/_info/flow-actions.json`.

![Flow Builder action services list](../../../../../.gitbook/assets/flow-builder-action-sevices-list.png)

```jsx
// <plugin root>/src/Resources/app/administration/src/main.js
Shopware.Service('flowBuilderService').addIcons({
    addEntityTag: 'regular-tag',
});

Shopware.Service('flowBuilderService').addLabels({
    addEntityTag: 'sw-flow.actions.addTag',
});

Shopware.Service('flowBuilderService').addActionNames({
    ADD_TAG: 'action.create.tag',
});
```

And then add snippets for labels:

```jsx
// /src/Resources/app/administration/src/snippet/en-GB.json
{
    "sw-flow": {
        "actions": {
            "addTag": 'Create tag'
        }
    }
}
```

Do it as the same with `de-DE.json` file for translation of DE language.

**Grouping Actions**

If you want your action on the Tag group, add this line to the `main.js` file above.

```jsx

Shopware.Service('flowBuilderService').addActionGroupMapping({
    'action.create.tag': 'tag',
});
```

Otherwise, by default, it will be on the General group.

| Group Name | Group Headline |
| :--- | :--- |
| general | General|
| tag | Tag |
| customer | Customer |
| order | Order |

Here is the result for the after the **Step 1**.

![Choose a Flow Builder Action](../../../../../.gitbook/assets/flow-builder-trigger-action.png)

### Step 2: Add configuration for action

First, we need to customize `modalName` computed for the configuration modal to ensure your selected action matches your new action. After that, the description should be generated from your custom description. In the core, we had `getActionDescriptions` method, which handles description generation, so you have to override that method to show the action in the configuration description.

```jsx
// <plugin root>/src/Resources/app/administration/src/extension/sw-flow-sequence-action/index.js
const { Component } = Shopware;

Component.override('sw-flow-sequence-action', {
    computed: {
        modalName() {
            if (this.selectedAction === this.flowBuilderService.getActionName('ADD_TAG')) {
                return 'swag-example-plugin-modal';
            }

            return this.$super('modalName');
        },
    },

    methods: {
        getActionDescriptions(sequence) {
            if (sequence.actionName === this.flowBuilderService.getActionName('ADD_TAG')) {
                const tags = config.tags.join(', ');

                // The description of new action will be show here.
                return this.$tc('swag-example-plugin.descriptionTags', 0, {
                    tags
                });
            }

            return this.$super('getActionDescriptions', sequence);
            
        },
    },
});
```

Then, we need a modal to save your action config. For example, we create a component `swag-example-plugin-modal`.

#### JavaScript file

```jsx
// <plugin root>/src/Resources/app/administration/src/component/swag-example-plugin-modal/index.js
import template from './swag-example-plugin-modal.html.twig';
const { Component } = Shopware;

Component.register('swag-example-plugin-modal', {
    template,

    props: {
        sequence: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            tags: [],
        };
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.tags = this.sequence?.config?.tags || [];
        },

        onClose() {
            this.$emit('modal-close');
        },

        onAddAction() {
            const sequence = {
                ...this.sequence,
                config: {
                    ...this.config,
                    tags: this.tags
                },
            };

            this.$emit('process-finish', sequence);
        },
    },
});
```

#### Twig template file

```twig
// <plugin root>/src/Resources/app/administration/src/component/swag-example-plugin-modal/swag-example-plugin-modal.html.twig
{% block swag_example_plugin_modal %}
    <sw-modal
        class="swag-example-plugin-modal"
        :title="$tc('swag-example-plugin.titleCreateTag')"
        @modal-close="onClose"
    >
        {% block swag_example_plugin_modal_content %}
            <sw-multi-tag-select
                v-model="tags"
                :label="$tc('swag-example-plugin.labelTags')"
            />
        {% endblock %}

        {% block swag_example_plugin_modal_footer %}
            <template #modal-footer>
                {% block swag_example_plugin_modal_footer_cancel_button %}
                    <sw-button
                        class="swag-example-plugin-modal__cancel-button"
                        size="small"
                        @click="onClose"
                    >
                        {{ $tc('global.default.cancel') }}
                    </sw-button>
                {% endblock %}

                {% block swag_example_plugin_modal_footer_save_button %}
                    <sw-button
                        class="swag-example-plugin-modal__save-button"
                        variant="primary"
                        size="small"
                        @click="onAddAction"
                    >
                        {{ sequence.id
                        ? $tc('swag-example-plugin.buttonSaveAction')
                        : $tc('swag-example-plugin.buttonAddAction') }}
                    </sw-button>
                {% endblock %}
            </template>
        {% endblock %}
    </sw-modal>
{% endblock %}
```

Here is the final result

![Flow Builder create tag](../../../../../.gitbook/assets/flow-builder-tag.png)

Click on [Save action] and we will get the result as below screenshot.

![Flow Builder create tag result](../../../../../.gitbook/assets/flow-builder-tag-result.png)

#### Custom configuration for action without the modal

You don't need a modal for the configuration. It can be added automatically.

Imagine, your action is already in the action list after [the first step](#step-1-show-action-label-in-action-list)

![Choose a Flow Builder Action](../../../../../.gitbook/assets/flow-builder-trigger-action.png)

First, override the `openDynamicModal` method in the plugin to check if the value matches the desired action. Then, call the `onSaveActionSuccess` directly with the configuration. After the check, call `return`.

#### JavaScript

```jsx
// <plugin root>/src/Resources/app/administration/src/extension/sw-flow-sequence-action/index.js
import template from './sw-flow-sequence-action.html.twig';
const { Component } = Shopware;

Component.register('sw-flow-sequence-action', {
    methods: {
        openDynamicModal(value) {
            if (!value) {
                return;
            }

            const actionName = this.flowBuilderService.getActionName('ADD_TAG')

            if (value === actionName) {
                this.selectedAction = actionName;
                const config = {
                    tags: 'VIP, New customer'
                };

                // Config can be a result from an API.

                this.onSaveActionSuccess({ config });
                return;
            }

            // handle for the rest of actions.
        },
    },
});
```

Now, after you click on the action, the new sequence will automatically be added to the action list like this:

![Flow Builder create tag result](../../../../../.gitbook/assets/flow-builder-tag-result.png)

### Demo

You can view the whole demo for this custom Flow Builder trigger and action below:

![Flow Builder demo](../../../../../.gitbook/assets/flow-builder-demo.gif)
