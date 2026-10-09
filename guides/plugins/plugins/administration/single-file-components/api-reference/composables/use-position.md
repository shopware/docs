---
nav:
  title: usePosition()
  position: 180

---

# `usePosition()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { usePosition } from 'shopware:composables';

function usePosition(): {
    getNewPosition: (repository: Repository, criteria: Criteria, context: ApiContext, field?: string) => Promise<number>;
    lowerPositionValue: (collection: EntityCollection, selectedItem: Entity, field?: string) => EntityCollection;
    raisePositionValue: (collection: EntityCollection, selectedItem: Entity, field?: string) => EntityCollection;
    changePosition: (collection: EntityCollection, selectedItem: Entity, field?: string, direction?: string) => EntityCollection;
    getSiblingIndex: (collection: EntityCollection, selectedItem: Entity, field?: string, direction?: string) => number;
    getSibling: (collection: EntityCollection, selectedItem: Entity, field?: string, direction?: string) => Entity | null;
    renumberPositions: (collection: EntityCollection, startIndex?: number, field?: string) => EntityCollection;
};
```

Helpers for the `position` integers that order an entity collection.

```ts
const { getNewPosition, raisePositionValue } = usePosition();

const position = await getNewPosition(repository, new Criteria(1, 1), Shopware.Context.api);
```

`getNewPosition()` aggregates the current maximum and returns it plus one, starting at `1` for an empty
collection. It adds that aggregation and a sorting to the `criteria` you pass. `lowerPositionValue()` and
`raisePositionValue()` swap an item with its neighbour, and `renumberPositions()` renumbers the whole
collection from `startIndex`, which defaults to `0`.

Every function takes an optional `field` argument that defaults to `'position'`, so a collection ordered
by a differently named field works too. They sort the collection in place and hand it back.

Replaces the `position` mixin.
