# Store API

## Introduction and Goals

The main goal of the Store API is to provide an interaction layer that exposes business functionality of Shopware via HTTP, so external, buyer-facing applications can interact with Shopware in an automated way.

### 1.1 Requirements

Separating the frontend from the backend has become a much requested task in eCommerce projects. An API that exposes all required data and interactions is an essential requirement for such projects. With the Store API we want to provide a generalized interface that allows frontend applications to build complex integrations with Shopware without any need for extending the backend. Potential consumers of the Store API can be:

* Native mobile or desktop applications
* Custom single page applications (e.g. React / Vue.js based sites)
* Snippet integrations (e.g. embedding into a Wordpress site)
* CMS integrations (e.g. implementing a checkout in a Typo3 Website)
* IoT devices

### 1.2 Quality goals

The following goals are leading factors of the design and implementation of the Store API.

**Compatibility**

We understand, that API consumers rely on the stability of the API for the stability of their integration. Hence, we ensure that API breaks are well-communicated, documented and performed using established practices for deprecation and change management.

**Performance Efficiency**

The Store API provides adequately quick response times (generally between 50-200ms) that allow it to be used directly within production environments. Still, complex integrations designed for high-load operation might introduce additional redundancy / caching mechanisms.

**Intuitive operation**

For developers building custom frontends the Store API is the main surface of integration between Shopware and the application they are implementing. Hence, we make sure to provide a comprehensive documentation, consistent structure and behaviour of our endpoints. Endpoints are designed around and for use cases and processes rather than the internal data structure of the system.

### 1.3 Stakeholder

// Not Happy with that part

Primarily, we want to make it easy to develop custom frontend applications using Shopware - so the primary user of the Store API will be API driven frontends.