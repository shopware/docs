# CMS Reference

```xml
// cms.xml
<?xml version="1.0" encoding="utf-8" ?>
<cms xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Cms/Schema/cms-1.0.xsd">
    <blocks>
        <block>
            <!-- A unique technical name for your block. We recommend to use a shorthand prefix for your company, e.g. "Swag" for shopware AG. -->
            <name>my-first-block</name>
            <!-- The category your block is associated with. See the XSD for available categories. -->
            <category>text-image</category>

            <!-- Your block's label which will be shown in the CMS module in the Administration. -->
            <label>First block from app</label>
            <!-- The label is translatable by providing ISO codes. -->
            <label lang="de-DE">Erster Block einer App</label>

            <!-- The slots that your block holds which again hold CMS elements. -->
            <slots>
                <!-- A slot requires a unique name and a type which refers to the CMS element it shows. Right now you can only use the CMS elements provided by Shopware but at a later point you will be able to add custom elements too. -->
                <slot name="left" type="manufacturer-logo">
                    <!-- The slot requires some basic configuration. The following config-value elements highly depend on which element the slot holds. -->
                    <config>
                        <!-- The following config-value will be interpreted as "displayMode: { source: "static", value: "cover"}" in the JavaScript. -->
                        <config-value name="display-mode" source="static" value="cover"/>
                    </config>
                </slot>
                <slot name="middle" type="image-gallery">
                    <config>
                        <config-value name="display-mode" source="static" value="auto"/>
                        <config-value name="min-height" source="static" value="300px"/>
                    </config>
                </slot>
                <slot name="right" type="buy-box">
                    <config>
                        <config-value name="display-mode" source="static" value="contain"/>
                    </config>
                </slot>
            </slots>

            <!-- Each block comes with a default configuration which is pre-filled and customizable when adding a block to a section in the CMS module in the Administration. -->
            <default-config>
                <margin-bottom>20px</margin-bottom>
                <margin-top>20px</margin-top>
                <margin-left>20px</margin-left>
                <margin-right>20px</margin-right>
                <!-- The sizing mode of your block. Allowed values are "boxed" or "full_width". -->
                <sizing-mode>boxed</sizing-mode>
                <background-color>#000</background-color>
            </default-config>
        </block>

        <block>
            <name>my-second-block</name>
            <category>text-image</category>

            <label>Second block from app</label>
            <label lang="de-DE">Zweiter Block einer App</label>

            <slots>
                <slot name="left" type="form">
                    <config>
                        <config-value name="display-mode" source="static" value="cover"/>
                    </config>
                </slot>
                <slot name="middle" type="image">
                    <config>
                        <config-value name="display-mode" source="static" value="auto"/>
                        <config-value name="background-color" source="static" value="red"/>
                    </config>
                </slot>
                <slot name="right" type="youtube-video">
                    <config>
                        <config-value name="display-mode" source="static" value="contain"/>
                    </config>
                </slot>
            </slots>

            <default-config>
                <margin-bottom>20px</margin-bottom>
                <margin-top>20px</margin-top>
                <margin-left>20px</margin-left>
                <margin-right>20px</margin-right>
                <sizing-mode>boxed</sizing-mode>
                <background-color>#000</background-color>
            </default-config>
        </block>
    </blocks>
</cms>
```
