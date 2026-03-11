---
nav:
  title: Fields Reference
  position: 10

---

# Fields Reference

| Name                         | Description                  | Extends                   | StorageAware |
|:-----------------------------|:-----------------------------|:--------------------------|:-------------|
| AssociationField             | Stores a association value   | Field                     |              |
| AutoIncrementField           | Stores an integer value      | IntField                  |              |
| BlobField                    | Stores a blob value          | Field                     | x            |
| BoolField                    | Stores a bool value          | Field                     | x            |
| BreadcrumbField              | Stores a JSON value          | JsonField                 |              |
| CalculatedPriceField         | Stores a JSON value          | JsonField                 |              |
| CartPriceField               | Stores a JSON value          | JsonField                 |              |
| CashRoundingConfigField      | Stores a JSON value          | JsonField                 |              |
| ChildCountField              | Stores an integer value      | IntField                  |              |
| ChildrenAssociationField     | Stores a association value   | OneToManyAssociationField |              |
| ConfigJsonField              | Stores a JSON value          | JsonField                 |              |
| CreatedAtField               | Stores a DateTime value      | DateTimeField             |              |
| CreatedByField               | Stores a foreign key value   | FkField                   |              |
| CronIntervalField            | Stores a croninterval value  | Field                     | x            |
| DateField                    | Stores a date value          | Field                     | x            |
| DateIntervalField            | Stores a dateinterval value  | Field                     | x            |
| DateTimeField                | Stores a datetime value      | Field                     | x            |
| EmailField                   | Stores a string value        | StringField               |              |
| [EnumField](enum-field)      | Stores a enum value          | Field                     | x            |
| Field                        | Stores a  value              | Struct                    |              |
| FkField                      | Stores a fk value            | Field                     | x            |
| FloatField                   | Stores a float value         | Field                     | x            |
| IdField                      | Stores a id value            | Field                     | x            |
| IntField                     | Stores a int value           | Field                     | x            |
| JsonField                    | Stores a json value          | Field                     | x            |
| ListField                    | Stores a JSON value          | JsonField                 |              |
| LockedField                  | Stores a boolean value       | BoolField                 |              |
| LongTextField                | Stores a longtext value      | Field                     | x            |
| ManyToManyAssociationField   | Stores a association value   | AssociationField          |              |
| ManyToManyIdField            | Stores a manytomanyid value  | ListField                 |              |
| ManyToOneAssociationField    | Stores a association value   | AssociationField          |              |
| ObjectField                  | Stores a JSON value          | JsonField                 |              |
| OneToManyAssociationField    | Stores a association value   | AssociationField          |              |
| OneToOneAssociationField     | Stores a association value   | AssociationField          |              |
| ParentAssociationField       | Stores a association value   | ManyToOneAssociationField |              |
| ParentFkField                | Stores a foreign key value   | FkField                   |              |
| PasswordField                | Stores a password value      | Field                     | x            |
| PriceDefinitionField         | Stores a JSON value          | JsonField                 |              |
| PriceField                   | Stores a JSON value          | JsonField                 |              |
| ReferenceVersionField        | Stores a foreign key value   | FkField                   |              |
| RemoteAddressField           | Stores a remoteaddress value | Field                     | x            |
| SerializedField              | Stores a serialized value    | Field                     | x            |
| StateMachineStateField       | Stores a foreign key value   | FkField                   |              |
| StringField                  | Stores a string value        | Field                     | x            |
| TaxFreeConfigField           | Stores a JSON value          | JsonField                 |              |
| TimeZoneField                | Stores a string value        | StringField               |              |
| TranslatedField              | Stores a translated value    | Field                     |              |
| TranslationsAssociationField | Stores a association value   | OneToManyAssociationField |              |
| TreeBreadcrumbField          | Stores a JSON value          | JsonField                 |              |
| TreeLevelField               | Stores an integer value      | IntField                  |              |
| TreePathField                | Stores a treepath value      | LongTextField             |              |
| UpdatedAtField               | Stores a DateTime value      | DateTimeField             |              |
| UpdatedByField               | Stores a foreign key value   | FkField                   |              |
| VariantListingConfigField    | Stores a JSON value          | JsonField                 |              |
| VersionDataPayloadField      | Stores a JSON value          | JsonField                 |              |
| VersionField                 | Stores a foreign key value   | FkField                   |              |
