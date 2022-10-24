# RabbitMQ

RabbitMQ is enabled by default in the template. This service is optional and can be disabled to use the default queue from the Database.

## Disable service

Comment out the RabbitMQ service configuration.

{% code title=".platform/services.yaml" %}

```yaml
#rabbitmq:
#   type: rabbitmq:3.8
#   disk: 1024
```

{% endcode %}

## Remove relationship

Comment out the relationship for it the app configuration.

{% code title=".platform.app.yaml" %}

```yaml
#relationships:
#   rabbitmqqueue: "rabbitmq:rabbitmq"
```

{% endcode %}

## Push changes

Push the changes to your git repository and wait for the deployment to finish.