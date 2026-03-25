---
nav:
  title: Build and Watch Frontend
  position: 40
---

# Build and Watch Frontend (Storefront & Administration)

Use these commands when developing or customizing the UI (Storefront or Administration), or developing extensions that affect the UI:

```bash
# Build the administration (admin panel)
make build-administration

# Build the storefront (shop frontend)
make build-storefront

# Start a watcher to rebuild the Administration automatically when files change
make watch-admin

# Start a watcher for Storefront
make watch-storefront
```

## Alternative: Run build and watch scripts without Make

You only need to run this step if you’re developing or customizing the frontend (Administration or Storefront). It compiles JavaScript and CSS assets so your changes are visible immediately.

The created project contains bash scripts in the `bin/` folder to build and watch the Administration and Storefront. Run the following commands:

```bash
./bin/build-administration.sh
./bin/build-storefront.sh
./bin/watch-administration.sh
./bin/watch-storefront.sh
```

Use these scripts to build the Administration and Storefront. The `watch` commands monitor changes to the Administration and Storefront and automatically rebuild them.
