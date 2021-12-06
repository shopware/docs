# Flow Builder

Flow Builder is a Shopware automation solution for shop owners with great adaptability and flexibility. With Flow Builder, you can build workflows to automate tasks tailored to your business needs without the programming knowledge.

## Flow
A flow is an automation process in your business. From here, you can specify which actions are triggered by a trigger. In addition, you have the option of defining conditions for these actions, under which the actions are to be executed. If multiple flows with the same trigger, the priority point will decide which flow will perform first.

## Trigger
A trigger is an event that starts the flow which detects the event from our storefront or the application. A trigger could have multiple actions.

## Condition
This is a business rule to determine whether the action should be executed.

## Action
The tasks that execute when the trigger happens or the certain conditions are met. There is a special action called "Stop flow", which will stop any further action below.

## How a flow sequence is evaluated

In Shopware, you have multiple interfaces and classes for different types of events. For Flow Builder those triggers mentioned above are implements from Aware* interface.

Once the action on the Storefront or from app happened, the FlowDispatcher will dispatch FlowEventAware to the FlowExecutor. From here, the FlowExecutor will check the condition to decide whether to execute the action.

![Flow builder concept for flow sequence](../../.gitbook/assets/flow-concept-1.png)

Here is an example flow what happen in system when an order is placed on the Storefront.

![Flow builder concept for order placed](../../.gitbook/assets/flow-concept-2.png)


