# Using filter

## Overview

In this guide you'll learn how to use filters in the Shopware Administration.

## Prerequisites

This guide requires you to already have a basic plugin running. If you don't know how to do this in the first place, have a look at our [Plugin base guide](../plugin-base-guide).

Furthermore you should have a look at our [add filter](add-filter) guide, since this guide is built upon it.

## Using the filter

In this section we will show you, how to use our `example` filter in JavaScript code and in your Twig template files.

### Filter in components JavaScript

If we want to use the filter in our components JavaScript files, we can access it by using `this.$options.filters` and the name of our filter.

```javascript
this.$options.filters.example('firstArgument')
```

### Filter in Twig templates

If we want to use our filter in Twig templates, we can easily use it by using a pipe `|` and the name of our filter. It is also possible to use filters in `v-bind` expressions.

Below you can see two example implementations, how it could be done with single argument filters.

```text
{% block my_custom_block %}
    <p>
       {{ $tc('swag-example.general.myCustomText')|example }}
    </p>
{% endblock %}
```

```text
<example-component :name="$tc('swag-example.general.myCustomText')|example"></example-component>
```

When using multiple arguments, we can pass them as shown below.

```text
{% block my_custom_block %}
    <p>
       {{ $tc('swag-example.general.myCustomText')|example('secondArgument', 'thirdArgument') }}
    </p>
{% endblock %}
```

```text
<example-component :title="$tc('swag-example.general.myCustomText')|example('secondArgument', 'thirdArgument')"></example-component>
```
