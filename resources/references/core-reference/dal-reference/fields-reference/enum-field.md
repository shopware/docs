---
nav:
  title: EnumField reference
  position: 100

---

# EnumField reference

## Usage

The `EnumField` can be used to restrict  `string` or `int` values to a fixed set.

Define a `\BackedEnum` class, use them in an Entity and restrict the values in your RDBMS.

<Tabs>
<Tab title="BackedEnums">

```php
<?php

enum PaymentMethod : string {
    case PAYPAL = 'paypal';
    case CREDIT_CARD = 'credit_card';
    case INVOICE = 'invoice';
}
```

```php
<?php

enum BatchOrderSize: int {
    case DOZEN = 12;
    case SCORE = 20;
    case SMALL_GROSS = 120;
    case GROSS = 144;
    case GRAND = 1000;
}
```

</Tab>
<Tab title="Entity usage">

```php
<?php

class BatchOrderEntity extends Entity {

    #[Field(type: FieldType::ENUM, column: 'payment_method')]
    protected PaymentMethod $paymentMethod;

    #[Field(type: FieldType::ENUM, column: 'amount')]
    protected BatchOrderSize $amount;
    
   public function getPaymentMethod(): PaymentMethod
    {
        return $this->paymentMethod;
    }
    
    public function setPaymentMethod(PaymentMethod $paymentMethod): void
    {
        $this->paymentMethod = $paymentMethod;
    }
    
    public function getAmount(): BatchOrderSize
    {
        return $this->amount;
    }
    
    public function setAmount(BatchOrderSize $amount): void
    {
        $this->amount = $amount;
    }
```

</Tab>
<Tab title="RDBMS definition">
  
```sql
CREATE TABLE `batch_order` (
    `id` BINARY(16) NOT NULL,
    `payment_method` ENUM('paypal', 'credit_card', 'invoice') NOT NULL,
    `amount` INT NOT NULL,
    PRIMARY KEY (`id`)
);
```

</Tab>
</Tabs>

It's not advisable to use `ENUM` types for integer values, as most RDBMS only support string values and use integers
internally. Using a regular `INT` column is recommended in this case. The `BackedEnum` will restrict the possible
values, unless the database is modified manually.

## Examples

### Example 1: Creating an input field from an enum

```twig
<select name="payment_method">
    {% for method in PaymentMethod::cases() %}
        <option value="{{ method.value }}">{{ method.name }}</option>
    {% endfor %}
</select>
```

### Example 2: Setting an Entity value

```php
<?php

$batchOrder = new BatchOrderEntity();
$batchOrder->setPaymentMethod(PaymentMethod::PAYPAL);
```

### Example 3: Check if a value is valid

```php
<?php

$validPaymentMethod = PaymentMethod::tryFrom($userProvidedInput);

// Either check for null
if (is_null($validPaymentMethod)) {
    // The input was not a valid payment method
}

// Or check for the class
if($validPaymentMethod instanceof PaymentMethod) {
    // The input was a valid payment method
}

```
