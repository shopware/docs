---
nav:
  title: Methodize Assets
  position: 10

---

# Methodize Assets

Maintaining a well-organized repository for all documentation assets, including images, videos, and files, is crucial. This section provides an overview of how assets are represented, managed, and the naming conventions that are adhered to.

::: info
For the creation of a visual representation, either contact the Shopware design team directly or submit a request through the [Issues](https://github.com/shopware/docs/issues) section.
:::

## Visual diagram guidelines

Our documentation categorizes visuals into different types, including screenshots, diagrams (such as UML and flowcharts), and GIFs. Each of these visual elements shares common quality standards. This section outlines the specific requirements that must be met by all visuals used in technical documentation.

Use the following standards:

| Image attributes | Specification | Notes|
|------------------|---------------|---------|
| File type| Only .png, .svg and .gif| Use a lossless image format for screenshots (i.e., PNG) and vector format (i.e., SVG) for drawings (diagram, chart, logos, ...).|
|File size | max. 5 MB | It is best to upload high-quality images. |
|File name | Only use letters and hyphens `<topicName>-<subtopicName>-<meaningfulImageName>.md.` | Use the naming convention documented below in naming conventions for images.|
|Image size | Width: max 768px, Height: max 576px | This is automatically taken care by the inbuilt functions in our docs.|
|Aspect ratio | 4:3 | This is automatically taken care by the inbuilt functions in our docs. |
|Copyright| - |Determine if an image or diagram is protected by copyright. If it is, you must obtain permission and acknowledge credit.|
|Personal identifiable information (PII) | - | Make sure to mask, modify, or remove any PII such as passwords, logins, account details, or other information that could compromise security.|
|Alt tags| `![Alt](/path/to/img.jpg “image title”)` | Make sure to include alt text for every image. The text is used in situations where the image isn’t visible and image SEOs.|
|Borders|-|No borders are added to the images|

What needs to be considered for visual diagrams:

* If you add images to illustrate items in a list (typically, steps in a procedure), align these images accordingly:
    * If there is only one image that illustrates the entire procedure, place the image at the end of the procedure or align it with the lead-in paragraph.
    * If you need to provide an image for each step in the procedure, place each image at the end of each step it follows.

* When images is to be embedded in files/nested files, then use the below naming convention for the images:

  * *`<topicName>-<meaningfulImageName>.svg`*. For example,

    ```markdown
        storefront-pages.svg
    ```

  * If sub-topic exists, *`<topicName>-<subtopicName>-<meaningfulImageName>.svg`*. For example,

    ```markdown
        storefront-dataHandling-pages.svg 
    ```

  * The image names can be serialized if multiple images are under the same topic. For example,

    ```markdown
        storefront-dataHandling-pages_01.svg
    ```

* An introductory sentence should precede most images.

* Store all the media in the [assets directory]( https://github.com/shopware/docs/tree/main/assets). Once it is loaded, copy the reference to the Markdown file. Test images in a local build.

## Diagrams

Consider using diagrams when you need to:

* Show architecture
* Show complex relationships
* Define a complex workflow
* For flowcharts, sequence diagram, state machine diagram, class diagram, etc use [Mermaid](https://mermaid.live/) to create one and add the diagram code in codeblock.

## Screenshots

Consider using screenshots when you want to:

* Provide an example of a visualization
* Show panels populated with query and settings
* Show configurations and settings
* Emphasize a new feature
* Limit the contents of an image to the relevant portion. Do not include distracting or unnecessary content and whitespace.

What needs to be considered for taking screenshots :

* If the screenshot shows a desktop application interface, you must use the latest OS version supported by the solution to take the screenshot.
* The screenshot must be in focus and show an active window, wizard or dialog box.
* Avoid both horizontal and vertical scroll bars whenever possible.
* The screenshot must show real-world data or at least data that is close to realistic use cases.
* All screenshots you take must be consistent with each other.
* Screenshots can be taken using GIMP, Snipping tools, or any tool you have already worked on.
* Do not use screenshots for Code samples (show code samples in codeblocks).
* Do not take screenshots for a page that is likely to change frequently.

## GIFs

Consider using GIFs when you want to:

* Demonstrate procedures.
* Highlight functionalities visually.
* Aid setup and initial tasks with visual guides.

## File

Every file added to a folder can have a naming convention as:

*`<two_digit_number>-<meaningful_image_name>.md`.* For example,

```markdown
01-doc-process.md
```

## Video

* Provide captions and transcripts for video content.

* A similar naming pattern to that of images is also followed for videos.

All the previous sections detail how to articulate and format the document. The next section describes the entire process of writing, reviewing, and publishing the documentation.
