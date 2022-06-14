# RabbitMQ

1. Add RabbitMQ in [`.platform/services.yaml`](.platform/services.yaml)
1. Add a relationship for it in [`.platform.app.yaml`](.platform.app.yaml)
1. Push to Platform.sh (so RabbitMQ is provisioned)
1. For RabbitMQ to work, you need to manually add a queue named `shopware-queue` and a `messages` exchange. To do this you can e.g. use the platform CLI to open a tunnel (`ssh -L 15672:rabbitmqqueue.internal:15672 $(platform ssh --pipe -A app)`) and open the UI via `http://localhost:15672/`. You can get the credentials via `platform relationships`. `RABBITMQ_URL` is set in [`platformsh-env.php`](platformsh-env.php).
1. `composer require enqueue/amqp-bunny`
1. Uncomment [`config/packages/enqueue.yaml`](config/packages/enqueue.yaml)
