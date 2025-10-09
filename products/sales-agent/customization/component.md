---
nav:
   title: Component Customization
   position: 30

---
::: warning
All customization instructions will refer to changes made within your customization layer folder.
:::

# Component Customization

In this document, we will demonstrate how to customize a component (e.g, the login page) in the Sales Agent frontend using the Nuxt layer concept. This guide will help you understand the process of extending or modifying the default components in your frontend without altering the core files.

## Understand the component structure of the default layer

Before customizing any components, it's essential to understand the structure of the default layer. Navigate to the `~/layers/sales-agent` directory to view all available components.

In this case, look for the `login.vue` component inside `sales-agent/pages/auth`.

## Create the component in the custom layer

Now, inside your custom layer, paste the copied `login.vue` file. You should now have the same default component in your custom-layer directory, ready for modification.
Once you have copied the component to your custom layer, modify the part of the component that you want to change. For instance, you may want to change the style, add new functionality, or update the template.
At this point, the frontend app will ignore the `login.vue` from the default layer and only use the `login.vue` from the custom layer.

See example in the layer `example` of source code.
