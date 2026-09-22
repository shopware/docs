---
nav:
  title: Logging
  position: 10

---

# Logging

## Overview

Monolog is the logging library for PHP.
It is used by Shopware to log errors and debug information.
The log files are located in the `var/log` directory of your Shopware installation.

## Configuration

Configuration of Monolog is done in the `config/packages/prod/monolog.yaml` file.
The following example shows the default configuration:

<<< @/docs/snippets/config/monolog.yaml

## Filter and tune Shopware logs

Shopware provides additional logging controls in `config/packages/shopware.yaml`:

```yaml
shopware:
  logger:
    error_code_log_levels:
      CHECKOUT__CUSTOMER_AUTH_BAD_CREDENTIALS: notice
    exclude_exception:
      - App\Exception\ExpectedException
    exclude_events:
      - app.noisy.event
    file_rotation_count: 30
```

`error_code_log_levels` changes the severity of `ShopwareHttpException` records by error code.
`exclude_exception` drops exact exception classes, while `exclude_events` suppresses selected business event records.
Both exclusion lists extend Shopware's defaults.
`file_rotation_count` controls how many rotated log files are retained.

Use exclusions sparingly to avoid hiding actionable failures.

`shopware.logger.enforce_throw_exception`, also available through `LOGGER_ENFORCE_THROW_EXCEPTION=1`, makes code paths using `ExceptionLogger` rethrow after logging in production.
This is useful for diagnostics but changes runtime behavior.

## Log levels

Monolog supports the following log levels:

- `DEBUG`: Detailed debug information.
- `INFO`: Interesting events. Examples: User logs in, SQL logs.
- `NOTICE`: Normal but significant events.
- `WARNING`: Exceptional occurrences that are not errors.
Examples: Use of deprecated APIs, poor use of an API, undesirable things that are not necessarily wrong.
- `ERROR`: Runtime errors that do not require immediate action but should typically be logged and monitored.
- `CRITICAL`: Critical conditions. Example: Application component unavailable, unexpected exception.
- `ALERT`: Action must be taken immediately. Example: Entire website down, database unavailable, etc.
This should trigger the SMS alerts and wake you up.
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
