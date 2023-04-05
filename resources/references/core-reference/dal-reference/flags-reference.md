---
nav:
  title: Flags Reference
  position: 20

---

# Flags Reference

| Classname | Description |
| :--- | :--- |
| AllowEmptyString | Flag a text column that an empty string should not be considered as null|
| AllowHtml | In case a column is allowed to contain HTML-esque data. Beware of injection possibilities |
| ApiAware | Makes a field available in the Store or Admin API. If no parameter is passed for the flag, the field will be exposed in the both Store and Admin API. By default, all fields are enabled for the Admin API, as the flag is added in the base Field class. However, the scope can be restricted to `AdminApiSource` and `SalesChannelApiSource`.  |
| CascadeDelete | In case the referenced association data will be deleted, the related data will be deleted too |
| Computed | The value is computed by indexer or external systems and cannot be written using the DAL.|
| Deprecated | This flag is used to mark the field that has been deprecated and will be removed with the next major version. |
| Extension | Defines that the data of this field is stored in an Entity::$extension and are not part of the struct itself. |
| Inherited | Defines that the data of this field can be inherited by the parent record |
| PrimaryKey | The PrimaryKey flag defines the field as part of the entity's primary key. Usually, this should be the ID field.  |
| Required | Fields marked as "Required" must be specified during the create request of an entity. This configuration is only taken into account during the write process. |
| RestrictDelete | Associated data with this flag, restricts the delete of the entity in case that a record with the primary key exists. |
| ReverseInherited | Flags "ReverseInherited" |
| Runtime | Defines that the data of the field will be loaded at runtime by an event subscriber or other class. Used in entity extensions for plugins or not directly fetchable associations.|
| SearchRanking | Defines the weight for a search query on the entity for this field |
| SetNullOnDelete | In case the referenced association data will be deleted, the related data will be set to null and an Written event will be thrown |
| Since | The "Since" flag defines since which Shopware version the field is available.  |
| WriteProtected | By setting the "WriteProtected" flag, write access via API can be restricted. This flag is mostly used to protect indexed data from direct writing via API. |
