/**
 * Tell Don't Ask Principle - Correct Implementation
 *
 * The Tell Don't Ask principle suggests that objects should tell other objects what to do
 * rather than asking for their state and making decisions based on that state.
 *
 * In this example, we have a ShoppingCart class that encapsulates its behavior.
 * Clients tell the cart what to do (add items, apply discounts, checkout) rather than
 * asking for its internal state to make decisions.
 */

// Item class represents a product in the shopping cart
class Item {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

// ShoppingCart class encapsulates cart behavior
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountRate = 0;
  }

  addItem(item) {
    this.items.push(item);
    console.log(`Added ${item.name} to cart`);
  }

  removeItem(itemName) {
    const index = this.items.findIndex(item => item.name === itemName);
    if (index !== -1) {
      const removedItem = this.items.splice(index, 1)[0];
      console.log(`Removed ${removedItem.name} from cart`);
    }
  }

  applyDiscount(rate) {
    this.discountRate = rate;
    console.log(`Applied ${rate * 100}% discount to cart`);
  }

  getTotal() {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const discount = subtotal * this.discountRate;
    return subtotal - discount;
  }

  checkout() {
    const total = this.getTotal();
    console.log(`Checking out. Total after discount: $${total.toFixed(2)}`);
    this.items = [];
    this.discountRate = 0;
    return total;
  }
}

// OrderProcessor uses the cart by telling it what to do
class OrderProcessor {
  processOrder(cart) {
    // Tell the cart to checkout (don't ask for its items and calculate yourself)
    const total = cart.checkout();
    console.log(`Order processed successfully. Amount: $${total.toFixed(2)}`);
    return {
      status: 'success',
      total: total
    };
  }
}

// Usage
const cart = new ShoppingCart();
const processor = new OrderProcessor();

// Client code tells objects what to do
cart.addItem(new Item('Laptop', 1200));
cart.addItem(new Item('Mouse', 25));
cart.applyDiscount(0.1); // 10% discount

// OrderProcessor tells the cart to checkout
processor.processOrder(cart);

// This demonstrates the Tell Don't Ask principle because:
// 1. The ShoppingCart encapsulates its behavior and data
// 2. Clients tell the cart what to do rather than asking for its state
// 3. The OrderProcessor tells the cart to checkout rather than asking for its items
// 4. Each object is responsible for its own behavior