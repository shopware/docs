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
| ApiAware | Make this property exposed by the API |
| CascadeDelete | In case the referenced association data will be deleted, the related data will be deleted too |
| Computed | The value is computed by indexer or external systems and cannot be written using the DAL.|
| Deprecated | Flags "Deprecated" |
| Extension | Defines that the data of this field is stored in an Entity::$extension and are not part of the struct itself. |
| Inherited | Defines that the data of this field can be inherited by the parent record |
| PrimaryKey | Flags "PrimaryKey" |
| ReadProtected | Flags "ReadProtected" |
| Required | Flags "Required" |
| RestrictDelete | Associated data with this flag, restricts the delete of the entity in case that a record with the primary key exists. |
| ReverseInherited | Flags "ReverseInherited" |
| Runtime | Defines that the data of the field will be loaded at runtime by an event subscriber or other class. Used in entity extensions for plugins or not directly fetchable associations.|
| SearchRanking | Defines the weight for a search query on the entity for this field |
| SetNullOnDelete | In case the referenced association data will be deleted, the related data will be set to null and an Written event will be thrown |
| Since | Flags "Since" |
| WriteProtected | Flags "WriteProtected" |
