/**
 * Don't Repeat Yourself (DRY) Principle - Violation
 *
 * The DRY principle states that "Every piece of knowledge must have a single, unambiguous,
 * authoritative representation within a system." This means avoiding duplication of code and logic.
 *
 * This file demonstrates a violation of the DRY principle by repeating the same logic
 * in multiple places, leading to code that is harder to maintain and more prone to errors.
 */

// An e-commerce application that violates DRY by repeating calculation logic
class ShoppingCartViolation {
  constructor() {
    this.items = [];
    this.discountCode = null;
  }

  addItem(product, quantity, price) {
    this.items.push({ product, quantity, price });
  }

  // Calculates subtotal - logic repeated in multiple methods
  calculateSubtotal() {
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.quantity * item.price;
    }
    return subtotal;
  }

  // Calculates tax - repeats the subtotal calculation logic
  calculateTax(taxRate = 0.1) {
    // Repeating the subtotal calculation
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.quantity * item.price;
    }

    return subtotal * taxRate;
  }

  // Applies discount - repeats the subtotal calculation logic again
  applyDiscount(discountCode) {
    this.discountCode = discountCode;

    // Repeating the subtotal calculation
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.quantity * item.price;
    }

    let discountAmount = 0;

    // Discount logic with repeated code for each discount type
    if (discountCode === 'SAVE10') {
      discountAmount = subtotal * 0.1;
    } else if (discountCode === 'SAVE20') {
      discountAmount = subtotal * 0.2;
    } else if (discountCode === 'SAVE30') {
      discountAmount = subtotal * 0.3;
    }

    return discountAmount;
  }

  // Calculates shipping - repeats weight calculation logic
  calculateShippingCost() {
    // Calculate total weight - repeated in estimateDeliveryDate
    let totalWeight = 0;
    for (const item of this.items) {
      // Assuming each product has a weight of quantity * 0.5 kg
      totalWeight += item.quantity * 0.5;
    }

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

  // Estimates delivery date - repeats weight calculation logic
  estimateDeliveryDate() {
    // Calculate total weight again - duplicated from calculateShippingCost
    let totalWeight = 0;
    for (const item of this.items) {
      // Assuming each product has a weight of quantity * 0.5 kg
      totalWeight += item.quantity * 0.5;
    }

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

  // Generates order summary - repeats all calculations
  generateOrderSummary() {
    // Repeating all calculations instead of reusing existing methods
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.quantity * item.price;
    }

    let discountAmount = 0;
    if (this.discountCode) {
      // Repeating discount logic
      if (this.discountCode === 'SAVE10') {
        discountAmount = subtotal * 0.1;
      } else if (this.discountCode === 'SAVE20') {
        discountAmount = subtotal * 0.2;
      } else if (this.discountCode === 'SAVE30') {
        discountAmount = subtotal * 0.3;
      }
    }

    // Repeating tax calculation
    const tax = subtotal * 0.1;

    // Repeating shipping calculation
    let totalWeight = 0;
    for (const item of this.items) {
      totalWeight += item.quantity * 0.5;
    }

    let shippingCost;
    if (totalWeight < 1) {
      shippingCost = 5.99;
    } else if (totalWeight < 5) {
      shippingCost = 9.99;
    } else if (totalWeight < 20) {
      shippingCost = 19.99;
    } else {
      shippingCost = 39.99;
    }

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
const cart = new ShoppingCartViolation();
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
 * This violates DRY because:
 * 1. The subtotal calculation logic is repeated in multiple methods (calculateSubtotal, calculateTax, applyDiscount, generateOrderSummary)
 * 2. The weight calculation logic is duplicated in calculateShippingCost and estimateDeliveryDate
 * 3. The discount logic is repeated in applyDiscount and generateOrderSummary
 * 4. The shipping cost calculation is duplicated in calculateShippingCost and generateOrderSummary
 *
 * This repetition makes the code:
 * - Harder to maintain (changes need to be made in multiple places)
 * - More prone to errors (if logic is updated in one place but not others)
 * - Less readable and more verbose
 * - More difficult to test
 */