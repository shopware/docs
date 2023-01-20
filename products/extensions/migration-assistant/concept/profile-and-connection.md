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
<?php declare(strict_types=1);

namespace SwagMigrationAssistant\Profile\Shopware55;

use SwagMigrationAssistant\Profile\Shopware\ShopwareProfileInterface;

class Shopware55Profile implements ShopwareProfileInterface
{
    public const PROFILE_NAME = 'shopware55';

    public const SOURCE_SYSTEM_NAME = 'Shopware';

    public const SOURCE_SYSTEM_VERSION = '5.5';

    public const AUTHOR_NAME = 'shopware AG';

    public const ICON_PATH = '/swagmigrationassistant/static/img/migration-assistant-plugin.svg';

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
<?php declare(strict_types=1);

namespace SwagMigrationAssistant\Migration\Connection;

/*...*/

class SwagMigrationConnectionDefinition extends EntityDefinition
{
    /*...*/

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
             (new IdField('id', 'id'))->setFlags(new PrimaryKey(), new Required()),
             (new StringField('name', 'name'))->setFlags(new Required()),
             (new JsonField('credential_fields', 'credentialFields'))->setFlags(new WriteProtected(MigrationContext::SOURCE_CONTEXT)),
             new JsonField('premapping', 'premapping'),
             (new StringField('profile_name', 'profileName'))->setFlags(new Required()),
             (new StringField('gateway_name', 'gatewayName'))->setFlags(new Required()),
             new CreatedAtField(),
             new UpdatedAtField(),
             new OneToManyAssociationField('runs', SwagMigrationRunDefinition::class, 'connection_id'),
             new OneToManyAssociationField('mappings', SwagMigrationMappingDefinition::class, 'connection_id'),
             new OneToManyAssociationField('settings', GeneralSettingDefinition::class, 'selected_connection_id'),
        ]);
    }
}
```
