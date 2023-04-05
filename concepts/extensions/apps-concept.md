# Apps

The app system allows you to extend and modify the functionality and appearance of Shopware. It leverages well defined extension points, you can hook into, to implement your specific use case.

The app system is designed to be decoupled from Shopware itself. This has two great advantages:

1. Freedom of choice: You need to understand only the interface between Shopware and your app to get started with developing your own app. You don't need special knowledge of the inner workings and internal structure of Shopware itself. Additionally you have the freedom to choose a programming language or framework of your choice to implement your app. This is achieved by decoupling the deployment of Shopware itself and your app and by using the Admin API and webhooks to communicate between Shopware and your app, instead of using programming language constructs directly.
2. Fully cloud compatible: By decoupling Shopware and your app, your app is automatically compatible for the use in a multi tenant cloud system, therefore your app can be used within self-hosted shops and shops on [Shopware Cloud](../../products/cloud-1.md).

The central interface between your app and Shopware is defined by a dedicated manifest file. The manifest is what glues Shopware and your app together. It defines what features your app uses and how Shopware can connect to your app. You can find more information about how to use the manifest file in the App Base Guide.

<PageRef page="apps-concept" />

## Communication between Shopware and your app

Shopware communicates with your app only exclusively HTTP-Requests, therefore you are free to choose a tech-stack for your app, as long as you can serve HTTP-Requests. Shopware will notify you over events happening in the shop that your app is insterested in by posting to HTTP-Endpoints that you define in the manifest file. While processing these events your app can use the Shopware API to get additional data that your app needs. A schematic overview of the communication may look like this:

![Communication between Shopware and your app](../../.gitbook/assets/shop-app-communication.svg)

To secure this communication a registration handshake is performed during the installation of your app. During this registration it is verified that Shopware talks to the right app backend server and your app get's credentials used to authenticate against the API. You can read more on the registration worklfow in the [App Base Guide](../../guides/plugins/apps/app-base-guide.md).

::: info
Notice that this is optional in the case that Shopware and your app don't need to communicate, e.g. because your app provides a [Theme](apps-concept.md).
:::

## Modify the appearance of the storefront

Your app can modify the appearance of the storefront, by shipping your storefront assets \(template files, javascript sources, SCSS sources, snippet files\) alongside your manifest file. You don't need to serve those assets from your external server, as Shopware will build the storefront anew on installation of your app and will consider your modifications in that process. Find out more about modifying the appearance of the storefront in the App Storefront Guide.

<PageRef page="apps-concept" />
