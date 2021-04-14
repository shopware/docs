# General Concepts

Though the Admin API and the Store API serve very different purposes, they have some commonalities handy to be aware of.

## Querying data

For the Admin API these apply to the `/search` endpoint, whilst for the Store API they apply to almost every endpoint that returns a list of records.

It starts with a very simple underlying concept, which encapsulates your entire search description in one generic object, referred to as the **search criteria**.

{% page-ref page="search-criteria.md" %}

There are some additional instructions that can be specified using **request headers**.

{% page-ref page="request-headers.md" %}

## Documentation

Here you find a common approach regarding the way that Shopware provides endpoint references for its APIs:

{% page-ref page="generated-reference.md" %}

