---
nav:
  title: Dependency Injection & Dependency Handling
  position: 50

---

# Dependency Injection and Dependency Handling

Within the Core domain, it is not allowed to access the PHP session. There is only one PHP session if it is a storefront request. The appropriate implementation and consideration of session data must be handled in the Storefront domain.
