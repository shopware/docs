# Rate Limiter

## Overview

Shopware 6 provides certain rate limits by default that reduces the risk of bruteforce attacks for pages like login or password reset.

## Configuration

The configuration for the rate limiter of Shopware 6 resides in the general bundle configuration:

```text
<shop root>
└── config
   └── packages
      └── shopware.yml
```

To configure the default rate limiters for your shop, you need to add the `shopware.api.rate_limiter` map to the `shopware.yml`. Under this key, you can separately define the rate limiters.

In the following, you can find a list of the default limiters:

- `login`: Storefront / Store-API customer authentication.
- `guest_login`: Storefront / Store-API after order guest authentication.
- `oauth`: API oauth authentication / Administration login.
- `reset_password`: Storefront / Store-API customer password reset.
- `user_recovery`: Administration user password recovery.
- `contact_form`: Storefront / Store-API contact form.

```yaml
// <shop root>/config/packages/shopware.yaml
shopware:
  api:
    rate_limiter:
      login:
        enabled: false
      oauth:
        enabled: true
        policy: 'time_backoff'
        reset: '24 hours'
        limits:
          - limit: 3
            interval: '10 seconds'
          - limit: 5
            interval: '60 seconds'
```

### Configuring time backoff policy

The `time_backoff` policy is built by Shopware itself. It enables you to throttle the request in multiple steps with different waiting times.
Below you can find an example which throttles the request for 10 seconds after 3 requests and starting from 5 requests it always
throttles for 60 seconds. If there are no more requests, it will be reset after 24 hours.

```yaml
// <plugin root>/src/Resources/config/rate_limiter.yaml
example_route:
    enabled: true
    policy: 'time_backoff'
    reset: '24 hours'
    limits:
        - limit: 3
          interval: '10 seconds'
        - limit: 5
          interval: '60 seconds'
```
