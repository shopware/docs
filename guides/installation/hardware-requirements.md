---
nav:
  title: Hardware Requirements
  position: 2

---

# Hardware Requirements

Before setting up the Shopware 6 development environment, ensure your system meets the following basic requirements.

- Unix-based system (macOS or Linux), or Windows with WSL 2 or Docker for full compatibility
- Administrative/root privileges (if required within the organization)
- At least 8 GB RAM (16 GB recommended) and 10 GB free disk space
- Reliable internet connection for dependency downloads

## System requirements

| Component            | Recommended                                                  |
|:---------------------|:-------------------------------------------------------------|
| **CPU**              | Quad-core or higher                                          |
| **Memory (RAM)**     | 8 GB minimum, 16 GB recommended (especially for Docker)      |
| **Disk space**       | ~10 GB free for Shopware + services                          |
| **Operating system** | macOS 13+, Windows 10/11 (Pro with WSL 2), or Linux (64-bit) |

## Permissions and networking requirements

- Allow your system’s firewall to let containers or local web servers communicate internally
- On Linux, you may need to add your user to the `docker` group using the below command:

```bash
sudo usermod -aG docker $USER
```

Once your environment meets these requirements, proceed to [Docker setup](./docker-setup.md).

:::info
For other modes of setup, refer to documentation on [legacy setups](../legacy-setups) that we no longer recommend.
:::
