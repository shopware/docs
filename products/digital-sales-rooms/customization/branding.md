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

- Create `uno.config.ts` inside your layer (if missing).

- E.g. to change the primary color to `#000000`, add the following code:

```js
theme: {
  colors: {
    primary: {
      DEFAULT: '#000000'
    }
  }
}
```

- Refer to the `uno.config.ts` file in the dsr layer to understand the key structure for overriding colors.
