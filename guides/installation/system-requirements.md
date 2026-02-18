---
nav:
  title: System Requirements
  position: 2

---

# System requirements

Before setting up the Shopware 6 development environment, ensure your system meets the following requirements.

## Hardware

| Component | Requirement |
|---------------|------------------------------------------------------|
| CPU | Quad-core or higher recommended |
| Memory (RAM) | 8 GB minimum, 16 GB recommended (especially for Docker) |
| Disk space | Approximately 10 GB free for Shopware and supporting services |
| Internet connection | Reliable connection required for dependency downloads |

## Operating system

| Platform | Requirement |
|-------|--------------------------------------------------|
| macOS | macOS 13 or newer |
| Linux | 64-bit distribution |
| Windows | Windows 10/11 Pro using WSL 2 or Docker Desktop |

Unix-based systems (macOS or Linux) are recommended for best compatibility.

## Permissions and networking

| Area | Requirement |
|--------------|------------------------------------------------------------------------|
| Permissions | Administrative or root privileges (if required within the organization) |
| Firewall | Allow internal communication between containers or local web services |
| Docker (Linux) | Add your user to the docker group (command below) |

Example command:

```bash
sudo usermod -aG docker $USER
```

Once your environment meets these requirements, proceed to [Docker setup](./docker-setup.md).

:::info
For alternative installation approaches, see the documentation on [legacy setups](./legacy-setups/index.md). These methods are no longer recommended for new projects.
:::
