---
nav:
  title: Install and Activate Plugins
  position: 30

---

# Install and Activate Plugins

This guide explains how to install and activate a newly created plugin.

From your Shopware project root directory, refresh the list of plugins:

```bash
bin/console plugin:refresh
```

You should see a list like this:

```bash
Shopware Plugin Service
=======================

 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
  Plugin                         Label                                        Version     Upgrade version   Author                       Installed   Active   Upgradeable
 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
  SwagBasicExample               The displayed readable name for the plugin   1.0.0                         Shopware                     No          No       No
 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
```

This output confirms the plugin was loaded correctly.

::: info
If a warning about the `version` field in `composer.json` appears, it is expected and does not affect the result.
:::

Now install and activate:

```bash
bin/console plugin:install --activate SwagBasicExample
```

This prints the following output:

```bash
Shopware Plugin Lifecycle Service
=================================

 Install 1 plugin(s):
 * The displayed readable name for the plugin (v1.0.0)

 Plugin "SwagBasicExample" has been installed and activated successfully.
```

Your plugin is now installed and active.

## Next steps

Review our [plugin lifecycle](../plugins/plugin-fundamentals/plugin-lifecycle.md) guide next.
