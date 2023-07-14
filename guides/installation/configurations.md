# Configurations

## Overview

When running Shopware 6 there are various configuration options you can use to customize your installation. This page will give you an overview of the different configuration options and how they effect Shopware.

## Configuration

The configuration for Shopware 6 resides in the general bundle configuration:

```text
<project root>
└── config
   └── packages
      └── shopware.yaml
```

## Feature Flags

Some features of Shopware are only activated when the corresponding feature flag is enabled. Feature flags can be enabled in your project's `.env` file:

{% code title="<project root>/.env" %}

```shell
STOCK_HANDLING=1
```

{% endcode %}
