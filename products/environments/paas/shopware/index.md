---
nav:
    title: Shopware PaaS Native
    position: 10
---

# Introduction to Shopware PaaS Native

**Shopware PaaS Native (Platform-as-a-Service)** is a fully managed, cloud-native environment dedicated to hosting and developing Shopware applications. Built with an opinionated infrastructure, Shopware PaaS Native enables developers to focus on custom development without the overhead of managing scalability or infrastructure. This platform is optimized for efficiency, scalability, and rapid iteration, helping developers streamline Shopware project workflows.

## Key technical features

- **Kubernetes and AWS-Powered Infrastructure:** Shopware PaaS Native is built on a Kubernetes-based architecture running on AWS. This setup provides managed resources—such as servers, storage, networking, and databases—optimized to scale automatically based on application demands, ensuring high availability and stability without manual intervention.

- **Developer-Centric Tools and Workflows:** The platform includes preconfigured tools and standardized workflows specifically designed for Shopware development. These tools enable seamless integration with CLI, APIs, and other familiar development resources, streamlining deployment, testing, and monitoring processes.

- **Efficient Build and Deployment Pipelines:** Developers benefit from a ready-to-use environment optimized for continuous integration and deployment (CI/CD), reducing the need to manage complex infrastructure configurations. This setup accelerates development lifecycles and minimizes error rates.

## Shopware PaaS Native Architecture

The architecture of Shopware PaaS Native includes two primary layers:

1. **Infrastructure Layer:** A robust, cloud-based foundation powered by Kubernetes and AWS. Resources are configured to scale based on project needs, ensuring high availability and stability.

2. **Platform Layer:** A preconfigured environment with integrated best practices and tools, streamlining the development and deployment of Shopware applications. This layer accelerates workflows and reduces operational complexity by providing a consistent and managed setup.

## Comparison with Self-Hosted and SaaS Models

| **Model**                         | **Self-Hosted**                      | **Shopware PaaS Native**                           | **SaaS**                                          |
|-----------------------------------|--------------------------------------|----------------------------------------------------|---------------------------------------------------|
| **Infrastructure Responsibility** | Fully managed by the customer        | Managed by Shopware (customer manages application) | Fully managed by Shopware                         |
| **Control Over Customization**    | Complete control                     | High control with opinionated best practices       | Limited; customization possible only through apps |
| **Setup and Maintenance Effort**  | High                                 | Moderate, with most infrastructure tasks automated | Low                                               |
| **Ideal Use Case**                | Full control, advanced custom setups | Balance of control and managed scalability         | Ease of use with minimal setup                    |
