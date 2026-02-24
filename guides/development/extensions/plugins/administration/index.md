---
nav:
  title: Administration
  position: 60

---

# Administration

The Administration allows you to customize and extend the functionality of Shopware's backend interface. You can add modules, routes, components, services, permissions, and UI logic.

Typical use cases include:

* Adding a custom module
* Registering routes and navigation entries
* Creating Vue components
* Working with repositories and API data
* Handling permissions (ACL)
* Injecting services
* Customizing templates and styling

This section follows a practical development workflow. Start with registering a module and route, then build your components, connect data, and refine permissions and UI behavior.

## Developer workflow

When extending the Administration inside a plugin, follow this sequence:

1. [Add a custom module](module-component-management/add-custom-module.md) and [menu entry](routing-navigation/add-menu-entry.md)
2. [Add custom routes](routing-navigation/add-custom-route.md)
3. [Add custom components](module-component-management/add-custom-component.md) and [use base components](module-component-management/using-base-components.md)
4. Connect [data](data-handling-processing/using-data-handling.md) (repositories or [API requests](services-utilities/making-api-requests.md))
5. Handle permissions and [add ACL rules](permissions-error-handling/add-acl-rules.md)
6. [Inject services](services-utilities/injecting-services.md) and [extend services](services-utilities/extending-services.md)
7. [Customize templates](templates-styling/writing-templates.md) and [add custom styles](templates-styling/add-custom-styles.md)
8. Manage state using [Vuex](data-handling-processing/using-vuex-state.md) or [Pinia](system-updates/pinia.md)

Advanced topics such as [mixins and directives](mixins-directives/using-mixins.md) or [extending webpack](advanced-configuration/extending-webpack.md) are covered separately.

Let’s start by [adding a custom module](module-component-management/add-custom-module.md).
