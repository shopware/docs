# Fastly

Fastly allows Shopware to store the HTTP Cache at the nearest edge server to the end-customer. This saves a lot of resources as the cached responses don't reach the actual application and it decreases the response time drastically world-wide. Another benefit is that the Redis cache is not used anymore and will have less cache items.

## Setup

{% hint style="info" %}
Fastly is supported in Shopware versions 6.4.11 or newer.
{% endhint %}

1. Make sure `FASTLY_API_TOKEN` and `FASTLY_SERVICE_ID` are set in the environment or contact the support when they are missing.
2. Enable Fastly config in [`.platform.app.yaml`](.platform.app.yaml) by removing hashtag before `mv config/packages/fastly.yaml.dist config/packages/fastly.yaml`
3. Push the new config and Fastly is enabled