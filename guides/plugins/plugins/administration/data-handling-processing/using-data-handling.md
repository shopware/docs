---
nav:
  title: Using the data handling
  position: 120

---

# Using the data handling

The Shopware 6 Administration allows you to fetch and write nearly everything in the database. This guide will teach you the basics of the data handling.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line and preferably registered module. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

Considering that the data handling in the Administration is remotely operating the Data Abstraction Layer its highly encouraged to read the articles [Reading data with the DAL](../../../../../guides/plugins/plugins/framework/data-handling/reading-data.md) and [Writing data with the DAL](../../../../../guides/plugins/plugins/framework/data-handling/writing-data.md).

## Relevant classes

`Repository`: Allows to send requests to the server - used for all CRUD operations `Entity`: Object for a single storage record `EntityCollection`: Enable object-oriented access to a collection of entities `SearchResult`: Contains all information available through a search request `RepositoryFactory`: Allows to create a repository for an entity `Context`: Contains the global state of the Administration \(language, version, auth, ...\) `Criteria`: Contains all information for a search request \(filter, sorting, pagination, ...\)

## The repository service

Accessing the Shopware API in the Administration is done by using the repository service, which can be injected with a [bottleJs](https://github.com/young-steveo/bottlejs) dependency injection container. In the Shopware Administration, there's a wrapper that makes `bottleJs` work with the [inject / provide](https://vuejs.org/v2/api/#provide-inject) from [`Vue`](https://vuejs.org/). In short: You can use the `inject` key in your component configuration to fetch services from the `bottleJs` DI container, such as the `repositoryFactory`, that you will need in order to get a repository for a single entity.

Add those lines to your component configuration:

```javascript
inject: [
    'repositoryFactory'
],
```

This way the `repositoryFactory` object is accessible in your component. The `create` function can be used to create a repository for a single entity, like in this example:

```javascript
const productRepository = this.repositoryFactory.create('product')
```

Note: You can also change some options in the repository, with the third parameter:

```javascript
Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            repository: undefined
        }
    },

    created() {
        const options = {
            version: 1 // default is the latest api version
        };

        this.repository = this.repositoryFactory.create('product', null, options);
    }
});
```

Note: The version 1 used in the options is just an example, how to select a version. Then again the default would be the newest version. There are no other options.

## Working with the criteria class

To fetch data from the server, the repository has a `search` function. Each repository function requires the API `context` and `criteria` class, which contains all functionality of the core criteria class. If you want to see all the options take a look at the file [src/Administration/Resources/app/administration/src/core/data/criteria.data.ts](https://github.com/shopware/meteor/blob/main/packages/admin-sdk/src/data/Criteria.ts).

```javascript
const { Criteria } = Shopware.Data;
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            result: undefined
        }
    },

    computed: {
        productRepository() {
            // create a repository for the `product` entity
            return this.repositoryFactory.create('product');
        },
    },

    created() {
        const criteria = new Criteria();

        criteria.setPage(1);
        criteria.setLimit(10);
        criteria.setTerm('foo');
        criteria.setIds(['some-id', 'some-id']); // Allows to provide a list of ids which are used as a filter

        /**
            * Configures the total value of a search result.
            * 0 - no total count will be selected. Should be used if no pagination required (fastest)
            * 1 - exact total count will be selected. Should be used if an exact pagination is required (slow)
            * 2 - fetches limit * 5 + 1. Should be used if pagination can work with "next page exists" (fast)
        */
        criteria.setTotalCountMode(2);

        criteria.addFilter(
            Criteria.equals('product.active', true)
        );

        criteria.addSorting(
            Criteria.sort('product.name', 'DESC')
        );

        criteria.addAggregation(
            Criteria.avg('average_price', 'product.price')
        );

        criteria.getAssociation('categories')
            .addSorting(Criteria.sort('category.name', 'ASC'));

        this.productRepository
            .search(criteria, Shopware.Context.api)
            .then(result => {
                this.result = result;
            });
    }
});
```

## How to fetch a single entity

Since the context of an edit or update form is usually a single root entity, the data handling diverges here from the Data Abstraction Layer and provides loading of a single resource from the Admin API.

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            entity: undefined
        }
    },
    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        }
    },

    created() {
        const entityId = 'some-id';

        this.productRepository
            .get(entityId, Shopware.Context.api)
            .then(entity => {
                this.entity = entity;
            });
    }
});
```

## Update an entity

The data handling contains change tracking and sends only changed properties to the Admin API endpoint. Please be aware that in order to be as transparent as possible, updating data will not be handled automatically. A manual update is mandatory.

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            entityId: '1de38487abf04705810b719d4c3e8faa',
            entity: undefined
        }
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        }
    },

    created() {
        this.productRepository
            .get(this.entityId, Shopware.Context.api)
            .then(entity => {
                this.entity = entity;
            });
    },

    methods: {
        // a function which is called over the ui
        updateTrigger() {
            this.entity.name = 'updated';

            // sends the request immediately
            this.productRepository
                .save(this.entity, Shopware.Context.api)
                .then(() => {
                    // the entity is stateless, the data has be fetched from the server, if required
                    this.productRepository
                        .get(this.entityId, Shopware.Context.api)
                        .then(entity => {
                            this.entity = entity;
                        });
                });
        }
    }
});
```

## Delete an entity

The `delete` method sends a `delete` request for a provided id. To delete multiple entities at once use the `syncDeleted` method by passing an array of `ids`.

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        }
    },

    created() {
        this.productRepository.delete('1de38487abf04705810b719d4c3e8faa', Shopware.Context.api);
    }
});
```

## Create an entity

Although entities are detached from the data handling once retrieved or created they still must be set up through a repository. You can create an entity by using the `this.repositoryFactory.create()` method, fill it with data and save it as seen below:

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            entity: undefined
        }
    },

    computed: {
        manufacturerRepository() {
            return this.repositoryFactory.create('product_manufacturer');
        }
    },

    created() {
        this.entity = this.manufacturerRepository.create(Shopware.Context.api);

        this.entity.name = 'test';

        this.manufacturerRepository.save(this.entity, Shopware.Context.api);
    }
});
```

## Working with associations

Each association can be accessed via normal property access:

```javascript
const { Criteria } = Shopware.Data;
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined
        }
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        productCriteria() {
            return new Criteria()
                .addAssociation('manufacturer')
                .addAssociation('categories')
                .addAssociation('prices');
        }
    },

    created() {
        this.repository = this.repositoryFactory.create('product');

        const entityId = '66338d4e19f749fd90b59032134ecb74';

        this.repository
            .get(entityId, Shopware.Context.api, this.productCriteria)
            .then(product => {
                this.product = product;

                // ManyToOne: contains an entity class with the manufacturer data
                console.log(this.product.manufacturer);

                // ManyToMany: contains an entity collection with all categories.
                // contains a source property with an api route to reload this data (/product/{id}/categories)
                console.log(this.product.categories);

                // OneToMany: contains an entity collection with all prices
                // contains a source property with an api route to reload this data (/product/{id}/prices)            
                console.log(this.product.prices);
            });
    }
});
```

### Set a ManyToOne

If you have a ManyToOne association, you can write changes as seen below:

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined,
        };
    },

    computed: {

        productRepository() {
            return this.repositoryFactory.create('product');
        },
        manufacturerRepository() {
            return this.repositoryFactory.create('product_manufacturer');
        }
    },

    created() {
        this.productRepository
            .get('some-product-id', Shopware.Context.api)
            .then((product) => {
                this.product = product;

                this.product.manufacturerId = 'some-manufacturer-id'; // manually set the foreign key y

                this.productRepository.save(this.product, Shopware.Context.api);
            });
    },
});
```

### Working with lazy loaded associations

In most cases, _ToMany_ associations can be loaded by adding a the association with the `.addAssociation()` method of the Criteria object.

```javascript
const { Criteria } = Shopware.Data;
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        productCriteria() {
            const criteria = new Criteria();
            criteria.addAssociation('prices');

            return criteria;
        }
    },

    created() {
        this.productRepository
            .get('some-id', Shopware.Context.api, this.productCriteria)
            .then((product) => {
                this.product = product;
            });
    }

});
```

### Working with OneToMany associations

The following example shows how to create a repository based on associated data. In this case the `priceRepository` contains associated `prices` to the product with the `id` 'some-id'.

```javascript
const { Criteria } = Shopware.Data;
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined,
            prices: undefined
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        priceRepository() {
            if (!this.product) {
                return undefined;
            };

            return this.repositoryFactory.create(
                // `product_price`
                this.product.prices.entity,
                // `product/some-id/priceRules`
                this.product.prices.source
            );
        }
    },

    created() {
        this.productRepository
            .get('some-product-id', Shopware.Context.api)
            .then((product) => {
                this.product = product;
            });
    },

    methods: {
        loadPrices() {
            this.priceRepository
                .search(new Criteria(), Shopware.Context.api)
                .then((prices) => {
                    this.prices = prices;
                });
        },

        addPrice() {
            const newPrice = this.priceRepository.create(Shopware.Context.api);

            newPrice.quantityStart = 1;
          // Note: there are more things required than just the quantityStart

            this.priceRepository
                .save(newPrice, Shopware.Context.api)
                .then(this.loadPrices);
        },

        deletePrice(priceId) {
            this.priceRepository
                .delete(priceId, Shopware.Context.api)
                .then(this.loadPrices);
        },

        updatePrice(price) {
            this.priceRepository
                .save(price, Shopware.Context.api)
                .then(this.loadPrices);
        }
    }
});
```

### Working with ManyToMany associations

The following example shows how to create a repository based on associated data. In this case the `categoryRepository` contains associated categories to the product with the `id` 'some-id'.

```javascript
const { Criteria } = Shopware.Data;
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined,
            categories: undefined
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        categoryRepository() {
            if (!this.product) {
                return undefined;
            };

            return this.repositoryFactory.create(
                // `product_categories`
                this.product.categories.entity,
                // `product/some-id/categories`
                this.product.categories.source
            );
        }
    },

    created() {
        this.productRepository
            .get('some-product-id', Shopware.Context.api)
            .then((product) => {
                this.product = product;
            });
    },

    methods: {
        loadCategories() {
            this.categoryRepository
                .search(new Criteria(), Shopware.Context.api)
                .then((categories) => {
                    this.categories = categories;
                });
        },

        addCategoryToProduct(category) {
            this.categoryRepository
                .assign(category.id, Shopware.Context.api)
                .then(this.loadCategories);
        },

        removeCategoryFromProduct(categoryId) {
            this.categoryRepository
                .delete(categoryId, Shopware.Context.api)
                .then(this.loadCategories);
        }
    }
});
```

### Working with local associations

In case of a new entity, the associations can not be sent directly to the server using the repository, because the parent entity isn't saved yet. For example: You can not add prices to a product which is not even saved in the database yet.

For this case the association can be used as storage as well and will be updated with the parent entity. In the following examples, `this.productRepository.save(this.product, Shopware.Context.api)` will send the prices and category changes.

Notice: It is mandatory to `add` entities to collections in order to get reactive data for the UI.

#### Working with local OneToMany associations

The following example shows how to create a repository based on associated data. In this case the `priceRepository` contains associated `prices` to the product with the `id` 'some-id'.

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        priceRepository() {
            if (!this.product) {
                return undefined;
            };

            this.priceRepository = this.repositoryFactory.create(
                // `product_price`
                this.product.prices.entity,
                // `product/some-id/priceRules`
                this.product.prices.source
            );
        }
    },

    created() {
        this.productRepository
            .get('some-id', Shopware.Context.api)
            .then(product => {
                this.product = product;

            });
    },
    methods: {
        loadPrices() {
            this.prices = this.product.prices;
        },

        addPrice() {
            const newPrice = this.priceRepository
                .create(Shopware.Context.api);

            newPrice.quantityStart = 1;
            // update some other fields

            this.product.prices.add(newPrice);
        },

        savePrice() {
            this.productRepository.save(this.product)
        },

        deletePrice(priceId) {
            this.product.prices.remove(priceId);
        },

        updatePrice(price) {
            // price entity is already updated and already assigned to product, no sources needed 
        }
    }
});
```

#### Working with local ManyToMany associations

The following example shows how to create a repository based on associated data. In this case the `categoryRepository` contains associated categories to the product with the `id` 'some-id'.

```javascript
Shopware.Component.register('swag-basic-example', {
    inject: ['repositoryFactory'],

    template,

    data: function () {
        return {
            product: undefined,
            prices: undefined
        };
    },

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },
        priceRepository() {
            if (!this.product) {
                return undefined;
            };

            return this.repositoryFactory.create(
                // `product_price`
                this.product.prices.entity,
                // `product/some-id/priceRules`
                this.product.prices.source
            );
        }
    },

    created() {
        this.productRepository
            .get('some-id', Shopware.Context.api)
            .then(product => {
                this.product = product;
            });
    },
    methods: {
        loadPrices() {
            this.prices = this.product.prices;
        },

        addPrice() {
            const newPrice = this.priceRepository
                .create(Shopware.Context.api);

            newPrice.quantityStart = 1;
            // update some other fields

            this.product.prices.add(newPrice);
        },

        savePrice() {
            this.productRepository.save(this.product)
        },

        deletePrice(priceId) {
            this.product.prices.remove(priceId);
        },

        updatePrice(price) {
            // price entity is already updated and already assigned to product, no sources needed 
        }
    }
});
```

#### Working with entity extensions

The following example shows how to pass on and save data of entity extensions.

```javascript{134,164}
import template from './swag-paypal-pos-wizard.html.twig';
import './swag-paypal-pos-wizard.scss';
import {
    PAYPAL_POS_SALES_CHANNEL_EXTENSION,
    PAYPAL_POS_SALES_CHANNEL_TYPE_ID,
} from '../../../../../constant/swag-paypal.constant';

const { Component, Context } = Shopware;
const { Criteria } = Shopware.Data;

Component.extend('swag-paypal-pos-wizard', 'sw-first-run-wizard-modal', {
    template,

    inject: [
        'SwagPayPalPosApiService',
        'SwagPayPalPosSettingApiService',
        'SwagPayPalPosWebhookRegisterService',
        'salesChannelService',
        'repositoryFactory',
    ],

    mixins: [
        'swag-paypal-pos-catch-error',
        'notification',
    ],

    data() {
        return {
            showModal: true,
            isLoading: false,
            salesChannel: {},
            cloneSalesChannelId: null,
            stepperPages: [
                'connection',
                'connectionSuccess',
                'connectionDisconnect',
                'customization',
                'productSelection',
                'syncLibrary',
                'syncPrices',
                'finish',
            ],
            stepper: {},
            currentStep: {},
        };
    },

    metaInfo() {
        return {
            title: this.wizardTitle,
        };
    },

    computed: {

        paypalPosSalesChannelRepository() {
            return this.repositoryFactory.create('swag_paypal_pos_sales_channel');
        },

        salesChannelRepository() {
            return this.repositoryFactory.create('sales_channel');
        },

        salesChannelCriteria() {
            return (new Criteria(1, 500))
                .addAssociation(PAYPAL_POS_SALES_CHANNEL_EXTENSION)
                .addAssociation('countries')
                .addAssociation('currencies')
                .addAssociation('domains')
                .addAssociation('languages');
        },
    },

    watch: {
        '$route'(to) {
            this.handleRouteUpdate(to);
        },
    },

    mounted() {
        this.mountedComponent();
    },

    methods: {
        //...
        
        createdComponent() {
            //...
            this.createNewSalesChannel();
        },

        save(activateSalesChannel = false, silentWebhook = false) {
            if (activateSalesChannel) {
                this.salesChannel.active = true;
            }

            return this.salesChannelRepository.save(this.salesChannel, Context.api).then(async () => {
                this.isLoading = false;
                this.isSaveSuccessful = true;
                this.isNewEntity = false;

                this.$root.$emit('sales-channel-change');
                await this.loadSalesChannel();

                this.cloneProductVisibility();
                this.registerWebhook(silentWebhook);
            }).catch(() => {
                this.isLoading = false;

                this.createNotificationError({
                    message: this.$tc('sw-sales-channel.detail.messageSaveError', 0, {
                        name: this.salesChannel.name || this.placeholder(this.salesChannel, 'name'),
                    }),
                });
            });
        },

        createNewSalesChannel() {
            if (Context.api.languageId !== Context.api.systemLanguageId) {
                Context.api.languageId = Context.api.systemLanguageId;
            }

            this.previousApiKey = null;
            this.salesChannel = this.salesChannelRepository.create(Context.api);
            this.salesChannel.typeId = PAYPAL_POS_SALES_CHANNEL_TYPE_ID;
            this.salesChannel.name = this.$tc('swag-paypal-pos.wizard.salesChannelPrototypeName');
            this.salesChannel.active = false;

            this.salesChannel.extensions.paypalPosSalesChannel
                = this.paypalPosSalesChannelRepository.create(Context.api);

            Object.assign(
                this.salesChannel.extensions.paypalPosSalesChannel,
                {
                    mediaDomain: '',
                    apiKey: '',
                    imageDomain: '',
                    productStreamId: null,
                    syncPrices: true,
                    replace: 0,
                },
            );

            this.salesChannelService.generateKey().then((response) => {
                this.salesChannel.accessKey = response.accessKey;
            }).catch(() => {
                this.createNotificationError({
                    message: this.$tc('sw-sales-channel.detail.messageAPIError'),
                });
            });
        },

        loadSalesChannel() {
            const salesChannelId = this.$route.params.id || this.salesChannel.id;
            if (!salesChannelId) {
                return new Promise((resolve) => { resolve(); });
            }

            this.isLoading = true;
            return this.salesChannelRepository.get(salesChannelId, Shopware.Context.api, this.salesChannelCriteria)
                .then((entity) => {
                    this.salesChannel = entity;
                 this.previousApiKey = entity.extensions.paypalPosSalesChannel.apiKey;
                    this.isLoading = false;
                });
        },
        //...
    },
});
```

## Next steps

As this is very similar to the DAL it might be interesting to learn more about that. For this, head over to the section about the [data handling](../../../../../guides/plugins/plugins/framework/data-handling) in PHP.
