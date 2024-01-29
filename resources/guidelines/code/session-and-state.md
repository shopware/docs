---
nav:
  title: Session and State
  position: 120

---

# Session and State

Within the `Core` domain, it is not allowed to access the PHP session. There is only one PHP session if it is a Storefront request. The appropriate implementation and consideration of session data must be handled in the Storefront domain.
