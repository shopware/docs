---
nav:
  title: Using the datepicker plugin
  position: 270

---

# Using the Datepicker Plugin

## Overview

To provide an input field for date and time values, you can use the datepicker plugin. This guide shows you how to use it.

The datepicker plugin uses the `flatpickr` implementation under the hood. So, check out the `flatpickr` documentation,
if you need more information about the date picker configuration itself.

<PageRef page="https://flatpickr.js.org" title="Introduction" target="_blank" />

## Prerequisites

You won't learn how to create a plugin in this guide, head over to our Plugin base guide to create
your first plugin:

<PageRef page="../plugin-base-guide" />

You should also know how to customize templates:

<PageRef page="./customize-templates" />

## Setup a datepicker input field

To apply the datepicker functionality we have to add a DOM element in a template, e.g. an input field.
To keep this example simple for now we just override the `base_main_inner` block of the `storefront/page/content/index.html.twig` template.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}
    <label>
        <input type="text"
               name="customDate"
               class="customDate"
        />
    </label>

    {{ parent() }}
{% endblock %}
```

Now you should see an empty input field if you open the storefront in your browser.
We need to add the data-attribute `data-date-picker` to activate the datepicker plugin on our input field.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}
    <label>
        <input type="text"
               name="customDate"
               class="customDate"
               data-date-picker
        />
    </label>

    {{ parent() }}
{% endblock %}
```

If we check the change in the browser again, thus after reloading the page, we can see that the datepicker plugin is now active on this element.

## Configure the datepicker

If you select a date with the datepicker from the example above, you will see that a time is always selected and displayed in the input field. By default, the time selection is activated.

We can change this behaviour by passing more options to the datepicker plugin.

Here you can see how this is done by setting up a local Twig variable `pickerOptions`. We can assign a JSON formatted object to the variable and pass the value to the datepicker plugin through the `data-date-picker-options` attribute.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}

    {% set pickerOptions = {
        locale: app.request.locale,
        enableTime: true
    } %}
    
    <label>
        <input type="text"
               name="customDate"
               class="customDate"
               data-date-picker
               data-date-picker-options="{{ pickerOptions|json_encode|escape('html_attr') }}"
        />
    </label>

    {{ parent() }}
{% endblock %}
```

As you can see, we also pass in the `locale` option which gets its value from `app.request.locale`. As a result,
the datepicker plugin now uses the same locale as the current storefront and the date formatting matches active
languages accordingly.

## Preselect a date

To preselect the value of the datepicker we can simply set its value in the input field which gets picked up by the datepicker plugin.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}

    {% set pickerOptions = {
        locale: app.request.locale,
        enableTime: true
    } %}
    
    <label>
        <input type="text"
               name="customDate"
               class="customDate"
               value="2021-01-01T00:00:00+00:00"
               data-date-picker
               data-date-picker-options="{{ pickerOptions|json_encode|escape('html_attr') }}"
        />
    </label>

    {{ parent() }}
{% endblock %}
```

## Controlling the datepicker via buttons

To open or close the datepicker by trigger buttons you can pass in DOM selectors. You can also setup a selector to reset the currently selected value.
Here is an example which shows all three selectors in action.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}

    {% set pickerProperties = {
        locale: app.request.locale,
        enableTime: true,
        selectors: {
            openButton: ".openDatePicker",
            closeButton: ".closeDatePicker",
            clearButton: ".resetDatePicker"
        }
    } %}

    <label>
        <input type="text"
               name="foo"
               class="customDate"
               value="2021-04-13T00:00:00+00:00"
               data-date-picker
               data-date-picker-options="{{ pickerProperties|json_encode|escape('html_attr') }}"
        />

        <button class="openDatePicker">Open</button>
        <button class="closeDatePicker">Close</button>
        <button class="resetDatePicker">Reset</button>
    </label>

    {{ parent() }}
{% endblock %}
```

## More options

| Option | Default | Description |
| :--- | :--- | :--- |
| `dateFormat` | 'Y-m-dTH:i:S+00:00' | Pattern for the date string representation
| `altInput` | true | Hides your original input and creates a new one.
| `altFormat` | 'j. FY, H:i' | Alternative pattern for the date string representation if `altInput` is enabled. The value of the input field gets still formatted by `dateFormat`
| `time_24hr` | true |
| `enableTime` | true |
| `noCalendar` |false |
| `weekNumbers` | true |
| `allowInput` | true |
| `minDate` | null | Specifies the minimum/earliest date (inclusively) allowed for selection
| `maxDate` | null | Specifies the maximum/latest date (inclusively) allowed for selection.
