---
nav:
  title: Add custom captcha
  position: 80

---

# Add custom captcha

## Overview

You can add your custom captcha to the Shopware 6 core. This guide will show you how to do that.

## Prerequisites

In order to be able to start with this guide, you need to have an own plugin running. As to most guides, this guide is also built upon the [Plugin base guide](../plugin-base-guide)

## Adding custom captcha to your plugin

In order to add custom captcha to your plugin, create a new folder called `Captcha` inside the `src/Framework` directory of your plugin. This is optional, but it's a good practice to keep your plugin files organized.

Take a look at the AbstractCaptcha class. This class is the base class for all captcha types. It contains the following methods:

* `supports(string $type): bool` - This method is used to check if the captcha type is supported by the plugin.
* `isValid(string $code): bool` - This method is used to check if the captcha code is valid.
* `getName(): string` - This method is used to get the name of the captcha type.
* `shouldBreak(): bool` - This method is used to check if the captcha should break the validation.
* `getData(): array` - This method is used to get the data of the captcha type.
* `getViolations(): ConstraintViolationListInterface` - This method is used to get the violations of the captcha type.

Extend the AbstractCaptcha class and implement the methods isValid and getName. The isValid method should return true if the captcha code is valid, false otherwise. The getName method should return the name of the captcha type.

```php

<?php declare(strict_types=1);

namespace Shopware\Storefront\Framework\Captcha;

use GuzzleHttp\ClientInterface;
use Psr\Http\Client\ClientExceptionInterface;
use Shopware\Core\Framework\Log\Package;
use Symfony\Component\HttpFoundation\Request;

#[Package('storefront')]
class YourCaptcha extends AbstractCaptcha
{
    final public const CAPTCHA_NAME = 'yourCaptchaName';
    final public const CAPTCHA_REQUEST_PARAMETER = '_your_captcha_name';
    private const YOUR_CAPTCHA_ENDPOINT = 'https://www.yourcaptcha.com/verify';

    /**
     * @internal
     */
    public function __construct(private readonly ClientInterface $client)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function isValid(Request $request, array $captchaConfig): bool
    {
        if (!$request->get(self::CAPTCHA_REQUEST_PARAMETER)) {
            return false;
        }
        
        try {
            $response = $this->client->request('POST', self::GOOGLE_CAPTCHA_VERIFY_ENDPOINT, [
                'form_params' => [
                    'response' => $request->get(self::CAPTCHA_REQUEST_PARAMETER),
                    'remoteip' => $request->getClientIp(),
                ],
            ]);

            $responseRaw = $response->getBody()->getContents();
            $response = json_decode($responseRaw, true);

            return $response && (bool) $response['success'];
        } catch (ClientExceptionInterface) {
            return false;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function getName(): string
    {
        return self::CAPTCHA_NAME;
    }
}

```

## Google reCAPTCHA v3 example

You might want to check out the example [GoogleReCaptchaV3](https://github.com/shopware/shopware/blob/trunk/src/Storefront/Framework/Captcha/GoogleReCaptchaV3.php) class from the Shopware 6 core. It's a good example of how to implement a custom captcha type.
