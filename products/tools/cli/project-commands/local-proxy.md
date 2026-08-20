---
nav:
  title: Local Proxy
  position: 15

---

# Local Proxy

`shopware-cli project proxy` runs any number of local Shopware projects at the same time, each reachable at a stable hostname like `https://shop1.shopware.local`, instead of everyone competing for `127.0.0.1:8000`.

## How it works

- Every project gets a hostname derived from its directory name, for example `~/Playground/shop1` becomes `https://shop1.shopware.local`.
- A shared **Traefik** container routes requests by hostname, so shop containers publish no host ports.
- A small DNS container answers `*.shopware.local` with `127.0.0.1`. No query leaves the machine.
- A local certificate authority signs a wildcard certificate, so HTTPS works without browser warnings once trusted.

## Opting in

### New projects

Pass `--local-domain` to `shopware-cli project create`, or choose **"Local domains: Yes"** in the interactive setup wizard. This writes the hostname into `.shopware-project.yml`, and `shopware-cli project dev` brings the shop up through the proxy automatically — no further `proxy up` needed.

```bash
shopware-cli project create my-shop --docker --local-domain
```

### Existing (port-based) projects

Use `proxy up` to opt an existing project in on demand. It switches the project's URL to its hostname and remembers the previous port so it can be restored later.

```bash
shopware-cli project proxy up
```

## Commands

| Command | Description |
| --- | --- |
| `shopware-cli project proxy setup` | One-time machine setup: configures DNS routing and trusts the local CA. Requires `sudo`. Supports `--domain` and `--skip-trust`. |
| `shopware-cli project proxy up` | Registers the current project with the shared proxy and starts it. |
| `shopware-cli project proxy down` | Deregisters the current project and restores its previous port-based configuration. |
| `shopware-cli project proxy list` | Lists all projects currently registered with the shared proxy. |
| `shopware-cli project proxy verify` | Runs a health check across DNS, certificate trust, and routing, with hints to fix problems. |
| `shopware-cli project proxy teardown` | Runs `down` for every registered project, then stops the shared infrastructure. Prompts for confirmation unless `--force` is passed. |

Run `shopware-cli project proxy setup` once per machine before using local domains for the first time. After that, `project create --local-domain`, `project dev`, and `project proxy up` all work without `sudo`.

## Requirements

Local domains require the Docker-based development environment (`--docker`). They are not available with other environment executors.
