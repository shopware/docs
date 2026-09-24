---
nav:
  title: usePosition()
  position: 180

---

# `usePosition()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { usePosition } from 'shopware:composables/use-position';

function usePosition(): {
    getNewPosition: (repository, criteria, context, field?) => Promise<number>;
    lowerPositionValue: (collection, selectedItem, field?) => EntityCollection;
    raisePositionValue: (collection, selectedItem, field?) => EntityCollection;
    changePosition: (collection, selectedItem, field?, direction?) => EntityCollection;
    getSiblingIndex: (collection, selectedItem, field?, direction?) => number;
    getSibling: (collection, selectedItem, field?, direction?) => Entity | null;
    renumberPositions: (collection, startIndex?, field?) => EntityCollection;
};
```

Helpers for the `position` integers that order an entity collection.

```ts
const { getNewPosition, raisePositionValue } = usePosition();

const position = await getNewPosition(repository, new Criteria(1, 1), Shopware.Context.api);
```

`getNewPosition()` aggregates the current maximum and returns it plus one, starting at `1` for an empty
collection. `lowerPositionValue()` and `raisePositionValue()` swap an item with its neighbour, and
`renumberPositions()` renumbers the whole collection from `startIndex`.

Every function takes the field name as its last-but-one argument and defaults to `'position'`, so a
collection ordered by a differently named field works too. They sort the collection in place and hand it
back.

Replaces the `position` mixin.
