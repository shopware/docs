# Storefront

In this article, we'll get to know our Storefront component and learn a lot of its main concepts. Along the way, you'll
find answers to the following questions:

- What is the Storefront component & what's its main purpose?
- What technologies are being used?
- How is the Storefront structured?
- Which parts of other Platform components are being used?
- How does the composite data handling work?
- What's the definition & main purpose of Pages, Pagelets, Controllers and their corresponding Templates?
- How is the Storefront handling translations and assets?

## Introduction

The Storefront component is a Frontend written in PHP. It conceptually sits on top of our Core - similar to the
Administration component. As the Storefront can be seen as a classical PHP application, it makes usage of HTML
rendering, JavaScript and a CSS preprocessor. Speaking of technologies, the Storefront component uses Twig as the
templating engine and SASS for styling purposes. The foundation of the Storefront component is based on the Bootstrap
framework and therefore fully customizable.   
