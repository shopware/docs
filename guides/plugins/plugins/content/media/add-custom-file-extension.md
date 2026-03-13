---
nav:
  title: Add custom media extension
  position: 20

---

# Add Custom Media File Extension

You might have come across the fact that you cannot just upload any type of media to Shopware by using the Media
module in the Administration.
If that's the case for you, this guide will be the solution.
It will explain how to add new allowed file extensions to Shopware using a plugin.

## Prerequisites

As most of our plugin guides, this guide was also built upon our [Plugin base guide](../../plugin-base-guide).
Furthermore, you'll have to know about adding classes to the [Dependency injection](../../plugin-fundamentals/dependency-injection) container
and about using a subscriber to [Listen to events](../../plugin-fundamentals/listening-to-events).

## Adding a custom extension

In this section, we're going to allow a new extension to Shopware first, without letting Shopware know exactly what kind of file this new extension represents (Images, videos, documents, etc.).

For this to work, all you have to do is register for the `MediaFileExtensionWhitelistEvent` event, which can be found [here](https://github.com/shopware/shopware/blob/v6.4.0.0/src/Core/Content/Media/File/FileSaver.php#L397-L398).
This is, of course, done via a [subscriber](../../plugin-fundamentals/listening-to-events).

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

You can use the method `getWhitelist` of the `$event` variable to get the current allowlist, which is just a plain array of extensions.
Therefore, you can add new array entries and then set the array back to the `$event` instance by using the respective setter method
`setWhitelist`.

And that's it already! Shopware now allows uploading files with the `.img` extension.

## Recognising the new extension

There is another thing you most likely want to do here.
While you can add new extensions as mentioned above, Shopware does not automatically recognise the type of extension it is dealing with.
Is it a new image extension and should be displayed as such? Is it a video file extension? Maybe a new kind of document?

To let Shopware know which kind of type we're dealing with, you can add a new `TypeDetector` class
to let Shopware know about your new extension.

In the following example, we'll imagine that we've added a new **image** extension called `img`, like we did above, and we're going to let Shopware know
about it.

What we'll be doing now is adding a custom `TypeDetector` class that returns an `ImageType` if the file's extension matches our type detector.
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

<Tab title="services.php">

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Swag\BasicExample\Core\Content\Media\TypeDetector\CustomImageTypeDetector;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(CustomImageTypeDetector::class)
        ->tag('shopware.media_type.detector', ['priority' => 10]);
};
```

</Tab>
</Tabs>

You will need to create a new class that implements the `TypeDetectorInterface` interface.
This will come with the requirement of having a `detect` method, which will return the respective media type.

Inside the `detect` method, we're first checking if the file extension matches our allowed extensions, in this case, only
`img`.
If that's not the case, just return the `$previouslyDetectedType`, which most likely comes from the `DefaultTypeDetector` and which
tried to detect the type already by analysing the file's MIME-type.

If the extension does match, we're definitely going to return `ImageType` here.
Make sure to add flags to your media type, e.g., the `transparent` flag, or if it's an animated image.

You can find all available flags in their respective media type classes,
e.g. [here](https://github.com/shopware/shopware/blob/v6.4.0.0/src/Core/Content/Media/MediaType/ImageType.php#L7-L10) for the image media type.

Make sure to register your new type detector to the [Dependency injection container](../../plugin-fundamentals/dependency-injection)
by using the tag `shopware.media_type.detector`.

Shopware will now recognise your new image extension and handle your new file like an image.

## Public vs private media

Shopware uses **two separate extension allowlists** depending on whether the media is public or private:

| Allowlist | Configuration parameter | When used |
|-----------|-------------------------|-----------|
| **Public** | `shopware.filesystem.allowed_extensions` | Media stored in the public filesystem (product images, CMS assets, etc.). Files are accessible via URL. |
| **Private** | `shopware.filesystem.private_allowed_extensions` | Media stored in the private filesystem (digital product downloads, documents, etc.). Files are not directly accessible via URL and require authentication to download. |

The `MediaFileExtensionWhitelistEvent` is dispatched with one of these allowlists depending on whether the media being uploaded is marked as private. Your subscriber receives the appropriate allowlist each time.

If your custom extension should work for both public and private media, add it to your subscriber. The same logic applies to both allowlists, since the event is fired separately for each upload context.

## Media types

When implementing a `TypeDetector`, you must return the correct `MediaType` for your extension. The following types are available:

| MediaType class | Purpose |
|-----------------|---------|
| `ImageType` | Images (jpg, png, etc.). Supports thumbnails and flags such as `transparent`, `animated`, and `vectorGraphic`. |
| `VideoType` | Video files (mp4, webm, etc.). **Note:** Not all browsers support all video formats. Shopware displays a warning in the Administration about formats that may not be playable everywhere (e.g., MOV, AVI, WMV). |
| `AudioType` | Audio files (mp3, wav, etc.). **Note:** Not all browsers support all audio formats. Shopware displays a warning in the Administration about formats that may not be playable everywhere (e.g., FLAC, AAC, WMA). |
| `DocumentType` | Documents (PDF, DOC, etc.). |
| `SpatialObjectType` | 3D/spatial files (e.g. GLB). |
| `BinaryType` | Fallback for unknown or generic file types. |

Choose the type that best matches how Shopware should handle your custom extension (e.g., image thumbnails, document previews).
