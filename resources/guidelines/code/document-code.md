---
nav:
  title: Document Code
  position: 60

---

# Document Code

* Methods of interfaces or abstract classes should always have a doc block describing what the function is used for and what is to be observed in the function. This should serve to clarify what an implementation has to take into account.
* Unnecessary doc block lines should always be avoided. This includes the `@param` and `@return` annotations as long as this is already defined by type hints.
* In a doc block, all exceptions thrown directly by the function should be documented via `@throws` annotation.
* Exceptions that could be thrown by a library are not included in the doc blocks.
