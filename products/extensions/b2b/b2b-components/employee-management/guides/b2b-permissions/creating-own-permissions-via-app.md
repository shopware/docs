# Create Permissions via App

App needs to use the API to extend and create permissions. Therefore, the apps can send a request to the Store API and pass the required parameters to [`/store-api/permission`]() route.

After doing that, the already existing permissions created by Shopware or added by plugin, will be merged with the permission created by apps.

It is important to note that permissions have a unique name. So a permission named `employee.read` can neither be added by apps nor by plugins, because this name is already in use. So a new name can better be added by making use of snippets.

## Snippets

The Snippet for the new permissions have to be added to the following namespace: `b2b.role-edit.permissions.[name]`. The placeholder has to be replaced by the name of the new permission, e.g., `b2b.role-edit.permissions.order.delete`.
