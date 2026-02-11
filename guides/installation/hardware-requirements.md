---
nav:
  title: Hardware Requirements
  position: 2

---

# Hardware requirements

Before setting up your Shopware 6 development environment, make sure your system is ready. Check these basics before installation:

- You’re using a Unix-based system (macOS or Linux), or Windows with WSL 2 or Docker for full compatibility
- You have admin/root privileges (if required in your organization)
- You have at least 8 GB RAM (16 GB recommended) and 10 GB free disk space
- You have a reliable Internet connection for dependency downloads

These recommendations ensure smooth local development regardless of your setup:

| Component            | Recommended                                                  |
|:---------------------|:-------------------------------------------------------------|
| **CPU**              | Quad-core or higher                                          |
| **Memory (RAM)**     | 8 GB minimum, 16 GB recommended (especially for Docker)      |
| **Disk space**       | ~10 GB free for Shopware + services                          |
| **Operating system** | macOS 13+, Windows 10/11 (Pro with WSL 2), or Linux (64-bit) |

## Permissions and networking

- Allow your system’s firewall to let containers or local web servers communicate internally.
- On Linux, you may need to add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```

Once your environment meets these requirements, proceed to [setup](./docker-setup.md).
