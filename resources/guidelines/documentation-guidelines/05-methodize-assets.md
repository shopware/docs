---
nav:
  title: Methodize Assets
  position: 10

---

# Methodize Assets

It is essential to organize and keep all the assets (images, files, videos, etc) used in our documentation. This section briefs you about how the assets are represented, managed and what naming conventions are followed.

::: info To create a pictorial illustration, reach out to the Shopware design team.
:::

## Images

* Screenshots can be taken using GIMP, Snipping tools, or any tool you have already worked on.

* Prefer to add SVG over PNG images as SVGs stay sharp when you zoom in on the image. This applies to all created images. However, snipped images can be in PNG format.

* Add all the images to the .gitbook/assets/ directory and give them a meaningful name.

* Use the below-naming convention for the images:

  * *<toc_topic_name>-<meaningful_image_name>.svg*. For example,

    ```markdown
        storefront-pages.svg
    ```

  * If sub-topic exists, *<toc_topic_name>-<sub_topic_name>-<meaningful_image_name>.svg*. For example,

    ```markdown
        storefront-dataHandling-pages.svg 
    ```

  * The image names can be serialized if multiple images are under the same topic. For example,

    ```markdown
        storefront-dataHandling-pages_01.svg
    ```

* Use `alt text` and figure captions. This details what an image is trying to convey.

* An introductory sentence should precede most images.

## File

Every file added to a folder can have a naming convention as:

*<two_digit_number>-<meaningful_image_name>.md.* For example,

```markdown
01-doc-process.md
```

## Video

* Provide captions and transcripts for video content.

* A similar naming pattern as images is also followed for videos.

All the previous sections detail you about articulating and formatting the document. The next section describes the entire process of writing, reviewing, and publishing the documentation.
