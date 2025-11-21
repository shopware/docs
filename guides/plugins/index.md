---
nav:
  title: Extensions
  position: 20

---

# Extensions

As a Shopware developer, your primary focus is developing extensions that enhance or modify Shopware's functionality. Shopware offers three extension types—Plugins, Themes, and Apps—each with its own benefits and implications.

To dive straight in, take a look at our introduction guides, which provide essential information on how to create, configure, and extend your store with Shopware extensions:

<PageRef page="plugins/plugin-base-guide" />

<PageRef page="apps/app-base-guide" />

<PageRef page="themes/theme-base-guide" />

## At a glance

This comparison table aims to help you decide which Shopware extension type best fits your use case.

| Task | Plugin | Theme | App | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| Change Storefront appearance | ✅ | ✅ | ✅ |  |
| Add admin modules | ✅ | ❌ | ✅ |  |
| Execute webhooks | ✅ | ❌ | ✅ | Apps' main functionality is to call webhooks, but plugins can be implemented to do that as well. |
| Add custom entities | ✅ | ❌ | ✅ |  |
| Modify database structure | ✅ | ❌ | ❌ |  |
| Integrate payment providers | ✅ | ❌ | ✅ |  |
| Publish in the Shopware Store | ✅ | ✅ | ✅ |  |
| Install in Shopware 6 Cloud Shops | ❌ | ❌ (unless delivered via App) | ✅ | While theme plugins can’t be installed in Cloud, Apps can include themes and provide the same functionality.|
| Install in Shopware 6 self-hosted Shops | ✅ | ✅ | ✅ | Apps can be installed and used since Shopware 6.4.0.0. |
| Add custom logic/routes/commands | ✅ | ❌ | ✅ | Apps extract functionalities/logic into separate services, so technically they can add custom logic. |
| Control order of style/template inheritance | ❌ | ✅ | ✅ |  |
