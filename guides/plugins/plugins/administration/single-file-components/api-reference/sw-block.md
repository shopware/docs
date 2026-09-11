---
nav:
  title: sw-block
  position: 60

---

# `sw-block`

<!--@include: ../../../../../../snippets/guide/administration_sfc_experimental.md-->

The extension point. Globally registered, so you write the tag without importing anything. Which prop you pass decides what it does.

| Prop | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | **Declares** an extension point. Its children are the default content |
| `extends` | `string` | **Contributes** to the extension point of that name. Renders nothing where it stands |

`name` and `extends` are the only props you write. The component has others - your editor may offer them - and they are internal: the build rejects an authored `data`, `v-bind` or `#default` on an `sw-block`.

## Declaring an extension point

```html
<sw-block name="swag_greeting_card_body">
    <p>Default content</p>
</sw-block>
```

With nothing registered against the name, this renders as though the wrapper were not there.

## Contributing to one

```html
<sw-block extends="swag_greeting_card_body">
    <sw-block-parent />
    <p>Mine, underneath</p>
</sw-block>
```

The target block is replaced by what goes inside. To keep what was there, render [`sw-block-parent`](sw-block-parent).

An `<sw-block extends>` belongs at the root of an override's template and cannot be nested inside another element. Where it sits does not affect where its content renders: it registers the content, and the matching `<sw-block name>` renders it.

## Names

Block names are strings and nothing validates them, so a typo silently matches nothing. They must be unique per component. The convention is an owner prefix and then the path through the component, in `snake_case`: core uses `sw_`, a plugin uses its own.

```text
sw_product_detail_base_price_form
swag_greeting_card_body
```

## Bindings in block content

Your override's bindings are available inside its `<sw-block extends>` content and read like any other Vue template binding. Mutating one from the template - `@click="counter++"` - is not supported; wrap the mutation in a function and call that instead.
