---
nav:
  title: Entities Reference
  position: 50

---

# Entities Reference

```xml
// entities.xml
<?xml version="1.0" encoding="utf-8" ?>
<entities xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/CustomEntity/Xml/entity-1.0.xsd">
    <entity name="custom_entity_blog">
        <fields>
            <!-- we support different scalar values: int, float, string, text, bool, date -->
            <int name="position" store-api-aware="true" />
            <float name="rating" store-api-aware="true" />
            <string name="title" required="true" translatable="true" store-api-aware="true" />
            <text name="content" allow-html="true" translatable="true" store-api-aware="true" />
            <bool name="display" translatable="true" store-api-aware="true" />
            <date name="my_date" store-api-aware="false" />

            <!-- additionally, to the scalar values, we have support for json fields  -->
            <json name="payload" store-api-aware="false" />
            
            <!-- beside the generic fields, we support different logical fields like email and price -->
            <email name="email"  store-api-aware="false" />
            <price name="price" store-api-aware="false" />

            <!-- you may want to define that some fields should not be available in the store-api -->
            <text name="internal_comment" store-api-aware="false" />

            <!-- you can also define relation between entities -->
            <many-to-many name="products" reference="product" store-api-aware="true" />

            <!-- it is also possible to cascading relations between you own custom entities. In this case, we delete all ce_blog_comment records, when the linked custom_entity_blog record deleted -->
            <one-to-many name="comments" reference="ce_blog_comment" store-api-aware="true" on-delete="cascade" reverse-required="true" />
            
            <!-- There are many other cascade cases which we support -->

            <!-- Restrict product deletion when the product is set as `top_seller` -->
            <many-to-one name="top_seller_restrict" reference="product" store-api-aware="true" required="false" on-delete="restrict" />
                <!-- This definition, generates a fk field automatically inside the product table -->

            <!-- when product deleted, delete all custom_entity_blog records where the product is defined as `top_seller_cascade`-->
            <many-to-one name="top_seller_cascade" reference="product" store-api-aware="true" required="true" on-delete="cascade" />

            <!-- when product deleted, set the `top_seller_set_null` column to null -->
            <many-to-one name="top_seller_set_null" reference="product" store-api-aware="true" on-delete="set-null" />

            <!-- restrict product deletion when the product is set as `link_product_restrict`-->
            <one-to-one name="link_product_restrict" reference="product" store-api-aware="false" on-delete="restrict" />

            <!-- when product deleted, delete all custom_entity_blog records where the product is defined as `link_product_cascade`-->
            <one-to-one name="link_product_cascade" reference="product" store-api-aware="false" on-delete="cascade" />

            <!-- when product deleted, set the `link_product_set_null_id` column to null -->
            <one-to-one name="link_product_set_null" reference="product" store-api-aware="false" on-delete="set-null" />

            <!-- restrict custom_entity_blog deletion, when the blog is linked in some category -->
            <one-to-many name="links_restrict" reference="category" store-api-aware="true" on-delete="restrict" />

            <!-- set custom_entity_blog_links_id to null, when the custom_entity_blog record deleted -->
            <one-to-many name="links_set_null" reference="category" store-api-aware="true" on-delete="set-null" />

            <!-- we also support inheritance for product relations  -->
            <many-to-many name="inherited_products" reference="product" store-api-aware="true" inherited="true"/>
            <many-to-one name="inherited_top_seller" reference="product" store-api-aware="true" required="false" inherited="true" on-delete="set-null"/>
            <one-to-one name="inherited_link_product" reference="product" store-api-aware="true" inherited="true" on-delete="set-null" />
        </fields>
    </entity>

    <!-- since shopware v6.5.15.0 you can use the `ce_` shorthand prefix, to make your entity names shorter -->
    <entity name="ce_blog_comment">
        <fields>
            <string name="title" required="true" translatable="true" store-api-aware="true" />
            <!-- <fk name="ce_blog_comments_id" required="true"   <<< defined over the one-to-many association in the custom_entity_blog definition -->
            <text name="content" allow-html="true" translatable="true" store-api-aware="true" />
            <email name="email"  store-api-aware="false" />
            <many-to-one name="recommendation" reference="product" store-api-aware="true" required="false" on-delete="set-null" />
        </fields>
    </entity>
</entities>
```
