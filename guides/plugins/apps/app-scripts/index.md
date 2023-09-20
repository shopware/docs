# App Scripts

App Scripts allow your app to include logic that is executed inside the Shopware execution stack. It allows you to build richer extensions that integrate more deeply with Shopware.

::: info
Note that app scripts were introduced in Shopware 6.4.8.0 and are not supported in previous versions.
:::

## Script hooks

The entry point for each script is the so-called "Hooks". You can register one or more scripts inside your app that should be executed whenever a specific hook is triggered.
Through the hook, your script gets access to the data of the current execution context and can react to or manipulate the data in some way.  

See the [Hooks reference](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md) for a complete list of all available.

## Scripts

At the core, app scripts are [twig files](https://twig.symfony.com/) executed in a sandboxed environment. Based on which hook the script is registered to, the script has access to the data of that hook and pre-defined services that can be used to execute your custom logic.

Apps scripts are placed in the `Resources/scripts` directory of your app. For each hook, you want to execute a script on, create a new subdirectory. The name of the subdirectory needs to match the name of the hook.

You can place one or more `.twig` files inside each of these subdirectories, which will be executed when the hook gets triggered.

The file structure of your apps should look like this:

```text
└── DemoApp
    ├── Resources
    │   └── scripts                         // all scripts are stored in this folder
    │       ├── product-page-loaded         // each script in this folder will be executed when the `product-page-loaded` hook is triggered
    │       │   └── my-first-script.twig
    │       ├── cart
    │       │   ├── first-cart-script.twig
    │       │   └── second-cart-script.twig // you can execute multiple scripts per hook
    │       └── ...
    └── manifest.xml
```

### Including scripts

Sometimes scripts can become more complex or you want to extract common functionality. Thus it is handy to split your scripts into smaller parts that can later be included in other scripts.

In order to do that you can compose your reusable scripts into [twig macros](https://twig.symfony.com/doc/3.x/tags/macro.html), put them inside a dedicated `include` folder and then import them using the [twig import functionality](https://twig.symfony.com/doc/3.x/tags/import.html).

```text
└── DemoApp
    ├── Resources
    │   └── scripts                         
    │       ├── include    
    │       │   └── media-repository.twig         // this script may be included into the other scripts
    │       ├── cart
    │       │   ├── first-cart-script.twig
    │       └── ...
    └── manifest.xml
```

Note that app scripts can use the `return` keyword to return values to the caller.

A basic example may look like this:

```twig
// Resources/scripts/include/media-repository.twig
{% macro getById(mediaId) %}
    {% set criteria = {
        'ids': [ mediaId ]
    } %}
    
     {% return services.repository.search('media', criteria).first %}
{% endmacro %}
```

```twig
// Resources/scripts/cart/first-cart-script.twig
{% import "include/media-repository.twig" as mediaRepository %}

{% set mediaEntity = mediaRepository.getById(myMediaId) %}
```

### Interface Hooks

Some "Hooks" describe interfaces this means that your scripts for that hook need to implement one or more functions.
E.g., the `store-api-hook` defines a `cache_key` and a `response` function. Those functions are closely related but are executed separately.
To implement the different functions, you use different twig blocks with the name of the function:

```twig
{% block cache_key %}
    // provide a cacheKey for the incoming request
{% endblock %}

{% block response %}
    // produce the response for the request
{% endblock %}
```

Some functions are optional, whereas others are required. In the above example the `cache_key` function is optional.
That means you can omit that block in your script without an error (but caching for the endpoint won't work in that case).
The `response` function is required, which means that if your script does not provide a `response` block, it will lead to an error.

Note that for each function, you get access to different input data or services, so in the `cache_key` block, you don't necessarily have access to the same data and services as in the `response` block.
The available data and services are described for each hook (or each function in InterfaceHooks) in the [reference documentation](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md).

### Translation

Inside the app script, you have access to the [Storefront translation mechanism](../../plugins/storefront/add-translations.md) by using the `|trans`-filter.

```twig
{% set translated = 'my.snippet.key'|trans %}

{% do call.something('my.snippet.key'|trans) %}
```

### Extended syntax

In addition to the default twig syntax, app scripts can also use a more PHP-flavoured syntax.

#### Equals check with `===`

Instead of using the rather verbose `{% if var is same as(1) %}`, you can use the more dense `===` equality checks.

```twig
{% if var === 1 %}
    ...
{% endif %}
```

Additionally, you can also use the `!==` not equals operator as well.

```twig
{% if var !== 1 %}
    ...
{% endif %}
```

#### Loops with `foreach`

Instead of the `for...in` syntax for loops, you can also use a `foreach` tag.

```twig
{% foreach list as entry %}
    {{ entry }}
    {% break %}
{% endforeach %}
```

#### Instance of checks with `is`

You can use a `is` check to check the type of a variable.

```twig
{% if var is string %}
    ...
{% endif %}
```

The following types are supported:

* `true`
* `false`
* `boolean` / `bool`
* `string`
* `scalar`
* `object`
* `integer` / `int`
* `float`
* `callable`
* `array`

#### Type casts with `intval`

You can cast variables into different types with the `intval` filter.

```twig
{% if '5'|intval === 5 %}
    {# always evaluates to true #}
{% endif %}
```

The following type casts are supported:

* `intval`
* `strval`
* `boolval`
* `floatval`

#### conditions with `&&` and `||`

Instead of using `AND` or `OR` in if-conditions, you can use the `&&` or `||` shorthands.

```twig
{% if condition === true && condition2 === true %}
    ...
{% endif %}
```

#### `return` tag

You can use the `return` tag to return values from inside macros.

```twig
{% macro foo() %} 
     {% return 'bar' %}
{% endmacro %}
```

## Available services

Depending on the hook that triggered the execution of your script, you get access to different services you can use inside your scripts, e.g. to access data inside Shopware or to manipulate the cart.
Take a look at the [Hook reference](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md) to get a complete list of all available services per hook.

Additionally, we added a `ServiceStubs`class that can be used as typehint in your script, so you get auto-completion features of your IDE.

```twig
{# @var services \Shopware\Core\Framework\Script\ServiceStubs #}

{% set configValue = services.config.app('my-app-config') %}
```

::: info
The stub class contains all services, but not all of them are available depending on the hook.
:::

## Example Script - loading media entities

Assuming your app adds a [custom field set](../custom-data/custom-fields.md) for the product entity with a custom media entity select field.

When you want to display the file of the media entity in the [Storefront](../storefront/README.md), it is not easily possible because, in the template's data, you only get the id of the media entity, but not the URL of the media file itself.

For this case, you can add an app script on the `product-page-loaded`
hook, which loads the media entity by id and adds it to the page object so the data is available in templates.

```twig
// Resources/scripts/product-page-loaded/add-custom-media.twig
{# @var services \Shopware\Core\Framework\Script\ServiceStubs #}

{% set page = hook.page %}
{# @var page \Shopware\Storefront\Page\Product\ProductPage #}

{% if page.product.customFields.myCustomMediaField is not defined %}
    {% return %}
{% endif %}

{% set criteria = {
    'ids': [ page.product.customFields.myCustomMediaField ]
} %}

{% set media = services.repository.search('media', criteria).first %}

{% do page.addExtension('swagMyCustomMediaField', media) %}
```

For a more detailed example of how to load additional data, refer to the [data loading guide](./data-loading.md).

Alternatively, take a look at the [cart manipulation guide](./cart-manipulation.md) to get an in-depth explanation of how to manipulate the cart with scripts.

## Developing/debugging scripts

You can get information about what scripts were triggered on a specific Storefront page inside the [Symfony debug toolbar](https://symfony.com/doc/current/the-fast-track/en/5-debug.html#discovering-the-symfony-debugging-tools).

::: info
The debug toolbar is only visible if your Shopware installation is in `APP_ENV = dev`. Ensure to set the correct env, e.g., in your `.env` file, when developing app scripts.
:::

You can find all hooks that are triggered and the scripts that are executed for each by clicking on the `script` icon.

![Symfony Debug Toolbar](../../../../.gitbook/assets/script-debug-toolbar.png)

That will open the Symfony profiler in the script detail view, where you can see all triggered hooks and the count of the scripts executed for each script at the top.

![Script Debug Toolbar](../../../../.gitbook/assets/script-debug-detail.png)

Additionally, you can use the `debug.dump()` function inside your scripts to dump data to the debug view.
A script like this:

```twig
{% do debug.dump(hook.page) %}
```

Will dump the page object to the debug view.

![Output of debug.dump()](../../../../.gitbook/assets/script-debug-dump.png)
