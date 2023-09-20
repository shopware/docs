---
nav:
  title: Add Flow Builder action
  position: 10

---

# Add custom flow Action

::: info
  This functionality is available starting with Shopware 6.4.6.0
:::

## Overview

In this guide, you'll learn how to create custom flow action in Shopware. The flow builder uses actions to perform business tasks. This example will introduce a new custom action called `create tags`.

## Prerequisites

In order to add your own custom flow action for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide.](../../plugin-base-guide)

You also should be familiar with the [Dependency Injection container](../../plugin-fundamentals/dependency-injection) as this is used to register your custom flow action and [Listening to events](../../plugin-fundamentals/listening-to-events#creating-your-own-subscriber) to create a subscriber class.

It might be helpful to gather some general understanding about the [concept of Flow Builder](../../../../../concepts/framework/flow-concept) as well.

## Existing triggers and actions

You can refer to the [Flow reference](../../../../../resources/references/core-reference/flow-reference) to read triggers and actions detail.

## Create custom flow action

To create a custom flow action, firstly, you need to create a plugin and install it. Refer to the [Plugin Base Guide](../../plugin-base-guide) to do it. For instance, create a plugin named `SwagCreateTagAction`. You have to implement both backend (PHP) code and a user interface in the Administration to manage it. Let's start with the PHP part first, which handles the main logic of our action. Later, another example demonstrates to show your new actions in the Administration.

## Creating flow action in PHP

### Create new Aware interface

 First of all, we need to define an aware interface for your own action. I intended to create the `CreateTagAction`, so I need to create a related aware named `TagAware`, will be placed in directory `<plugin root>/src/Core/Framework/Event`. Our new interface has to extend from interfaces `Shopware\Core\Framework\Event\FLowEventAware`:

```php
// <plugin root>/src/Core/Framework/Event/TagAware.php
<?php declare(strict_types=1);
namespace Swag\CreateTagAction\Core\Framework\Event;

use Shopware\Core\Framework\Event\FlowEventAware;
use Shopware\Core\System\Tag\TagEntity;

interface TagAware extends FlowEventAware
{
    ...

    public const TAG = 'tag';

    public const TAG_ID = 'tagId';

    public function getTag(): TagEntity;

    ...
}
```

### Create new action

In this example, we will name it `CreateTagAction`. It will be placed in the directory `<plugin root>/src/Core/Content/Flow/Dispatching/Action`. Below you can find an example implementation:

::: info
  Available starting with Shopware 6.4.6.0
:::

Our new class has to extend from the abstract class `Shopware\Core\Framework\Event\FLowEvent`.

```php
// <plugin root>/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php
<?php declare(strict_types=1);

namespace Swag\CreateTagAction\Core\Content\Flow\Dispatching\Action;

use Shopware\Core\Content\Flow\Dispatching\Action\FlowAction;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Uuid\Uuid;
use Swag\CreateTagAction\Core\Framework\Event\TagAware;
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

You also need to register this action in the container as a service. Make sure to define a tag `<tag name="flow.action" priority="600">` at `<plugin root>/src/Resources/config/services.xml`, so that your action would be added to response of *`/api/_info/flow-actions.json`* API and `priority` will decide the order of action of API response:

::: info
  Available starting with Shopware 6.4.6.0
:::

```xml
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\CreateTagAction\Core\Content\Flow\Dispatching\Action\CreateTagAction">
    <argument type="service" id="tag.repository" />
    <tag name="kernel.event_subscriber"/>
    <tag name="flow.action" priority="600"/>
</service>
```

Now your own action is created completely. Let's go to the next step.

### Define action scope

In this step, you will know how to define your action scope for `CreateTagAction`.
There are three scopes for the `CreateTagAction`:

- Available for all already Events.
- Available for only one or multiple already Events.
- Available for new event (new event from this plugin).

#### The `CreateTagAction` available for all already Events

- Just define the empty array in `CreateTagAction::requirements`

```php
// <plugin root>/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php
    ...

    public function requirements(): array
    {
        return [];
    }

    ...
```

That means when you define the requirements like the code above, all triggers in the flow builder can define the action `CreateTagAction` for the next progress.

![Flow Builder trigger](../../../../../.gitbook/assets/flow-builder-action-available-all-events.png)

- The action name is empty as the action name snippet is not yet defined.

#### The `CreateTagAction` available for only one or multiple already Events

- Make the `CreateTagAction` available for all events relate to Order, Customer

```php
// <plugin root>/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php
    ...

    public function requirements(): array
    {
        return [OrderAware::class, CustomerAware::class];
    }

    ...
```

#### The `CreateTagAction` available for new event

- For this case, you can define a new event and make the `CreateTagAction` available for this event.

- Event must implement the `TagAware`

```php
// <plugin root>/src/Core/Content/Event/BasicExampleEvent.php
<?php declare(strict_types=1);
namespace Swag\CreateTagAction\Core\Content\Event;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\BusinessEventInterface;
use Shopware\Core\Framework\Event\EventData\EntityType;
use Shopware\Core\Framework\Event\EventData\EventDataCollection;
use Shopware\Core\System\Tag\TagDefinition;
use Shopware\Core\System\Tag\TagEntity;
use Swag\CreateTagAction\Core\Framework\Event\TagAware;
use Symfony\Contracts\EventDispatcher\Event;

class BasicExampleEvent extends Event implements TagAware, BusinessEventInterface
{
    public const EVENT_NAME = 'example.event';

    private TagEntity $tag;

    private Context $context;

    public function __construct(Context $context, TagEntity $tag)
    {
        $this->tag = $tag;
        $this->context = $context;
    }

    public function getName(): string
    {
        return self::EVENT_NAME;
    }

    public static function getAvailableData(): EventDataCollection
    {
        return (new EventDataCollection())
            ->add('tag', new EntityType(TagDefinition::class));
    }

    public function getContext(): Context
    {
        return $this->context;
    }

    public function getTag(): TagEntity
    {
        return $this->tag;
    }
}
```

- Define the `TagAware` in `CreateTagAction::requirements`

```php
// <plugin root>/src/Core/Content/Flow/Dispatching/Action/CreateTagAction.php
    ...

    public function requirements(): array
    {
        return [TagAware::class];
    }

    ...
```

- To show the new event in Flow Builder Triggers list

```php
// <plugin root>/src/Core/Content/Subscriber/BusinessEventCollectorSubscriber.phpp
<?php declare(strict_types=1);
namespace Swag\CreateTagAction\Core\Content\Subscriber;

use Shopware\Core\Framework\Event\BusinessEventCollector;
use Shopware\Core\Framework\Event\BusinessEventCollectorEvent;
use Swag\CreateTagAction\Core\Content\Event\BasicExampleEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class BusinessEventCollectorSubscriber implements EventSubscriberInterface
{
    private BusinessEventCollector $businessEventCollector;

    public function __construct(BusinessEventCollector $businessEventCollector)
    {
        $this->businessEventCollector = $businessEventCollector;
    }

    public static function getSubscribedEvents()
    {
        return [
            BusinessEventCollectorEvent::NAME => 'onAddExampleEvent',
        ];
    }

    public function onAddExampleEvent(BusinessEventCollectorEvent $event): void
    {
        $collection = $event->getCollection();

        $definition = $this->businessEventCollector->define(BasicExampleEvent::class);

        if (!$definition) {
            return;
        }

        $collection->set($definition->getName(), $definition);
    }
}
```

And don't forget to register your subscriber to the container at `<plugin root>/src/Resources/config/services.xml`.

```xml
// <plugin root>/src/Resources/config/services.xml
<service id="Swag\CreateTagAction\Core\Content\Subscriber\BusinessEventCollectorSubscriber">
    <argument type="service" id="Shopware\Core\Framework\Event\BusinessEventCollector"/>
    <tag name="kernel.event_subscriber"/>
</service>
```

- Define the Event snippet

```js
// <plugin root>/src/Resources/app/administration/src/module/sw-flow/snippet/en-GB.jsonon
{
  "sw-flow": {
    "triggers": {
      "example": "Example",
      "event": "Event"
    }
  }
}
```

![Flow Builder trigger](../../../../../.gitbook/assets/flow-builder-triggers-list.png)

Well done, you have successfully created your custom action in Backend in PHP. Now, you can choose the new event in the Flow Builder triggers list and see the new action after setting the trigger for the new flow.

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

First, define an action name in `create-tag-action.constant.js`. To be consistent with the custom action defined in the PHP code, also create a constant called `CREATE_TAG` to represent `action.create.tag`, which gets from the response of `/api/_info/flow-actions.json`.

![Flow Builder action services list](../../../../../.gitbook/assets/flow-builder-action-sevices-list.png)

```jsx
// <plugin root>/src/Resources/app/administration/src/constant/create-tag-action.constant.js
export const ACTION = Object.freeze({
    CREATE_TAG: 'action.create.tag',
});

export const GROUP = 'customer'

export default {
    ACTION, GROUP
};
```

**Grouping Actions**

Using the `GROUP` constant, you can define a group that your action will show up in. The default group is `general`.

| Group Name | Group Headline |
| :--- | :--- |
| general | General|
| tag | Tag |
| customer | Customer |
| order | Order |

Next, we override `sw-flow-sequence-action` component to show `CREATE_TAG` label in action list. For example, we override `getActionTitle` method to add icon, label for `CREATE_TAG` action.

```jsx
// <plugin root>/src/Resources/app/administration/src/extension/sw-flow-sequence-action/index.js
import { ACTION, GROUP } from '../../constant/create-tag-action.constant';

const { Component } = Shopware;

Component.override('sw-flow-sequence-action', {
    computed: {
        // Not necessary if you use an existing group
        // Push the `groups` method in computed if you are defining a new group
        groups() {
             this.actionGroups.unshift(GROUP);

            return this.$super('groups');
        },
    },

    methods: {
        getActionTitle(actionName) {
            if (actionName === ACTION.CREATE_TAG) {
                return {
                    value: actionName,
                    icon: 'regular-tag',
                    label: this.$tc('create-tag-action.titleCreateTag'),
                    group: GROUP,
                }
            }

            return this.$super('getActionTitle', actionName);
        },
    },
});
```

```jsx
// <plugin root>/src/Resources/app/administration/src/main.js
import './extension/sw-flow-sequence-action';
```

```js
// <plugin root>/src/Resources/app/administration/src/snippet/en-GB.jsonon
{
    "create-tag-action": {
        "titleCreateTag": "Create tag",
        "labelTags": "Tags",
        "buttonSaveAction": "Save action",
        "buttonAddAction": "Add action",
        "descriptionTags": "Tags: {tags}"
    }
}
```

Here is the result for the after the **Step 1**.

![Choose a Flow Builder Action](../../../../../.gitbook/assets/flow-builder-trigger-action.png)

At this step, it may be affected by the cache, it may not display properly. Please clear cache and watch or build the js again to display correctly.

### Step 2: Add configuration for action

First, we customise `modalName` for the configuration modal, add an `actionDescription` computed property and create the `getCreateTagDescription` method to show action the configuration description.

```jsx
// <plugin root>/src/Resources/app/administration/src/extension/sw-flow-sequence-action/index.js
import { ACTION, GROUP } from '../../constant/create-tag-action.constant';

const { Component } = Shopware;

Component.override('sw-flow-sequence-action', {
    computed: {
        modalName() {
            if (this.selectedAction === ACTION.CREATE_TAG) {
                return 'sw-flow-create-tag-modal';
            }

            return this.$super('modalName');
        },

        actionDescription() {
            const actionDescriptionList = this.$super('actionDescription');

            return {
                ...actionDescriptionList,
                [ACTION.CREATE_TAG] : (config) => this.getCreateTagDescription(config),
            };
        },
    },

    methods: {
        getCreateTagDescription(config) {
            const tags = config.tags.join(', ');

           return this.$tc('create-tag-action.descriptionTags', 0, {
                tags
            });
        },

        getActionTitle(actionName) {
            if (actionName === ACTION.CREATE_TAG) {
                return {
                    value: actionName,
                    icon: 'regular-tag',
                    label: this.$tc('create-tag-action.titleCreateTag'),
                    group: GROUP,
                }
            }

            return this.$super('getActionTitle', actionName);
        },
    },
});
```

Then, we need a modal to save your action config. For example, we create a component `sw-flow-create-tag-modal`.

#### JavaScript file

```jsx
// <plugin root>/src/Resources/app/administration/src/component/sw-flow-create-tag-modal/index.js
import template from './sw-flow-create-tag-modal.html.twig';
const { Component } = Shopware;

Component.register('sw-flow-create-tag-modal', {
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

```html
// <plugin root>/src/Resources/app/administration/src/component/sw-flow-create-tag-modal/sw-flow-create-tag-modal.html.twig
{% block create_tag_action_modal %}
<sw-modal
    class="create-tag-action-modal"
    :title="$tc('create-tag-action.titleCreateTag')"
    @modal-close="onClose"
>
    {% block create_tag_action_modal_content %}
        <sw-multi-tag-select
            v-model="tags"
            :label="$tc('create-tag-action.labelTags')"
        />
    {% endblock %}

    {% block create_tag_action_modall_footer %}
        <template #modal-footer>
            {% block create_tag_action_modal_footer_cancel_button %}
                <sw-button
                    class="create-tag-action-modal__cancel-button"
                    size="small"
                    @click="onClose"
                >
                    {{ $tc('global.default.cancel') }}
                </sw-button>
            {% endblock %}

            {% block create_tag_action_modal_footer_save_button %}
                <sw-button
                    class="create-tag-action-modal__save-button"
                    variant="primary"
                    size="small"
                    @click="onAddAction"
                >
                    {{ sequence.id
                    ? $tc('create-tag-action.buttonSaveAction')
                    : $tc('create-tag-action.buttonAddAction') }}
                </sw-button>
            {% endblock %}
        </template>
    {% endblock %}
</sw-modal>
{% endblock %}
```

```jsx
// <plugin root>/src/Resources/app/administration/src/main.js
import './extension/sw-flow-sequence-action';
import './component/sw-flow-create-tag-modal';
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
            if (value === ACTION.CREATE_TAG) {
                this.selectedAction = ACTION.CREATE_TAG;
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
