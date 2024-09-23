---
nav:
   title: Appearance
   position: 40

---

# Appearance

To change the appearance of your Sales Agent, you can customize the theme, colors, and logo.

## Regarding SCSS

We currently include SCSS (or Sass) as a dev dependency in our project (see `package.json`). This is a dependency we need as a peer dependency of the meteor component library basically.
We discourage you from using SCSS, as we'll likely remove it from Sales Agent in the future. The reason for this is that we already provide a powerful framework for styling your frontend (UnoCSS), which is also integrated into the Shopware Frontends framework.


## Config, favicon and logo

You can customize your sales agent by editing the app and configuration in your `config.ts` file. In addition, favicon and logo can easily be replaced in the following paths to use them. Please consider using square dimensions for the image file if possible:

- Favicon: `./public/favicon.ico`
- Logo: `./public/logo.svg`