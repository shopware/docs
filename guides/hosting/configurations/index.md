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
