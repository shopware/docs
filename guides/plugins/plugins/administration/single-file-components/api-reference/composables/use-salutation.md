---
nav:
  title: useSalutation()
  position: 160

---

# `useSalutation()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useSalutation } from 'shopware:composables/use-salutation';

function useSalutation(): {
    salutation: (entity: SalutationFilterEntityType, fallbackSnippet?: string) => string;
};
```

Formats the salutation of a customer-like entity - anything carrying a `salutation` association along with
`title`, `firstName` and `lastName`.

```ts
const { salutation } = useSalutation();

const greeting = computed(() => salutation(customer.value, 'sw-customer.detail.noSalutation'));
```

It resolves the `salutation` filter on each call, so it behaves exactly as the filter does in a template.

Replaces the `salutation` mixin.
