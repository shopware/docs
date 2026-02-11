---
nav:
  title: Add scheduled task
  position: 100

---

# Add Scheduled Task

## Overview

Quite often one might want to run any type of code on a regular basis, e.g. to clean up very old entries every once in a while, automatically. Usually known as "Cronjobs", Shopware 6 supports a `ScheduledTask` for this.

## Prerequisites

This guide is built upon our [plugin base guide](../plugin-base-guide), but that one is not mandatory. Knowing how the `services.php` file in a plugin works is also helpful, which will be taught in our guides about [Dependency Injection](dependency-injection) and [Creating a service](add-custom-service). It is shortly explained here as well though, so no worries!

::: info
Refer to this video on **[Adding scheduled tasks](https://www.youtube.com/watch?v=88S9P3x6wYE)**. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Registering scheduled task in the DI container

With `autoconfigure` enabled in your `services.php`, both `ScheduledTask` and `ScheduledTaskHandler` classes are automatically detected and registered. The `ScheduledTask` is automatically tagged with `shopware.scheduled.task`, and the `#[AsMessageHandler]` attribute on the handler takes care of message handler registration.

No explicit service configuration is required — simply create your classes and they will be picked up automatically.

## ScheduledTask and its handler

Here's an example `ScheduledTask`:

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
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(handles: ExampleTask::class)]
class ExampleTaskHandler extends ScheduledTaskHandler
{
    public function run(): void
    {
        // ...
    }
}
```

The task handler, `ExampleTaskHandler`, is annotated with `#[AsMessageHandler]` handling the `ExampleTask` class. In addition, the `ScheduledTaskHandler` has to extend from the class `Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskHandler`. This also comes with one method that you need to implement first:

* `run`: This method is executed once your scheduled task is executed. Do everything, that your task is supposed to do here. In this example, it will just create a new file.

Now every five minutes, your task will be executed and it will print an output every time now.

## Executing the scheduled task

Usually scheduled tasks are registered when installing or updating your plugin. If you don't want to reinstall your plugin in order to register your scheduled task, you can also use the following command to achieve this:
 `bin/console scheduled-task:register`

In order to properly test your scheduled task, you first have to run the command `bin/console scheduled-task:run`. This will start the `ScheduledTaskRunner`, which takes care of your scheduled tasks and their respective timings. It will dispatch a message to the message bus once your scheduled task's interval is due.

Now you still need to run the command `bin/console messenger:consume` to actually execute the dispatched messages. Make sure, that the `status` of your scheduled task is set to `scheduled` in the `scheduled_task` table, otherwise it won't be executed. This is not necessary, when you're using the admin worker.

<!--@include: ../../../../snippets/guide/debugging_scheduled_tasks.md-->

## More interesting topics

* [Adding a custom command](add-custom-commands)
