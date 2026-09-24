---
nav:
  title: useRuleBetweenOperator()
  position: 210

---

# `useRuleBetweenOperator()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useRuleBetweenOperator } from 'shopware:composables/use-rule-between-operator';

function useRuleBetweenOperator(options: {
    condition: () => RuleCondition | null | undefined;
    ensureValueExist: () => void;
}): {
    isBetween: ComputedRef<boolean>;
    betweenValue: WritableComputedRef<{ from: string | null; to: string | null }>;
};
```

Renders a condition's `between` operator as a from/to pair on a date or datetime field.

```ts
const { isBetween, betweenValue } = useRuleBetweenOperator({
    condition: () => props.condition,
    ensureValueExist: () => emit('ensure-value-exist'),
});
```

`betweenValue` is writable, and writing calls `ensureValueExist()` first, the way the mixin reached into
its host to do. A condition whose `renderedFieldValue` is not an object reads as `{ from: null, to: null }`
rather than throwing.

Replaces the `rule-between-operator` mixin.
