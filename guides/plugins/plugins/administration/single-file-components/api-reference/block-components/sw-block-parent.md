---
nav:
  title: sw-block-parent
  position: 70

---

# `sw-block-parent`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```html
<sw-block-parent />
```

Takes no props. Renders whatever the extension point held before this override: the default content, or the previous override in the chain. Globally registered, so you write the tag without importing anything.

Leave it out and the original markup is replaced.

## Position decides yours

```html
<!-- append -->
<sw-block extends="swag_greeting_card_body">
    <sw-block-parent />
    <p>I go after</p>
</sw-block>

<!-- prepend -->
<sw-block extends="swag_greeting_card_body">
    <p>I go before</p>
    <sw-block-parent />
</sw-block>

<!-- replace -->
<sw-block extends="swag_greeting_card_body">
    <p>The original content is gone</p>
</sw-block>
```

## Render it once, unconditionally

It claims its position in the chain when it is created, so a `v-if` on it, or a `v-for` around it, corrupts that chain. One `<sw-block-parent />` per extending block, always rendered.

## Chains

When several overrides target one block they stack, and each one's `<sw-block-parent />` renders the previous one's output rather than the original default. That is what keeps other plugins on the page when your own change is additive.
