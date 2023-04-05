# Add Scheduled Task

## Overview

Quite often one might want to run any type of code on a regular basis, e.g. to clean up very old entries every once in a while, automatically. Usually known as "Cronjobs", Shopware 6 supports a `ScheduledTask` for this.

## Prerequisites

This guide is built upon our [plugin base guide](../plugin-base-guide), but that one is not mandatory. Knowing how the `services.xml` file in a plugin works is also helpful, which will be taught in our guides about [Dependency Injection](dependency-injection) and [Creating a service](add-custom-service). It is shortly explained here as well though, so no worries!

::: info
Refer to this video on **[Adding scheduled tasks](https://www.youtube.com/watch?v=88S9P3x6wYE)**. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Registering scheduled task in the DI container

A `ScheduledTask` and its respective `ScheduledTaskHandler` are registered in a plugin's `services.xml`. For it to be found by Shopware 6 automatically, you need to place the `services.xml` file in a `Resources/config/` directory, relative to the location of your plugin's base class. The path could look like this: `<plugin root>/src/Resources/config/services.xml`.

Here's an example `services.xml` containing a new `ScheduledTask` as well as a new `ScheduledTaskHandler`:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <services>
        <service id="Swag\BasicExample\Service\ScheduledTask\ExampleTask">
            <tag name="shopware.scheduled.task" />
        </service>
        <service id="Swag\BasicExample\Service\ScheduledTask\ExampleTaskHandler">
            <argument type="service" id="scheduled_task.repository" />
            <tag name="messenger.message_handler" />
        </service>
    </services>
</container>
```

Note the tags required for both the task and its respective handler, `shopware.scheduled.task` and `messenger.message_handler`. Your custom task will now be saved into the database once your plugin is activated.

## ScheduledTask and its handler

As you might have noticed, the `services.xml` file tries to find both the task itself as well as the new task handler in a directory called `Service/ScheduledTask`. This naming is up to you, Shopware 6 decided to use this name though.

Here's the an example `ScheduledTask`:

```php
// <plugin root>/src/Service/ScheduledTask/ExampleTask.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service\ScheduledTask;

use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTask;

class ExampleTask extends ScheduledTask
{
    public static function getTaskName(): string
    {
        return 'swag.example_task';
    }

    public static function getDefaultInterval(): int
    {
        return 300; // 5 minutes
    }
}
```

Your `ExampleTask` class has to extend from the `Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTask` class, which will force you to implement two methods:

* `getTaskName`: The technical name of your task. Make sure to add a vendor prefix to your custom task, to prevent collisions with other plugin's scheduled tasks. In this example this is `swag`.
* `getDefaultInterval`: The interval in seconds at which your scheduled task should be executed.

And that's it for the `ExampleTask` class.

Following will be the respective task handler:

```php
// <plugin root>/src/Service/ScheduledTask/ExampleTaskHandler.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service\ScheduledTask;

use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskHandler;

class ExampleTaskHandler extends ScheduledTaskHandler
{
    public static function getHandledMessages(): iterable
    {
        return [ ExampleTask::class ];
    }

    public function run(): void
    {
        file_put_contents('some/where/some/file.md', 'example');
    }
}
```

The respective task handler, `ExampleTaskHandler` as defined previously in your `services.xml`, has to extend from the class `Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskHandler`. This also comes with two methods, that you need to implement first:

* `getHandledMessages`: An iterable, or an array, of the scheduled tasks, that this handler will take care of. In this case this is only the `ExampleTask` class.
* `run`: This method is executed once your scheduled task is executed. Do everything, that your task is supposed to do here. In this example, it will just create a new file.

Now every five minutes, your task will be executed and it will print an output every time now.

## Executing the scheduled task

Usually scheduled tasks are registered when installing or updating your plugin. If you don't want to reinstall your plugin in order to register your scheduled task, you can also use the following command to achieve this:
 `bin/console scheduled-task:register`

In order to properly test your scheduled task, you first have to run the command `bin/console scheduled-task:run`. This will start the `ScheduledTaskRunner`, which takes care of your scheduled tasks and their respective timings. It will dispatch a message to the message bus once your scheduled task's interval is due.

Now you still need to run the command `bin/console messenger:consume` to actually execute the dispatched messages. Make sure, that the `status` of your scheduled task is set to `scheduled` in the `scheduled_task` table, otherwise it won't be executed. This is not necessary, when you're using the admin worker.

## More interesting topics

* [Adding a custom command](add-custom-commands)
