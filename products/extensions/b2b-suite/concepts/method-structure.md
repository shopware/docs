# Method Structure

## Replaceable functions

Almost every function in the B2B Suite is replaceable, but not all are guaranteed to be compatible with every version change.
Only the framework domain has guaranteed rules to limit the changes of each method per release version.
The methods in other domains have dependencies on the Shopware core and have to be adjusted if changes are made.

### Protected functions in framework

Protected functions with an `@internal` comment aren't guaranteed to be compatible or changed to minor version changes.

Example:

```php
// <b2b root>/components/Common/Controller/GridHelper.php
<?php declare(strict_types=1);

namespace Shopware\B2B\Common\Controller;

[...]

class GridHelper
{    
    [...]
    
    /**
     * @internal
     */
    protected function extractLimitAndOffset(Request $request, SearchStruct $struct): void
    {
        $struct->offset = $request->getParam('offset', null);
        $struct->limit = $request->getParam('limit', null);
    }

    [...]
}
```

### Public functions in framework

Public functions are made to be compatible and not changed until the major version changes.

### TypeScript functions

TypeScript functions always have access modifiers and are completely typed with their arguments and return types.
Furthermore, the same deprecation rules you already know from other parts of Shopware apply here.

Example:

```typescript
export default class {
    public addClass(element: HTMLElement, name: string): void {
        element.classList.add(name);
    }
}
```
