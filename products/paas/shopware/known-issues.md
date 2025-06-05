---
nav:
  title: Known issues
  position: 60
---

# Known Issues

This document outlines acknowledged issues with Shopware PaaS, including workarounds if known.

## Size of messages for the message queue

Currently, Shopware does not prevent bigger messages, but will do so with the next major version 6.7. Ensure the messages you are sending do not exceed this limit. Check your local log files for this [critical log message](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/MessageQueue/Subscriber/MessageQueueSizeRestrictListener.php#L48)

## Plugins should support S3 compatible storage

Some third-party plugin providers may not currently support S3 compatible storage solutions. Such plugins cannot be used in Shopware PaaS since we use S3 compatible storage as the media storage backend. If you encounter such a situation, consider visiting the plugin’s documentation or contact the developer directly to verify whether the plugin supports remote storage via S3 or a compatible service and if there are any known workarounds or planned updates for S3 support.
