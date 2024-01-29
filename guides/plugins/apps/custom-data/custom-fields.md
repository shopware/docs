---
nav:
  title: Custom fields
  position: 10

---

# Custom Data

You can add custom fields to Shopware and thus add your own fields to extending data records. The user is able to modify this fields from within the Shopware Administration.  
To make use of the custom fields, register your custom field sets in your manifest file:

<<< @/docs/snippets/config/app/custom-fields-simple.xml

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference).

For the data needed, please refer to the custom fields in general: At first, you need a custom field set, as [custom fields](../../plugins/framework/custom-field/) in Shopware are organised in sets. Here you need to consider some important fields:

* `name`: A technical name for your set
* `label`: This element provides the label of the text and can be used for defining translations of the label as well.
* `related-entities`: With this element set the entities the custom field set is used in
* `fields`: Finally, the fields are configured in this section.

::: warning
The names of the custom fields are global and therefore should always contain a vendor prefix, like "swag" for "shopware ag", to keep them unique. This holds true for the name of the custom field set, as well as each name of the fields itself.
:::

When defining custom fields in the `<fields>` element, you can configure additional properties of the fields. For example a `placeholder`, `min`, `max` and `step` size of a float field:

```html
<float name="swag_test_float_field">
    <label>Test float field</label>
    <label lang="de-DE">Test-Kommazahlenfeld</label>
    <help-text>This is an float field.</help-text>
    <position>2</position>
    <placeholder>Enter an float...</placeholder>
    <min>0.5</min>
    <max>1.6</max>
    <steps>0.2</steps>
</float>
```

Refer to the [custom field](../../plugins/framework/custom-field/) documentation for further details.
