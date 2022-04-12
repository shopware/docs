# Metrics

{% hint style="warning" %}
This feature is still in development and highly experimental. Existing interfaces might change, and we do not guarantee any stability yet.
{% endhint %}

As a merchant you'll most likely want to track what is happening in your shop.
How many orders were placed during the last 30 days?
What was the average cart amount of all those orders?
Is the average amount of line items higher after a marketing campaign?

To answer such questions it can be very helpful to collect all sort of information of an order and push it to an analytics service that helps you visualize and understand this data.
And this is where metrics come into play!

To understand this article you should be familiar with the plugin fundamentals:

{% page-ref page="../../plugin-base-guide.md" %}

## Collecting Metrics in Shopware
There are several ways of collecting metrics by implementing different interfaces provided by Shopware.
For event based metrics, e.g. when an order is placed, a simple event subscriber can be used.
For more resource intensive metrics it's better to use a collector, that is run once a day by scheduled task.

As a plugin developer you have the following extension points:

| Type               | API                               | Description                                                   |
|--------------------|-----------------------------------|---------------------------------------------------------------|
| Metrics subscriber | `AbstractMetricsEventSubscriber`  | Collect metrics when an event is dispatched.                  |
| Metrics collector  | `AbstractMetricsCollector`        | Collect resource intensive metrics once a day.                |
| Metadata provider  | `AbstractPartialMetadataProvider` | Enrich all collected metrics with additional metadata.        |
| Metrics client     | `AbstractMetricClient`            | Connect to an analytics service to which metrics are sent to. |
| Configuration      | `shopware.yaml`                   | Configure and enable metric clients.                          |

For more details on each of the extension points refer to the corresponding section in this article.

{% hint style="danger" %}
One important thing to keep in mind when capturing metrics is to avoid operations before the response is streamed to the user.
Shopware adheres to this by performing metric operations on Symfony's `kernel.terminate` event.
{% endhint %}

### Metric struct
A single metric in Shopware is represented by the `MetricStruct` class, an immutable object that holds all the data associated to the metric.

Let's have a closer look at its properties and what they're about:

| Property  | Mutator            | Description                                                                                        |
|-----------|--------------------|----------------------------------------------------------------------------------------------------|
| `$name`     | `n/a`              | The metric's name.                                                                                 |
| `$type`     | `::withType()`     | Allowed types are `count`, `gauge` and `histogram` (defined as class constants for easier access). |
| `$value`    | `::withValue()`    | The value of the metric must be one of <code>bool                                                  |int|float|string</code> and mainly depends on the metric's type.                |
| `$metadata` | `::withMetadata()` | The metadata are additional information that usually are the same for all metrics.                 |
| `$tags`     | `::withTags()`     | Tags are specific to a metric and are typically used for filtering and aggregating metrics.        |

So, when to use tags or metadata? When fetching data and creating a new metric that you want to have additional key-value data specific to this very metric, you'll want to use tags.
Metadata, on the other hand, are data that are the same for every metric and therefore also added to all metrics only once before dispatching.
To provide additional custom metadata, see the corresponding section later in this article.

### Subscribers
With a metrics subscriber you can subscribe to every instance of `ShopwareEvent` and aggregate additional data that you want to have as part of your metric(s).

In this example we subscribe to the `CustomerRegisterEvent` and add the Sales Channel's identifier to it.

{% code title="custom/plugins/MetricsPlugin/src/Subscriber/CustomerRegisteredMetricsSubscriber.php" %}
```php
<?php declare(strict_types=1);

namespace MetricsPlugin\Subscriber;

use Shopware\Core\Checkout\Customer\Event\CustomerRegisterEvent;
use Shopware\Core\System\Metrics\AbstractMetricEventSubscriber;
use Shopware\Core\System\Metrics\MetricCollection;
use Shopware\Core\System\Metrics\MetricStruct;

class CustomerRegisteredMetricsSubscriber extends AbstractMetricEventSubscriber
{
    private const METRIC_NAME_CUSTOMER_REGISTERED = 'customer.registered';

    public function getSubscribedEvent(): string
    {
        CustomerRegisterEvent::class;
    }
    
    /**
     * @param CustomerRegisterEvent $event
     */
    public function getMetricsForEvent(ShopwareEvent $event): MetricCollection
    {
        $salesChannelId = $event->getSalesChannelContext()->getSalesChannelId();
        
        $metric = (new MetricStruct(self::METRIC_NAME_CUSTOMER_REGISTERED))
            ->withTags([
                'sales_channel_id' => $salesChannelId
            ]);
            
        return new MetricCollection([$metric]);
    }
}
```
{% endcode %}

### Collectors
You should be using metrics collectors when you perform heavy operations to fetch data for your metric(s).
This is mostly the case if you query the database and load a lot of associations to obtain large amounts of data that you transfer to metrics.
We highly recommend to **not** use Shopware's DAL when doing so but rather use plain SQL, which in general is a lot faster.

In this example we fetch count metrics about flows. This is of course only a very basic example, but there are almost no limits on what data you can add to your metrics.

{% code title="custom/plugins/MetricsPlugin/Collector/FlowMetricsCollector.php" %}
```php
<?php declare(strict_types=1);

namespace MetricsPlugin\Collector;

use Doctrine\DBAL\Connection;

/**
 * @internal
 */
class FlowMetricsCollector extends AbstractMetricsCollector
{
    private const METRIC_NAME_FLOWS_TOTAL_COUNT = 'flows.total_count';
    private const METRIC_NAME_ACTIVE_FLOWS_COUNT = 'flows.active_count';
    private const METRIC_NAME_INACTIVE_FLOWS_COUNT = 'flows.inactive_count';
    
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }
    
    public function collect(): MetricCollection
    {
        return new MetricCollection([
            (new MetricStruct(self::METRIC_NAME_FLOWS_TOTAL_COUNT, $this->fetchFlowsCount())),
            (new MetricStruct(self::METRIC_NAME_ACTIVE_FLOWS_COUNT, $this->fetchActiveFlowsCount())),
            (new MetricStruct(self::METRIC_NAME_INACTIVE_FLOWS_COUNT, $this->fetchInactiveFlowsCount())),
        ]);
    }

    private function fetchFlowsCount(): int
    {
        return (int) $this->connection->executeQuery('SELECT COUNT(id) FROM flow')->fetchOne();
    }

    private function fetchActiveFlowsCount(): int
    {
        return (int) $this->connection->executeQuery('SELECT COUNT(id) FROM flow WHERE active = 1')->fetchOne();
    }

    private function fetchInactiveFlowsCount(): int
    {
        return (int) $this->connection->executeQuery('SELECT COUNT(id) FROM flow WHERE active = 0')->fetchOne();
    }
}
```
{% endcode %}

{% code title="custom/plugins/MetricsPlugin/src/Resources/config/services.xml" %}
```xml
<services>
    <service id="MetricsPlugin\Collector\FlowMetricsCollector">    
        <tag name="shopware.metrics.collector"/>
    </service>
</services>
```
{% endcode %}

### Dispatcher
The `MetricsDispatcher` is the central service used for dispatching metrics collected by subscribers and collectors.
It receives a `MetricStruct`, enriches it with additional metadata and dispatches this metric to all registered and active metric clients.

### Metadata Providers
When collecting metrics, there are information that can be categorized as additional information that are the same for every metric.
Typically, these are information about the user who triggered an event, about a sales channel where an order was placed or instance data like the Shopware version.

So you don't have to fetch all this metadata every time you collect a metric you can create an `AbstractPartialMetadataProvider`.
Before dispatching a metric to all clients, the `MetricsDispatcher` first asks the `MetadataProvider` to provide all metadata by calling the partial metadata providers tagged with `shopware.metrics.metadata_provider`.

In this example we add the theme's technical name to the metadata, but only if the context's source is a `SalesChannelApiSource`.
Again, we recommend using plain SQL over Shopware's DAL for performance reasons.

{% code title="custom/plugins/MetricsPlugin/src/Core/System/MetadataProvider/CustomMetadataProvider.php" %}
```php
<?php declare(strict_types=1);

namespace MetricsPlugin\MetadataProvider;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\Metrics\AbstractPartialMetadataProvider;
use Shopware\Core\Framework\Api\Context\SalesChannelApiSource;
use Shopware\Core\Framework\Context;

class SalesChannelThemeMetadataProvider extends AbstractPartialMetadataProvider
{
    public const KEY_SALES_CHANNEL_ASSIGNED_THEME = 'sales_channel.assigned_theme';

    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function provide(Context $context): array
    {
        $source = $context->getSource();

        if (!$source instanceof SalesChannelApiSource) {
            return [];
        }

        return [
            self::KEY_SALES_CHANNEL_ASSIGNED_THEME => $this->fetchTechnicalNameOfAssignedTheme($source->getSalesChannelId()),
        ];
    }

    private function fetchTechnicalNameOfAssignedTheme(string $salesChannelId): string
    {
        $technicalName = $this->connection->executeQuery('
            SELECT t.technical_name FROM sales_channel sc
            JOIN theme_sales_channel tsc on sc.id = tsc.sales_channel_id
            JOIN theme t on tsc.theme_id = t.id
            WHERE sc.id = :salesChannelId
        ', ['salesChannelId' => Uuid::fromHexToBytes($salesChannelId)]);

        return (string) $technicalName->fetchOne();
    }
}
```
{% endcode %}

You can override the metadata of other providers by setting a lower priority on your service definition and putting your value for the same key.
The partial metadata of all providers will be merged inside the `MetadataProvider`.
Please note that the `MetadataProvider` goes through all partial metadata providers only once.
To force it to collect all partial metadata again, you need to call its `::reset()` method.

{% code title="custom/plugins/MetricsPlugin/src/Resources/config/services.xml" %}
```xml
<services>
    <service id="MetricsPlugin\MetadataProvider\SalesChannelThemeMetadataProvider">    
        <tag name="shopware.metrics.metadata_provider" priority="20"/>
    </service>
</services>
```
{% endcode %}

### Clients
Metric clients are the connectors to different backends that receive all the different metrics and data you collect.
Common backend services could be DataDog, PostHog, Amazon Timestream, InfluxDB or Prometheus to name only a few.
They accept a `MetricStruct` and convert all the data contained in it into a format which its backend can handle.

To create your own metric client you simply extend the `AbstractMetricClient`.
All metric clients are tagged with `shopware.metrics.client` and are injected into the `MetricsDispatcher` that calls each client for every metric.

The metric clients are called at a time when the response has already been streamed to the user, so there's no necessity to make sure they're not blocking the request-response-cycle.
Ideally however, the clients are implemented in such a way, that metrics are sent in a batch rather than sending a request for every single metric.
In most cases, this is already done in underlying libraries.

{% code title="custom/plugins/MetricsPlugin/src/Client/InfluxDbClient.php" %}
```php
<?php declare(strict_types=1);

namespace MetricsPlugin\Client;

use InfluxDB\Database;
use InfluxDB\Point;
use Shopware\Core\System\Metrics\AbstractMetricClient;
use Shopware\Core\System\Metrics\MetricStruct;

class InfluxDbClient extends AbstractMetricsClient
{
    private Database $database;

    public function capture(MetricStruct $metric, Context $context): void
    {
        $point = new Point(
            $metric->getName(),
            $metric->getValue(),
            $metric->getTags(),
            $metric->getMetadata()
        );
        
        $this->database->writePoints([$point]);
    }
}
```
{% endcode %}

When tagging the service, you add a `client` attribute to it, which is used as an index when injecting the client into the `MetricsDispatcher`.
Clients that are not configured inside the `shopware.yaml` configuration file, will be removed from the `MetricsDispatcher` and won't receive any metrics.

{% code title="custom/plugins/MetricsPlugin/src/Resources/config/services.xml" %}
```xml
<services>
    <service id="MetricsPlugin\Client\InfluxDbClient">    
        <tag name="shopware.metrics.client" client="InfluxDb"/>
    </service>
</services>
```
{% endcode %}

## Configuration
{% hint style="info" %}
The shop's administrator has to opt-in to allow tracking of metrics. If the opt-in is not active, no metrics will be collected.
{% endhint %}

You can enable metric clients by specifying them under `shopware.metrics.clients` in the `shopware.yaml` file.
Only metric clients tagged with `shopware.metrics.client` **and** activated there will be injected into the `MetricsDispatcher`.

In this example we activate an additional `InfluxDb` client that we implemented earlier in this article.
Please notice that the client's name inside `shopware.yaml` matches the tag's `client` attribute when defining the PHP service.

{% code title="custom/plugins/MetricsPlugin/src/Resources/config/packages/shopware.yaml" %}
```yaml
shopware:
    metrics:
        clients: ["PostHog", "InfluxDb"]
```
{% endcode %}
