# Creating own permissions via plugin

This article explains how to create custom permissions using an app.

To add a new permission via an app, you need to use the app [script hook](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md) `b2b-role-permissions` in conjunction with app scripting:

{% code title="Resources/scripts/b2b-role-permissions/my-own-permissions.twig" %}
{% raw %}

```twig
{% do hook.collection.addPermission('own_entity.read', 'own_entity', []) %}
{% do hook.collection.addPermission('own_entity.edit', 'own_entity', ['own_entity.read']) %}
{% do hook.collection.addPermission('own_entity.create', 'own_entity', ['own_entity.read', 'own_entity.edit']) %}
{% do hook.collection.addPermission('own_entity.delete', 'own_entity', ['own_entity.read', 'own_entity.edit']) %}
```

{% endraw %}
{% endcode %}

The `PermissionCollector` collects the permissions of all app scripts and then passes them to the storefront, where they can be attached to the role by the user.
If you want to check in the template if the user has this permission, the Twig function `isB2bAllowed` can be used:

```twig
{% sw_extends '@Storefront/storefront/page/checkout/checkout-item.html.twig' %}

{{ parent() }}

{% if isB2bAllowed('own_entity.read') %}
...
{% endif  %}
```
