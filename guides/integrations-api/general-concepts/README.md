# General Concepts

Even though the Admin API and the Store API serve very different purposes, they have some commonalities handy to be aware of.

## Querying data

For the Admin API these apply to the `/search` endpoint, whilst for the Store API they apply to almost every endpoint that returns a list of records.

It starts with a very simple underlying concept, which encapsulates your entire search description in one generic object, referred to as the **search criteria**.

{% page-ref page="search-criteria.md" %}

There are some additional instructions that can be specified using **request headers**.

{% page-ref page="request-headers.md" %}

## Documentation

Here you find a common approach regarding the way that Shopware provides endpoint references for its APIs:

{% page-ref page="generated-reference.md" %}

## API Versioning

Starting with Shopware version 6.4.0.0, we decided to change our API versioning strategy. The following article will cover what has been done and changed, how it used to be and how the version strategy looks like now.

{% page-ref page="api-versioning.md" %}
