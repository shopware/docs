# Manifest reference

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/app-system/0.1.0/src/Core/Content/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <!-- This is the element for the technical name of your app and must equal the name of the folder your app is contained in -->
        <name>MyExampleApp</name>
        <!-- In this element, you can set al label for your app. To include translations use the `lang` attribute -->
        <label>Label</label>
        <label lang="de-DE">Name</label>
        <!-- Translatable, A description of your app -->
        <description>A description</description>
        <description lang="de-DE">Eine Beschreibung</description>
        
        <author>Your Company Ltd.</author>
        <copyright>(c) by Your Company Ltd.</copyright>
        <version>1.0.0</version>
        <license>MIT</license>
        <!-- Optional, you can set the path to an icon that should be shown for your app, the icon needs to a `png` file -->
        <icon>icon.png</icon>
        <!-- Optional, in this element you can link to your privacy policy -->
        <privacy>https://your-company.com/privacy</privacy>
        <!-- Optional, Translatable, in this element you can describe the changes the shop owner needs to apply to his shops privacy policy, e.g. because you process personal information on an external server -->
        <privacyPolicyExtensions>
            This app processes following personal information on servers based in the U.S.:
            - Address information
            - Order positions
            - Order value
        </privacyPolicyExtensions>
        <privacyPolicyExtensions lang="de-DE">
            Diese App verarbeitet folgende personenbezogene Daten auf Servern in den USA:
            - Adress-Informationen
            - Bestellpositionen
            - Bestellsumme
        </privacyPolicyExtensions>
    </meta>
    <!-- Optinal, can be omitted if no communication between Shopware and your app is needed -->
    <setup>
        <!-- The URL which will be used for the registration -->
        <registrationUrl>https://my.example.com/registration</registrationUrl>
        <!-- Dev only, the secret that is used to sign the registration request -->
        <secret>mysecret</secret>
    </setup>
    <!-- Optional, can be omitted if your shop does not need permissions -->
    <permissions>
        <!-- request each permission your app needs -->
        <read>product</read>
        <create>product</create>
        <update>product</update>
        
        <delete>order</delete>
    </permissions>
    <!-- Optional -->
    <webhooks>
        <!-- register webhooks you want to receive, keep in mind that the name needs to be unique -->
        <webhook name="product-changed" url="https://example.com/event/product-changed" event="product.written"/>
    </webhooks>
</manifest>
```
{% endcode %}

