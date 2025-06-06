---
nav:
  title: Audit Log
  position: 70

---

# Audit Log

[Download](../example-plugins/B2bAcl.zip) a plugin showcasing the topic.

## Description

The B2B Suite provides a general audit log that can be implemented in every component.
The audit log component can save different log types and author information like first name, last name, and email.
It provides a one-to-many association index.
The database structure is described in the graphic below:

```mermaid
classDiagram 
    b2b_audit_log_index <--o b2b_audit_log : n to 1
    b2b_audit_log o--> b2b_audit_log_author : n to 1
    class b2b_audit_log_index{
        id 
        audit_log_id 
        reference_table 
        reference_id
    }
    class b2b_audit_log{
        id 
        log_value 
        log_type 
        event_date 
        author_hash
    }
    class b2b_audit_log_author{
        hash
        salutation
        title
        firstname
        lastname
        email
    }
```

As you can see, the database structure is very flat.
In the `b2b_audit_log` table, we save a log type and a serialized *AuditLogValueEntity*.
All required author information is saved in the `b2b_audit_log_author` table.

The `b2b_audit_log_index` saves all association data between an audit log and affected entities.
For example, if you change an order position, it would be nice to show this information in the main order view.

## A simple example

In this example, we will increase the quantity of an order position.
To create an audit log, you can use the following snippet:

```php
$auditLogValue = new AuditLogValueDiffEntity();
$auditLogValue->newValue = 'newValue';
$auditLogValue->oldValue = 'oldValue';

$auditLog = new AuditLogEntity();
$auditLog->logValue = $auditLogValue->toDatabaseString();
$auditLog->logType = 'changeOrderPosition';

$orderReferenceIndex = new AuditLogIndexEntity();
$orderReferenceIndex->referenceId = 10;
$orderReferenceIndex->referenceTable = OrderContextRepository::TABLE_NAME;

$this->auditLogService->createAuditLog($auditLog, $identity, [$orderReferenceIndex]);
```

With the following snippet, you can get all available audit logs:

```php
$auditLogSearchStruct = new AuditLogSearchStruct();
$auditLogs = $this->auditLogService->fetchList(OrderContextRepository::TABLE_NAME, 10, $auditLogSearchStruct);
```
