---
nav:
  title: Install and activate plugins
  position: 3

---

# Install and activate plugins

This guide explains how to install and activate a newly created plugin.

From your Shopware project root directory, refresh the list of plugins:

```bash
bin/console plugin:refresh
```

A warning about the `version` field of the `composer.json` file might appear; this can be ignored. You should see a list like this:

```bash
Shopware Plugin Service
=======================

 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
  Plugin                         Label                                        Version     Upgrade version   Author                       Installed   Active   Upgradeable
 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
  SwagBasicExample               The displayed readable name for the plugin   1.0.0                         Shopware                     No          No       No
 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
```

This output is a **good sign**, because this means Shopware recognized your plugin successfully.

Now install and activate:

```bash
bin/console plugin:install --activate SwagBasicExample
```

This should print the following output:

```bash
Shopware Plugin Lifecycle Service
=================================

 Install 1 plugin(s):
 * The displayed readable name for the plugin (v1.0.0)

 Plugin "SwagBasicExample" has been installed and activated successfully.
```

If successful, your plugin is now active and ready to use!

## Next steps

Review our [plugin lifecycle](plugin-fundamentals/plugin-lifecycle) guide next.
