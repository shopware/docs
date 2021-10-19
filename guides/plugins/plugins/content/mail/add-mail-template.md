# Add mail templates

## Overview

You can add new mail templates to Shopware by using the administration. However, you might want to ship a mail template with your plugin, so using the administration is no option.

This guide will cover how to add a custom mail template with your plugin.

## Prerequisites

The namespaces used in the examples of this guide are the same as the namespace from our [plugin base guide](../../plugin-base-guide.md), so you might want to have a look at it first.

Furthermore, this guide will use [database migrations](../../plugin-fundamentals/database-migrations.md) in order to add a custom mail template, which is not explained in depth here. Make sure to understand those first!

## Adding a mail template via migration

As already mentioned, adding a mail template is done by using a plugin database migration. To be precise, those are the steps necessary:

* Create a new mail template type or fetch an existing mail template type ID
* Add an entry to `mail_template` using the said template type ID
* Add an entry to `mail_template_translation` for each language you want to support

The following example will create a new template of type "contact form", which is already available. There will be an example to create a custom mail template type though.

Let's have a look at an example, which will:

* Use the "contact form" type
* Add a mail template entry
* Add a mail template translation for en\_GB and de\_DE

{% code title="<plugin root>/src/Migration/Migration1616418675AddMailTemplate.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;

class Migration1616418675AddMailTemplate extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1616418675;
    }

    public function update(Connection $connection): void
    {
        $mailTemplateTypeId = $this->getMailTemplateTypeId($connection);

        $this->createMailTemplate($connection, $mailTemplateTypeId);
    }

    public function updateDestructive(Connection $connection): void
    {
    }

    private function getMailTemplateTypeId(Connection $connection): string
    {
        $sql = <<<SQL
            SELECT id
            FROM mail_template_type
            WHERE technical_name = "contact_form"
SQL;

        return Uuid::fromBytesToHex($connection->fetchOne($sql));
    }

    private function getLanguageIdByLocale(Connection $connection, string $locale): ?string
    {
        $sql = <<<SQL
SELECT `language`.`id`
FROM `language`
INNER JOIN `locale` ON `locale`.`id` = `language`.`locale_id`
WHERE `locale`.`code` = :code
SQL;

        $languageId = $connection->executeQuery($sql, ['code' => $locale])->fetchColumn();
        if (!$languageId && $locale !== 'en-GB') {
            return null;
        }

        if (!$languageId) {
            return Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM);
        }

        return $languageId;
    }

    private function createMailTemplate(Connection $connection, string $mailTemplateTypeId): void
    {
        $mailTemplateId = Uuid::randomHex();

        $defaultLangId = $this->getLanguageIdByLocale($connection, 'en-GB');
        $deLangId = $this->getLanguageIdByLocale($connection, 'de-DE');

        $connection->insert('mail_template', [
            'id' => Uuid::fromHexToBytes($mailTemplateId),
            'mail_template_type_id' => Uuid::fromHexToBytes($mailTemplateTypeId),
            'system_default' => 0,
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);

        if ($defaultLangId !== $deLangId) {
            $connection->insert('mail_template_translation', [
                'mail_template_id' => Uuid::fromHexToBytes($mailTemplateId),
                'language_id' => $defaultLangId,
                'sender_name' => '{{ salesChannel.name }}',
                'subject' => 'Example mail template subject',
                'description' => 'Example mail template description',
                'content_html' => $this->getContentHtmlEn(),
                'content_plain' => $this->getContentPlainEn(),
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if ($defaultLangId !== Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM)) {
            $connection->insert('mail_template_translation', [
                'mail_template_id' => Uuid::fromHexToBytes($mailTemplateId),
                'language_id' => Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM),
                'sender_name' => '{{ salesChannel.name }}',
                'subject' => 'Example mail template subject',
                'description' => 'Example mail template description',
                'content_html' => $this->getContentHtmlEn(),
                'content_plain' => $this->getContentPlainEn(),
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if ($deLangId) {
            $connection->insert('mail_template_translation', [
                'mail_template_id' => Uuid::fromHexToBytes($mailTemplateId),
                'language_id' => $deLangId,
                'sender_name' => '{{ salesChannel.name }}',
                'subject' => 'Beispiel E-Mail Template Titel',
                'description' => 'Beispiel E-Mail Template Beschreibung',
                'content_html' => $this->getContentHtmlDe(),
                'content_plain' => $this->getContentPlainDe(),
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }
    }

    private function getContentHtmlEn(): string
    {
        return <<<MAIL
<div style="font-family:arial; font-size:12px;">
    <p>
        Example HTML content!
    </p>
</div>
MAIL;
    }

    private function getContentPlainEn(): string
    {
        return <<<MAIL
Example plain content!
MAIL;
    }

    private function getContentHtmlDe(): string
    {
        return <<<MAIL
<div style="font-family:arial; font-size:12px;">
    <p>
        Beispiel HTML Inhalt!
    </p>
</div>
MAIL;
    }

    private function getContentPlainDe(): string
    {
        return <<<MAIL
Beispiel Plain Inhalt!
MAIL;
    }
}
```
{% endcode %}

First of all, let's have a look at the small `update` method. It's mainly just fetching the mail template type ID using a short SQL statement and afterwards it executes the method `createMailTemplate`, which will cover all the other steps.

Now on to the `createMailTemplate` method, which looks big, but isn't that scary. First of all, we're fetching the language IDs for both `en_GB` and `de_DE`.

We then create the entry for the `mail_template` table. Make sure to set `system_default` to 0 here!

Afterwards we're inserting the entries into the `mail_template_translation` table. Due to several possible Shopware configurations \(en\_GB is default, or de\_DE is default, or another language is set as default language\), we need to check when exactly to insert the English, and when to insert the German translation.

Note the variables for the English and the German subject and description, make sure to change those as well to your needs.

Each of those calls uses a little helper method `getContentHtml` or `getContentPlain` respectively, where you can use your template.

And that's it, once your plugin is installed, the mail template will be added to Shopware.

{% hint style="warning" %}
Do not remove those templates in your plugin, e.g. when it is uninstalled. This may lead to data inconsistency, since those templates can be associated to other entities.
{% endhint %}

### Creating a custom mail type

In order to not only use an existing mail template type, but to create a custom one, you have to adjust the `update` method and create a new method.

Let's have a look:

{% code title="<plugin root>/src/Migration/Migration1616418675AddMailTemplate.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;

class Migration1616418675AddMailTemplate extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1616418675;
    }

    public function update(Connection $connection): void
    {
        $mailTemplateTypeId = $this->createMailTemplateType($connection);

        $this->createMailTemplate($connection, $mailTemplateTypeId);
    }

    private function createMailTemplateType(Connection $connection): string
    {
        $mailTemplateTypeId = Uuid::randomHex();

        $defaultLangId = $this->getLanguageIdByLocale($connection, 'en-GB');
        $deLangId = $this->getLanguageIdByLocale($connection, 'de-DE');

        $englishName = 'Example mail template type name';
        $germanName = 'Beispiel E-Mail Template Name';

        $connection->insert('mail_template_type', [
            'id' => Uuid::fromHexToBytes($mailTemplateTypeId),
            'technical_name' => 'custom_mail_template_type',
            'available_entities' => json_encode(['product' => 'product']),
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);

        if ($defaultLangId !== $deLangId) {
            $connection->insert('mail_template_type_translation', [
                'mail_template_type_id' => Uuid::fromHexToBytes($mailTemplateTypeId),
                'language_id' => $defaultLangId,
                'name' => $englishName,
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if ($defaultLangId !== Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM)) {
            $connection->insert('mail_template_type_translation', [
                'mail_template_type_id' => Uuid::fromHexToBytes($mailTemplateTypeId),
                'language_id' => Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM),
                'name' => $englishName,
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if ($deLangId) {
            $connection->insert('mail_template_type_translation', [
                'mail_template_type_id' => Uuid::fromHexToBytes($mailTemplateTypeId),
                'language_id' => $deLangId,
                'name' => $germanName,
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        return $mailTemplateTypeId;
    }

    // ...
}
```
{% endcode %}

First of all we changed the `getMailTemplateTypeId` method call to `createMailTemplateType`, a new method which we will create afterwards. Again, this method then has to return the ID of the newly created mail template ID.

So having a look at the `createMailTemplateType` method, you will see some similarities:

* First of all we're fetching the language IDs for `en_GB` and `de_DE`
* Then we define the translated names for the mail template type
* And then the respective `mail_template_type` entry, as well as the translated `mail_template_type_translation` entries are created

Note the `available_entities` column when creating the mail template type itself though. In here, you define which entities should be available for the respective mail template, in this example we'll just provide the `ProductEntity`.

## Next steps

Now that you know how to add custom mail templates, you might wonder how you can actually add new mail template data to existing mail templates.

For that case, we've created a separate guide about [adding data to mail templates](add-data-to-mails.md).

