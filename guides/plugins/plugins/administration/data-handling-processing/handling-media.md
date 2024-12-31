# Handling media

## Overview

The Shopware 6 Administration provides many components to work with, when it comes to handle media. For example, imagine you want to provide an opportunity to upload files.
This guide will show you how to use the most important of them.

## The media upload component

The Shopware 6 Administration media upload component makes it relatively easy to upload media of various kinds such as images, videos and audio files.
This is done through the `sw-media-upload-v2` component as seen below:

```html
<div>
    <sw-media-upload-v2
        uploadTag="my-upload-tag"
        :allowMultiSelect="false"
        variant="regular"
        :autoUpload="true"
        label="My image-upload">
    </sw-media-upload-v2>
</div>
```

As you can see in the code sample below, the `sw-media-upload-v2` is pretty configurable through properties.
To get an overview of all the options, here is a list:

| Property           | Function                                                                                                                        |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `source`           | The source that will be used for the internal `sw-media-preview-v2` if the component is not used in the `allowMultiSelect` mode |
| `variant`          | This can be used to choose between the `regular` and the `compact` variants                                                     |
| `uploadTag`        | This is used to coordinate with the `sw-upload-listener` component                                                              |
| `allowMultiSelect` | Sets whether multiple files can be uploaded at once                                                                             |
| `label`            | The text that is displayed in the header                                                                                        |
| `defaultFolder`    | The path where the file will be put                                                                                             |
| `targetFolderId`   | The `targetFolderId` that will be used as a backup to the `defaultFolder`                                                       |
| `helpText`         | Sets the `helpText` displayed in the header of the component                                                                    |
| `fileAccept`       | Sets what the underlying `<input>`, accepts standard is `image/*`                                                                 |
| `disabled`         | Disables the whole component                                                                                                    |

## Keeping track of uploads

As seen below, the `sw-upload-listener` component can be used in conjunction with an `sw-media-upload-v2` component.

```html
<div>
    <sw-media-upload-v2
        uploadTag="my-upload-tag"
        :allowMultiSelect="false"
        variant="regular"
        label="My image-upload">
    </sw-media-upload-v2>
    <sw-upload-listener
        @media-upload-finish="onUploadFinish" 
        uploadTag="my-upload-tag">
    </sw-upload-listener>
</div>
```

Notice that the `uploadTag` needs to be the same in the `sw-media-upload-v2` and the `sw-upload-listener` for them to communicate properly.
Beyond the `media-upload-finish` event there are a few more events:

| Event                 | Description                                        |
|-----------------------|----------------------------------------------------|
| `media-upload-add`    | This event is triggered when an upload is added    |
| `media-upload-finish` | This event is triggered when an upload finishes    |
| `media-upload-fail`   | This event is triggered on an upload failing       |
| `media-upload-cancel` | This event is triggered when an upload is canceled |

## Previewing Media

Media can be previewed with the `sw-media-preview-v2` component as seen below:

```html
<sw-media-preview-v2
    :source="some-id">
</sw-media-preview-v2>
```

As previously mentioned this component is already embedded within the `sw-media-upload-v2`.
However, using it as a separate component you get access to the following configuration options:

| Property         | Function                                                                      |
|------------------|-------------------------------------------------------------------------------|
| `source`         | The `id` or alternately the path to the media to be previewed                 |
| `showControls`   | Controls whether media such as videos or audio shows controls                 |
| `autoplay`       | Controls whether media such as videos or audio auto-plays                     |
| `hideTooltip`    | Hides the the filename tooltip of the media in at the bottom of the component |
| `mediaIsPrivate` | If set to true displays various lock symbols                                  |
