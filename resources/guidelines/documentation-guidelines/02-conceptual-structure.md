---
nav:
  title: Conceptual Structure
  position: 20

---

# Conceptual Outline

Our documentation is categorized into the following sections - Concepts, Products, Guides, and Resources. This structure provides different levels of detail, abstraction, and focus.

To give our readers a good experience, we have established writing guidelines for these sections.

## Concepts

This section articulates the core concepts of Shopware. It is an entry point to learn about how the platform is organized. This section rather **explain** than **show** how things work; therefore, please follow the guidelines below when writing *Concepts*.

* **Introduction** - Introduce the concept by its purpose — for example, *This article discusses the Shopware cart. Along the way, you will find answers to the following questions:*
  * *What is the cart?*
  * *What can it contain?*
  * *How does it relate to users and orders?*

* **Description** - Give a short description of the concept within 2-3 sentences — for example,  *"The cart is a collection of items a user wants to buy within the shop. It might contain products, discounts, or virtual products like bundles or configurable products. Eventually, a cart gets converted into an order. This process is called checkout."*

Use cross-references to help users fully understand the text — for example, provide a link to *configurable products* or *checkout* articles. Don't use terms like *"custom products"* as these are Shopware-specific, and newcomers may find it difficult to understand.

* **Comprehensive explanation** - Explain the concept in detail with examples, illustrations, tables, graphs, or sudo-code.

  Don't use any Shopware-specific source code. Using source code within a conceptual article has the following drawbacks:
  * It introduces another dependency that has to be maintained.
  * It builds on the presumption that readers know the given language and context.
  * People tend to copy & paste without context.

## Products

This section deals with topics specific to a single product of Shopware. Every product shares at least some aspect and serves as an entry point to other sections. For example, the *catalog* used within our Community Edition and in all commercial plans is technically the same.

## Guides

This section of the document is home to all the *how-to's*, *examples, cookbooks*, and *tutorials*. In contrast to articles within the *Concepts section*, *Guides* show code, give concrete examples, and provide step-by-step instructions.

It is essential to refer back to the concepts section for related topics from the Guides. For example, *"How to create a custom cart processor"* might contain terms and concepts explained within the "Concepts &gt; Commerce &gt; Checkout &gt; Cart" section and also relate to topics dealt within the "Concepts &gt; Framework &gt; Rules" section. A clear structure allows you to create these cross-references and make the documentation more readable.

## Resources

Resources contain structured documentation for API references, code references, testing references, tooling, links, SDKs, libraries, etc. It also includes guidelines for contribution and publishing.

Now that you have understood the documentation structure, the following section describes the command over language one needs to use for documentation.
