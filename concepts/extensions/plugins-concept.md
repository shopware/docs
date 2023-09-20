---
nav:
  title: Plugins
  position: 20

---

# Plugins

Plugins in Shopware are essentially an extension of [Symfony bundles](https://symfony.com/doc/current/bundles.html#creating-a-bundle). Such bundles and plugins can provide their own resources like assets, controllers, services, or tests. To reduce friction when programming plugins for Shopware, there is an abstract [Base class](../../guides/plugins/plugins/plugin-base-guide#create-your-first-plugin), which every plugin extends from the plugin base class. In this class, there are helper methods to initialize parameters like the plugin's name and root path in the dependency injection container. Also, each plugin is represented as a Composer package and may for example, define dependencies this way.

Plugins are deeply integrated into Shopware. You can do nearly everything with plugins, like "new User Provider" or "custom Search Engine".

::: warning
Plugins are not compatible with Shopware cloud stores. To extend Shopware cloud stores, you need an [App](apps-concept).
:::

Learn more about plugins from the [Plugin base guide](../../guides/plugins/plugins/plugin-base-guide)
