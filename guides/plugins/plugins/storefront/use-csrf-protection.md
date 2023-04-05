# Use CSRF Protection

## Overview

One of the common security risks of your application could be a [Cross Site Request Forgery](https://owasp.org/www-community/attacks/csrf) (CSRF) attack, which is the shorthand for Cross Site Request Forgery. This short guide will teach you how to properly secure your forms in the Storefront by using Shopware's built-in tools.

## Prerequisites

Since this guide will be a general example and not a plugin-specific one, there is no need for a running plugin. However, it will assume you've got a custom `form` element in the Storefront, which you want to secure.

Knowing what exactly CSRF is and how the attack works may come in handy, so you might want to have a look at the [OWASP page regarding CSRF](https://owasp.org/www-community/attacks/csrf).

## Use CSRF protection for form

As already mentioned, this guide assumed you've already got a custom form running, which needs CSRF protection. The following will be the example form we're going to use:

```html
<form action="{{ path('some.action') }}"
    method="post"
    data-form-csrf-handler="true"
    class="some-form-class">
    <div class="some-container-class">
        <button type="submit" class="btn btn-primary btn-block">Some button</button>
        <input type="hidden" name="mayNotBeManipulated" value="sensible value">
    </div>
</form>
```

Just a basic form with a submit button and a hidden input, that must not be manipulated.

Every storefront `POST` request is checked for a valid CSRF token to prevent [Cross Site Request Forgery attacks](https://owasp.org/www-community/attacks/csrf), since by default every Storefront route is automatically looking for a CSRF token. This also means, that the simple example form mentioned above will not work, since it's missing a CSRF token. You can make the form work, by disabling the CSRF protection on your route.

Protecting it now with the built-in tools requires you to add two new lines, but let's have a look at a secure example first:

```html
<form action="{{ path('some.action') }}"
    method="post"
    data-form-csrf-handler="true"
    class="some-form-class">
    <div class="some-container-class">
        <button type="submit" class="btn btn-primary btn-block">Some button</button>
        <input type="hidden" name="mayNotBeManipulated" value="sensible value">

        {{ sw_csrf('some.action') }}
    </div>
</form>
```

Shopware 6 provides two different mechanisms for token generation:

* The default recommended method is to generate CSRF tokens server side via twig and include them in forms. In the example, this is done with the twig function `sw_csrf`, whose parameter has to match the route its protecting. This is necessary, because the javascript mechanism won't work if the user disabled javascript in his browser.
* Ajax can also be used to generate token and append them to `POST` requests. The CSRF mode has to be set so `ajax` for this to work. This method is needed while using a third party cache provider like varnish. Read more on this in the caching section below. For that case, we're registering the [FormCsrfHandler plugin](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/app/storefront/src/plugin/forms/form-csrf-handler.plugin.js) on your form, which will take care of generating a CSRF token via javascript.

Therefore, the two new lines are the following:

* The `{{ sw_csrf }}` function is used to generate a valid CSRF token with twig and append it as a hidden input field to the form.

  It also accepts a `mode` parameter which can be set to `token` or `input`\(default\):

  ```text
    {{ sw_csrf('example.route', {"mode": "token"}) }}
  ```

  * Mode `token` renders only a blank token. This can be used to create an own input element or to hand over the token to a JS plugin.
  * Mode `input` renders a hidden input field with the token as value
  * Important: Note that the parameter of the `sw_csrf` function must match the route name for the action. Every token is only valid for a specific route.

* The data attribute `data-form-csrf-handler="true"` initialises the JS plugin if the `csrf` mode is set to `ajax`. This will fetch a valid token on submit and then appends it to the form.
  * The \`[FormCsrfHandler plugin](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/app/storefront/src/plugin/forms/form-csrf-handler.plugin.js) is only needed for native form submits.
  * `POST` requests made with the `http-client.service` are automatically protected when `csrf` mode is set to `ajax`

CSRF protection can be configured via [Symfony configuration files](https://symfony.com/doc/current/configuration.html).

```yaml
// <platform root>/src/Storefront/Resources/config/packages/storefront.yaml
storefront:
    csrf:
        enabled: true   // true/false to turn protection on/off
        mode: twig      // Valid modes are `twig` or `ajax`
```

## Exclude controller action from CSRF checks

As previously said, each Storefront route is looking for a CSRF token by default. It is possible to exclude a controller `POST` action from CSRF checks in the route annotation:

```php
/**
 * @Route("/example/route", name="example.route", defaults={"csrf_protected"=false}, methods={"POST"})
*/
public function exampleAction() {}
```

::: danger
Be aware that this is not recommended and could create a security vulnerability!
:::

## Caching and CSRF

The default configuration for the `csrf` mode is `twig` and works fine with the shopware HTTP cache. If an external cache \(e.g. varnish\) is used, the mode needs to be `ajax`. A valid CRSF token is then fetched before a `POST` request and appended.
