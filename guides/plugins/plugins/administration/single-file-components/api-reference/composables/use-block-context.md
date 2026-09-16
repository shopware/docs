---
nav:
  title: useBlockContext()
  position: 280

---

# `useBlockContext()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useBlockContext } from 'shopware:composables/use-block-context';

function useBlockContext(): {
    blockContext: Record<string, Slot[]>;
    getBlocks: (blockName: string) => Slot[];
    addBlock: (blockName: string, block?: Slot) => void;
    removeBlock: (blockName: string, block?: Slot) => void;
};
```

The registry behind the block components: which extensions have contributed content to which block name.

`<sw-block>` reads and writes it for you - declaring a block reads the registry, extending one adds to it,
and unmounting removes the entry again. An extension normally never touches this; reach for it only to
inspect what is registered.

<PageRef page="../block-components/" title="Block components" sub="sw-block and sw-block-parent, the API you actually write" />
