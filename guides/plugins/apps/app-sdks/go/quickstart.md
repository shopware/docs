# Quick start

## Installing

To start using the app server, install Go and run `go get`:

```sh
$ go get github.com/janbuecker/shopware-appserver-go
```

## Storage engines

The app server comes with one storage engine included: in-memory.

This storage resets on every restart of the server and should only be used for quick-start purposes.
All information is lost when the process is killed. This storage is used by default.

## Events

First, register a `POST` route in your web server and use `HandleWebhook` inside the handler:

```go
mux.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
    if err := srv.HandleWebhook(r); err != nil {
      // handle errors
   }

    // webhook handled successfully
})
```

To listen on an event, add the event to your `manifest.xml` file in your app and point it to your webhook endpoint.
Verifying the signature is done automatically for you.

**manifest.xml**

```xml
<webhooks>
    <webhook name="orderCompleted" url="https://appserver.com/webhooks" event="checkout.order.placed"/>
</webhooks>

<permissions>
   <read>order</read>
</permissions>
```

You can then register an event listener to the app server:

```go
srv.Event("checkout.order.placed", func(ctx context.Context, webhook appserver.WebhookRequest, api *appserver.APIClient) error {
    // do something on this event

    return nil
})
```

## Action buttons

First, register a `POST` route in your web server and use `HandleAction` inside the handler:

```go
mux.HandleFunc("/actions", func(w http.ResponseWriter, r *http.Request) {
    if err := srv.HandleAction(r); err != nil {
      // handle errors
   }

    // action handled successfully
})
```

To listen on a click on an action button, add the action button to your `manifest.xml` file in your app and point it to your actions endpoint.
Verifying the signature is done automatically for you.

**manifest.xml**

```xml
<admin>
    <action-button action="doSomething" entity="product" view="detail" url="https://appserver.com/actions">
        <label>do something</label>
    </action-button>
</admin>
```

You can then register an admin action listener to the app server:

```go
srv.Action("product", "doSomething", func(ctx context.Context, action appserver.ActionRequest, api *appserver.APIClient) error {
    // do something when someone clicks the action button

    return nil
})
```

## Full example

Here is a full example on an app server, that uses the standard http package and listens for events and action buttons.

```go
package main

import (
   "encoding/json"
   "log"
   "net/http"
   
   appserver "github.com/janbuecker/shopware-appserver-go"
)

func main() {
   srv := appserver.NewServer(
      "AppName",
      "AppSecret",
      "https://appserver.com/setup/register-confirm",
   )

   // event listener
   srv.Event("checkout.order.placed", func(ctx context.Context, webhook appserver.WebhookRequest, api *appserver.APIClient) error {
      // do something on this event
      
      return nil
   })

   // action buttons
   srv.Action("product", "doSomething", func(ctx context.Context, action appserver.ActionRequest, api *appserver.APIClient) error {
      // do something when someone clicks the action button
      
      return nil
   })
   
   // register routes and start server
   mux := http.NewServeMux()
   mux.HandleFunc("/webhooks", func(w http.ResponseWriter, r *http.Request) {
      if err := srv.HandleWebhook(r); err != nil {
         http.Error(w, err.Error(), http.StatusBadRequest)
         return
      }

      w.WriteHeader(200)
   })
   mux.HandleFunc("/actions", func(w http.ResponseWriter, r *http.Request) {
      if err := srv.HandleAction(r); err != nil {
         http.Error(w, err.Error(), http.StatusBadRequest)
         return
      }

      w.WriteHeader(200)
   })
   mux.HandleFunc("/setup/register", func(w http.ResponseWriter, r *http.Request) {
      reg, err := srv.HandleRegistration(r)
      if err != nil {
         http.Error(w, err.Error(), http.StatusBadRequest)
         return
      }

      regJSON, err := json.Marshal(reg)
      if err != nil {
         http.Error(w, err.Error(), http.StatusInternalServerError)
         return
      }

      w.WriteHeader(200)
      w.Write(regJSON)
   })

   mux.HandleFunc("/setup/register-confirm", func(w http.ResponseWriter, r *http.Request) {
      if err := srv.HandleConfirm(r); err != nil {
         http.Error(w, err.Error(), http.StatusBadRequest)
         return
      }

      w.WriteHeader(200)
   })

   log.Println("Listening on port 10100")
   log.Fatal(http.ListenAndServe(":10100", mux))
}
```
