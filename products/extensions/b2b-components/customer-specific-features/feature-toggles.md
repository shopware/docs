---
nav:
  title: Feature Toggles
  position: 10

---

## Introduction
A new "Customer-specific features" section on the Customer detail page allows the shop merchant to turn B2B features on or off for a specific customer. This section aims to provide each customer with their own set of specific features, granting them access to certain B2B Components within the shop.

![Feature Toggles](../../../../assets/b2b-feature-toggles.png)

To achieve this, ACL (Access Control List) and address the following cases where functionality may be hidden:

1. If the merchant has not activated a feature for a particular customer, it should be hidden.
2. If the B2B admin has not granted an employee access to a specific feature, it should not be visible.

Considering these scenarios, we can ensure that the appropriate B2B features are displayed and accessible based on feature toggles and admin-granted permissions.

### Prerequisite
To improve organization and maintain a clear structure, it is advisable to relocate all B2B Components into the `B2B` folder within the Commercial plugin. By doing so, you can centralize the B2B-related functionality, making it easier to locate, manage, and maintain the codebase. This folder structure promotes better separation of concerns and enhances the overall modularity of the application.
```
├── src
│   ├── B2B
│   │   ├── QuickOrder
│   │   ├── AnotherB2BComponent
│   │   │   CommercialB2BBundle.php
...

```

To ensure consistency and clarity, it is recommended to make your B2B Component extend CommercialB2BBundle instead of CommercialBundle as usual and add the type => 'B2B' attribute inside the describeFeatures() method of each B2B Component. This attribute will help identify and categorize the features specifically related to B2B functionality.

By including `type => 'B2B'` in the `describeFeatures()` method, you can distinguish B2B features from other types of features within your application. This will facilitate easier maintenance, organization, and identification of B2B-related functionalities, ensuring a streamlined development process.

For example, consider the following code snippet:

```php
namespace Shopware\Commercial\B2B\YourB2BComponent;

class YourB2BComponent extends CommercialB2BBundle
{
    public function describeFeatures(): array
    {
        return [
            [
                ...,
                'type' => self::TYPE_B2B,
            ],
        ];
    }
}
```

## Using feature toggle in Route/API/Controller
### Using new service
To determine if a customer is allowed to access a specific B2B feature, we will utilize the `isAllowed()` method from the `Shopware\Commercial\B2B\QuickOrder\Domain\CustomerSpecificFeature\CustomerSpecificFeatureService` service. This method accepts two parameters: the customer ID and the technical code of the B2B component.

We will place this check before every route, controller or API as follows:

```php
use Shopware\Commercial\B2B\QuickOrder\Domain\CustomerSpecificFeature\CustomerSpecificFeatureService;
 
class ApiController
{
    public function __construct(private readonly CustomerSpecificFeatureService $customerSpecificFeatureService)
    {
    }

    #[Route(
        path: '/your/path',
        name: 'path.name',
        defaults: ['_noStore' => false, '_loginRequired' => true],
        methods: ['GET'],
    )]
    public function view(Request $request, SalesChannelContext $salesChannelContext): Response
    {
        if (!$this->customerB2BFeatureService->isAllowed($salesChannelContext->getCustomerId(), 'QUICK_ORDER')) {
            throw CustomerSpecificFeatureException::notAllowed('QUICK_ORDER');
        }

        ...
    }
```

## Using feature toggle in Twig - Storefront
#### New Twig function

You can use a new Twig extension called customerHasFeature() to implement the functionality of retrieving customer-specific features in Twig templates. This method accepts only one parameter. The parameter is the technical code of the B2B component.

Here's an example implementation:

```php
namespace Shopware\Commercial\B2B\QuickOrder\Storefront\Framework\Twig\Extension;

class CustomerSpecificFeatureTwigExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('customerHasFeature', $this->isAllowed(...), ['needs_context' => true]),
        ];
    }

    public function isAllowed(array $twigContext, string $feature): bool
    {
        $customerId = null;
        if (\array_key_exists('context', $twigContext) && $twigContext['context'] instanceof SalesChannelContext) {
            $customerId = $twigContext['context']->getCustomerId();
        }
        
        if (!$customerId) {
            return false;
        }
        
        return $this->customerSpecificFeatureService->isAllowed($customerId, $feature);
    }
}
```

Use it to check if a specific feature is allowed for a given customer in Twig.

```html
{% if customerHasFeature('QUICK_ORDER') %}
    ...
{% endif %}
```
