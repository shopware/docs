---
nav:
   title: Appearance
   position: 40

---

# Appearance

To change the appearance of your Sales Agent, you can customize the theme, colors, and logo.

## Regarding SCSS

Currently SCSS (or Sass) is included as a dev dependency in our project (see `package.json`). This is a dependency needed as a peer dependency of the meteor component library. However, we discourage you from using SCSS, as we will likely remove it from Sales Agent in the future. The reason for this is that we already provide a powerful framework for styling your frontend (UnoCSS), which is also integrated into the Shopware Frontends framework.

## Config, favicon and logo

You can customize your sales agent by editing the app and configuring it in your `config.ts` file. Additionally, favicon and logo can be easily replaced in the following paths. Please consider using square dimensions for the image file if possible:

- Favicon: `./public/favicon.ico`
- Logo: `./public/logo.svg`
