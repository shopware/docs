---
nav:
  title: Customization
  position: 40

---

# Digital Sales Rooms Customization

This section explains how to customize the **Digital Sales Rooms** frontend template. The DSR frontend is built with Nuxt 3 and leverages the [Nuxt Layer concept](https://nuxt.com/docs/getting-started/layers), allowing you to override file content with your own Nuxt layer for easy customization.

## Create a new Nuxt layer

If you look into the `dsr-frontends` template, you'll find the default Nuxt layer named `dsr`. This layer should remain untouched. To apply customizations, you should create a new Nuxt layer and import it in `nuxt.config.ts`. For more details, refer to the [composition guide](https://nuxt.com/docs/guide/going-further/layers). Besides, we’ve also created a customization layer named `example` within the frontend source code. You can rename this layer and modify its contents to suit your needs.
