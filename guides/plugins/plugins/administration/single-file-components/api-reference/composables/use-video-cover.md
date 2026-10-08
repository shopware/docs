---
nav:
  title: useVideoCover()
  position: 240

---

# `useVideoCover()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useVideoCover } from 'shopware:composables';

function useVideoCover(options: { item: () => VideoCoverMedia | null | undefined }): {
    showCoverSelectionModal: Ref<boolean>;
    isVideoMedia: ComputedRef<boolean>;
    hasVideoCover: ComputedRef<boolean>;
    openCoverSelectionModal: () => void;
    closeCoverSelectionModal: () => void;
    onCoverSelectionChange: (selection: VideoCoverMedia[]) => Promise<void>;
    persistCoverMedia: (coverMediaId: string | null) => Promise<void>;
    removeVideoCover: () => Promise<void>;
    isImage: (media?: VideoCoverMedia | null) => boolean;
    isVideo: (item?: VideoCoverMedia | null) => boolean;
    getCoverMediaId: (item?: VideoCoverMedia | null) => string | null;
};
```

Assigns and removes the poster image of a video media item.

```ts
const { isVideoMedia, hasVideoCover, openCoverSelectionModal, removeVideoCover } = useVideoCover({
    item: () => props.item,
});
```

`item` is a getter so the media item stays reactive, and so the `isLoading` flag written during a save
lands on the entity the caller passed in.

`onCoverSelectionChange()` takes the first item the media modal selected, rejects it with an error
notification unless it is an image, and otherwise persists it. Opening the modal is guarded by `media.editor`.

Both writes notify on success and on failure. On success they also emit `sw-media-library-item-updated` on
the event bus, so an open library refreshes.

Replaces the `video-cover` mixin.
