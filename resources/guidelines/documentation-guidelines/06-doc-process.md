---
nav:
  title: Doc Process
  position: 20

---

# Documentation Process

You have gone a long way in understanding audience types, language rules, grammar treatment on textual content, and Shopware documentation structure to managing assets.

Now, are you thinking of how to kick-start?

Refer to our [GitHub repository](https://github.com/shopware/docs) for the complete process, from cloning the repository to publishing the content.

Well-defined writing leads to a more consistent, efficient learning experience for readers. We want to establish a common process for writing, reviewing, iterating, and maintaining documentation.

This section guides you on how to ink down your knowledge and publish the article.

## Ideate

When you prefer to contribute to an existing article or create a new one, consider yourself the "knowledge lead" for that particular topic while documenting.

Do some research and prepare a rough outline addressing the following points and prompt other maintainers for feedback:

* Who is the audience?
* What article are you going to write?
* What are the prerequisites for readers?
* Which questions are you going to answer?
* Which other topics might be relevant/interesting?

## Write

After you have discussed the abstract and set the objectives, start writing.

It is good to follow a "30/90" rule. This rule suggests creating the first draft when 30% done and taking the first feedback at a high level. When 90% done, schedule a steady review for in-depth validation.

In your first draft:

* Prepare the document structure (flow of topics).
* Jot down the topics of the documentation to be included and describe them.
* Mention all the points briefly that would be part of this article.
* Have a common thread throughout your article.
* Add placeholders for images or code blocks to be added later.
* Work with cross-references \(knowledge is a network, not a one-way street \).
* Try to use non-Shopware-specific language when possible or provide a link to its description (e.g., "DAL").

### Guidelines to writing concepts

* **Introduction** - Introduce the concept (for example, cart) by its purpose in such a way that it answers the following general questions:
  * *What is a cart?*
  * *What can it contain?*
  * *How does it relate to users and orders?*
  * *What can the readers expect in the further connected articles?*

Use cross-references to help users fully understand the text — for example, provide a link to *configurable products* or *checkout* articles. Don't use terms like *"custom products"* as these are Shopware-specific, and newcomers may find it difficult to understand.

* **Comprehensive explanation** - Explain the concept in detail with examples, illustrations, tables, graphs, or pseudo-code.

  Don't use any Shopware-specific source code. Using source code within a conceptual article has the following drawbacks:
  * It introduces another dependency that has to be maintained.
  * It builds on the presumption that readers know the given language and context.
  * People tend to copy & paste without context.

* **Conclusions** - If possible add a connective statement to the next article that follows.

## Review

After writing the first 30%, consult a reviewer to give some initial feedback. Discuss the current progress and re-arrange some parts if needed.

If you are the reviewer, check the text's general approach, tone, and wording as per the standard guidelines. Provide the curator with some early direction and feedback. Having multiple reviewers can be beneficial.

This process can be repetitive until the final version is ready.

## Publish

Before the final version is published, cross-check if the article fulfills all the questions and objectives outlined at the beginning. This must be reviewed, and feedback must be incorporated.

After reviewing the final draft, it will be published on notifying the administrators.

## Maintain Versions

All contents are based on Shopware Major versions, such as 6.3, 6.4, 6.5, etc. The current version is reflected by our GitHub repositories' `master` branch, whereas each older version has its respective separate branch.

If a documented feature or functionality is introduced within major versions (and also in cases where you think it is applicable), please include a hint showing the version constraints as below:

::: info
This functionality is available starting with Shopware 6.4.3.0.
:::



**Your contribution is our pride!**
