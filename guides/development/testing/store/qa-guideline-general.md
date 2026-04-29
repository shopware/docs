---
nav:
  title: QA guideline (general)
  position: 10
---

# Scope and terminology

- **Extension**: umbrella term for plugins and apps and themes.

- **Plugin**: installed in the Shopware instance; PHP code, Composer.

- **App**: integrated via app system; no direct PHP execution in core.

Unless stated otherwise, requirements apply to all extensions.

### Is a test environment available for testing the extension?

For testing, we provide you with a test environment in your partner account within the extension. This allows the extension to be tested across all its functionalities.

### Has the extension been fully tested before submission?

Before submitting, the extension should be checked to ensure everything works as described in our guidelines. Each area must be reviewed carefully.
In addition, the extension must be preconfigured with at least one of its main functionalities. For example, if the extension provides product custom fields with different input options, these should already be set up and some examples created in the test environment before submission.

### Can a video be provided to showcase the extension?

There is an option to upload a video demonstrating the functionality of the extension. This facilitates the review process and can also be used in the store to present the features to customers. The video should be in English or German and recorded in our test environment.

### Has the code quality been verified?

After the functional test, the code quality is reviewed. Our developers will check whether it has been developed according to Shopware standards.

### What happens if the extension fails testing multiple times?

The extension will be tested a maximum of three times during functional testing and twice by our developers. If it repeatedly shows errors during our tests or if these issues are not resolved, the extension may be blocked for up to 12 weeks. During this blocking period, the extension will not be tested or approved. It is not permitted to create a functional copy of the extension to bypass the suspension.

### Have all external technologies or integrations been declared?

If the extension uses any integrated technologies, such as APIs or services that send or receive data, these must be disclosed.
For example, an agency might create an integration with PayPal, DHL, or their own service.

### Is a technology partner agreement required for your extension?

If the extension is a software application or interface that involves downstream costs, transaction fees, or service charges for the customer, a technology partner agreement must be completed before the app can be activated.

If you have any questions regarding the technology partner agreement, please contact our sales team by email at <alliances@shopware.com> or by phone at +44 (0) 203 095 2445 (UK) / 00 800 746 7626 0 (worldwide) / +49 (0) 25 55 / 928 85-0 (Germany).

Alternatively, you can include this information directly in your app and provide it during the final submission.
