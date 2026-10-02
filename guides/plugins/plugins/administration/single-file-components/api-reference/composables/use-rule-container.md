---
nav:
  title: useRuleContainer()
  position: 200

---

# `useRuleContainer()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useRuleContainer } from 'shopware:composables/use-rule-container';

function useRuleContainer(options: {
    condition: () => RuleConditionNode;
    level: () => number;
    disabled: () => boolean;
    onAddPlaceholder: () => void;
}): {
    conditionDataProviderService: ComputedRef<unknown>;
    childAssociationField: ComputedRef<string>;
    createCondition: (conditionData: unknown, parentId: string | null, position: number) => RuleConditionNode;
    insertNodeIntoTree: (parentCondition: RuleConditionNode, childToInsert: RuleConditionNode) => void;
    removeNodeFromTree: (parentCondition: RuleConditionNode, childToRemove: RuleConditionNode) => void;
    containerRowClass: ComputedRef<ContainerRowClass>;
    nextPosition: ComputedRef<number>;
};
```

The state a condition container inside `sw-condition-tree` works against - what you need when building a
custom container for the rule builder.

The tree provides the condition service and the three tree-editing functions; the composable injects them
and adds `containerRowClass`, which alternates the background by nesting level and carries the disabled
state.

`onAddPlaceholder` is called when the container runs out of children, which is how a container keeps an
empty row for the next condition.

`conditionDataProviderService` and `childAssociationField` stay refs here. The Options API unwrapped them
on the instance proxy, so a migrated template that used them without `.value` needs one.

Replaces the `ruleContainer` mixin.
