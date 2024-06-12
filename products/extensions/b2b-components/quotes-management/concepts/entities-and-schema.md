---
nav:
  title: Entities & Schema
  position: 20

---

# Entities and schema

## Entities

### Quote

The quote entity stores fundamental information about each quote such as state, pricing, discount, associated users, customer and customers.

### Quote Delivery

The quote delivery represents the delivery information of a quote. It includes details such as the shipping method, earliest and latest shipping date.

### Quote Delivery Position

The quote delivery position represents the line items of a quote delivery. It has a quote line item, price, total price, unit price, quantity, and custom fields.

### Quote Line item

The quote line item represents the line items of a quote. Only product type is supported currently.

### Quote Transaction

The quote transaction entity captures payment amount and also allows saving an external reference.

### Quote Comment

The quote comment entity stores comments related to a quote.

### Quote Employee

The quote employee entity represents employees associated with a quote.

### Quote Document

The quote document entity represents documents associated with a quote.

## Schema


```mermaid
erDiagram
    Quote {
        id uuid PK
        version_id uuid PK
        auto_increment bigint
        state_id uuid
        customer_id uuid
        order_id uuid
        order_version_id uuid
        quote_number varchar(64)
        price json
        shipping_costs json
        discount json
        amount_total double
        amount_net double
        custom_fields json
    }
    QuoteComment {
        id uuid PK
        version_id uuid PK
        comment longtext
        seen_at datetime(3)
        quote_id uuid
        quote_version_id uuid
        state_id uuid
        customer_id uuid
    }
    QuoteDelivery {
        id uuid PK
        version_id uuid PK
        quote_id uuid
        quote_version_id uuid
        shipping_method_id uuid
        shipping_costs json
        custom_fields json
    }
    QuoteDeliveryPosition {
        id uuid PK
        version_id uuid PK
        quote_line_item_id uuid
        quote_line_item_version_id uuid
        price json
        total_price int
        unit_price int
        quantity int
        custom_fields json
    }
    QuoteDocument {
        id uuid PK
        version_id uuid PK
        document_number varchar(255)
        document_type_id uuid
        file_type varchar(255)
        quote_id uuid
        quote_version_id uuid
        config json
        custom_fields json
    }
    QuoteEmployee {
        id uuid PK
        version_id uuid PK
        quote_id uuid
        quote_version_id uuid
        employee_id uuid
        first_name varchar(255)
        last_name varchar(255)
    }
    QuoteLineItem {
        id uuid PK
        version_id uuid PK
        product_id uuid
        product_version_id uuid
        label varchar(255)
        quantity int
        type varchar(255)
        payload json
        price json
        discount json
        position int
    }
    QuoteTransaction {
        id uuid PK
        version_id uuid PK
        quote_id uuid
        quote_version_id uuid
        payment_method_id uuid
        amount json
        custom_fields json
    }
    QuoteDelivery o{--|| Quote : "has deliveries"
    QuoteDeliveryPosition o{--|| QuoteDelivery : "has positions"
    QuoteLineItem o{--|| Quote : "has line items"
    QuoteComment o{--|| Quote : "has comments"
    QuoteTransaction o{--|| Quote : "has transactions"
    QuoteDocument o{--|| Quote : "has documents"
    QuoteEmployee o{--|| Quote : "belongs to employee"
    QuoteDeliveryPosition o{--|| QuoteLineItem : "has positions"
```
