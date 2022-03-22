# Reverse Http Cache

## Overview

A reverse http cache is a cache server placed before the web shop. If you are not familiar with http caching, please see our [http cache concept](../../../concepts/framework/http_cache.md). The reverse http cache needs the following capabilities to fully function with Shopware:

* Able to differentiate the request with multiple cookies
* Allow clearing the cache using a web request for a specific site or with `/` for all pages

{% hint style="info" %}
In this guide, we will use Varnish as example for an http cache.
{% endhint %}

### The example Setup with Varnish

{% hint style="warning" %}
This setup is compatible from Shopware version 6.4.
{% endhint %}

![](../../../.gitbook/assets/reverse_proxy_setup.svg)

### Configure shopware

At first we need to activate the reverse proxy support in Shopware. To enable it we need to create a new file in `config/packages/storefront.yaml`

```yaml
storefront:
    csrf:
        enabled: true
        # The internal Shopware http cache replaces the csrf token on the fly. This can't be done in Reverse proxy. So we use ajax to get an csrf token
        mode: ajax
    reverse_proxy:
        enabled: true
        ban_method: "BAN"
        # This needs to point to your varnish hosts
        hosts: [ "http://varnish" ]
        # Max parallel invalidations at same time for a single worker
        max_parallel_invalidations: 3
        # Redis Storage for the http cache tags
        redis_url: "redis://redis"
```

Also set `SHOPWARE_HTTP_CACHE_ENABLED=1` in your `.env` file.

### Configure Varnish

As Shopware is now prepared to work with a reverse proxy, we need to configure Varnish to use a Shopware specific configuration (VCL). Below you can find an example Shopware 6 Varnish configuration.

```text
vcl 4.0;

import std;

# You should specify here all your app nodes and use round robin to select a backend
backend default {
    .host = "<app-host>";
    .port = "80";
}

# ACL for purgers IP. (This needs to contain app server ips)
acl purgers {
    "127.0.0.1";
    "localhost";
    "::1";
}

sub vcl_recv {
    # Mitigate httpoxy application vulnerability, see: https://httpoxy.org/
    unset req.http.Proxy;

    # Strip query strings only needed by browser javascript. Customize to used tags.
    if (req.url ~ "(\?|&)(pk_campaign|piwik_campaign|pk_kwd|piwik_kwd|pk_keyword|pixelId|kwid|kw|adid|chl|dv|nk|pa|camid|adgid|cx|ie|cof|siteurl|utm_[a-z]+|_ga|gclid)=") {
        # see rfc3986#section-2.3 "Unreserved Characters" for regex
        set req.url = regsuball(req.url, "(pk_campaign|piwik_campaign|pk_kwd|piwik_kwd|pk_keyword|pixelId|kwid|kw|adid|chl|dv|nk|pa|camid|adgid|cx|ie|cof|siteurl|utm_[a-z]+|_ga|gclid)=[A-Za-z0-9\-\_\.\~]+&?", "");
    }
    set req.url = regsub(req.url, "(\?|\?&|&)$", "");

    # Normalize query arguments
    set req.url = std.querysort(req.url);

    # Make sure that the client ip is forward to the client.
    if (req.http.x-forwarded-for) {
        set req.http.X-Forwarded-For = req.http.X-Forwarded-For + ", " + client.ip;
    } else {
        set req.http.X-Forwarded-For = client.ip;
    }

    # Handle BAN
    if (req.method == "BAN") {
        if (!client.ip ~ purgers) {
            return (synth(405, "Method not allowed"));
        }

        ban("req.url ~ "+req.url);
        return (synth(200, "BAN URLs containing (" + req.url + ") done."));
    }

    # Normalize Accept-Encoding header
    # straight from the manual: https://www.varnish-cache.org/docs/3.0/tutorial/vary.html
    if (req.http.Accept-Encoding) {
        if (req.url ~ "\.(jpg|png|gif|gz|tgz|bz2|tbz|mp3|ogg)$") {
            # No point in compressing these
            unset req.http.Accept-Encoding;
        } elsif (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } elsif (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            # unkown algorithm
            unset req.http.Accept-Encoding;
        }
    }

    if (req.method != "GET" &&
        req.method != "HEAD" &&
        req.method != "PUT" &&
        req.method != "POST" &&
        req.method != "TRACE" &&
        req.method != "OPTIONS" &&
        req.method != "PATCH" &&
        req.method != "DELETE") {
        /* Non-RFC2616 or CONNECT which is weird. */
        return (pipe);
    }

    # We only deal with GET and HEAD by default
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Don't cache Authenticate & Authorization
    if (req.http.Authenticate || req.http.Authorization) {
        return (pass);
    }

    # Always pass these paths directly to php without caching
    # Note: virtual URLs might bypass this rule (e.g. /en/checkout)
    if (req.url ~ "^/(checkout|account|admin|api)(/.*)?$") {
        return (pass);
    }

    return (hash);
}

sub vcl_hash {
    # Consider Shopware http cache cookies
    if (req.http.cookie ~ "sw-cache-hash=") {
        hash_data("+context=" + regsub(req.http.cookie, "^.*?sw-cache-hash=([^;]*);*.*$", "\1"));
    } elseif (req.http.cookie ~ "sw-currency=") {
        hash_data("+currency=" + regsub(req.http.cookie, "^.*?sw-currency=([^;]*);*.*$", "\1"));
    }
}

sub vcl_hit {
  # Consider client states for response headers
  if (req.http.cookie ~ "sw-states=") {
     set req.http.states = regsub(req.http.cookie, "^.*?sw-states=([^;]*);*.*$", "\1");

     if (req.http.states ~ "logged-in" && obj.http.sw-invalidation-states ~ "logged-in" ) {
        return (pass);
     }

     if (req.http.states ~ "cart-filled" && obj.http.sw-invalidation-states ~ "cart-filled" ) {
        return (pass);
     }
  }
}

sub vcl_backend_response {
    # Fix Vary Header in some cases
    # https://www.varnish-cache.org/trac/wiki/VCLExampleFixupVary
    if (beresp.http.Vary ~ "User-Agent") {
        set beresp.http.Vary = regsub(beresp.http.Vary, ",? *User-Agent *", "");
        set beresp.http.Vary = regsub(beresp.http.Vary, "^, *", "");
        if (beresp.http.Vary == "") {
            unset beresp.http.Vary;
        }
    }

    # Respect the Cache-Control=private header from the backend
    if (
        beresp.http.Pragma        ~ "no-cache" ||
        beresp.http.Cache-Control ~ "no-cache" ||
        beresp.http.Cache-Control ~ "private"
    ) {
        set beresp.ttl = 0s;
        set beresp.http.X-Cacheable = "NO:Cache-Control=private";
        set beresp.uncacheable = true;
        return (deliver);
    }

    # strip the cookie before the image is inserted into cache.
    if (bereq.url ~ "\.(png|gif|jpg|swf|css|js|webp)$") {
        unset beresp.http.set-cookie;
    }

    # Allow items to be stale if needed.
    set beresp.grace = 6h;

    # Save the bereq.url so bans work efficiently
    set beresp.http.x-url = bereq.url;
    set beresp.http.X-Cacheable = "YES";

    # Remove the exact PHP Version from the response for more security
    unset beresp.http.x-powered-by;

    return (deliver);
}

sub vcl_deliver {
    ## we don't want the client to cache
    set resp.http.Cache-Control = "max-age=0, private";

    # remove link header, if session is already started to save client resources
    if (req.http.cookie ~ "session-") {
        unset resp.http.Link;
    }

    # Set a cache header to allow us to inspect the response headers during testing
    if (obj.hits > 0) {
        unset resp.http.set-cookie;
        set resp.http.X-Cache = "HIT";
    }  else {
        set resp.http.X-Cache = "MISS";
    }
    
    # Remove the exact PHP Version from the response for more security (e.g. 404 pages)
    unset resp.http.x-powered-by;

    # invalidation headers are only for internal use
    unset resp.http.sw-invalidation-states;

    set resp.http.X-Cache-Hits = obj.hits;
}
```

To verify if it works, you can look for a new response header `X-Cache` in the http response. It shows you if it was a cache hit or miss.

### Disable the verification headers

The `X-Cache` and `X-Cache-Hits` headers are only meant to verify that Varnish is doing it's job. You typically don't want to have those headers enabled on a production environment.

To disable these headers, comment out the lines by prefixing them with the `#` character. The lines in questions are:
```
# Set a cache header to allow us to inspect the response headers during testing
if (obj.hits > 0) {
    unset resp.http.set-cookie;
    set resp.http.X-Cache = "HIT";
}  else {
    set resp.http.X-Cache = "MISS";
}

set resp.http.X-Cache-Hits = obj.hits;
```

Make it so that the lines look like the following:
```
# Set a cache header to allow us to inspect the response headers during testing
if (obj.hits > 0) {
    unset resp.http.set-cookie;
    #set resp.http.X-Cache = "HIT";
}  else {
    #set resp.http.X-Cache = "MISS";
}

#set resp.http.X-Cache-Hits = obj.hits;
```



