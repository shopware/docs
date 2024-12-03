---
nav:
  title: Logging
  position: 10

---

# Logging

## Overview

Monolog is the logging library for PHP. It is used by Shopware to log errors and debug information. The log files are located in the `var/log` directory of your Shopware installation.

## Configuration

Configuration of Monolog is done in the `config/packages/prod/monolog.yaml` file. The following example shows the default configuration:

<<< @/docs/snippets/config/monolog.yaml

## Log levels

Monolog supports the following log levels:

- `DEBUG`: Detailed debug information.
- `INFO`: Interesting events. Examples: User logs in, SQL logs.
- `NOTICE`: Normal but significant events.
- `WARNING`: Exceptional occurrences that are not errors. Examples: Use of deprecated APIs, poor use of an API, undesirable things that are not necessarily wrong.
- `ERROR`: Runtime errors that do not require immediate action but should typically be logged and monitored.
- `CRITICAL`: Critical conditions. Example: Application component unavailable, unexpected exception.
- `ALERT`: Action must be taken immediately. Example: Entire website down, database unavailable, etc. This should trigger the SMS alerts and wake you up.
- `EMERGENCY`: Emergency: system is unusable.

## Log sent e-mails and other flow events

To monitor all sent e-mails and other flow events set the `business_event_handler_buffer` to `info` level:

```yaml
monolog:
  handlers:
    business_event_handler_buffer:
      level: info
```

::: info
Be aware that this will cost you some performance.
:::
