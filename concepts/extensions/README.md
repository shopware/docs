# Extensions

In order to provide users \(i.e. developers\) with a clear abstraction, Shopware consists of a core which designed in a way that allows for a lot of **extensibility** without sacrificing maintainability or structural integrity. Some of those concepts were already introduced in the [Frameworks](../framework/) section.

## Apps

![](../../.gitbook/assets/app-extension-model.png)

Starting with Shopware 6.4.0.0, we introduced a new way to extend Shopware using the newly created app system. Apps are not executed within the process of the Shopware core, but are notified about events via Webhooks which they can register. They can modify and interact with Shopware resources through the [Admin REST API](https://shopware.stoplight.io/docs/admin-api).

[Learn more about apps](apps-concept.md)

## Plugins

![](../../.gitbook/assets/plugin-extension-model.png)

Plugins are executed within the Shopware core process and can react to events, execute custom code or extend services. They have direct access to the database, though there are guidelines in place to ensure update-compatibility, such as a service facade or database migrations.

{% hint style="warning" %}
**Plugins & Shopware Cloud**

Due to their direct access to the Shopware process and the database, plugins are not supported by Shopware Cloud. 
{% endhint %}

[Learn more about plugins](plugins-concept.md)

# Start Coding

Refer to our Guides section to learn how to use both extension systems, and also how they differ:

{% page-ref page="../../guides/plugins/" %}

