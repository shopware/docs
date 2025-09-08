---
nav:
  title: Extension Points
  position: 40

---

# Extension Points

Extension Points allow you to **replace core functionality** by intercepting and modifying the execution flow of system processes, unlike traditional events which are only for notifications.

## Example

```php
public function onResolveListing(ResolveListingExtension $event): void
{
    // Replace default product loading with custom implementation
    $event->result = $this->customProductLoader->load($event->criteria, $event->context);
    
    // Stop default behavior
    $event->stopPropagation();
}
```
