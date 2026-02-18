---
nav:
  title: Concept
  position: 10

---

# Concept

## Overview

[Shopware Migration Assistant](https://github.com/shopware/SwagMigrationAssistant) was built with simple but powerful concepts in mind. These enable you to extend the plugin in various ways and migrate data into the Shopware 6 environment. You should have a basic understanding of how to use the migration plugin and its core features before extending it yourself, as this documentation will not explain the usage of the plugin.

We will provide you with a basic introduction to the concepts and structure right here in this chapter. Take a look at the last headline \(Extension points\) to find out more about the various ways to extend this plugin.

## Migration process

The migration procedure, states, and full step-by-step workflow are documented on a dedicated page.

For details, see [Migration Process](migration-process).

## Profile and connections

Users of the plugin can create connections to different source systems. A connection is used to allow multiple migrations from the same source and update the right data \(mapping\). Connections require a specific profile indicating the type of source system. Users can, for example, create a connection to a Shopware shop using the Shopware 5.5 profile. Developers can create their own profiles from scratch, connect to different source systems, or just extend existing ones.

For more details, look at [Profile and Connection](profile-and-connection).

## DataSelection and DataSet

These are the fundamental data structures for defining what to migrate. Each `DataSet` represents an entity, for example, a database table. Each `DataSelection` represents an orderly group of `DataSets`. For more information, refer to the articles on [DataSelection and DataSet](dataselection-and-dataset).

## Migration context

This data structure provides all the necessary data for the migration. For more details, refer to the [Migration Context](migration-context).

## Premapping

Because the structure of the source system does not always match the structure of the target system, the user may need to map the old structure to the new one. For example, in Shopware 5, we have default salutations like `Mr.`, but the user can also create custom ones. In Shopware 6, there are default salutations like `Mr.` and the user can also create custom ones. So the salutation `Mr.` from Shopware 5 must be mapped to Shopware 6 `Mr.`. In this default case, the mapping can be achieved automatically, but customized salutations will most likely have to be mapped manually. The premapping will be written into the mapping table to associate the old identifier with the new one.

You can look at [Premapping](premapping) section for more details.

## Gateway and reader

Users will have to specify a gateway for the connection. The gateway defines the way of communicating with the source system. Behind the user interface, we use `Reader` objects to read the data from the source system. For the `shopware55` profile, we have the `api` gateway, which communicates via HTTP/S with the source system, and the `local` gateway, which communicates directly with the source system's database. Thus both systems must be on the same server to successfully use the `local` gateway.

To use the `ShopwareApiGateway`, you must download the [Shopware Connector](https://github.com/shopware/SwagMigrationConnector) plugin for your Shopware 5.

For more details, look at the [Gateway and Reader](gateway-and-reader) article.

## Converter, mapping, and deltas

Data gathered by `Reader` objects is transferred to `Converter` objects that put the data in a format Shopware 6 is able to work with. Simultaneously entries in the underlying mapping table are inserted to map the old identifiers to the new ones for future migrations \(Have a look at the `MappingService` for that\). The mapping is saved for the current connection. Converted data will be removed after the migration, and the mapping will stay persistent. Also, a checksum is saved to the mapping to identify and skip the same source data \(data has not been changed since the last migration\).

You can find out more about them in the [Convert and Mapping](convert-and-mapping) section of this guide.

## Logging

During any migration, especially during the data conversion, there will possibly be errors that should be logged. The users can see these errors and these should be as helpful as possible.

For more information, have a look at the [Logging](logging) section.

## Error Resolution

The Migration Assistant provides users with the possibility to resolve errors that occurred during migration. The user can see details of an error and decide how to proceed. For example, if a product could not be migrated because of a missing tax, the user can create a new tax and assign it to the product. After that, the user can mark the error as resolved, and the Migration Assistant will try to migrate the product.

Error Resolution is part of the standard migration workflow in Administration.

## Writer

The `Writer` objects will receive the converted data and write it to Shopware 6. There is no special magic here; you do not need to worry about error handling because the Migration Assistant takes care of it.

To learn more about them, take a look at the [Writer](writer) section.

## Media processing

During a typical migration, media is handled in a dedicated processing step after writing. Gateway-specific processors import files either via HTTP (`api` gateway) or local filesystem (`local` gateway).

You can look at the [Media Processing](media-processing) article for more details.

## After migration

All fetched data will be deleted after finishing or aborting a migration run, but the mapping of the identifiers will stay.

## Extension points

The recommended way to migrate plugin data from a source system is to extend that profile by a new `DataSelection`. It is also possible to create a new profile in case a migration from a different shop/source system is sought.

Take a look at the following guides for your scenario:

* [Extending a Shopware Migration Profile](../guides/extending-a-shopware-migration-profile): Migrating your first basic plugin data \(via local gateway\).
* [Extending the Migration Connector](../guides/extending-the-migration-connector): Add API support for your migration.
* [Decorating a Shopware Migration Assistant Converter](../guides/decorating-a-shopware-migration-assistant-converter): Implement a premapping and change the behavior of an existing converter.
* [Creating a New Migration Profile](../guides/creating-a-new-migration-profile): Create a new profile from scratch to support a third-party source system \(other than Shopware\).
