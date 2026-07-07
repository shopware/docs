---
nav:
  title: Rate Limiter
  position: 70

---

# Rate Limiter

::: info
This functionality is available starting with Shopware 6.4.6.0.
:::

## Overview

Shopware 6 provides certain rate limits by default that reduces the risk of brute-force attacks for pages like login or password reset.

These rate limiters are always active. You do not need to add the `shopware.api.rate_limiter` map to your `shopware.yml` for them to work. The core already ships with the defaults documented below, and the `shopware.yml` is only used to override them (for example, to raise a limit or disable a limiter).

## Default rate limiters

The following limiters are enabled by default. The values listed here reflect the current Shopware core configuration and may change between versions. When in doubt, the source of truth is `src/Core/Framework/Resources/config/packages/shopware.yaml` in the version you are running.

| Limiter | Protects | Since | Policy | Reset | Limits |
| --- | --- | --- | --- | --- | --- |
| `login` | Storefront / Store-API customer authentication | 6.4.6.0 | `time_backoff` | 24 hours | 10 / 10s, 15 / 30s, 20 / 60s |
| `guest_login` | Storefront / Store-API after-order guest authentication | 6.4.6.0 | `time_backoff` | 24 hours | 10 / 10s, 15 / 30s, 20 / 60s |
| `oauth` | API OAuth authentication / Administration login | 6.4.6.0 | `time_backoff` | 24 hours | 10 / 10s, 15 / 30s, 20 / 60s |
| `reset_password` | Storefront / Store-API customer password reset | 6.4.6.0 | `time_backoff` | 24 hours | 3 / 30s, 5 / 60s, 10 / 90s |
| `user_recovery` | Administration user password recovery | 6.4.6.0 | `time_backoff` | 24 hours | 3 / 30s, 5 / 60s, 10 / 90s |
| `contact_form` | Storefront / Store-API contact form | 6.4.6.0 | `time_backoff` | 24 hours | 3 / 30s, 5 / 60s, 10 / 90s |
| `notification` | Store-API notification endpoint | 6.4.8.0 | `time_backoff` | 24 hours | 10 / 10s, 15 / 30s, 20 / 60s |
| `newsletter_form` | Store-API newsletter registration | 6.4.16.0 | `time_backoff` | 24 hours | 3 / 30s, 5 / 60s, 10 / 90s |
| `cart_add_line_item` | Adding line items to the cart | 6.4.18.0 | `system_config` | 1 hour | Limit read from `core.cart.lineItemAddLimit`, interval 60s |
| `revocation_request_form` | Store-API revocation request form | 6.7.9.0 | `time_backoff` | 24 hours | 3 / 30s, 5 / 60s, 10 / 90s |
| `newsletter_unsubscribe_form` | Store-API newsletter unsubscribe | 6.7.9.0 | `time_backoff` | 24 hours | 3 / 30s, 5 / 60s, 10 / 90s |
| `app_shop_verify` | App shop registration verification | 6.7.9.0 | `sliding_window` | n/a | 60 / 60min |
| `mcp_admin_api` | MCP server Admin API access (keyed per OAuth token) | 6.8.0.0 | `time_backoff` | 1 hour | 300 / 60s, 1000 / 10min |
| `mcp_store_api` | MCP server Store API access (keyed per sales-channel context token) | 6.8.0.0 | `time_backoff` | 1 hour | 120 / 60s, 600 / 10min |

In the table above, `Limits` uses the `limit / interval` notation, and `s` / `min` are seconds / minutes. When you add a new default limiter to the core, add a row here with its introduction version so this table stays complete.

## Configuration

The configuration for the rate limiter of Shopware 6 resides in the general bundle configuration:

```text
<shop root>
└── config
   └── packages
      └── shopware.yml
```

To override the [default rate limiters](#default-rate-limiters) for your shop, you need to add the `shopware.api.rate_limiter` map to the `shopware.yml`. Under this key, you can separately define each rate limiter. Any key you set is merged into the defaults, so you only need to configure the values you want to change.

The following example disables the `login` limiter and overrides the `oauth` limiter:

::: code-group

```yaml [SHOP_ROOT/config/packages/shopware.yaml]
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

:::

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

::: code-group

```yaml [PLUGIN_ROOT/src/Resources/config/rate_limiter.yaml]
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

:::
