/**
 * Tell Don't Ask Principle - Violation Example
 *
 * This example demonstrates a violation of the Tell Don't Ask principle
 * where objects expose their internal state and other objects make decisions
 * based on that state instead of telling objects what to do.
 *
 * This violates the principle because it leads to tight coupling and reduces encapsulation.
 */

// Item class represents a product in the shopping cart
class Item {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

// ShoppingCart class that exposes its internal state
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountRate = 0;
  }

  // Exposes internal state
  getItems() {
    return this.items;
  }

  // Exposes internal state
  getDiscountRate() {
    return this.discountRate;
  }

  // Allows external modification of state
  setDiscountRate(rate) {
    this.discountRate = rate;
  }

  addItem(item) {
    this.items.push(item);
  }

  removeItem(itemName) {
    const index = this.items.findIndex(item => item.name === itemName);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  // Note: No checkout method - the responsibility is moved to OrderProcessor
}

// OrderProcessor asks for cart's state and makes decisions
class OrderProcessor {
  processOrder(cart) {
    // Asks for cart's internal state
    const items = cart.getItems();
    const discountRate = cart.getDiscountRate();

    // Makes decisions based on cart's state
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price;
      console.log(`Processing item: ${item.name} - $${item.price}`);
    }

    // Calculates discount (logic duplicated from cart)
    const discount = subtotal * discountRate;
    const total = subtotal - discount;

    console.log(`Order processed. Subtotal: $${subtotal.toFixed(2)}, Discount: $${discount.toFixed(2)}, Total: $${total.toFixed(2)}`);

    // Clears the cart by directly manipulating its state
    while (cart.getItems().length > 0) {
      cart.getItems().pop();
    }
    cart.setDiscountRate(0);

    return {
      status: 'success',
      total: total
    };
  }
}

// Usage
const cart = new ShoppingCart();
const processor = new OrderProcessor();

// Add items to cart
cart.addItem(new Item('Laptop', 1200));
cart.addItem(new Item('Mouse', 25));

// Set discount rate
cart.setDiscountRate(0.1); // 10% discount

// Process order by asking for cart's state
processor.processOrder(cart);

// This violates the Tell Don't Ask principle because:
// 1. The ShoppingCart exposes its internal state (items and discount rate)
// 2. The OrderProcessor asks for the cart's state and makes decisions based on it
// 3. The OrderProcessor directly manipulates the cart's state
// 4. Business logic that should be in the cart is duplicated in the OrderProcessor
// 5. Changes to the ShoppingCart implementation would likely require changes to OrderProcessor