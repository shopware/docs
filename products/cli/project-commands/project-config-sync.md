---
nav:
  title: Project Config synchronization
  position: 2

---

# Project config synchronization

Shopware CLI can synchronize the project configurations between different environments. This is useful, for example, to keep the configuration in the development and production environment in sync.

The Following things are possible to synchronize:

- Theme Configuration
- System Configuration (including extension configuration)
- Mail Templates
- Entity

## Setup

To synchronize the project, you need to create a `.shopware-project.yml` file in the root of your project. This file contains the configuration for the synchronization.

You can also use the command `shopware-cli project config init` to create a new `shopware-project.yml` file. Make sure that you configure the API access too as this is required for the synchronization.

## Credentials with environment variables

If you don't want to store the credentials in the `shopware-project.yml` file, you can use environment variables.

- `SHOPWARE_CLI_API_URL` - The URL to the Shopware instance
- `SHOPWARE_CLI_API_CLIENT_ID` - The client ID for the API access
- `SHOPWARE_CLI_API_CLIENT_SECRET` - The client secret for the API access
- `SHOPWARE_CLI_API_USERNAME` - The username for the API access
- `SHOPWARE_CLI_API_PASSWORD` - The password for the API access

Either you can fill `SHOPWARE_CLI_API_CLIENT_ID` and `SHOPWARE_CLI_API_CLIENT_SECRET` or `SHOPWARE_CLI_API_USERNAME` and `SHOPWARE_CLI_API_PASSWORD`.

## Initial pulling

To pull the configuration from the Shopware instance, you can use the command `shopware-cli project config pull`. This command pulls the configuration from the Shopware instance and stores it in the local `shopware-project.yml` file.

## Pushing the configuration

After you made the changes in the local `shopware-project.yml` file, you can push the changes to the Shopware instance with the command:

```bash
shopware-cli project config push
```

This shows the difference between your local and the remote configuration and asks you if you want to push the changes.

## Entity synchronization

With entity synchronization, you can synchronize any kind of entity using directly the Shopware API.

```yaml
sync:
  entity:
      - entity: tax
        payload:
          name: 'Tax'
          taxRate: 19
```

This example synchronizes a new tax entity with the name `Tax` and the tax rate `19`.

The further synchronizations will create the same entity again, you may want to fix the entity ID to avoid duplicates.

```yaml
sync:
  entity:
    - entity: tax
      # build a criteria to check that the entity already exists. when exists this will be skipped
      exists:
        - type: equals
          field: name
          value: 'Tax'
      # actual api payload to create something
      payload:
        name: 'Tax'
        taxRate: 19
```
