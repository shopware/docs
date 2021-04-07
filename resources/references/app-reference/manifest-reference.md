# Manifest Reference

{% code title="manifest.xml" %}
```xml
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
    <!-- Optional, can be omitted if the administration should not be extended -->
    <admin>
        <!-- Register a custom module that is used as a parent menu entry for other modules -->
        <module name="myAdminModules"
                parent="sw-marketing"
                position="50"
        >
            <label>My modules</label>
            <label lang="de-DE">Meine Module</label>
        </module>
        <!-- Register a custom module (iframe), that should be loaded from the given surce -->
        <module name="exampleModule"
                source="https://example.com/promotion/view/promotion-module"
                parent="app-MyExampleApp-myAdminModules"
        >
            <label>Example Module</label>
            <label lang="de-DE">Beispiel Modul</label>
        </module>
        <!-- Register a module that is opened from the app store and your list of installed apps -->
        <main-module source="https://example.com/main-module"/>
        <!-- Register action buttons that should be displayed in the detail and listing pages of the administration -->
        <!-- view is one of: "list", "detail" -->
        <action-button action="setPromotion" entity="promotion" view="detail" url="https://example.com/promotion/set-promotion">
            <label>set Promotion</label>
        </action-button>
        <action-button action="deletePromotion" entity="promotion" view="detail" url="https://example.com/promotion/delete-promotion">
            <label>delete Promotion</label>
        </action-button>
        <action-button action="restockProduct" entity="product" view="list" url="https://example.com/restock">
            <label>restock</label>
        </action-button>
    </admin>
    <!-- Optional -->
    <custom-fields>
        <!-- register each custom field set you may want to add -->
        <custom-field-set>
            <!-- the technical name of the custom field set, needs to be unique, therefor use your vendor prefix -->
            <name>swag_example_set</name>
            <!-- Translatable, the label of the field set -->
            <label>Example Set</label>
            <label lang="de-DE">Beispiel-Set</label>
            <!-- define the entities to which your field set should be assigned -->
            <related-entities>
                <order/>
            </related-entities>
            <!-- define the fields in your set -->
            <fields>
                <!-- the element type, defines the type of the field -->
                <!-- the name needs to be unique, therefore use your vendor prefix -->
                <text name="swag_code">
                    <!-- Translatable, the label of the field -->
                    <label>Example field</label>
                    <!-- Optional, Default = 1, order your fields by specifying the position -->
                    <position>1</position>
                    <!-- Optional, Default = false, mark a field as required -->
                    <required>false</required>
                    <!-- Optional, Translatable, the help text for the field -->
                    <help-text>Example field</help-text>
                </text>
                <float name="swag_test_float_field">
                    <label>Test float field</label>
                    <label lang="de-DE">Test-Kommazahlenfeld</label>
                    <help-text>This is an float field.</help-text>
                    <position>2</position>
                    <!-- some elements allow more configuration, like placeholder, main and max values etc. -->
                    <!-- Your IDE should give you pretty good autocompletion support to explore the configuration for a given type -->
                    <placeholder>Enter an float...</placeholder>
                    <min>0.5</min>
                    <max>1.6</max>
                    <steps>0.2</steps>
                </float>
            </fields>
        </custom-field-set>
    </custom-fields>
</manifest>
```
{% endcode %}

