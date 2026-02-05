---
nav:
  title: Override Responsive Breakpoints in a Theme
  position: 65

---

# Override Responsive Breakpoints in a Theme

Shopware uses the default breakpoint configuration of Bootstrap for responsive layout adjustments. However, these breakpoints are also passed to Twig and JS. If you want to override these breakpoints with your custom configuration, you can do so by overriding the corresponding theme config fields.

## Setting custom breakpoint values

Since Shopware 6.7.8.0 you have 6 new theme config fields available to override specific breakpoint settings. These fields are hidden for users in the adminisration of Shopware and only serve as a developer feature. You can use these fields in the theme.json of your theme to set specific values for each breakpoint.

**Example:**  

```JSON
{
  "name": "My custom theme",
  "config": {
    "fields": {
      "sw-breakpoint-xs": {
        "value": 0,
      },
      "sw-breakpoint-sm": {
        "value": 576,
      },
      "sw-breakpoint-md": {
        "value": 768,
      },
      "sw-breakpoint-lg": {
        "value": 992,
      },
      "sw-breakpoint-xl": {
        "value": 1200,
      },
      "sw-breakpoint-xxl": {
        "value": 1400,
      }
    }
  }
}

```

When you override the existing fields, they will automatically replace the existing values in Twig and JS. You can also access those values in your code the same way as other theme variables. If you also want these values to be used in SCSS to override the default Bootstrap configuration, you have to do this separately.

## Overriding Bootstrap default Breakpoints

Because Shopware uses the default values of Bootstrap for breakpoints in CSS, you won't find any configuration in the default theme of Shopware. However, you can change those in your custom theme. 

For detailed information about the configuration of breakpoints in Bootstrap you can refer to the [official documentation](https://getbootstrap.com/docs/5.3/layout/breakpoints/).

The theme config values are also available in SCSS and you can reuse them to apply the same configuration in SCSS. This way you have a single point of truth for defining the breakpoints for your theme.

```SCSS
$grid-breakpoints: (
    xs: $sw-breakpoint-xs,
    sm: $sw-breakpoint-sm,
    md: $sw-breakpoint-md,
    lg: $sw-breakpoint-lg,
    xl: $sw-breakpoint-xl,
    xxl: $sw-breakpoint-xxl
);
```
