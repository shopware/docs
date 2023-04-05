# ACL and Routing

The ACL Routing component allows you to block Controller Actions for B2B users. It relies on and extends the technologies already defined by the ACL component. To accomplish this, the component directly maps an `action` in a given `controller` to a `resource` (= entity type) and `privilege` (= class of actions). There are two core actions you should know: `index` and `detail`, as you can see in the following acl-config example below.

## Registering routes

All routes that need access rights need to be stored in the database. The B2B Suite provides a service to simplify this process. For it to work correctly, you need an array in a specific format structured like this:

```php
$myAclConfig =  [
    'contingentgroup' => //resource name
    [
        'B2bContingentGroup' => // controller name
        [
            'index' => 'list', // action name => privilege name
            [...]
            'detail' => 'detail',
        ],
    ],
];
```

This configuration array can then be synced to the database by using this service during installation:

```php
Shopware\B2B\AclRoute\Framework\AclRoutingUpdateService::create()
    ->addConfig($myAclConfig);
```

This way, you can easily create and store the resources. Of course, to show a nice frontend, you must also provide snippets for translation. The snippets get automatically created from resource and privilege names and are prefixed with `_acl_`. So the resource `contingentgroup` needs a translation named `_acl_contingentgroup`.

## Privilege names

The default privileges are:

| Privilege name |                                    What it means                                    |
|:----------------:|:-----------------------------------------------------------------------------------:|
| `list`           |                  Entity listing (e.g. indexActions, gridActions)                   |
| `detail`         | Disabled forms, lists of assignments, but only the inspection, not the modification |
| `create`         |                              Creation of new entities                               |
| `delete`         |                           Removal of existing entities                             |
| `update`         |                         Updating/changing existing entities                         |
| `assign`         |                        Changing the assignment of the entity                        |
| `free`           |                                   No restrictions                                   |

It is quite natural to map CRUD actions like this. However, the assignment is a little less intuitive. This should help:

* All assignment controllers belong to the resource on the right side of the assignment (e.g., the `B2BContactRole` controller is part of the `role` resource).
* All assignment listings have the detail privilege (e.g., `B2BContactRole:indexAction` is part of the `detail` privilege).
* All actions writing the assignment are part of the assign privilege (e.g. `B2BContactRole:assignAction` is part of the `assign` privilege).

## Automatic generation

You can autogenerate this format with the `RoutingIndexer`. This service expects a format that is automatically created by the *IndexerService*.
This could be part of your deployment or testing workflow.

```php
require __DIR__ . '/../B2bContact.php';
$indexer = new Shopware\B2B\AclRoute\Framework\RoutingIndexer();
$indexer->generate(\Shopware_Controllers_Frontend_B2bContact::class, __DIR__ . '/my-acl-config.php');
```

The generated file looks like this:

```php
'NOT_MAPPED' => //resource name
      array(
          'B2bContingentGroup' => // controller name
              array(
                  'index' => 'NOT_MAPPED', // action name => privilege name
                  [...]
                  'detail' => 'NOT_MAPPED',
              ),
      ),
```

If you spot a privilege or resource that is called `NOT_MAPPED`,
the action is new, and you must update the file to add the correct privilege name.

## Template extension

The ACL implementation is safe at the PHP level. Any route you have no access to will automatically be blocked, but for a better user experience, you should also extend the template to hide inaccessible actions.

```twig
Href: {{ url("frontend.b2b." ~ page.route ~ ".assign") }}
Class: {{ b2b_acl('b2broleaddress', 'assign') }}
```

This will add a few vital CSS classes:

Allowed actions:

```html
<a [...] class="is--b2b-acl is--b2b-acl-controller-b2broleaddress is--b2b-acl-action-assign is--b2b-acl-allowed"/>
```

Denied actions:

```html
<a [...] class="is--b2b-acl is--b2b-acl-controller-b2broleaddress is--b2b-acl-action-assign is--b2b-acl-forbidden"/>
```

The default behavior is then just to hide the link by setting its display property to `display: none`.

But there are certain specials to this:

* applied to a `form` tag will remove the submit button and disable all form items.
* applied to a table row in the b2b default grid will mute the applied ajax panel action.

## Download

Refer here for [simple example plugin](../../../../../../docs/products/extensions/b2b-suite/guides/example-plugins/B2bAcl.zip).
