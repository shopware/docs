# Ajax Panel

`AjaxPanel` is a mini-framework based on Storefront plugins. It mimics `iFrame` behavior by integrating content from different controller actions through ajax into a single view and intercepting, usually page changing events and transforming them into XHR-Requests.

The diagram below shows how this schematically behaves:

![image](../../../../../.gitbook/assets/ajax-panel-abstract.svg)

## Basic usage

The `AjaxPanel` plugin is part of the b2b frontend and will scan your page automatically for the trigger class `b2b--ajax-panel`.
The most basic ajax panel looks like this:

```twig
<div
    class="b2b--ajax-panel"
    data-url="{{ path('frontend.b2b.b2bcontact.grid' }}"
>
    <!-- will load content here -->
</div>
```

After the document is ready, the ajax panel will trigger an XHR GET-Request and replace its inner HTML with the responses content.
Now, all clicks on links and forms submitted inside the container will be changed to XHR-Requests.

## Extended usage

### Make links clickable

Any HTML element can be used to trigger a location change in an ajax panel, just add a class and set a destination:

```twig
<p class="ajax-panel-link" data-href="{{ path('frontend.b2b.b2bcontact.grid') }}">Click</p>
```

### Ignore links

It might be necessary that certain links in a panel really trigger the default behavior. You just have to add a class to the link or form:

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

## Ajax panel plugins

The B2B Suite comes with a library of simple helper plugins to add behavior to the ajax panels.

![image](../../../../../.gitbook/assets/ajax-panel-structure.svg)

As you can see, there is the `AjaxPanelPluginLoader` responsible for initializing and reinitializing plugins inside b2b-panels.
Let's take our last example and extend it with a form plugin:

```twig
<div
    class="b2b--ajax-panel"
    data-url="{{ path('frontend.b2b.b2bcontact.grid') }}"
    data-plugins="ajaxPanelFormDisable"
>
    <!-- will load content here -->
</div>
```

This will disable all form elements inside the panel during panel reload.

While few of them add very specific behavior to the grid or tab's views, there are also a few more commonly interesting plugins.

### Modal

The `b2bAjaxPanelModal` plugin helps to open ajax panel content in a modal dialog box. Let's extend our initial example:

```twig
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

Sometimes a change in one panel needs to trigger reload in another panel.
This might be the case if you are editing in a dialog and displaying a grid behind it.
In this case, you can just trigger reload on other panel id's, just like that:

```twig
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
In the view the `div` element needs the class `is--b2b-tree-select-container` and the data attribute <code v-pre>data-move-url="{{ path('frontend.b2b.b2brole.move') }}"</code>.
The controller has to implement a move action, which accepts the `roleId`, `relatedRoleId`, and the `type`.

Possible types:

* prev-sibling
* last-child
* next-sibling
