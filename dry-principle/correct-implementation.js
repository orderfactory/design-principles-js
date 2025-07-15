/**
 * Don't Repeat Yourself (DRY) Principle - Correct Implementation
 *
 * The DRY principle states that "Every piece of knowledge must have a single, unambiguous,
 * authoritative representation within a system." This means avoiding duplication of code and logic.
 *
 * This file demonstrates a correct implementation of the DRY principle by ensuring
 * that each piece of logic exists in only one place, making the code more maintainable and less prone to errors.
 */

// An e-commerce application that follows DRY by centralizing calculation logic
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountCode = null;
    this.taxRate = 0.1; // Default tax rate
  }

  addItem(product, quantity, price) {
    this.items.push({ product, quantity, price });
  }

  // Single source of truth for subtotal calculation
  calculateSubtotal() {
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.quantity * item.price;
    }
    return subtotal;
  }

  // Uses calculateSubtotal instead of repeating the logic
  calculateTax() {
    return this.calculateSubtotal() * this.taxRate;
  }

  // Single source of truth for discount calculation
  getDiscountRate(code) {
    const discountRates = {
      'SAVE10': 0.1,
      'SAVE20': 0.2,
      'SAVE30': 0.3
    };

    return discountRates[code] || 0;
  }

  // Uses calculateSubtotal and getDiscountRate instead of repeating logic
  applyDiscount(discountCode) {
    this.discountCode = discountCode;
    const discountRate = this.getDiscountRate(discountCode);
    return this.calculateSubtotal() * discountRate;
  }

  // Single source of truth for weight calculation
  calculateTotalWeight() {
    let totalWeight = 0;
    for (const item of this.items) {
      // Assuming each product has a weight of quantity * 0.5 kg
      totalWeight += item.quantity * 0.5;
    }
    return totalWeight;
  }

  // Uses calculateTotalWeight instead of repeating the logic
  calculateShippingCost() {
    const totalWeight = this.calculateTotalWeight();

    // Shipping cost based on weight
    if (totalWeight < 1) {
      return 5.99;
    } else if (totalWeight < 5) {
      return 9.99;
    } else if (totalWeight < 20) {
      return 19.99;
    } else {
      return 39.99;
    }
  }

  // Uses calculateTotalWeight instead of repeating the logic
  estimateDeliveryDate() {
    const totalWeight = this.calculateTotalWeight();

    // Delivery time based on weight
    let deliveryDays;
    if (totalWeight < 1) {
      deliveryDays = 1;
    } else if (totalWeight < 5) {
      deliveryDays = 2;
    } else if (totalWeight < 20) {
      deliveryDays = 3;
    } else {
      deliveryDays = 5;
    }

    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryDays);

    return deliveryDate;
  }

  // Uses existing methods instead of repeating calculations
  generateOrderSummary() {
    const subtotal = this.calculateSubtotal();
    const discountAmount = this.discountCode ? this.applyDiscount(this.discountCode) : 0;
    const tax = this.calculateTax();
    const shippingCost = this.calculateShippingCost();
    const total = subtotal - discountAmount + tax + shippingCost;

    return {
      items: this.items,
      subtotal: subtotal,
      discount: discountAmount,
      tax: tax,
      shipping: shippingCost,
      total: total
    };
  }
}

// Usage example
const cart = new ShoppingCart();
cart.addItem('Laptop', 1, 999.99);
cart.addItem('Mouse', 2, 24.99);
cart.addItem('Keyboard', 1, 59.99);

console.log(`Subtotal: $${cart.calculateSubtotal().toFixed(2)}`);
console.log(`Tax: $${cart.calculateTax().toFixed(2)}`);
console.log(`Discount: $${cart.applyDiscount('SAVE20').toFixed(2)}`);
console.log(`Shipping: $${cart.calculateShippingCost().toFixed(2)}`);
console.log(`Estimated Delivery: ${cart.estimateDeliveryDate().toDateString()}`);

const summary = cart.generateOrderSummary();
console.log('Order Summary:', summary);

/**
 * This follows DRY because:
 * 1. The subtotal calculation exists in only one place (calculateSubtotal method)
 * 2. The weight calculation exists in only one place (calculateTotalWeight method)
 * 3. The discount rate logic is centralized in the getDiscountRate method
 * 4. Each method uses other methods instead of repeating their logic
 * 5. The generateOrderSummary method reuses existing methods instead of duplicating calculations
 *
 * Benefits of this approach:
 * - Easier to maintain (changes only need to be made in one place)
 * - Less prone to errors (no risk of updating logic in one place but not others)
 * - More readable and concise code
 * - Easier to test (can test each piece of logic independently)
 * - More flexible (e.g., changing the tax rate only requires updating one property)
 */