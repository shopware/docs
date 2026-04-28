---
nav:
   title: Branding Customization
   position: 10

---
::: warning
All customization instructions will refer to changes made within your customization layer folder.
:::

# Branding Customization

## Favicon

- Create `public` folder inside your layer (if missing).

- Place your favicon inside the `public` folder and ensure it is named `favicon.ico`.

## Web application title

- Create `nuxt.config.ts` inside your layer (if missing).

- Replace "Your app name" with your app's name and add the following code:

```js
app: {
  head: {
    title: 'Your app name'
  }
}
```

## Theme color

Sales Agent utilizes the Shopware [Meteor Component Library](https://shopware.design/get-started/installation.html), which provides a comprehensive CSS variable system to manage themes. The default theme is aligned with their design system, ensuring consistency across applications. This package offers both a [light theme](https://github.com/shopware/meteor/blob/main/packages/tokens/deliverables/administration/light.css) and a [dark theme](https://github.com/shopware/meteor/blob/main/packages/tokens/deliverables/administration/dark.css), allowing you to explore and utilize the CSS variable system effectively.

### Customizing Theme Colors

To tailor the theme to your brand's identity, you can override the default CSS variables. By defining custom values in your own CSS file, you can seamlessly adapt the visual aspects of the application:

```css
/* main.css */
:root {
  --color-interaction-primary-default: #80A1BA; /* Add your primary color */
  /* Add more customizations as needed */
}
```

### Integrating Custom Styles in Nuxt.js

To apply these customizations in your application, import the CSS file into your Nuxt configuration. This will ensure that your branding colors take effect across the app:

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["./main.css"], // Include your custom CSS file
});
```

By doing so, you maintain the flexibility of the Shopware system while aligning it with your unique brand style, providing a cohesive user experience.
