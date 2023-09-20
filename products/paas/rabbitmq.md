# RabbitMQ

RabbitMQ is enabled by default in the template. This service is optional but recommended. It can be disabled and replaced by an SQL-backed queue.

## Disable service

Comment out the RabbitMQ service configuration.

```yaml
// .platform/services.yaml
#rabbitmq:
#   type: rabbitmq:3.8
#   disk: 1024
```

## Remove relationship

Comment out the relationship for the app configuration.

```yaml
// .platform.app.yaml
#relationships:
#   rabbitmqqueue: "rabbitmq:rabbitmq"
```

## Push changes

Push the changes to your git repository and wait for the deployment to finish.
