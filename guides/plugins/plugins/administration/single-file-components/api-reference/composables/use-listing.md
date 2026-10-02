---
nav:
  title: useListing()
  position: 170

---

# `useListing()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useListing } from 'shopware:composables/use-listing';

function useListing(options: {
    getList: () => void | Promise<void>;
    filters?: () => ListingFilter[];
    page?: number;
    limit?: number;
    total?: number;
    sortBy?: string | null;
    sortDirection?: string;
    naturalSorting?: boolean;
    term?: string;
    selection?: Record<string, any>;
    disableRouteParams?: boolean;
    searchConfigEntity?: string | null;
    entitySearchable?: boolean;
    storeKey?: string;
    filterCriteria?: unknown[];
}): UseListingReturn;
```

Everything a list page needs: pagination, sorting, the search term, the active filters and the current
selection, all kept in sync with the route query so a page survives a reload and a browser back.

## Options

`getList` is the only mandatory one. It is your own loader, and the composable calls it whenever the
listing state changes - so the composable owns the state, and you own the request.

`filters` is the second callback, returning the filters the page offers. Every remaining option is the
initial value of a listing field, the values a component used to set in its own `data()`.

`disableRouteParams: true` keeps the state out of the URL, which is what you want for a list inside a
modal or a tab rather than a page of its own.

## What you get back

The state as refs - `page`, `limit`, `total`, `sortBy`, `sortDirection`, `naturalSorting`, `term`,
`selection`, `filterCriteria` and the rest.

The derived values - `maxPage`, `selectionCount`, `selectionArray`, `currentSortBy`, `routeName`,
`searchRankingFields`.

The handlers a data grid expects - `onPageChange`, `onSearch`, `onSort`, `onSortColumn`, `onSwitchFilter`,
`onRefresh`, `updateSelection`, `resetListing`, `updateCriteria`, and `addQueryScores()` for search
ranking.

```ts
const { page, limit, total, term, onPageChange, onSearch } = useListing({
    getList: () => loadProducts(),
});
```

## One difference to the mixin

The first load runs in `onMounted()` rather than `created()`, because `getList` is a callback that can
only exist once the call has returned. A list page that relied on data being there before the first
render needs a look.

Replaces the `listing` mixin.
