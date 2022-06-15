# Complex views

## Table of contents

* [Description](#description)
* [Controller structure](#controller-structure)
* [Root controller](#root-controller)
* [Sub controller](#sub-controller)
* [Tips for ajax panel views](#tips-for-ajax-panel-views)
* [Modal Component](#modal-component)

## Description

The B2B-Suite comes with a whole User Interface providing administration like features in the frontend. The structure is reflected in the naming of the several controller classes. Each controller then uses a canonical naming scheme. The example below shows the _ContactController_ with all its assignment controllers.

![image](/.gitbook/assets/contact-controller-complex-example.svg)

As you can see, every controller is associated with one specific component.

## Controller structure

The controller naming is very straightforward. It always looks like this:

    B2bContact - contact listing
    ├── B2bContactRole - role <-> contact assignment
    ├── B2bContactAddress - address <-> contact assignment
    ├── B2bContactContingent - contingent <-> contact assignment
    ├── B2bContactRoute - route <-> contact assignment

We distinguish here between _root controller_ and _sub controller_. A root controller does not require parameters to be passed to it, it provides a basic page layout and CRUD actions on a single entity. Contrary a sub controller depends on a context (usually a selected id) from requests and provides auxiliary actions, like assignments, in this context.

## Root controller

The root controller usually looks like this:

```php
<?php declare(strict_types=1);

namespace My\Namespace;

class RootController
{
    /**
    * Provides the page layout and display a listing containing the entities
    */
    public function indexAction() { [...] }
    
    /**
    * Display an empty form or optionally errors and the invalid entries
    */
    public function newAction() { [...] }

    /**
    * Post only!
    *
    * Store new entity, if invalid input forward to `newAction`, if successful forward to `detailAction`
    */
    public function createAction() { [...] }

    /**
    * Provides the detail layout. Usually a modal box containing a navigation and initially selecting the `editAction`
    *
    */
    public function detailAction() { [...] }

    /**
    * Display the Form containing all stored data
    */
    public function editAction() { [...] }

    /**
     * Post only!
     *
     * Store updates to the entity, forward to `editAction`
     */
    public function updateAction() { [...] }

    /**
     * Post only!
     *
     * Removes a record, Forwards to `indexAction`
     */
     public function removeAction() { [...] }
}
```

As you can see there are a few `POST` only actions, these are solely for data processing and do not have a view of their own. This decision was made to provide smaller and easier to understand methods, easing the handling for extension developers. So actually there are fewer views than actions:

    ├── index.html.twig - the listing grid
    ├── detail.html.twig - the modal dialog layout with navigation and extends modal.html.twig
    ├── edit.html.twig - edit an existing entity and extends modal.html.twig
    ├── _edit.html.twig - extends modal-content.html.twig
    ├── new.html.twig - extends modal.html.twig
    ├── _new.html.twig - extends modal-content.html.twig
    ├── _form.html.twig - the internal usage only form for edit and new

## Sub controller

The sub controller depends on parameters to get the context it should act on. A typical assignment controller looks like this:

```php
<?php declare(strict_types=1);

namespace My\Namespace;

class SubController
{
    /**
     * Provides the layout for the controller and contains the listing
     */
    public function indexAction() { [...] }

    /**
     * Post only!
     *
     * Assign two id's to each other
     */
    public function assignAction() { [...] }
}
```

Since POST only actions never have views, these controllers only have one view:

    ├── index.html.twig - contains entity listing

## Modal Component

You can find more information about our modal component in this article: [B2B-Suite Modal Component](modal-component.md)
