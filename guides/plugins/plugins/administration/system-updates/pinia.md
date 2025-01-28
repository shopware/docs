---
nav:
  title: Upgrading to Pinia
  position: 261
---

# Migration from Vuex in Shopware to Pinia

## Introduction

With the release of Shopware 6.7, we will replace Vuex with [Pinia](https://pinia.vuejs.org/) as the state management library for the administration.

## Why Pinia?

Migrating to Pinia simplifies state management with an intuitive API, no need for mutations, better TypeScript support, and seamless integration with Vue 3 Composition API. It’s lightweight, modular, and offers modern features like devtools support, making it a more efficient alternative to Vuex.

## Migration Guide

To migrate a Vuex store to Pinia, you need to make some changes to the store definition and how you access it in components.

- First, register it with `Shopware.Store.register` and define the store with `state`, `getters`, and `actions` properties:

**Before (Vuex):**

```javascript
export default {
    namespaced: true,

    state: {
      // Initial state
      ...
    },
    mutations: {
      ...
    },
    getters: {
       ...
    },
    actions: {
       ...
    },
}
```

**After (Pinia):**

```javascript
const store = Shopware.Store.register('<storeName>', {
    state: () => ({
        // Initial state
        ...
    }),
    getters: {
       ...
    },
    actions: {
       ...
    },
});
export default store;
```

- You can also register the store with an `id` property in the definition object, for example:

```javascript
const store = Shopware.Store.register({
    id: '<storeName>',
    state: () => ({
        // Initial state
    }),
    getters: {
       // ...
    },
    actions: {
       // ...
    },
});
```

- If you register a store that already exists, it will be overwritten. You can also unregister a store:

```javascript
Shopware.Store.unregister('<storeName>');
```

- To register a store from a component or index file, simply import the store file.

**Before (Vuex):**

```javascript
import productsStore from './state/products.state';

Shopware.State.registerModule('product', productsStore);
```

**After (Pinia):**

```javascript
import './state/products.state';
```

### Key Changes

#### State

In Pinia, `state` must be a function returning the initial state instead of a static object.

 ```javascript
 state: () => ({
     productName: '',
 })
 ```

#### Mutations

Vuex `mutations` are no longer needed in Pinia, since you can modify state directly in actions or compute it dynamically.

```javascript
actions: {
    updateProductName(newName) {
        this.productName = newName; // Directly update state
    },
},
```

#### Getters

- There cannot be getters with the same name as a property in the state, as both are exposed at the same level in the store.
- Getters should be used to compute and return information based on state, without modifying it.

#### TypeScript

We recommend migrating JavaScript stores to TypeScript for stricter typing, better autocompletion, and fewer errors during development.

```typescript
const store = Shopware.Store.register({
  id: 'myStore',
  ...
});

export type StoreType = ReturnType<typeof store>;
```

Then, you can use this type to extend `PiniaRootState`:

```typescript
import type { StoreType } from './store/myStore';

declare global {
    interface PiniaRootState {
        myStore: StoreType;
    }
}
```

### Composables as a Store

With Pinia, you can use reactive properties inside a store and define it like a composable. Keep in mind that only variables and functions returned from the store will be tracked by Pinia in devtools.

```typescript
const store = Shopware.Store.register('<storeName>', function() {
  const count = ref(0);

  const doubled = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  return { count, doubled, increment, decrement };
});
```

You can also use a composable function defined outside the store. This allows you to encapsulate and reuse logic across different stores or components, promoting better code organization and modularity:
  
```typescript
// composables/myComposable.ts
export function useMyComposable() {
  const count = ref(0);

  const doubled = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  return { count, doubled, increment, decrement };
}
```

```typescript
// store/myStore.ts
import { useMyComposable } from '../composables/myComposable';

const store = Shopware.Store.register('myStore', useMyComposable);
```

### Accessing the Store

To access the store in Vuex, you would typically do:

```javascript
Shopware.State.get('<storeName>');
```

When migrating to Pinia, it changes to:

```javascript
Shopware.Store.get('<storeName>');
```

### Testing

To test your store, just import it so it's registered. You can use `$reset()` to reset the store before each test:

```javascript
import './store/my.store';

describe('my store', () => {
  const store = Shopware.Store.get('myStore');

  beforeEach(() => {
    store.$reset();
  });

  it('has initial state', () => {
    expect(store.count).toBe(0);
  });
});
```

When testing components that use Pinia stores, register Pinia as a plugin and reset it before each test:

```javascript
import { createPinia, setActivePinia } from 'pinia';

const pinia = createPinia();

describe('my component', () => {
  beforeEach(() => {
    setActivePinia(pinia);
  });

  it('is a component', async () => {
    const wrapper = mount(await wrapTestComponent('myComponent', { sync: true }), {
      global: {
        plugins: [pinia],
        stubs: {
          // ...
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
```
