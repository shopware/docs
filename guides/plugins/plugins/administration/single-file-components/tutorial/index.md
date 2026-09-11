---
nav:
  title: Tutorial
  position: 20

---

# Tutorial: extend the Administration with Single File Components

<!--@include: ../../../../../../snippets/guide/administration_sfc_experimental.md-->

Five chapters, one continuous build. You start with an empty directory and end with a plugin that warns a merchant when a product's profit margin is too low, on the product detail page every merchant already knows.

![The finished plugin on the product detail page](../../../../../../assets/administration-sfc-tutorial-extended.png)

Three lines of that banner come from three different files, and telling them apart is what the tutorial is for: markup your component owns, state an override replaced, and markup a second override added.

## Before you start

| Requirement | Notes |
| --- | --- |
| A Shopware installation from `trunk` | SFC support is not in any 6.7 release |
| Docker | [Chapter 1](set-up-your-environment) sets the shop up with Shopware CLI |
| Vue 3 and the Composition API | `computed` and `<script setup>` are used from the first chapter and are not explained here |

Previous Administration experience is not needed. If you have it, the "What this replaces" section at the end of each chapter puts the new way next to the Twig and Options API way you already know.

## Chapters

<PageRef page="set-up-your-environment" title="1. Set up your environment" sub="Docker, the plugin skeleton, and the build" />
<PageRef page="your-first-override" title="2. Your first override" sub="Put your own markup on the product detail page" />
<PageRef page="read-the-base-component" title="3. Read the component you extend" sub="useSwPreviousState() and real product data" />
<PageRef page="build-your-own-component" title="4. Build your own component" sub="A base SFC with props and state of its own" />
<PageRef page="make-it-extensible" title="5. Make your component extensible" sub="sw-block, swDefinePublic and swDefineOverride" />
