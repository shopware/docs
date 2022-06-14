# Ajax panel

You can download a plugin showcasing the topic [here](/products/editions/enterprise-edition/b2b-suite/example-plugins/B2bAjaxPanel.zip).

## Table of contents

* [Description](#description)
* [Basic usage](#basic-usage)
* [Extended usage](#extended-usage)
  * [Make links clickable](#make-links-clickable)
  * [Ignore links](#ignore-links)
  * [Link to a different panel](#link-to-a-different-panel)
* [Ajax Panel Plugins](#ajax-panel-plugins)
  * [Modal](#modal)
  * [TriggerReload](#triggerreload)
  * [TreeSelect](#treeselect)

## Description

`AjaxPanel` is a is a mini-framework based on storefront plugins. It mimics `iFrame` behaviour by integrating content from
different controller actions through ajax into a single view and intercepting,
usually page changing, events and transforming them into XHR-Requests.

The diagram below shows how this schematically behaves:

![image](/.gitbook/assets/ajax-panel-abstract.svg)

## Basic usage

The `AjaxPanel` plugin is part of the b2b frontend and will scan your page automatically for the trigger class `b2b--ajax-panel`.
The most basic ajax panel looks like this:

{% raw %}

```twig
<div
    class="b2b--ajax-panel"
    data-url="{{ path('frontend.b2b.b2bcontact.grid' }}"
>
    <!-- will load content here -->
</div>
```

{% endraw %}

After the document is ready, the ajax panel will trigger a XHR GET-Request and replace it's inner html with the responses content.
Now all clicks on links and form submits inside the container will be changed to XHR-Requests.
A streamlined example of this behaviour can be found in the [B2BAjaxPanel Example Plugin](/products/editions/enterprise-edition/b2b-suite/example-plugins/B2bAjaxPanel.zip),
but it is used across the B2B-Suite.

## Extended usage

### Make links clickable

Any HTML element can be used to trigger a location change in an ajax panel, just add a class and set a destination:

{% raw %}

```twig
<p class="ajax-panel-link" data-href="{{ path('frontend.b2b.b2bcontact.grid') }}">Click</p>
```

{% endraw %}

### Ignore links

It might be necessary that certain links in a panel really trigger the default behaviour,
you just have to add a class to the link or form:

```html
<a href="http://www.shopware.com" class="ignore--b2b-ajax-panel">Go to Shopware Home</a>

<form class="ignore--b2b-ajax-panel">
    [...]
</form>
```

### Link to a different panel

One panel can influence another one by defining and linking to an id.

```html
 <div ... data-id="foreign"></div>
 <a [...] data-target="foreign">Open in another component</a>
```

## Ajax Panel Plugins

The B2B-Suite comes with a whole library of simple helper plugins to add behaviour the ajax panels.

![image](/.gitbook/assets/ajax-panel-structure.svg)

As you can see, there is the `AjaxPanelPluginLoader` responsible for initializing and reinitializing plugins inside b2b-panels.
Let's take our last example and extend it with a form plugin.

```html
<div
    class="b2b--ajax-panel"
    data-url="{{ path('frontend.b2b.b2bcontact.grid') }}"
    data-plugins="ajaxPanelFormDisable"
>
    <!-- will load content here -->
</div>
```

This will disable all form elements inside the panel during panel reload.

While few of them add very specific behaviour to the grid or tab's views.
There are also a few more commonly interesting plugins.

### Modal

The `b2bAjaxPanelModal` plugin helps to open ajax panel content in a modal dialog box. Let's extend our initial example:

```html
<div
    class="b2b--ajax-panel b2b-modal-panel"
    data-url="{{ path('frontend.b2b.b2bcontact.grid') }}"
    data-plugins="ajaxPanelFormDisable"
>
    <!-- will load content here -->
</div>
```

This will open the content in a modal box.

### TriggerReload

Sometimes change in one panel needs to trigger reload in another panel.
This might be the case if you are editing in a dialog and displaying a grid behind it.
In this case you can just trigger reload on other panel id's, just like that:

```html
<div class="b2b--ajax-panel" data-url="{{ path('frontend.b2b.b2bcontact.grid') }}" data-id="grid">
    <!-- grid -->
</div>

<div class="b2b--ajax-panel" data-url="{{ path('frontend.b2b.b2bcontact.edit') }}" data-ajax-panel-trigger-reload="grid">
    <!-- form -->
</div>
```

Now every change in the form view will trigger reload in the grid view.

### TreeSelect

This `TreeSelect` plugin allows to display a tree view with enabled drag and drop.
In the view the `div` element needs the class `is--b2b-tree-select-container` and the data attribute `data-move-url="{{ path('frontend.b2b.b2brole.move') }}"`.
The controller have to implement a move action, which accepts the `roleId`, `relatedRoleId` and the `type`.

Possible types:

* prev-sibling
* last-child
* next-sibling
