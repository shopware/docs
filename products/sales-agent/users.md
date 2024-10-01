---
nav:
   title: User creation
   position: 60

---

# Creating a user and set restrictions

You can create a user by sending a `POST` request to the `/api/user` endpoint. The `x-api-key` header is required and can be set in the environment (`API_AUTH_SECRET_KEY`).

```bash
curl -XPOST -H 'x-api-key: <secret>' -H "Content-type: application/json" -d '{
    "name": <name>,
    "email": <email>,
    "id": <id>,
    "password": <password>
}' '<sales_agent_instance_url>/api/user'
```

If you want to restrict the user so that they can only see specific customers, you can send a POST request to the `/api/entity-restriction` endpoint.

```bash
curl -XPOST -H 'x-api-key: <secret>' -H "Content-type: application/json" -d '{
    "entity": "customer",
    "email": <user_email>,
    "criteria": {
      "filter": [{
        "field": "lastName",
        "type": "equals",
        "value": "Doe"
      }]
    }
}' '<sales_agent_instance_url>/api/entity-restriction'
```

In this example, the user with the email `<user_email>` will only be able to see customers with the last name "Doe".
The criteria object supports the same fields as the shopware API. You can find more information about the criteria object in the [documentation](https://developer.shopware.com/docs/guides/integrations-api/general-concepts/search-criteria.html).

Further documentation of the available endpoints can be found in the [API documentation](https://shopware.stoplight.io/docs/swag-sales-agent/).