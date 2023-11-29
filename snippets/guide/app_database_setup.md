The App Bundle ships with a basic Shop entity to store the shop information. You can extend this entity to store more information about your app if needed.

Symfony configures doctrine to use PostgreSQL by default. Change the `DATABASE_URL` environment variable in your `.env` file if you want to use MySQL.
You can also use SQLite by setting the `DATABASE_URL` to `sqlite:///%kernel.project_dir%/var/app.db` for development.

After choosing your database engine, you need to require two extra composer packages.

```shell
composer req symfony/maker-bundle migrations
```

And create your first migration using `bin/console make:migration` (which is using the `AbstractShop` Class) and apply it to your database with `bin/console doctrine:migrations:migrate`.
