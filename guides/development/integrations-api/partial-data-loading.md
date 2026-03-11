---
nav:
  title: Partial Data Loading
  position: 50

---

# Partial Data Loading

`Partial data loading` allows you to select specific fields of an entity to be returned by the API. This can be useful if you only need a few fields of an entity and don't want to load the whole entity. This can reduce response size and improve your application's performance.

## Partial data loading vs Includes

`Partial data loading` is different from the [includes](./search-criteria.md#includes-apialias) feature. The `includes` works as post-output processing, so the complete entity or data is loaded on the backend and then filtered, while `partial data loading` works already at the database level. This means the database only loads the requested fields, not the entire entity.

### Usage

```http
POST /api/search/currency
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
Accept: application/json

{
 "fields": [
 "name"
 ]
}
```

```json
// response
{
  "total": 1,
  "data": [
 {
      "extensions": [],
      "_uniqueIdentifier": "018cda3ac909712496bccc065acf0ff4",
      "translated": {
        "name": "US-Dollar"
 },
      "id": "018cda3ac909712496bccc065acf0ff4",
      "name": "US-Dollar",
      "isSystemDefault": false,
      "apiAlias": "currency"
 }
 ],
  "aggregations": []
}
```

Fields can also reference fields of associations, like in this example, the assigned salesChannel names of the currency. The API automatically adds the necessary associations.

```http
POST /api/search/currency
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
Accept: application/json

{
 "fields": [
 "name",
 "salesChannels.name"
 ]
}
```

```json
// response
{
  "total": 1,
  "data": [
 {
      "extensions": [],
      "_uniqueIdentifier": "018cda3ac909712496bccc065acf0ff4",
      "translated": {
        "name": "US-Dollar"
 },
      "id": "018cda3ac909712496bccc065acf0ff4",
      "name": "US-Dollar",
      "salesChannels": [
 {
          "extensions": [],
          "_uniqueIdentifier": "018cda3af56670d6a3fa515a85967bd2",
          "translated": {
            "name": "Storefront"
 },
          "id": "018cda3af56670d6a3fa515a85967bd2",
          "name": "Storefront",
          "apiAlias": "sales_channel"
 }
 ],
      "isSystemDefault": false,
      "apiAlias": "currency"
 }
 ],
  "aggregations": []
}
```

## Default fields

Some fields are always loaded, such as `id` and join-related fields like foreign keys; these are necessary for the API to work correctly and can't be removed.

## Runtime fields

Some fields in the API are generated at runtime, such as `isSystemDefault` for the currency. These fields are loaded by default when the referenced data is available; otherwise, they can be requested in the `fields` parameter to force the API to load them.

For custom entity definitions with a runtime flag, the referenced fields must be specified in the constructor. See an example from the core:

```php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
 (new IdField('id', 'id'))->addFlags(new ApiAware(), new PrimaryKey(), new Required()),
 (new StringField('path', 'path'))->addFlags(new ApiAware()),

        // When this field is requested, we need the data of the path field to generate the URL
 (new StringField('url', 'url'))->addFlags(new ApiAware(), new Runtime(['path'])),
 ]);
}
```

## Limitations

The current limitation of the `partial data loading` is that it only works on the Entity level. Any custom responses, such as a product detail page or CMS, in the Store API can't be used with this feature, as the Store API needs the entire entity to generate the response. If you need a small response, we recommend using the [includes](./search-criteria.md#includes-apialias) feature of the Search API.
