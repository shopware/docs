---
nav:
  title: System Check
  position: 80

---

# System Checks

System checks are a way to ensure that your Shopware installation is operating normally where each check verifies a specific aspect functionality. If a check fails, it can be an indicator that something is wrong with your system.

## Concepts

### System Check

Shopware is composed of many components that work together to provide the full experience. A component can be an internal piece of code that achieves a functionality, an external provider, or a plugin.

Each system checks verify a specific aspect of the system. For example, one system check can verify that the database connection is working, another that the payment system is functioning correctly, or that the SMTP server is online. 

And to ensure clear terminology, we have defined the following logical concepts that defines a guideline for a System Check type:

- `Readiness Checks`: Checks that are executed before the system is ready to serve traffic.
- `Health Checks`: Checks that are executed periodically to ensure the system is healthy. Those are usually invoked either manually or by monitoring systems.
- `Long running Checks`: These are a subset of `Health Checks` but the main difference is that they can take a long time to execute, and they should always be executed in the background.

> [System Execution Context](#system-check-execution-context) plays a vital role in determining the type of the check

### Category

The category aims to cluster what the check is verifying rather than to categorize the type of check itself. 
Each component logically falls into a certain category. Functional categories are used to group checks together. The following categories are available:

- `SYSTEM`: System checks make sure that the backbone of the software is functioning correctly. For example, a database connection.
- `FEATURE`: Feature checks make sure that a specific feature of the software is functioning correctly. For example, the payment system.
- `EXTERNAL`: External checks make sure that external services are responding correctly. For example, the SMTP server is online.
- `AUXILIARY`: Auxiliary checks make sure that auxiliary services are functioning correctly. For example, Shopware background tasks are running.

### Status

A component is not always in a failing or working state. For example, sometimes it can be degraded and not fully operational while still providing some functionality. The status of a check is used to represent the outcome of the check:

- `OK`: The component is functioning correctly.
- `SKIPPED`: The component check was skipped. Which could mean that some criteria for the check were not met. (e.g. the check is not applicable to the current environment)
- `UNKNOWN`: The component status is unknown.
- `WARNING`: The component is functioning but with some issues that are not errors.
- `ERROR`: The component has runtime errors, but some parts of it could still be functioning.
- `FAILURE`: The component has failed with irrecoverable errors.

### System Check Execution Context

System checks may be unnecessary in certain contexts but crucial in others. For instance, in an immutable environment, a check verifying runtime configuration is not needed after the system has been deployed to customers, as the configuration is not expected to change. However, this check is vital before a roll-out.

The context in which a check is executed is represented by the `SystemCheckExecutionContext`. The following contexts are available:

- `WEB`: The check is running in a web environment.
- `CLI`: The check is running in a command-line interface environment.
- `PRE_ROLLOUT`: The check is running before a system roll-out.
- `RECURRENT`: The check is running as part of a scheduled task.
