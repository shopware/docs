# Structure

Our documentation follows a structure which provides different levels of detail, abstraction and focus. In order to give our readers a good experience, we're also establishing guidelines for writing documentation in the different sections.

### Guides

This section will be home to all the _how-tos_, _examples_, _cook-books_ and _tutorials_. In contrast to articles within the _Concepts_ section, _Guides_ should show code, give concrete examples and have step-by-step instructions. It is important to refer to the concepts which are related to a particular guide.

Example - A Guide _"How to create a custom cart processor"_ might contain terms and concepts which were explained within the "Concepts &gt; Commerce &gt; Checkout &gt; Cart" sections and also relate to topics dealt with in the "Concepts &gt; Framework &gt; Rules" section. A clear structure allows us to create these cross-references and make the documentation more readable and enjoyable.

> Start with the [Guide Documentation Template](templates/guide-documentation-template.md)

### Concepts

This section contains articles which deal with the core concepts of Shopware and provide an entry point to collect knowledge about how the platform is organised. These articles should **explain** rather than **show** how things work - therefore please stick to these common guidelines when you're writing _Concepts_.

* Introduce the article by explaining what you're going to deal with:  _"In this article, we'll be discussing the cart of Shopware. Along the way, you'll find answers for the following questions:_ 
  * _What is the cart?_
  * _What can it contain?_
  * _How does it relate to users and orders?"_ 
* Give a short and general introduction and position the concept within the platform \(2-3 sentences\):  _"The cart is a collection of items a user wants to buy within the shop. It might contain products, but also discounts or virtual products like bundles or configurable products. Eventually, a cart can be converted into an order. This process is called checkout."_  Use cross-references to help users fully understand the text. For example, link to _configurable products_ or _checkout_. Don't use terms like "custom products" as these are Shopware-specific and newcomers won't understand what you mean. 
* Explain the concept in the way that you think is applicable. Show examples \(illustrations, tables, graphs, sudo-code\), but try to not use any Shopware-specific source code. Using source code within conceptual articles has several drawbacks: 
  * It introduces another dependency which has to be maintained
  * It build on the presumption, that readers know the given language and context
  * People tend to copy & paste without context
  * Though readable code is great it's not meant to convey "understanding"

### Products

The _Products_ section deals with topics which are specific to a single product of Shopware. Since almost all of our products share at least some aspects, it also serves as an "entry point" to other sections and articles. For example, the "catalog" used within our Community Edition and Professional Edition is technically the same.

However, every edition features some things that others don't - such as the B2B Suite within the enterprise edition. The corresponding documentation can then be found in "Products &gt; Enterprise Edition &gt; B2B Suite". At some point we might create dedicated spaces \(documentations\) for some of those entries. These spaces can then follow a similar structure to the entire documentation.

### Resources

Resources contain structured documentation, such as API references, tooling, links, SDKs, libraries but also guidelines for contribution, publishing.

