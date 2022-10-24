# RabbitMQ

Perform the following steps to activate RabbitMQ in your environment.

## Enable service

Add (or uncomment) the RabbitMQ service configuration.

{% code title=".platform/services.yaml" %}

```yaml
rabbitmq:
   type: rabbitmq:3.8
   disk: 1024
```

{% endcode %}

## Add relationship

Add (or uncomment) the relationship for it the app configuration.

{% code title=".platform.app.yaml" %}

```yaml
relationships:
#    rabbitmqqueue: "rabbitmq:rabbitmq"
```

{% endcode %}

## Push changes

Push the changes to your git repository and wait for the deployment to finish.