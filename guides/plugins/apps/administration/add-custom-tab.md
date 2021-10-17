# Add custom Tab

Starting from Shopware version 6.4.6.0, you are able to add your own tab to the administration, that is a structure element that should be shown on a page (and its respective child routes).
In order to create a custom tab, you need to define an admin element to define `<admin>` extensions. In there, please add your tab by defining a `<tab>` element.

* Here you're able to define the parent route where the tab will be displayed and the path of your tab.
* To define the tab's title and its translation, you can add a label as child element.

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        ...
    </meta>
    <admin>
        ...
        <tab parent="sw.product.detail" path="NewTab">
            <label>New tab</label>
        </tab>
    </admin>
    ...
</manifest>
```
{% endcode %}

For a complete reference of the structure of the manifest file take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference.md).
