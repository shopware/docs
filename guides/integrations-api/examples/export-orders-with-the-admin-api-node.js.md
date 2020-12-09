# Export orders with the Admin API \(Node.js\)

When you process a lot of orders within your Shop, you want to make sure that synchronisation between multiple systems can be automated. The Admin API lets you fetch and synchronise orders in an automated manner. We obviously don't know about the system you're integrating with, but we can give you a little guidance on how to approach it.

## Introduction

In this guide, you'll learn how to

* Authenticate as an API user
* Manage the authentication and refresh token
* Filter, fetch and mark received orders
* Basic error handling

by creating a couple of functions that implement the relevant business logic required to achieve these goals.

It will not be a ready-to-use library, but a collection of code snippets that you can reuse for your custom implementation. The guide is based off an exemplary implementation in Node.js using the [Gluegun](https://github.com/infinitered/gluegun) toolbox. It is a helpful tool to create CLI applications in Node.js.

It's helpful to have basic knowledge of the following concepts in order to follow this guide

* Javascript, Node.js
* [Gluegun](https://github.com/infinitered/gluegun)
* OAuth 2.0 \(client credentials\)
* Axios \(Javascript HTTP client\)

## Authenticate

First of all, we have to authenticate. We do that by obtaining an access token which we can get through the Admin APIs token endpoint located at `api/oauth/token`:

```javascript
toolbox.getAuthToken = async () => {

    try {
      
      if(authTokenExpiry <= new Date()) {
        warning('[ORDER_SYNC] Token expired, obtaining new token')
        const authTokenResponse = await axios.post(
          `${integration.host}api/oauth/token`,
          {
            client_id: integration.client_id,
            client_secret: integration.client_secret,
            grant_type: "client_credentials",
            scopes: "write"
          }
        );

        const expires_in = authTokenResponse.data.expires_in - 100
        authTokenExpiry = new Date(new Date().getTime() + (expires_in * 1000))
        authToken = authTokenResponse.data.access_token
        
        info(`[ORDER_SYNC] New token valid until: ${authTokenExpiry}`)
      }

      return authToken;

    } catch (exception) {
      if(exception.response && exception.response.data) {
        error('[ORDER_SYNC] Couldn\'t authenticate')
        error(`[ORDER_SYNC] ${exception.message} - '${exception.response.data.errors[0].title}'`)
      } else {
        error('[ORDER_SYNC] Please check connection')
      }

      return null
    }
  };
```

First of all, we check whether we already have a token. Thus, we store the expiry within `authTokenExpiry` and compare it with the current date. Initially it will obviously not be set, so this evaluates to true \(thanks to Javascript\).

```javascript
const axios = require('axios')

const ORDER_STATE_IN_PROCESS = "de9d9c380e9047aa8daf7a869da89f8f"

// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = toolbox => {
  toolbox.config = {
    ...toolbox.config,
    ...require('./../../integration-cli.config.json')
  }

  let { print: { error, success, warning } } = toolbox
  let { integration } = toolbox.config

  let authToken = null
  let authTokenExpiry = -1

  toolbox.getAuthToken = async () => {

    try {
      
      if(authTokenExpiry <= new Date()) {
        warning('[ORDER_SYNC] Token expired, obtaining new token')
        const authTokenResponse = await axios.post(
          `${integration.host}api/oauth/token`,
          {
            client_id: integration.client_id,
            client_secret: integration.client_secret,
            grant_type: "client_credentials",
            scopes: "write"
          }
        );

        const expires_in = authTokenResponse.data.expires_in - 100
        authTokenExpiry = new Date(new Date().getTime() + (expires_in * 1000))
        authToken = authTokenResponse.data.access_token
        
        warning(`[ORDER_SYNC] New token valid until: ${authTokenExpiry}`)
      }

      return authToken;

    } catch (exception) {
      if(exception.response && exception.response.data) {
        error('[ORDER_SYNC] Couldn\'t authenticate')
        error(`[ORDER_SYNC] ${exception.message} - '${exception.response.data.errors[0].title}'`)
      } else {
        error('[ORDER_SYNC] Please check internet connection')
      }

      return null
    }
  };

  toolbox.getOrders = async (authToken) => {

    try {

      const ordersResponse = await axios.post(
        `${integration.host}api/v${integration.version}/search/order`,
        {
            limit: 5,
            associations: {
              lineItems: {},
              currency: {},
              addresses: {},
              transactions: {
                associations: {
                  paymentMethod: {},
                  stateMachineState: {}
                }
              }
            },
            filter: [
              {
                type: "multi",
                operator: "and",
                queries: [
                  {
                    type: "multi",
                    operator: "or",
                    queries: [
                      {
                        type: "equals",
                        field: "transactions.stateMachineState.technicalName",
                        value: "paid"
                      },
                      {
                        type: "multi",
                        operator: "and",
                        queries: [
                          {
                            type: "equals",
                            field: "transactions.stateMachineState.technicalName",
                            value: "open"
                          },
                          {
                            type: "equals",
                            field: "transactions.paymentMethodId",
                            value: "66f5f6ae704b44c7a7662cdf78bb200a"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: "equals",
                    field: "customFields.exportedCounter",
                    value: null
                  }
                ]
              }
            ],
            sort: [{
              field: 'orderDateTime',
              order: 'ASC'
            }]
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );

      return ordersResponse.data;

    } catch (exception) {
      if(exception.response && exception.response.data) {
        error(`[ORDER_SYNC] ${exception.message} - '${exception.response.data.errors[0].title}'`)
        error(JSON.stringify(exception.response.data))
      } else {
        error('[ORDER_SYNC] Please check internet connection')
      }

      return null
    }
  };

  toolbox.acknowledgeReceivedOrders = async (authToken, ids) => {

    let payload = ids.map(id => {
      return {
        id,
        stateId: ORDER_STATE_IN_PROCESS,
        customFields: {
          exportedCounter: 'exported'
        }
      };
    })

    const ackResponse = await axios.post(
      `${integration.host}api/v${integration.version}/_action/sync`,
      {
        acknowledge: {
          entity: 'order',
          action: 'upsert',
          payload
        }
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      }
    );

    if(ackResponse.data.data.acknowledge.result.length !== payload.length) {
      error(`[ORDER_SYNC] Error: Acknowledge response didn't match expected length`)
      error(`[ORDER_SYNC] Error: ${JSON.stringify(ackResponse.data)}`)
    }

    success(`[ORDER_SYNC] Acknowledged ${payload.length} orders`)
  }
}
```

