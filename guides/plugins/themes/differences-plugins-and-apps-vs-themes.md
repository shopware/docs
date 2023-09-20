# Differences Plugins and Apps vs Themes

A theme is a special type of Plugin or App, aimed at easily changing the visual appearance of the Storefront. If you want to get more information about plugins and apps you can check out the [Plugin Base Guide](../plugins/plugin-base-guide) and [App Base Guide](../apps/app-base-guide).

There are basically several ways to change the appearance of the Storefront. You can have "regular" plugins or apps which main purpose is to add new functions and change the behavior of the shop. These plugins / apps might also contain SCSS/CSS and JavaScript to be able to embed their new features into the Storefront.

Technically a theme is also a plugin / app but it will be visible in the theme manger once its activated and can be assigned to a specific sales channel, while plugins / apps are activated globally. To distinguish a theme from a "regular" plugin / app you need to implement the Interface `Shopware\Storefront\Framework\ThemeInterface`. A theme can inherit also from other themes, overwrite the default configuration \(colors, fonts, media\) and add new configuration options.

You do not need to write any PHP code in a theme. If you need PHP code you should choose a plugin instead. Another important distinction to themes is this: Themes are specific for a sales channel and have to be assigned to them to take effect, the other way around plugins and apps have a global effect on the Shopware installation.

## Next steps

Now that you have learned the differences between themes, plugins and apps, you can create your first theme.

* [Create a first Shopware theme](create-a-theme)
