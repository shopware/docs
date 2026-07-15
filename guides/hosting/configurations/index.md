---
nav:
  title: Configurations
  position: 20

---

# Configurations

## Overview

When running Shopware 6 there are various configuration options you can use to customize your installation.

## Configuration

The configuration for Shopware 6 resides in the general bundle configuration:

```text
<project root>
└── config
   └── packages
      └── shopware.yaml
```

If you want to aim at a specific environment, you can create a configuration file for that as follows:

```text
<project root>
└── config
   └── packages
      └── dev
         └── mailer.yaml
```

```text
<project root>
└── config
   └── packages
      └── prod
         └── mailer.yaml
```

For more information on environment-specific configurations, check out the [Symfony Configuration Environments](https://symfony.com/doc/current/configuration.html#configuration-environments) section.

## Available options

Use the following command to display all Shopware configuration options and their default values for your installed version:

```bash
bin/console config:dump-reference shopware
```

## Runtime environment variables

Symfony environment variable placeholders, such as `%env(int:CART_EXPIRE_DAYS)%`, are resolved at runtime. They cannot be used for Shopware configuration options that enforce a positive minimum value while the service container is compiled. Symfony validates these options against an integer placeholder value of `0`, which fails the minimum-value constraint.

The following options are affected (depending on your Shopware version and its configuration constraints):

- `shopware.filesystem.batch_write_size`
- `shopware.sitemap.batchsize`
- `shopware.media.presigned_upload.expiration_minutes`
- `shopware.dal.batch_size`
- `shopware.dal.max_rule_prices`
- `shopware.dal.versioning.expire_days`
- `shopware.cart.expire_days`
- `shopware.order.deep_link.expire_days`
- `shopware.sales_channel_context.expire_days`
- `shopware.product.search_keyword.relevant_keyword_count`
- `shopware.mcp.app_tool_timeout`

Configure these options with literal values in `config/packages/shopware.yaml` or an environment-specific configuration file instead of using `%env(...)%` placeholders.
