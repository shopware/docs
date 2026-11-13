---
nav:
  title: Product documents
  position: 25

---

# Product Documents Configuration

::: info
Product documents are available since Shopware 6.7.17.0.
:::

Merchants can attach documents, such as manuals, data sheets or certificates, to products.
The settings on this page decide which files a document can have, and when Shopware deletes the files it no longer needs.
For the data model and how clients read the documents, see [Products](../../../../concepts/commerce/catalog/products.md#product-documents).

## File types and size

Configure the allowed file types and the largest file in `config/packages/shopware.yaml`, for example to add Excel files and allow up to 50 MB:

<<< @/docs/snippets/config/product_documents.yaml

| Setting              | Default                             | Description                                                                  |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| `allowed_extensions` | `pdf`, `docx`, `jpg`, `jpeg`, `png` | File types a document can have. Your list replaces the default.              |
| `max_file_size`      | `20M`                               | Largest file of a document, in bytes or with a unit such as `K`, `M` or `G`. |

A plugin can change the allowed file types as well, with the `ProductDocumentAllowedExtensionsEvent`.
The event receives the list from `shopware.yaml`, and `setAllowedExtensions()` changes it.

Shopware checks the files whenever a document is saved, through the Administration or the Admin API.
A file has to exist, be public, be stored in the shop, and stay within both settings.
Otherwise, the request fails with one of these error codes:

* `PRODUCT_DOCUMENT_FILE_NOT_FOUND`
* `PRODUCT_DOCUMENT_FILE_PRIVATE`
* `PRODUCT_DOCUMENT_FILE_EXTENSION_NOT_ALLOWED`
* `PRODUCT_DOCUMENT_FILE_SIZE_UNKNOWN`, also for links to files on another server
* `PRODUCT_DOCUMENT_FILE_TOO_LARGE`

## Upload limits

Uploads through the Administration also pass PHP and the web server, whose limits can be lower than `max_file_size`:

* PHP: `upload_max_filesize` and `post_max_size`
* Nginx: `client_max_body_size`, or the matching setting of your web server

The Administration takes its upload limit from `settings.productDocuments.maxFileSize` in `GET /api/_info/config`.
It is the lowest of `max_file_size` and the two PHP limits.
With presigned uploads, files go straight to the storage, and only `max_file_size` applies.

To allow larger files, raise `max_file_size`, the PHP limits and the web server limit together.

## Unused files

The media library has a default folder for document files, "Product Document Media".
The scheduled task `product_document.media.cleanup` runs once a month and deletes files from that folder that no document uses and that are older than a day.

To keep these files, deactivate the task:

```bash
bin/console scheduled-task:deactivate product_document.media.cleanup
```
