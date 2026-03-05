---
nav:
  title: General Concepts
  position: 10

---

# General Concepts

Even though the Admin API and the Store API serve very different purposes, they share some commonalities worth noting.

## Querying data

For the Admin API, these apply to the `/search` endpoint, whilst for the Store API, they apply to almost every endpoint that returns a list of records.

It starts with a simple underlying concept that encapsulates your entire search description in a single generic object, called the **search criteria**.

<PageRef page="search-criteria" />

Additional instructions can be specified using **request headers**.

<PageRef page="request-headers" />

## Documentation

Here you find a common approach regarding the way that Shopware provides endpoint references for its APIs:

<PageRef page="generated-reference" />
