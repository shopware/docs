---
nav:
  title: Plugin lifecycle methods
  position: 140

---

# Plugin Lifecycle Methods

## Overview

A Shopware plugin can be installed, activated, deactivated and then again uninstalled. Those are some plugin lifecycle methods, which will be covered a bit more in this guide.

## Prerequisites

This guide is built upon our [plugin base guide](../plugin-base-guide), which explains the basics of a plugin as a whole. Make sure to have a look at it to get started on building your first plugin.

## Lifecycle methods

Each of the followings methods are going to be part of the plugin bootstrap, in this example the file will be `<plugin root>/src/SwagBasicExample.php`, which is the bootstrap file of the previously mentioned plugin base guide.

Throughout all of the lifecycle methods, you have access to the [service container](dependency-injection) via `$this->container`.

### Install

The install method of a plugin is executed when the plugin is installed. You can use this method to install all the necessary requirements for your plugin, e.g. a new payment method.

```php
// <plugin root>/src/SwagBasicExample
public function install(InstallContext $context): void
{
    // Do stuff such as creating a new payment method
}
```

In your install method, you have access to the `InstallContext`, which provides information such as:

* The current plugin version
* The current Shopware version
* The `Context`, which provides a lot more of system information, e.g. the currently used language
* A collection of the [plugin migrations](database-migrations)
* If the migrations should be executed \(`isAutoMigrate` or `setAutoMigrate` to prevent the execution\)

::: info
You maybe don't want to create new data necessary for your plugin in the `install` method, even though it seems to be the perfect place. That's because an installed plugin is not automatically active yet - hence some data changes would have an impact on the system before the plugin is even active and therefore functioning. A good rule of thumb is: Only install new data or entities, that can be activated or deactivated themselves, such as a payment method. This way you can create a new payment method in the `install` method, but keep it inactive for now.
:::

### Uninstall

The opposite of the `install` method. It gets executed once the plugin is uninstalled. You might want to remove the data, that your plugin created upon installation.

::: warning
You can't simply remove everything that your plugin created previously. Think about a new payment method, that your plugin created and which was then used for actual orders. If you were to remove this payment method when uninstalling the plugin, all the orders that used this payment method would be broken, since the system wouldn't find the used payment method anymore. In this case, you most likely just want to deactive the respective entity, if possible. Be careful here!
:::

```php
// <plugin root>/src/SwagBasicExample
public function uninstall(UninstallContext $context): void
{
    // Remove or deactivate the data created by the plugin
}
```

The `uninstall` method comes with the `UninstallContext`, which offers the same information as the `install` method. There's one more very important information available with the `UninstallContext`, which is the method `keepUserData`.

#### Keeping user data upon uninstall

When uninstalling a plugin, the user is asked if he really wants to delete all the plugin data. The method `keepUserData` of the `UninstallContext` will provide the users decision. If `keepUserData` returns `true`, you should **not** remove important data of your plugin, the user wants to keep them.

```php
// <plugin root>/src/SwagBasicExample
public function uninstall(UninstallContext $context): void
{
    parent::uninstall($context);

    if ($context->keepUserData()) {
        return;
    }

    // Remove or deactivate the data created by the plugin
}
```

::: info
Refer to this video on **[Uninstalling a plugin](https://www.youtube.com/watch?v=v9OXrUJzC1I)** dealing with plugin uninstall routines. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

### Activate

The `activate` method is executed once the plugin gets actually activated. You most likely want to do one of the following things here:

* Activate entities that you created in the install method, e.g. such as a payment method
* Create new entities or data, that you couldn't create in the install method

```php
// <plugin root>/src/SwagBasicExample
public function activate(ActivateContext $context): void
{
    // Activate entities, such as a new payment method
    // Or create new entities here, because now your plugin is installed and active for sure
}
```

The `ActivateContext` provides the same information as the `InstallContext`.

### Deactivate

The opposite of the `activate` method. Its triggered once the plugin deactivates the plugin. This method should mostly do the opposite of the plugin's `activate` method:

* Deactivate entities created by the `install` method
* Maybe remove entities, that cannot be deactivated but would harm the system, if they remained in the system while the plugin

  is inactive

```php
// <plugin root>/src/SwagBasicExample
public function deactivate(DeactivateContext $context): void
{
    // Deactivate entities, such as a new payment method
    // Or remove previously created entities
}
```

The `DeactivateContext` provides the same information as the `InstallContext`.

### Update

The `update` method is executed once your plugin gets updated to a new version. You do not need to update database entries here, since this should be done via [plugin migrations](database-migrations). Otherwise you'd have to check if this specific update to an entity was already done in a previous `update` method execution, mostly by using plugin version conditions.

However, of course you can still do that if necessary. Also, non-database updates can be done here.

```php
// <plugin root>/src/SwagBasicExample
public function update(UpdateContext $context): void
{
    // Update necessary stuff, mostly non-database related
}
```

The `UpdateContext` provides the same information as the `InstallContext`, but comes with one more method. In order to get the new plugin version, you can use the method `getUpdatePluginVersion` in contrast to the `getCurrentPluginVersion`, which will return the currently installed plugin version.

### PostInstall and PostUpdate methods

There are two more lifecycle methods, that are worth mentioning: `PostUpdate` and `PostInstall`, which are executed **after** the respective process of installing or updating your plugin is fully and successfully done.

```php
// <plugin root>/src/SwagBasicExample
public function postInstall(InstallContext $installContext): void
{
}

public function postUpdate(UpdateContext $updateContext): void
{
}
```
