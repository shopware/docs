---
nav:
  title: Rate Limiter
  position: 10

---

# Rate Limiter

::: info
This functionality is available starting with Shopware 6.4.6.0.
:::

## Overview

Shopware 6 provides certain rate limits by default that reduces the risk of brute-force attacks for pages like login or password reset.

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

::: info
The following optional limiters are available starting with Shopware 6.7.10.0.
:::
- `login_user`: Storefront / Store-API customer authentication per email address, regardless of IP.
- `login_client`: Storefront / Store-API customer authentication per IP address, regardless of email.
- `oauth_user`: API oauth authentication / Administration login per username, regardless of IP.
- `oauth_client`: API oauth authentication / Administration login per IP address, regardless of username.


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
