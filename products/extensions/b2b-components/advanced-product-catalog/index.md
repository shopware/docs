---
nav:
  title: Advanced Product Catalog
  position: 10

---

# Advanced Product Catalog

The Advanced Product Catalog component enables B2B merchants to create customized product catalogs tailored to specific organizational units (OUs). This powerful feature allows businesses to control product visibility and create personalized catalog experiences for employees within specific organizational structures, ensuring that users see only the products and categories relevant to their assigned OU.

## Key Features

* **Organizational Unit-Based Access**: Catalogs are tied to specific organizational units, controlling which employees can access which products
* **Automatic Category Management**: Option to automatically include new product categories in existing catalogs
* **Version Support**: Full compatibility with Shopware's versioning system for categories
* **Custom Fields**: Extensible metadata support through custom fields for additional catalog configuration
* **Feature Toggle Integration**: The feature is automatically available when an organizational unit is active

## How It Works

The Advanced Product Catalog system operates through a sophisticated entity relationship model that links catalogs to organizational units and product categories. When an organizational unit is active, employees within that OU automatically gain access to the Advanced Product Catalog feature.

## Administration Interface

The Advanced Product Catalog can be configured through the Shopware administration interface:

* **Location**: Navigate to **Customer → Company → Organizational Unit**
* **Functionality**: Create, update, and manage catalog settings for each organizational unit
* **Configuration**: Select category access, and configure automatic category inclusion

## Integration

The Advanced Product Catalog is an integral part of the Organization Unit system:

* **Organizational Unit Dependency**: The feature is only available when organizational units are active
* **Employee Access Control**: Catalogs serve as settings that determine which products employees in specific OUs can access
* **B2B Component Integration**: Works seamlessly with other B2B components like Employee Management and Organization Units
* **Customer-Specific Features**: Supports the B2B component feature toggle system for granular access control

## Use Cases

* **Organizational Structure Management**: Control product visibility based on company hierarchy and organizational units
* **Employee Access Control**: Ensure employees only see products relevant to their role and organizational level
* **Product Portfolio Management**: Curate product offerings for specific organizational segments
* **Access Control**: Ensure sensitive or specialized products are only visible to authorized organizational units
* **Multi-Company Support**: Manage different product catalogs for different business entities or subsidiaries

## Benefits

* **Enhanced Employee Experience**: Employees see only relevant products based on their organizational context
* **Improved Access Control**: Granular control over which products are visible to which organizational units
* **Better Inventory Management**: Control which products are accessible to prevent unauthorized access
* **Flexible Configuration**: Easy setup and management through the administration interface
* **Performance Optimized**: Built-in caching support for improved catalog loading times

## Feature Toggle System

The Advanced Product Catalog follows the B2B component feature toggle pattern:

* **Organizational Unit Activation**: The feature becomes available when an organizational unit is active
* **Customer-Specific Control**: Merchants can control access through the customer-specific features system

The Advanced Product Catalog component is essential for B2B merchants who need granular control over product visibility based on organizational structure and want to create personalized shopping experiences for their employees within different organizational units.
