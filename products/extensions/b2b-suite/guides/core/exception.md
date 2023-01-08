# Exception

## Translatable exception

To show the customer a translated exception message in the Shopware error controller, the exception must implement the `B2BTranslatableException` Interface.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Common\Repository;

use DomainException;
use Shopware\B2B\Common\B2BTranslatableException;
use Throwable;

class NotAllowedRecordException extends DomainException implements B2BTranslatableException
{
    private string $translationMessage;

    private array $translationParams;

    public function __construct(
        $message = '',
        string $translationMessage = '',
        array $translationParams = [],
        $code = 0,
        Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);

        $this->translationMessage = $translationMessage;
        $this->translationParams = $translationParams;
    }

    public function getTranslationMessage(): string
    {
        return $this->translationMessage;
    }

    public function getTranslationParams(): array
    {
        return $this->translationParams;
    }
}
```

The snippet key is a modified `translationMessage`.

```php
preg_replace('([^a-zA-Z0-9]+)', '', ucwords($exception->getTranslationMessage()))
```

Variables in the message will be replaced by the `string_replace()` method.
The identifiers are the keys of the `translationParams` array.
