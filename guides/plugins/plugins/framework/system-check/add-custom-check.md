---
nav:
  title: Add custom check
  position: 10

---

# Overview

In this guide, we will be building a dummy example of a custom system check that verifies if the local system has enough disk space to operate normally.

## Add a new Custom Check

First, you need to add a new `LocalDiskSpaceCheck` class that extends the `Shopware\Core\Framework\SystemCheck\BaseCheck` and implement the essential categorization methods.

### Fill the categorization methods

Each check contains a set of categorization methods that help to classify the check, and determine when and where it should be executed.

```php
class LocalDiskSpaceCheck extends BaseCheck
{
    public function category(): Category
    {
        // crucial for the system to function at all. 
        return Category::SYSTEM;
    }

    public function name(): string
    {
        return 'LocalDiskSpaceCheck';
    }

    protected function allowedSystemCheckExecutionContexts(): array
    {   // a potentially long-running check, because it has an IO operation.
        return SystemCheckExecutionContext::longRunning();
    }
}
```

### Create the check logic

The next step is to implement the actual check logic. We will check if the disk space is below a certain threshold and return the appropriate result.

```php
class LocalDiskSpaceCheck extends BaseCheck
{
    public function __construct(
        private readonly string $adapterType,
        private readonly string $installationPath,
        private readonly int $warningThresholdInMb
    )
    {
    }

    public function run(): Result
    {
        if ($this->adapterType !== 'local') {
           return new Result(name: $this->name(), status: Status::SKIPPED, message: 'Disk space check is only available for local file systems.', healthy: true)
        }
        
        $availableSpaceInMb = $this->getFreeDiskSpaceInMegaBytes();
        if ($availableSpaceInMb < $this->warningThresholdInMb) {
            return new Result(name: $this->name(), status: Status::WARNING, message: sprintf('Available disk space is below the warning threshold of %s.', $this->warningThresholdInMb), healthy: true);
        }

        return new Result(name: $this->name(), status: Status::OK, message: 'Disk space is sufficient.', healthy: true);
    }

     private function getFreeDiskSpaceInMegaBytes()
     {
        $freeSpace = disk_free_space($this->installationPath);
        $totalSpace = disk_total_space($this->installationPath);
        $availableSpace = $totalSpace - $freeSpace;

        return $availableSpace / 1024 / 1024;
     }
    ...
    ...
}
```

> An important consideration is the healthy flag, which is subjective and can vary depending on the specific shop's criteria. For example, if the disk space threshold is set high, the system can still function normally, so the healthy flag could be true. Conversely, if the threshold is too low for normal operation, the healthy flag could be false.

### Register the custom check

Finally, you need to register the custom check as a service resource.

```xml
        <service id="%YourNameSpace%\LocalDiskSpaceCheck" >
            <argument>%shopware.filesystem.public.type%</argument>
            <argument>%shopware.filesystem.public.config.root%</argument>
            <argument>%warning_threshold_in_mb%</argument>
            <tag name="shopware.system_check"/>
        </service>
```

### Trigger the check

The system check is now part of the system check collection and will be executed when the system check is triggered. Refer to the [System Check](./) guide for more information.
