---
nav:
  title: Handle asynchronous messages
  position: 40

---

# Handle asynchronous messages

## Overview

::: warning
This guide contains the `async_low_priority` queue which is only available in version 6.5.7.0 and above. You must not configure this queue in older versions as the messenger:consume command will fail.
:::

In this guide you will learn how to handle asynchronous messages and the difference between the asynchronous queues.

## Prerequisites

This guide is built upon the [Add message to queue guide](add-message-to-queue), so you should have read that first.

## Different queues

Currently, there are two different queues for asynchronous messages which allow us to have different prioritized queues as mentioned in [Prioritized Transports](https://symfony.com/doc/current/messenger.html#prioritized-transports). The first one is the `async` queue which can be used if a message implements the `AsyncMessageInterface` as mentioned in [Create a message](add-message-to-queue#create-a-message).  

The second queue is the `async_low_priority` queue which will also handle the messages asynchronously, but with a lower priority, as this queue should be handled once the `async` queue is empty. This queue can be used if a message implements the `AsyncLowPriorityMessageInterface`.  

Here's an example:

```php
// <plugin root>/src/MessageQueue/Message/EmailNotification.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\MessageQueue\Message;

use Shopware\Core\Framework\MessageQueue\AsyncLowPriorityMessageInterface;

class EmailNotification implements AsyncLowPriorityMessageInterface
{
    private string $content;

    public function __construct(string $content)
    {
        $this->content = $content;
    }

    public function getContent(): string
    {
        return $this->content;
    }
}
```

## Retry strategies

Both queues have the same retry strategy. If a message fails to be handled, it will be retried up to 3 times with a starting delay of 1 second, doubling after each retry. After the third retry, the message will be moved to the `failed` queue. 

## More interesting topics

* [Message Queue](add-message-to-queue)
* [Message Handler](add-message-handler)
