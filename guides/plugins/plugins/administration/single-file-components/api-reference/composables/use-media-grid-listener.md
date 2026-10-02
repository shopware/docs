---
nav:
  title: useMediaGridListener()
  position: 220

---

# `useMediaGridListener()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useMediaGridListener } from 'shopware:composables/use-media-grid-listener';

function useMediaGridListener(options: {
    selectableItems: () => MediaGridItem[];
    onFolderChange: (folderId: string) => void;
}): {
    selectedItems: ShallowRef<MediaGridItem[]>;
    listSelectionStartItem: ShallowRef<MediaGridItem | null>;
    mediaItemSelectionHandler: ComputedRef<Record<string, (event: MediaGridItemEvent) => void>>;
    isListSelect: ComputedRef<boolean>;
    isItemSelected: (item: MediaGridItem) => boolean;
    showItemSelected: (item: MediaGridItem) => boolean;
    clearSelection: () => void;
    navigateToFolder: (event: { item: MediaGridItem }) => void;
    showDetails: (gridItem: MediaGridItem) => void;
    handleMediaItemClicked: (event: MediaGridItemEvent) => void;
    handleMediaGridItemSelected: (event: MediaGridItemEvent) => void;
    handleMediaGridItemUnselected: (event: { item: MediaGridItem }) => void;
};
```

Turns the click and selection events of `sw-media-media-item` into a selection, with `ctrl`/`cmd` toggling
and `shift` ranges.

Bind `mediaItemSelectionHandler` with `v-on` and the grid is wired up:

```vue
<sw-media-media-item
    v-for="item in items"
    :key="item.id"
    :item="item"
    :selected="isItemSelected(item)"
    v-on="mediaItemSelectionHandler"
/>
```

`selectableItems` is the order a `shift` range is resolved against, so hand back the items in the order
the grid renders them. `onFolderChange` is called when a folder is opened, where the mixin emitted an
event.

`selectedItems` is a `shallowRef` on purpose: the selection is tracked by item identity, and a deep ref
would hand out reactive proxies that no longer compare equal to the items you passed in.

Replaces the `media-grid-listener` mixin.
