# Plugins

Plugins in Shopware are essentially an extension of [Symfony bundles](https://symfony.com/doc/current/bundles.html#creating-a-bundle). Such bundles and plugins can provide their own resources like assets, controllers, services or tests. To reduce friction when programming plugins for Shopware, there's an abstract [base class](../../guides/plugins/plugins/plugin-base-guide.md#create-your-first-plugin), which every plugin extends from - the plugin base class. In this class there are helper methods to initialize parameters like the plugin's name and root path in the dependency injection container. Also, each plugin is represented as a composer package and may for example define dependencies this way.

Plugins are deeply integrated into Shopware. You can do nearly _everything_ with plugins, like "new User Provider" or "custom Search Engine".

{% hint style="warning" %}
Plugins are not compatible with Shopware Cloud! If you want to extend Shopware Cloud you need an [App](apps-concept.md).
{% endhint %}

Learn more about plugins in the Plugin Base Guide:

{% page-ref page="../../guides/plugins/plugins/plugin-base-guide.md" %}

