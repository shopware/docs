---
nav:
  title: useValidation()
  position: 190

---

# `useValidation()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useValidation } from 'shopware:composables/use-validation';

function useValidation(options: { validation: () => ValidationRules }): {
    validationService: ValidationService;
    validate: (value: unknown) => boolean;
    validateRule: (value: unknown, rule: string) => boolean;
};
```

Runs a value against validation rules - a boolean, a rule name, a comma-separated list of names, or an
array of either.

```ts
const { validate } = useValidation({ validation: () => props.validation });

const isValid = computed(() => validate(currentValue.value));
```

The rules arrive as a getter so they stay reactive when the component's `validation` prop changes. The
rules themselves come from the injected `validationService`.

## No `isValid`

The mixin also exposed an `isValid` computed that read the host's current value under whichever of
`currentValue`, `value` or `selections` happened to exist. A composable cannot guess that name, so it is
not there - pass the value to `validate()` yourself, as above.

Replaces the `validation` mixin.
