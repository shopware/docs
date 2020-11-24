# Plugin Base Guide (Category with content and no childs)
```
Notes:
- How to create a basic plugin (Create a file in custom/plugin, extend from X, use namespace as plugin name, done)
- Also available as command, explain
- Explain composer.json
- Refer to next steps (Create new page, Listen to events, Customize templates)
- Mention plugin lifecycle (Mention when installing the plugin is explained)
```

# Plugins for Symfony developers (Category with just content and no childs)
```
Notes:
- Mention differences. Cross reference to fundamentals
- Listen to events (Reference)
- Dependency Injection (Reference)
- Add CLI command (Reference)
- Symfony Bundles vs Shopware Bundles vs Shopware Plugins
```

# Plugin fundamentals
* Listen to events
    * Add reference
* Dependency Injection
    * Mainly a symfony reference
* Add CLI command
    * Add reference
* Add plugin configuration
* Read plugin configuration
* Add dependency to other plugins
* Add a custom class / service
    * Is maybe explained via "Dependency Injection" already
* Execute database queries
    * Basically "Migrations"
    * Reference to Symfony docs?
* Plugin compatibility
    * E.g. "Version switches"
* Add scheduled tasks

# Testing
* Add End-To-End tests
* Add storefront unit tests
* Add administration unit tests
* Add PHPunit tests

# Checkout
## Cart
* Add custom cart items
* Customize price calculation
* Using currency rounding
* Add cart validator
* Add nested cart item
* Add discounts / surcharges
* Change price of single item in cart

## Customer
* Add custom fields to customer registration
* Add validation to customer registration
* Add password encoding
* Customize "Merchant registration"
* Add custom login method

## Document
* Add custom documents
* Add data to document rendering

## Order
* Add custom order, payment and delivery states
* Using the state machine
* Change order validations
* Add order validations
* Listen to order changes
* Change order state
* Add custom fields to order

## Payment
* Add custom payment provider
* Customize payment provider

## Shipping
* Add custom shipping method

# Content

## CMS
* Add custom CMS block
* Add custom CMS element
* Add data to CMS elements
    * Explain adding data via data resolver
* Loading a cms page in storefront

## Import / export
* Add custom profile type
* Add custom mapping

## Mail
* Add custom mail transporter
* Add a mail template

## Media
* Add custom media type

## Product Stream
* Using a product stream in storefront
    * Explain: How to fetch products using a product stream ID

## SEO
* Add custom SEO URLs
* Add data to SEO URL generation (As in: Can be used in the administration then)

## Sitemap
* Add custom sitemap entries
* Modify sitemap generation

# Framework

## Data Handling / DataAbstractionLayer
* Add custom complex data
    * Mainly "How to register an own entity to the DAL"
* Add complex data to existing entities
* Add data indexer
* Reading data
* Writing data
* Add custom flags
* Using flags
* Add data associations
* Add data translations

## Event
* Register to events
    * Basically "Subscriber", should include reference to Symfony
* Finding events
* Add custom event

## Message Queue
* Add message to queue
* Add message handler
* Add middleware

## Rule
* Add custom rules
    * Explain: Rules are part of the context in the storefront
* Add rule to custom entity

## Custom field
* Add custom field
* Fill custom field with data
* Using custom fields with media type

## Store API
* Add own store api route

# Storefront
* Add custom page
* Add custom "pagelet"
    * Implementing an ajax route
* Override existing routes
* Customize templates
* Add custom javascript
* Override existing javascript
* Removing an unnecessary javascript plugin
* Add custom assets
* Add custom styling
* Add custom captcha
* Reacting to javascript events
* Fetching data with javascript
* Using a modal window
    * Explain: Static modal & ajax modal
* Add cookie to consent manager
* Reacting to cookie consent changes
* Add more data to existing page
* Add translations
* Using media / thumbnails
    * Explain `searchMedia` function
* Using icons
* Using CSRF protection
* Add SCSS variables
* Using custom fields
    * Include "using custom field labels"
* Adding off canvas menu
    * If too complex or only hacky possible: Don't do it
* Working with viewports in javascript
* Add listing filters

# Administration
* Using the Shopware object
    * Explain: No other imports from core allowed! Use Shopware object!
* Add custom module
* Customize modules
* Add menu entry
    * Add info about first layer menu not being available
    * Explain creating "groups"
* Add custom component
* Customize component
* Add new tab to existing module
* Add field to existing module
* Add vue templates
    * TwigJS != PHP Twig
* Using data handling
    * Reading data
    * Writing data
* Add new route
* Add custom service
* Using services
* Using custom fields in your module
* Add permissions
* Add styles
* Add state
* Add translations
* Add mixins
* Add search for custom data
* Using base components
* Using assets
* Add directives
* Using directives
* Add filter
* Using filter
* Add data sanitizing
* Add shortcuts
* Add error-handling
* Add middleware to existing services and factories
* Add decorators to existing services and factories
* Handling media
* Using the data grid component
* Add responsive behavior
* Using utility functions