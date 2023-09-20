# Add Custom Media File Extension

## Overview

You might have come across the fact, that you cannot just upload any type of media to Shopware by using the Media
module in the Administration.
If that's the case for you, this guide will be the solution.
It will provide an explanation on how you can add new allowed file extensions to Shopware using a plugin.

## Prerequisites

As most of our plugin guides, this guide was also built upon our [Plugin base guide](../../plugin-base-guide.md).
Furthermore, you'll have to know about adding classes to the [Dependency injection](../../plugin-fundamentals/dependency-injection.md) container
and about using a subscriber in order to [Listen to events](../../plugin-fundamentals/listening-to-events.md).

## Adding a custom extension

In this section, we're going to take care of allowing a new extension to Shopware first, without letting Shopware know
exactly what kind of file this new extension represents (Images, videos, documents, ...).

For this to work, all you have to do is to register to the `MediaFileExtensionWhitelistEvent` event, which can be found
[here](https://github.com/shopware/platform/blob/v6.4.0.0/src/Core/Content/Media/File/FileSaver.php#L397-L398).
This is of course done via a [subscriber](../../plugin-fundamentals/listening-to-events.md).

Have a look at the following code example:

```php
// <plugin root>/src/Service/Subscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Content\Media\Event\MediaFileExtensionWhitelistEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class Subscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            MediaFileExtensionWhitelistEvent::class => 'addEntryToFileExtensionWhitelist'
        ];
    }

    public function addEntryToFileExtensionWhitelist(MediaFileExtensionWhitelistEvent $event): void
    {
        $whiteList = $event->getWhitelist();
        $whiteList[] = 'img';

        $event->setWhitelist($whiteList);
    }
}
```

You can use the method `getWhitelist` of the `$event` variable to get the current whitelist, which is just a plain array of extensions.
Therefore you can add new array entries and then set the array back to the `$event` instance by using the respective setter method
`setWhitelist`.

And that's it already! Shopware will now allow uploading files with the extension `.img`.

## Recognising the new extension

There is another thing you most likely want to do here.
While you can add new extensions like mentioned above, Shopware does not automatically recognise which kind of extension it is dealing with.
Is it a new image extension and should be displayed as such? Is it a video file extension? Maybe a new kind of document?

In order to let Shopware know which kind of type we're dealing with, you can add a new `TypeDetector` class
to let Shopware know about your new extension.

In the following example we'll imagine that we've added a new **image** extension called `img`, like we did above, and we're going to let Shopware know
about it.

What we'll be doing now, is to add a custom `TypeDetector` class which returns an `ImageType` if the extension of the file to be checked matches our type detector.
Have a look at the following example:

<Tabs>
<Tab title="CustomImageTypeDetector.php">

```php
// <plugin root>/src/Core/Content/Media/TypeDetector/CustomImageTypeDetector.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Media\TypeDetector;

use Shopware\Core\Content\Media\File\MediaFile;
use Shopware\Core\Content\Media\MediaType\ImageType;
use Shopware\Core\Content\Media\MediaType\MediaType;
use Shopware\Core\Content\Media\TypeDetector\TypeDetectorInterface;

class CustomImageTypeDetector implements TypeDetectorInterface
{
    protected const SUPPORTED_FILE_EXTENSIONS = [
        'img' => [ImageType::TRANSPARENT],
    ];

    public function detect(MediaFile $mediaFile, ?MediaType $previouslyDetectedType): ?MediaType
    {
        $fileExtension = mb_strtolower($mediaFile->getFileExtension());
        if (!\array_key_exists($fileExtension, self::SUPPORTED_FILE_EXTENSIONS)) {
            return $previouslyDetectedType;
        }

        if ($previouslyDetectedType === null) {
            $previouslyDetectedType = new ImageType();
        }

        $previouslyDetectedType->addFlags(self::SUPPORTED_FILE_EXTENSIONS[$fileExtension]);

        return $previouslyDetectedType;
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Content\Media\TypeDetector\CustomImageTypeDetector">
            <tag name="shopware.media_type.detector" priority="10"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

You will have to create a new class which implements from the interface `TypeDetectorInterface`.
This will come with the requirement of having a `detect` method, which will return the respective media type.

Inside of the `detect` method, we're first checking if the file extension matches our allowed extensions, in this case only
`img`.
If that's not the case, just return the `$previouslyDetectedType`, which most likely comes from the `DefaultTypeDetector` and which
tried to detect the type already by analysing the file's MIME-type.

If the extension does indeed match, we're for sure going to return `ImageType` here.
Make sure to add flags to your media type, e.g. the `transparent` flag, or if it's an animated image.

You can find all available flags in their respective media type classes,
e.g. [here](https://github.com/shopware/platform/blob/v6.4.0.0/src/Core/Content/Media/MediaType/ImageType.php#L7-L10) for the image media type.

Make sure to register your new type detector to the [Dependency injection container](../../plugin-fundamentals/dependency-injection.md)
by using the tag `shopware.media_type.detector`.

Shopware will now recognise your new image extension and handle your new file like an image.
