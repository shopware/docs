---
nav:
  title: Profile and Connection
  position: 10

---

# Profile and Connection

## Overview

Users of the plugin can create connections to different source systems. A connection is used to allow multiple migrations from the same source and update the right data \(mapping\). Connections require a specific profile indicating the type of source system. Users can, for example, create a connection to a Shopware shop using the Shopware 5.5 profile. Developers can create their own profiles from scratch, connect to different source systems, or just build and extend existing ones.

## Profile

The base of Shopware Migration Assistant is the profile, which enables you to migrate your shop system to Shopware 6. Shopware Migration Assistant comes with the default Shopware 5.5 profile and is located in the `shopware55.xml`:

```html
<!-- Shopware 5.5 Profile -->
<service id="SwagMigrationAssistant\Profile\Shopware55\Shopware55Profile">
    <tag name="shopware.migration.profile"/>
</service>
```

In order to identify itself, the profile has to implement getter functions like `getName`, which returns the unique name of the profile. The profile is used together with the [Gateway](gateway-and-reader#gateway) to check and apply the right processing during a migration run.

```php
// SwagMigrationAssistant\Profile\Shopware55\Shopware55Profile

class Shopware55Profile implements ShopwareProfileInterface
{
    final public const PROFILE_NAME = 'shopware55';

    final public const SOURCE_SYSTEM_NAME = 'Shopware';

    final public const SOURCE_SYSTEM_VERSION = '5.5';

    final public const AUTHOR_NAME = 'shopware AG';

    final public const ICON_PATH = '/swagmigrationassistant/administration/static/img/migration-assistant-plugin.svg';

    public function getName(): string
    {
        return self::PROFILE_NAME;
    }

    public function getSourceSystemName(): string
    {
        return self::SOURCE_SYSTEM_NAME;
    }

    public function getVersion(): string
    {
        return self::SOURCE_SYSTEM_VERSION;
    }

    public function getAuthorName(): string
    {
        return self::AUTHOR_NAME;
    }

    public function getIconPath(): string
    {
        return self::ICON_PATH;
    }
}
```

## Connection

To connect Shopware 6 to your source system \(e.g., Shopware 5\), you will need a connection entity. The connection includes all the important information for your migration run. It contains the credentials for the API or database access, the actual [Premapping](premapping) and the profile, [Gateway](gateway-and-reader) combination which is used for your migration:

```php
// SwagMigrationAssistant\Migration\Connection\SwagMigrationConnectionDefinition

class SwagMigrationConnectionDefinition extends EntityDefinition
{
    final public const ENTITY_NAME = 'swag_migration_connection';

    // ...

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new StringField('name', 'name'))->addFlags(new Required()),
            (new JsonField('credential_fields', 'credentialFields'))->addFlags(new WriteProtected(MigrationContext::SOURCE_CONTEXT)),
            new PremappingField('premapping', 'premapping'),
            (new StringField('profile_name', 'profileName'))->addFlags(new Required()),
            (new StringField('gateway_name', 'gatewayName'))->addFlags(new Required()),
            new StringField('source_system_fingerprint', 'sourceSystemFingerprint'),
            new CreatedAtField(),
            new UpdatedAtField(),
            new OneToManyAssociationField('runs', SwagMigrationRunDefinition::class, 'connection_id'),
            new OneToManyAssociationField('mappings', SwagMigrationMappingDefinition::class, 'connection_id'),
            new OneToManyAssociationField('settings', GeneralSettingDefinition::class, 'selected_connection_id'),
        ]);
    }
}
```
