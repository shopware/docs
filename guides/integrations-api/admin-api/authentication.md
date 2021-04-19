# Authentication

Before you can use the API, you need to authenticate. The API uses the [OAuth 2.0](https://oauth.net/2/) standard to authenticate users. In short, OAuth 2.0 requires you to obtain an access token which you will have to include in every subsequent request so the server can confirm your identity.

## Obtain an access token

OAuth 2.0 defines various ways that users can authenticate, so-called **application grant types**. The Admin API supports two grant types or -flows:

* Client Credentials Grant
* Resource Owner Password Grant
* \(Refresh Token Grant\)

**Not sure which grant type to use?**

{% tabs %}
{% tab title="Client Credentials" %}
Per standard, the client credentials grant type should be used for machine-to-machine communications, such as CLI jobs or automated services. Once an access token has been obtained, it remains valid for 10 minutes.

It requires the setup of an integration and two credentials - an **application id** and an **application secret**.
{% endtab %}

{% tab title="Resource Owner Password" %}
The resource owner password credentials grant is used by our admin panel. It identifies the API user based on a **username** and a **password** in exchange for an access token with a lifetime of 10 minutes and a refresh token. We recommend to only use this grant flow for client applications that should perform administrative actions and require a user-based authentication.

It requires an admin user to be set up.
{% endtab %}

{% tab title="Refresh Token" %}
This grant is only available, when a preceding authentication with the resource owner password grant type has been performed. The **refresh token** obtained during the initial authentication can be exchanged for another short-lived \(10 minutes\) access token.
{% endtab %}
{% endtabs %}

In order to obtain an access token, perform one of the following requests

{% tabs %}
{% tab title="Integration" %}
```javascript
// POST /api/oauth/token

{
    "grant_type": "client_credentials",
    "client_id": "<client-id>",
    "client_secret": "<client-secret>"
}
```

which will return

```javascript
{
  "token_type": "Bearer",
  "expires_in": 600,
  "access_token": "xxxxxxxxxxxxxx"
}
```
{% endtab %}

{% tab title="Username and Password" %}
```javascript
// POST /api/oauth/token

{
    "client_id": "administration",
    "grant_type": "password",
    "scopes": "write",
    "username": "<user-username>",
    "password": "<user-password>"
}
```

which will return

```javascript
{
  "token_type": "Bearer",
  "expires_in": 600,
  "access_token": "xxxxxxxxxxxxxx",
  "refresh_token": "token"
}
```

Make sure to also persist the `refresh_token` for subsequent authentications using the refresh token grant.
{% endtab %}

{% tab title="Refresh Token" %}
```javascript
{
    "grant_type": "refresh_token",
    "client_id": "<client-id>",
    "refresh_token": "<refresh-token>"
}
```

which will return

```javascript
{
  "token_type": "Bearer",
  "expires_in": 600,
  "access_token": "xxxxxxxxxxxxxx",
  "refresh_token": "token"
}
```
{% endtab %}
{% endtabs %}

## Passing the access token

Once you've obtained an access token, simply provide it in your requests `Authorization` header as as a Bearer token:

```yaml
// GET /api/product/b7d2554b0ce847cd82f3ac9bd1c0dfad

Host: shop.example.com
Content-Type: application/json
Authorization: Bearer eyJ0....
```

