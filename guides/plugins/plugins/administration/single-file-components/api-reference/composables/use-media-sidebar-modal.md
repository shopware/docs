---
nav:
  title: useMediaSidebarModal()
  position: 230

---

# `useMediaSidebarModal()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useMediaSidebarModal } from 'shopware:composables/use-media-sidebar-modal';

function useMediaSidebarModal(options: {
    onItemsDelete: (ids: string[]) => void;
    onFolderItemsDissolve: (ids: string[]) => void;
    onItemsMove: (ids: string[]) => void;
}): {
    showModalReplace: Ref<boolean>;
    showModalDelete: Ref<boolean>;
    showFolderSettings: Ref<boolean>;
    showFolderDissolve: Ref<boolean>;
    showModalMove: Ref<boolean>;
    openModalReplace: () => void;
    closeModalReplace: () => void;
    openModalDelete: () => void;
    closeModalDelete: () => void;
    openFolderSettings: () => void;
    closeFolderSettings: () => void;
    openFolderDissolve: () => void;
    closeFolderDissolve: () => void;
    openModalMove: () => void;
    closeModalMove: () => void;
    deleteSelectedItems: (ids: string[]) => void;
    onFolderDissolved: (ids: string[]) => void;
    onFolderMoved: (ids: string[]) => void;
};
```

The open and close state of the media sidebar's modals: replace, delete, folder settings, folder dissolve
and move. Each gets a `show*` ref and an `open*`/`close*` pair.

Opening is guarded by the media ACL privileges - `media.editor` for replace, dissolve and move,
`media.deleter` for delete - so `openModalDelete()` on a user without the privilege simply does nothing.

The three handlers at the end close their modal and report what it did a tick later, through the callbacks
you passed in. The delay matters: the modal is torn down by the same flag flip, and the caller's reaction
typically reloads the list the modal was rendered into.

Where the mixin emitted events, this takes callbacks.

Replaces the `media-sidebar-modal-mixin`.
