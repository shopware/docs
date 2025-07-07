---
nav:
  title: Concept
  position: 10

---

# Concept

The migration process is designed to handle large datasets while maintaining data integrity. It uses three dedicated tables to track status, map records, and log errors. A message queue ensures scalability, and sequential migration respects entity relationships (e.g., migrating employees before quotes). Understanding these concepts is crucial before proceeding to execution.
