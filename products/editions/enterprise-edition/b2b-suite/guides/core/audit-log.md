# Audit Log

You can download a plugin showcasing the topic [here](../example-plugins/B2bAuditLog.zip).

## Table of contents

*   [Description](#description)
*   [A simple Example](#a-simple-example)

## Description

The B2B-Suite provides a general audit log which can be implemented in every component. 
The audit log component can save different log types, author information like firstname, lastname and email, 
and provides a one to many association index. The database structure is described in the graphic below:

![image](../../../../../../.gitbook/assets/audit_log_structure.svg)

As you can see, the database structure is very flat. In the `b2b_audit_log` table we save a log type and a serialized AuditLogValueEntity. 
All required author information is saved in the `b2b_audit_log_author` table.

The `b2b_audit_log_index` saves all association data between an audit log and affected entities. 
As an example, if you change an order position it would be nice to show this information in the main order view.

## A simple Example

In this example we will increase the quantity of an order position. 
To create an audit log you can use the following snippet:

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

With the following snippet you can get all available audit logs:

```php
$auditLogSearchStruct = new AuditLogSearchStruct();
$auditLogs = $this->auditLogService->fetchList(OrderContextRepository::TABLE_NAME, 10, $auditLogSearchStruct);
```
