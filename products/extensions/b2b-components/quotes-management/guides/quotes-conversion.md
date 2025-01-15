---
nav:
  title: Quotes conversion
  position: 30

---

# Quotes conversion

Customers can convert their shopping carts into quotes to facilitate seamless processing. There are two new services to handle the conversion process :

## Cart to quote converter

When a customer wants to request a quote for their shopping cart, the process involves converting a cart to an order and then proceeding to enrich the data for the quote. The method `convertToQuote` of class `Shopware\Commercial\B2B\QuoteManagement\Domain\CartToQuote\CartToQuoteConverter` is responsible for this process.

```php
use Shopware\Core\Checkout\Cart\Order\OrderConversionContext;
use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\Order\OrderConverter;

public function convertToQuote(Cart $cart, SalesChannelContext $context, OrderConversionContext $orderContext = null): Quote
    {
        $order = $this->orderConverter->convertToOrder($cart, $context, $orderContext);
        
        $quote = $order;
        
        //enrich quote data
        
        //enrich quote line-items
        
        return $quote;
    }
```

## Quote to cart converter

When a customer wants to place an order based on a quote, a new cart is created based on the quote data. The method `convertToCart` of class `Shopware\Commercial\B2B\QuoteManagement\Domain\QuoteToCart\QuoteToCartConverter` is responsible for this process.

```php
use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Commercial\B2B\QuoteManagement\Entity\Quote\QuoteEntity;
use Shopware\Commercial\B2B\QuoteManagement\Domain\Transformer\QuoteLineItemTransformer;

public function convertToCart(QuoteEntity $quote, SalesChannelContext $context): Cart
    {
        
        $cart = new Cart(Uuid::randomHex());
        $cart->setPrice($quote->getPrice());

        $lineItems = QuoteLineItemTransformer::transformToLineItems($quote->getLineItems());
        $cart->setLineItems($lineItems);
        
        //enrich the cart
        
        return $cart;
    }
```
