# Adding permissions

## Overview

This guide will teach you how to add Access Control Lists to the Shopware 6 Administration. Access Control Lists or ACL in Shopware ensure that you can create individual roles. These roles have finely granular rights, which every shop operator can set up for themselves. They can be assigned to users.

As an example, let's take a look at a role called 'Editor'. We would assign this role rights to edit products, categories and manufacturers. Now, every user who is a 'Editor' would be able to see and edit the specific areas which are defined in the role.

This documentation chapter will cover the following topics:

* What is an admin privilege
* How to register new admin privileges for your plugin
* How to protect your plugin routes
* How to protect your menu entries
* How to add admin snippets for your privileges
* How you can check in your module at any place if the user has the required rights

Note: ACL Rules in the Administration can be circumnavigated by making direct API calls to your backend.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. A basic understanding of the [vue router](https://router.vuejs.org/) is also required. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Admin privileges

Admin privileges are higher-level permissions that are always determined by an explicit identifier. This is made up of a 'key' and the 'role', connected by a dot: `.`.

A distinction is made here between normal `permissions` and `additional_permissions`. Let's start with the normal permissions.

### Normal permissions

![Permissions GUI](../../../../.gitbook/assets/permissions-gui.png)

`permissions`:

* Key: `product`
* Role: `viewer`
* Identifier \(Key + Role\): `product.viewer`

The key describes the higher-level admin privilege. For normal `permissions` this is usually the module name, `product` in this case. Other keys could be for example `manufacturer`, `shopping_experiences` or `customers`. The key is used to group the admin privileges, as seen in the picture above.

The role indicates which authorization is given for the key. So four predefined roles are available for the normal `permissions`:

* `viewer`: The viewer is allowed to view entities
* `editor`: The editor is allowed to edit entities
* `creator`: The Creator is allowed to create new entities
* `deleter`: The Deleter is allowed to delete entities

It is important to note that these combinations are not API permissions. They are only intended to enable, disable, deactivate or hide certain elements in the Administration.

For each admin privilege, the needed entity privileges need to be assigned. Depending on the admin privileges, these can be much more complex. This means that for example if a user should be allowed to view reviews, then they also have to be allowed to view customers, products and sales channels.

### Additional permissions

In addition to the normal `permissions`, which represent CRUD functionality, there are also `additional_permissions`. These are intended for all functions that cannot be represented by CRUD.

![Additional permissions GUI](../../../../.gitbook/assets/additional_permissions-gui.png)

The `additional_permissions` have their own card below the normal permissions grid. An example for `additional_permissions` would be: "clearing the cache". This is an individual action without CRUD functionalities. The key is still used for grouping. Therefore the role can be individual and does not have to follow the scheme.

`additional_permissions`:

* Key: `system`
* Role: `clear_cache`
* Identifier \(Key + Role\): `system.clear_cache`

## Register admin privilege

The privilege service is used to handle privileges in the Administration. Those privileges will then be displayed in the Users & Permissions module under the roles.

Privileges can be added or extended with the Method `addPrivilegeMappingEntry` of the privilege service:

| Property | Description |
| :--- | :--- |
| category | Where the privilege should be visible in the `permissions` grid or in the `additional_permissions` |
| parent | For nesting and gaining a better overview, you can add a parent key. If the privilege does not have a parent then use `null`. |
| key | All privileges with the same key will be grouped together. For normal `permissions` each role will be in the same row. |
| roles | When category is `permissions`: Use `viewer`, `editor`, `creator` and `deleter`. |
|  | When category is `additional_permissions`: Use a custom key because the additional permissions don´t enforce a structure. |

Each role in roles:

| Property | Description |
| :--- | :--- |
| privileges | You need to add all API permissions here which are required for an working admin privilege. The structure is `entity_name:operation`, e.g. 'product:read'. |
| dependencies | In some cases it is necessary to automatically check another role. To do this, you need to add the identifier, e.g. `product.viewer`. |

Here's an example how this can look like for the review functionality in the Administration:

```javascript
Shopware.Service('privileges')
    .addPrivilegeMappingEntry({
        category: 'permissions',
        parent: 'catalogues',
        key: 'review',
        roles: {
            viewer: {
                privileges: [
                    'product_review:read',
                    'customer:read',
                    'product:read',
                    'sales_channel:read'
                ],
                dependencies: []
            },
            editor: {
                privileges: [
                    'product_review:update'
                ],
                dependencies: [
                    'review.viewer'
                ]
            },
            creator: {
                privileges: [
                    'product_review:create'
                ],
                dependencies: [
                    'review.viewer',
                    'review.editor'
                ]
            },
            deleter: {
                privileges: [
                    'product_review:delete'
                ],
                dependencies: [
                    'review.viewer'
                ]
            }
        }
    });
```

### Adding new, normal permissions

You could use the service at any point in your code. However, it's important that it will be called before the user goes to the roles detail page. For convenience, we recommend this pattern:

```text
- <plugin root>/src/Resources/app/administration/src/<your-component>/
    - acl
        - index.js -> contains permission
    - ...
    - index.js -> import './acl'
```

Now you can use the method `addPrivilegeMappingEntry` to add a new entry:

To add a new mapping for your custom key use the following approach:

```javascript
// <plugin root>/src/Resources/app/administration/src/<your-component>/acl/index.js

Shopware.Service('privileges').addPrivilegeMappingEntry({
    category: 'permissions',
    parent: null,
    key: 'your_key',
    roles: {
        viewer: {
            privileges: [],
            dependencies: []
        },
        editor: {
            privileges: [],
            dependencies: []
        },
        creator: {
            privileges: [],
            dependencies: []
        },
        deleter: {
            privileges: [],
            dependencies: []
        }
    }
});
```

### Extending existing normal permissions

Adding privileges to an existing key can be done like this:

```javascript
// <plugin root>/src/Resources/app/administration/src/acl-override/index.js

Shopware.Service('privileges').addPrivilegeMappingEntry({
    category: 'permissions',
    parent: null,
    key: 'product',
    roles: {
        viewer: {
            privileges: ['plugin:read']
        },
        editor: {
            privileges: ['plugin:update']
        },
        newrole: {
            privileges: ['plugin:write']
        }
    }
});
```

Note: This file has to be imported in the `main.js` file which has to be placed in the `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by Shopware 6.

### Register additional permissions

To add privileges to the card `additional_permissions` you need to set `additional_permissions` in the property category. The main difference to normal permissions is that you can choose every role key you want.

Here's an example for `additional_permissions`:

```javascript
Shopware.Service('privileges').addPrivilegeMappingEntry({
    category: 'additional_permissions',
    parent: null,
    key: 'system',
    roles: {
        clear_cache: {
            privileges: ['system:clear:cache'],
            dependencies: []
        }
    }
});
```

Here, the key is `system` to group the permission together with other system specific permissions. However, you can feel free to add your own names here.

## Get permissions from other privilege mappings

In case you have many dependencies which are the same as in other modules, you can import them here. This can be useful if you have components in your module which have complex privileges. Some examples can be found in the rule builder or the media module. You can get these privileges with the method `getPrivileges` of the service.

See this example here:

```javascript
Shopware.Service('privileges').addPrivilegeMappingEntry({
    category: 'permissions',
    parent: null,
    key: 'product',
    roles: {
        viewer: {
            privileges: [
                'product.read',
                Shopware.Service('privileges').getPrivileges('rule.viewer')
            ],
            dependencies: []
        }
    }
})
```

Now all users with the privilege `product.viewer` automatically have access to all privileges from the `rule.viewer`.

Important: The user still has no access to the module itself in the Administration. This means that the example above doesn't give a user access to the `rule` module.

## Protect your plugin routes

It's easy to protect your routes for users without the appropriate privileges. Just add `privilege` to the `meta` property in your route:

```javascript
Module.register('your-plugin-module', {
    routes: {
        detail: {
            component: 'your-plugin-detail',
            path: 'your-plugin',
            meta: {
                privilege: 'your_key.your_role' // e.g. 'product.viewer'
            }
        }    
    }
});
```

## Protect your plugin menu entries

Similar to the routes, you can to add the property `privilege` to your navigation settings to hide it:

```javascript
Module.register('your-plugin-module', {
    navigation: [{
        id: 'your-plugin',
        ...,
        privilege: 'your_key.your_role' // e.g. product.viewer
    }]
});
```

or in the settings item:

```javascript
Module.register('your-plugin-module', {
    settingsItem: [{
        group: 'system',
        to: 'sw.your.plugin.detail',
        privilege: 'your_key.your_role' // e.g. product.viewer
    }]
});
```

## Add snippets for your privileges

To create translations for the labels of the permissions you need to add snippet translations. The path is created automatically for you:

For group titles:

```text
sw.privileges.${category}.${key}.label
// e.g. sw.privileges.permissions.product.label
// e.g. sw.privileges.additional_permissions.system.label
```

For specific roles \(only needed in `additional_permissions`\):

```text
sw.privileges.${category}.${key}.${role_key} 
// e.g. sw.privileges.additional_permissions.system.clear_cache
```

Just add the snippets to your snippets file:

```json
{
  "sw-privileges": {
    "permissions": {
      "review": {
        "label": "Reviews"
      }
    },
    "additional_permissions": {
      "system": {
        "label": "System",
        "clear_cache": "Clear cache"
      }
    }
  }
}
```

## Use the privileges in any place in your plugin

You can use the `acl` service to check if the user has the correct privileges to view or edit things, regardless of location in your app. The method you need is `acl.can(identifier)`: It checks automatically if the user has admin rights or the privilege for the identifier.

You can use the global Shopware object \(`Shopware.Service('acl')`\) or inject the service in your component:

```javascript
Shopware.Component.register('your-plugin-component', {
    template,

    inject: ['acl'],

    ...
});
```

With the injection, you can use the service functionality everywhere in your component.

Example in a method:

```javascript
Shopware.Component.register('your-plugin-component', {
    template,

    inject: ['acl'],

    methods: {
        allowSaving() {
            return this.acl.can('sales_channel.creator');
        }    
    }
});
```

Below is an example to hide the element if the user has not the right privilege:

```html
<button v-if="acl.can('review.editor')">
</button>
```

For example you could disable elements if the user has not the right privilege to use them and inform the user with a tooltip that a privilege is missing. To achieve this, you can use the global snippet path:

```html
<button @click="saveProduct"
        :disabled="!acl.can('review.editor')"
        v-tooltip="{
            message: $tc('sw-privileges.tooltip.warning'),
            disabled: acl.can('review.editor'),
            showOnDisabledElements: true
        }"
></button>
```

## Protect your shortcuts

You can replace the String value with an object which contains the method with the name `active` which then returns a boolean or just the property `active`as boolean. In our case we need a function to check if the user has the privilege required to use the shortcut.

```javascript
Module.register('your-plugin-module', {
    shortcuts: {
        'SYSTEMKEY+S': {
            active() {
                return this.acl.can('product.editor');
            },
            method: 'onSave'
        },
        ESCAPE: 'onCancel'
    },
});
```

## Add your custom privileges

To make sure your custom privileges are additionally added to existing roles, override the `enrichPrivileges` method and return a list of your custom privileges.
This method should return an array with the technical role name as key, while the privileges should be the array value.
An event subscriber will add the plugins custom privileges at runtime.

```php
<?php declare(strict_types=1);

namespace SwagTestPluginAcl;

use Shopware\Core\Framework\Plugin;

class SwagTestPluginAcl extends Plugin
{
    public function enrichPrivileges(): array
    {
        return [
            'product.viewer' => [
                'my_custom_privilege:read',
                'my_custom_privilege:write',
                'my_other_custom_privilege:read',
                // ...
            ],
            'product.editor' => [
                // ...
            ],
        ];
    }
}
```
