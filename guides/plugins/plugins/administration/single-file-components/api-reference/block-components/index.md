---
nav:
  title: Block components
  position: 30

---

# Block components

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

Two globally registered components carry the native block system. You write the tags without importing anything.

<PageRef page="sw-block" title="sw-block" sub="Declare an extension point, or contribute to one" />
<PageRef page="sw-block-parent" title="sw-block-parent" sub="Render what the extension point held before you" />

## The model

A component **declares** an extension point by wrapping markup in `<sw-block name="…">`. Its children are the default content, and with nothing registered against the name it renders as though the wrapper were not there.

An override **contributes** to that point with `<sw-block extends="…">`. That tag renders nothing where it stands: it registers its content, and the matching `<sw-block name>` renders it wherever that happens to be.

```html
<!-- swag-greeting-card.vue -->
<sw-block name="swag_greeting_card_body">
    <p>Default content</p>
</sw-block>

<!-- swag-greeting-card.override.vue -->
<sw-block extends="swag_greeting_card_body">
    <sw-block-parent />
    <p>Mine, underneath</p>
</sw-block>
```

## Names

A block name is a plain string and nothing validates it, so a typo matches nothing and fails silently. Names must be unique per component.

The convention is an owner prefix, then the path through the component, in `snake_case`:

```text
sw_product_detail_base_price_form
swag_greeting_card_body
```

Core uses `sw_`; a plugin uses its own prefix. A block you find in core is covered by the backwards-compatibility promise, so you can rely on it until the next major version.

## Chains

Several overrides may target one block. They stack in registration order, and each one's `<sw-block-parent />` renders the previous one's output rather than the original default. Leaving `<sw-block-parent />` out replaces everything below it, which is how one plugin removes another plugin's contribution.
