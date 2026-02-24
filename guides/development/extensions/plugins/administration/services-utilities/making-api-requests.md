---
nav:
  title: Making API requests
  position: 70

---

# Making API Requests

## Overview

In this guide you'll learn how to create a custom API service in your plugin's administration to make HTTP requests to the Shopware API. This is useful when you need to communicate with custom backend endpoints or extend Shopware's API functionality.

## Prerequisites

In order to add your own custom API service for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide).

You also need to have a custom administration module or component. Refer to [Add custom module](../module-component-management/add-custom-module) to get started.

## Creating the API service

First, create a new API service class that extends Shopware's `ApiService` class. This provides you with all the necessary methods for authentication and HTTP communication.

Create the service file in your plugin's administration source directory:

```javascript
// <plugin root>/src/Resources/app/administration/src/api/my-api-service.js
const { ApiService } = Shopware.Classes;

class MyApiService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = '_action/my-plugin') {
        super(httpClient, loginService, apiEndpoint);
    }

    // GET request example
    getMyData() {
        const apiRoute = `${this.getApiBasePath()}/my-data`;
        return this.httpClient
            .get(apiRoute, {
                headers: this.getBasicHeaders(),
            })
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }

    // POST request example with data
    createMyData(data) {
        const apiRoute = `${this.getApiBasePath()}/my-data`;
        return this.httpClient
            .post(
                apiRoute,
                data,
                {
                    headers: this.getBasicHeaders(),
                }
            )
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }

    // DELETE request example
    deleteMyData(id) {
        const apiRoute = `${this.getApiBasePath()}/my-data/${id}`;
        return this.httpClient
            .delete(apiRoute, {
                headers: this.getBasicHeaders(),
            })
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }

    // GET request with query parameters
    searchMyData(searchTerm, limit = 25) {
        const apiRoute = `${this.getApiBasePath()}/my-data/search`;
        return this.httpClient
            .get(apiRoute, {
                params: {
                    term: searchTerm,
                    limit: limit,
                },
                headers: this.getBasicHeaders(),
            })
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }
}

export default MyApiService;
```

## Registering the service

To make your API service available throughout your plugin's administration, you need to register it as a service provider. Create an index file to handle the registration:

```javascript
// <plugin root>/src/Resources/app/administration/src/api/index.js
import MyApiService from './my-api-service';

const { Application } = Shopware;

Application.addServiceProvider('myApiService', (container) => {
    const initContainer = Application.getContainer('init');

    return new MyApiService(
        initContainer.httpClient,
        container.loginService
    );
});
```

Don't forget to import this file in your plugin's main administration entry point:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
import './api';
// ... other imports
```

## Using the API service in components

Now you can inject and use your API service in any component within your plugin:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/my-module/component/my-component/index.js
import template from './template.twig';

const { Component, Mixin } = Shopware;

Component.register('my-component', {
    template,
    inject: ['myApiService'],
    mixins: [Mixin.getByName('notification')],

    data() {
        return {
            myData: [],
            isLoading: false,
        };
    },

    created() {
        this.loadData();
    },

    methods: {
        async loadData() {
            this.isLoading = true;
            
            try {
                this.myData = await this.myApiService.getMyData();
                
                this.createNotificationSuccess({
                    message: 'Data loaded successfully',
                });
            } catch (error) {
                this.createNotificationError({
                    message: error.message || 'An error occurred',
                });
            } finally {
                this.isLoading = false;
            }
        },

        async saveData(data) {
            this.isLoading = true;
            
            try {
                await this.myApiService.createMyData(data);
                
                this.createNotificationSuccess({
                    message: 'Data saved successfully',
                });
                
                // Reload data after saving
                await this.loadData();
            } catch (error) {
                this.createNotificationError({
                    message: error.message || 'Failed to save data',
                });
            } finally {
                this.isLoading = false;
            }
        },

        async deleteItem(id) {
            try {
                await this.myApiService.deleteMyData(id);
                
                this.createNotificationSuccess({
                    message: 'Item deleted successfully',
                });
                
                // Reload data after deletion
                await this.loadData();
            } catch (error) {
                this.createNotificationError({
                    message: error.message || 'Failed to delete item',
                });
            }
        }
    },
});
```

## Working with authentication

The `ApiService` base class automatically handles authentication by including the necessary headers. The `getBasicHeaders()` method provides:

- Authorization token
- Content-Type headers
- API version headers

If you need custom headers, you can extend them:

```javascript
getCustomData() {
    const headers = {
        ...this.getBasicHeaders(),
        'X-Custom-Header': 'custom-value'
    };

    return this.httpClient
        .get(`${this.getApiBasePath()}/custom-endpoint`, { headers })
        .then((response) => {
            return ApiService.handleResponse(response);
        });
}
```

## Error handling

The `ApiService.handleResponse()` method automatically handles common HTTP errors. However, you should still implement proper error handling in your components:

```javascript
async performApiCall() {
    try {
        const result = await this.myApiService.getMyData();
        // Handle success
    } catch (error) {
        // Check for specific error types
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error:', error.message);
        }
    }
}
```

## Advanced usage

### File uploads

For file uploads, you can use FormData:

```javascript
uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.httpClient.post(
        `${this.getApiBasePath()}/upload`,
        formData,
        {
            headers: {
                ...this.getBasicHeaders(),
                'Content-Type': 'multipart/form-data',
            },
        }
    ).then((response) => {
        return ApiService.handleResponse(response);
    });
}
```

### Accessing standard Shopware APIs

You can also access Shopware's standard APIs using the repository pattern:

```javascript
Component.register('my-component', {
    inject: ['repositoryFactory'],

    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        }
    },

    methods: {
        async loadProducts() {
            const criteria = new Shopware.Data.Criteria();
            criteria.setPage(1);
            criteria.setLimit(25);
            
            const products = await this.productRepository.search(criteria);
            // Use products...
        }
    }
});
```

## Next steps

Now that you've created your API service, you might want to:

- Create the corresponding backend API endpoints
- Add more complex API interactions
- Implement caching strategies for better performance
- Add request interceptors for global error handling

For more information on creating backend API endpoints, refer to the [API documentation](../../../../../concepts/api/).
