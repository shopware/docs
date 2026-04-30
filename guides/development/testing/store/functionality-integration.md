---
nav:
  title: Functionality and integration
  position: 30
---

# Functionality and integration

## Extension functionality

The extension's features work as described in the documentation. All listed features must be submitted by the time of the review.

## API validation

- API test button available or validation upon saving in the extension settings (for external services)
- Status message in the admin area and in the log indicating whether the test was successful or not. For example, [GitHub](https://github.com/shyim/ShyimApiTest)
- Invalid API data is logged in the event log (`/var/log/`) or in the database

## Configuration per sales channel

Apps that appear in the storefront must be configurable separately for each sales channel or only for a single channel.

## More

- **Message queue** - If the extension adds messages to the message queue, the entry should not be bigger than 256 KB. This limitation is set by common message queue workers and should not be exceeded.

- **Usage of fonts from external sources** - If external fonts (for example, Google Fonts, Font Awesome) or external services are used, this information must be included in the description in the extension store.

- **Tools:**

- [Adminer for Admin](https://store.shopware.com/en/frosh79014577529f/adminer-for-admin.html)
- [Tools](https://store.shopware.com/en/frosh12599847132f/tools.html)
- [Mail Archive](https://store.shopware.com/en/frosh97876597450f/mail-archive.html)
