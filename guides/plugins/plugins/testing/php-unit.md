---
nav:
  title: PHP unit testing
  position: 40

---

# PHP Unit Testing

## Overview

In this guide you'll learn how to create PHPUnit tests in Shopware 6. You can read more about PHP unit testing at the official PHPUnit documentation.

<PageRef page="https://phpunit.de/documentation.html" title="Documentation for PHPUnit &#x2013; The PHP Testing Framework" target="_blank" />

::: info
Throughout this guide, you will find the `$` symbol representing your command line.
:::

## Prerequisites

In order to create tests for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

Furthermore, you should have a look at our [Execute database queries/migrations](../plugin-fundamentals/database-migrations) guide since this guide will show you how to create a migration test for these example.

## PHPUnit configuration

First of all we have to configure PHPUnit a bit. Therefore we have to create a file called `phpunit.xml.dist` in the root directory of our plugin. To get more familiar with the configurable options, you can refer to the [PHPUnit documentation](https://phpunit.readthedocs.io/en/8.5/configuration.html). In this example we configure PHPUnit to search in the directories `<plugin root>/src/Test` and `<plugin root>/src/Migration/Test` for our tests.

Here's an example configuration for the development template:

```xml
// <plugin root>/phpunit.xml.dist
<?xml version="1.0" encoding="UTF-8"?>

<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/9.5/phpunit.xsd"
         bootstrap="../../../vendor/shopware/platform/src/Core/TestBootstrap.php"
         cacheResult="false">

    <php>
        <ini name="error_reporting" value="-1"/>
        <server name="KERNEL_CLASS" value="Shopware\Core\Kernel"/>
        <env name="APP_ENV" value="test"/>
        <env name="APP_DEBUG" value="1"/>
        <env name="APP_SECRET" value="s$cretf0rt3st"/>
        <env name="SHELL_VERBOSITY" value="-1"/>
        <env name="SYMFONY_DEPRECATIONS_HELPER" value="disabled" />
    </php>

    <testsuites>
        <testsuite name="Example Testsuite">
            <directory>src/Test</directory>
        </testsuite>

        <testsuite name="migration">
            <directory>src/Migration/Test</directory>
        </testsuite>
    </testsuites>

    <coverage>
        <include>
            <directory suffix=".php">./</directory>
        </include>
    </coverage>
</phpunit>
```

## Example Tests

### Integration test

After we've configured PHPUnit, we can start writing our first test. In this example we have a test which simply tries to instantiate every `.php` class, to see if any used core classes went missing. In our test we use the `IntegrationTestBehaviour` trait which comes in with some handy features, such as automatically setting up a database transaction or clearing the cache before starting your tests.

Therefore, this is how your service could then look like:

```php
// <plugin root>/src/Test/UsedClassesAvailableTest.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Test;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Symfony\Component\Finder\Finder;

class UsedClassesAvailableTest extends TestCase
{
    use IntegrationTestBehaviour;

    public function testClassesAreInstantiable(): void
    {
        $namespace = str_replace('\Test', '', __NAMESPACE__);

        foreach ($this->getPluginClasses() as $class) {
            $classRelativePath = str_replace(['.php', '/'], ['', '\\'], $class->getRelativePathname());

            $this->getMockBuilder($namespace . '\\' . $classRelativePath)
                ->disableOriginalConstructor()
                ->getMock();
        }

        // Nothing broke so far, classes seem to be instantiable
        $this->assertTrue(true);
    }

    private function getPluginClasses(): Finder
    {
        $finder = new Finder();
        $finder->in(realpath(__DIR__ . '/../'));
        $finder->exclude('Test');
        return $finder->files()->name('*.php');
    }
}
```

### Migration test

In order to test our example migration `Migration1611740369ExampleDescription`, we create a new test called `Migration1611740369ExampleDescriptionTest` which extends from the PHPUnit `TestCase`. Furthermore we use the `KernelTestBehaviour` trait since we need our database connection from the container.

Here's an example for a migration test:

```php
// <plugin root>/src/Migration/Test/Migration1611740369ExampleDescriptionTest.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration\Test;

use Doctrine\DBAL\Connection;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Test\TestCaseBase\KernelTestBehaviour;

class Migration1611740369ExampleDescriptionTest extends TestCase
{
    use KernelTestBehaviour;

    public function testNoChanges(): void
    {
        /** @var Connection $conn */
        $conn = $this->getContainer()->get(Connection::class);
        $expectedSchema = $conn->fetchAssoc('SHOW CREATE TABLE `swag_basic_example_general_settings`')['Create Table'];

        $migration = new Migration1611740369ExampleDescription();

        $migration->update($conn);
        $actualSchema = $conn->fetchAssoc('SHOW CREATE TABLE `swag_basic_example_general_settings`')['Create Table'];
        static::assertSame($expectedSchema, $actualSchema, 'Schema changed!. Run init again to have clean state');

        $migration->updateDestructive($conn);
        $actualSchema = $conn->fetchAssoc('SHOW CREATE TABLE `swag_basic_example_general_settings`')['Create Table'];
        static::assertSame($expectedSchema, $actualSchema, 'Schema changed!. Run init again to have clean state');
    }

    public function testNoTable(): void
    {
        /** @var Connection $conn */
        $conn = $this->getContainer()->get(Connection::class);
        $conn->executeStatement('DROP TABLE `swag_basic_example_general_settings`');

        $migration = new Migration1611740369ExampleDescription();
        $migration->update($conn);
        $exists = $conn->fetchColumn('SELECT COUNT(*) FROM `swag_basic_example_general_settings`') !== false;

        static::assertTrue($exists);
    }
}
```

## Mocking services

In some cases you want a service to behave differently in the test run. Such a case could be where a service deletes a file or makes a critical api call. To avoid this in a test run it is possible to create a `<plugin root>/Resources/config/services_test.{xml|yml}` file which will override your `<plugin root>/Resources/config/services.{xml|yml}`. But only for the test environment.  

In this test-only service config you can override arguments, aliases or parameters to change what the service container injects into your services during a test run.

## Executing the test

All commands in this section will be executed in the root directory of our plugin.

For easier usage, you could create a batch file called `phpunit.sh` into a `/bin` directory of your plugin. Its only purpose then would be executing the PHPUnit testsuite. Make sure the path in the following file actually fits.

```bash
// <plugin root>/bin/phpunit.sh
#!/usr/bin/env bash
dir=`pwd`
cd ./../../../
./vendor/bin/phpunit --configuration="$dir" "$@"
```

### Executing all tests in the plugin

Now we can execute the `phpunit.sh` to run all tests of our plugin.

```text
$ ./bin/phpunit.sh
```

### Executing a single test

If we want to execute a specific test only, we have to pass the path to the test as argument.

```text
$ ./bin/phpunit.sh src/Migration/Test/Migration1611740369ExampleDescriptionTest.php
```

### Executing a single method

To execute a specific method of a test, we have to pass the argument `--filter` with the name of the method and the path to test.

```text
$ ./bin/phpunit.sh --filter testNoChanges src/Migration/Test/Migration1611740369ExampleDescriptionTest.php
```

## Production template

If you use the production template \(which is also used by the zipped download version\), you have to change a few things. First the path to the bootstrap file is different, because there's no `shopware/platform`, but `shopware/core`. So we have to change `vendor/shopware/platform/src/Core/TestBootstrap.php` to `vendor/shopware/core/TestBootstrap.php`.

We also need to change the `KERNEL_CLASS` from `Shopware\Core\Kernel` to `Shopware\Production\Kernel`.

Therefore, this is how your configuration could then look like:

```xml
// <plugin root>/phpunit.xml.dist
<?xml version="1.0" encoding="UTF-8"?>

<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://schema.phpunit.de/7.1/phpunit.xsd"
         bootstrap="../../../vendor/shopware/core/TestBootstrap.php"
         cacheResult="false">

    <php>
        <ini name="error_reporting" value="-1"/>
        <server name="KERNEL_CLASS" value="Shopware\Production\Kernel"/>
        <env name="APP_ENV" value="test"/>
        <env name="APP_DEBUG" value="1"/>
        <env name="APP_SECRET" value="s$cretf0rt3st"/>
        <env name="SHELL_VERBOSITY" value="-1"/>
    </php>

    <testsuites>
        <testsuite name="Example Testsuite">
            <directory>src/Test</directory>
        </testsuite>

        <testsuite name="migration">
            <directory>src/Migration/Test</directory>
        </testsuite>
    </testsuites>

    <filter>
        <whitelist>
            <directory suffix=".php">./</directory>
        </whitelist>
    </filter>
</phpunit>
```

## Next steps

You've learned about PHPUnit tests here now. But what about unit testing your javascript code, either in the Storefront or the Administration?

* [Jest unit tests in Shopware's Administration](jest-admin)
* [Jest unit tests in Shopware's Storefront](jest-storefront)
