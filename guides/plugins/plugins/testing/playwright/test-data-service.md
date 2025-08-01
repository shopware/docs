---
nav:
  title: Test Data Service
  position: 18
---

# Services

The test suite provides several services that can be used to simplify your test code. These services are designed to be reusable and can be easily extended to fit your specific needs.

## Test Data Service

The `TestDataService` is a powerful utility designed to simplify test data creation, management, and cleanup when writing acceptance and API tests for Shopware. It provides ready-to-use functions for common data needs and ensures reliable, isolated test environments.
 For detailed documentation of the methods, you can have a look at the [service class](https://github.com/shopware/acceptance-test-suite/blob/trunk/src/services/TestDataService.ts) or use the auto-completion of your IDE.

## When to use the TestDataService in tests

You should use the `TestDataService` whenever you need **test data** that matches common Shopware structures, such as:

- Creating a **basic product**, **customer**, **order**, **category**, etc.
- Setting up **media** resources like product images or digital downloads.
- Creating **promotions**, **rules**, or **payment/shipping methods**.
- Fetching existing entities via helper methods (`getCurrency()`, `getShippingMethod()`, etc.).
- **Assigning relations** between entities (e.g., linking a product to a category).

### Typical examples

```typescript
const product = await TestDataService.createBasicProduct();
const customer = await TestDataService.createCustomer();
const shipping = await TestDataService.createBasicShippingMethod();
```

## When and why to extend the TestDataService

You should add new functions to the TestDataService (or extend it) when:

- Your project or plugin introduces **new entity types** (e.g., `CommercialCustomerGroup`, `CustomProductType`).
- You need a **specialized creation logic** (e.g., a shipping method with multiple rules, a pre-configured product bundle).
- Existing methods require **modifications** that should not affect the core service.
- You want to **reuse the same setup across multiple tests** without duplicating logic.
- You require **special cleanup handling** for newly created entities.

Using and extending the `TestDataService` properly ensures your acceptance tests stay **readable**, **maintainable**, and **scalable** even as your Shopware project grows.

## Available `create*` methods in TestDataService

These methods are designed to streamline the setup of test data, ensuring consistency and efficiency in your testing processes. They are much more available than listed below, but these are the most common ones. Please use your IDE auto-completion to find all available methods.

- `createBasicProduct(): Promise<Product>`
- `createVariantProducts(parentProduct: Product, propertyGroups: PropertyGroup[]): Promise<Product[]>`
- `createCustomer(): Promise<Customer>`
- `createCustomerGroup(): Promise<CustomerGroup>`
- `createOrder(lineItems: SimpleLineItem[], customer: Customer): Promise<Order>`
- `createCategory(): Promise<Category>`
- `createColorPropertyGroup(): Promise<PropertyGroup>`
- `createBasicPaymentMethod(): Promise<PaymentMethod>`
- `createBasicShippingMethod(): Promise<ShippingMethod>`

- [...]

## Available `assign*` methods in TestDataService

These methods are designed to establish associations between entities, such as linking products to categories or assigning media to manufacturers, ensuring that your test data reflects realistic scenarios. They are much more available than listed below, but these are the most common ones. Please use your IDE auto-completion to find all available methods.

- `assignProductCategory(productId: string, categoryIds: string[]): Promise<void>`
- `assignProductManufacturer(productId: string, manufacturerId: string): Promise<void>`
- `assignProductMedia(productId: string, mediaId: string): Promise<void>`

- [...]

## Available `get*` methods in TestDataService

They are much more available than listed below, but these are the most common ones. Please use your IDE auto-completion to find all available methods.

- `getCountry(iso2: string): Promise<Country>`
- `getCurrency(isoCode: string): Promise<Currency>`
- `getCustomerGroups(): Promise<CustomerGroup[]>`
- `getPaymentMethod(name = 'Invoice'): Promise<PaymentMethod>`

- [...]

## Writing new methods in `TestDataService`

If you want to add new functionality to this service — such as a new type of entity creation — you can follow this approach:

### 1. Define the purpose

Decide whether you're creating, assigning, or retrieving data. Most methods fall into one of the following patterns:
- `create*`: Creates a new entity (e.g., product, customer, category)
- `assign*`: Links existing entities (e.g., assign media to product)
- `get*`: Retrieves specific or filtered data from the system

### 2. Implement the method

Use the `AdminApiContext` to interact with the Shopware Admin API. Here's a simplified example of adding a method to [create a new shipping method](https://github.com/shopware/acceptance-test-suite/blob/e8d2a5e8cee2194b914aa35aa87fe7cf04060834/src/services/TestDataService.ts#L679)

### 3. Follow naming conventions

Be consistent in naming:
- Use `createBasic*` for standardized, default setups with predefined values (e.g. `createBasicProduct`)
- Use `create*With*` for variations (e.g. `createProductWithImage`)
- Use `assign*` for methods that associate two entities (e.g. `assignProductMedia`)
- Use `get*` to retrieve specific entities or lists (e.g. `getCurrency`)

### 4. Add a return type

Always define a return type (typically a `Promise<...>`) to improve autocompletion and documentation support.

### 5. Add cleanup logic

Make sure to clean up the entity via code after the test run by putting the entity to a record. See the example below:

```typescript
async createBasicRule(): Promise<Rule> {
        [...]
                
        this.addCreatedRecord('rule', rule.id);

        [...]
    }
```

Further information you can explore in the chapter: [Automatic Cleanup](#automatic-cleanup-of-test-data-and-system-configurations)

### 6. Test the method

Once added, use your new method inside a test to verify it works as expected (`/tests/TestDataService.spec.ts`):

```typescript
test('Verify new shipping method creation', async ({ TestDataService }) => {
    const shippingMethod = await TestDataService.createShippingMethod({
        name: 'Express Delivery'
    });

    expect(shippingMethod.name).toEqual('Express Delivery');
});
```

## Automatic cleanup of test data and system configurations

The `TestDataService` includes a built-in mechanism to ensure that any test data & system configuration entries created during a test run is automatically deleted afterward. This ensures that the Shopware instance remains clean and consistent between tests, helping to maintain **test isolation** and prevent **state leakage**.

### How cleanup works

When you create an entity using a `create*` method (e.g., `createBasicProduct`, `createCustomer`), the service automatically registers that entity for deletion by calling the `addCreatedRecord()` method:

```typescript
this.addCreatedRecord('product', product.id);
```

These records are stored in a cleanup queue processed at the end of each test using the Playwright lifecycle.

### Cleanup execution

The `cleanup()` method handles the deletion of all registered entities and system config changes. All created records are grouped into two categories:

- Priority Deletions (`priorityDeleteOperations`) – for entities with dependencies that must be deleted first (e.g., orders, customers)
- Standard Deletions (`deleteOperations`) – for all other entities

This prioritization prevents errors when deleting interdependent data. Any modified system configurations are reset to their previous state after deleting priority records.
The priority entities can be found in the `TestDataService` class. If you want to add a new entity to the priority deletion list, you can do so by adding it to the `priorityDeleteOperations` array.

### Skipping cleanup

In rare scenarios, such as performance testing or debugging, you may want to prevent cleanup for specific entities. You can simply skip the cleanUp by calling `TestDataService.setCleanUp(false)` within your test.

## Extending the TestDataService in external projects

The `TestDataService` is designed to be **easily extendable**. This allows you to add project-specific data generation methods while still benefiting from the existing, standardized base functionality.

### 1. Create a new subclass

You can create a new TypeScript class that **extends** the base `TestDataService`.

```typescript
import { TestDataService } from '@shopware-ag/acceptance-test-suite';

export class CustomTestDataService extends TestDataService {

    constructor(AdminApiContext, DefaultSalesChannel) {
        super(...);
    }
    
    async createCustomCustomerGroup(data: Partial<CustomerGroup>) {
        const response = await this.adminApi.post('customer-group?_response=true', {
            data: {
                ...
            },
        });

        const { data: createdGroup } = await response.json();
        this.addCreatedRecord('customer-group', createdGroup.id);

        return createdGroup;
    }
}
```

### 2. Provide the extended service as a fixture

Following the Playwright [fixture system](https://playwright.dev/docs/test-fixtures) described in the README, you create a new fixture that initializes your extended service.

Example from `AcceptanceTest.ts`:

```typescript
import { test as base } from '@shopware-ag/acceptance-test-suite';
import type { FixtureTypes } from './BaseTestFile';
import { CustomTestDataService } from './CustomTestDataService';

export interface CustomTestDataServiceType {
    TestDataService: CustomTestDataService;
}

export const test = base.extend<FixtureTypes & CustomTestDataServiceType>({
    TestDataService: async ({ AdminApiContext, DefaultSalesChannel }, use) => {
        const service = new CustomTestDataService(AdminApiContext, DefaultSalesChannel.salesChannel);
        await use(service);
        await service.cleanUp();
    },
});
```

In this setup:

- The `TestDataService` fixture is **overridden** with your custom `CustomTestDataService`.
- Now all tests that use `TestDataService` will have access to both the original and your extended methods.
- The automated cleanup is still in place, ensuring that any test data created during the test run is removed afterward.
