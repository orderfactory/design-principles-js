/**
 * Open/Closed Principle - Correct Implementation
 *
 * The Open/Closed Principle states that software entities (classes, modules, functions, etc.)
 * should be open for extension but closed for modification.
 *
 * In this example, we have a discount calculator system that follows the OCP.
 * We can add new customer types and their discount strategies without modifying existing code.
 */

// Base discount strategy class
class DiscountStrategy {
  calculateDiscount(order) {
    // This is an abstract method that should be implemented by subclasses
    throw new Error('Method calculateDiscount() must be implemented');
  }
}

// Regular customer discount strategy
class RegularCustomerDiscount extends DiscountStrategy {
  calculateDiscount(order) {
    return order.total * 0.01; // 1% discount for regular customers
  }
}

// Premium customer discount strategy
class PremiumCustomerDiscount extends DiscountStrategy {
  calculateDiscount(order) {
    return order.total * 0.10; // 10% discount for premium customers
  }
}

// VIP customer discount strategy
class VIPCustomerDiscount extends DiscountStrategy {
  calculateDiscount(order) {
    return order.total * 0.20; // 20% discount for VIP customers
  }
}

// Order class
class Order {
  constructor(customer, total) {
    this.customer = customer;
    this.total = total;
  }
}

// Discount calculator that follows OCP
class DiscountCalculator {
  constructor() {
    this.discountStrategies = new Map();
  }

  // Register a discount strategy for a customer type
  registerDiscountStrategy(customerType, discountStrategy) {
    this.discountStrategies.set(customerType, discountStrategy);
  }

  // Calculate discount for an order
  calculateDiscount(order) {
    const discountStrategy = this.discountStrategies.get(order.customer.type);

    if (!discountStrategy) {
      return 0; // No discount if no strategy is registered
    }

    return discountStrategy.calculateDiscount(order);
  }
}

// Customer class
class Customer {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

// Usage
const calculator = new DiscountCalculator();

// Register discount strategies
calculator.registerDiscountStrategy('regular', new RegularCustomerDiscount());
calculator.registerDiscountStrategy('premium', new PremiumCustomerDiscount());
calculator.registerDiscountStrategy('vip', new VIPCustomerDiscount());

// Create customers
const regularCustomer = new Customer('John', 'regular');
const premiumCustomer = new Customer('Alice', 'premium');
const vipCustomer = new Customer('Bob', 'vip');

// Create orders
const regularOrder = new Order(regularCustomer, 100);
const premiumOrder = new Order(premiumCustomer, 100);
const vipOrder = new Order(vipCustomer, 100);

// Calculate discounts
console.log(`Regular customer discount: $${calculator.calculateDiscount(regularOrder)}`); // $1
console.log(`Premium customer discount: $${calculator.calculateDiscount(premiumOrder)}`); // $10
console.log(`VIP customer discount: $${calculator.calculateDiscount(vipOrder)}`); // $20

// This demonstrates OCP because:
// 1. The DiscountCalculator class is closed for modification - we don't need to change its code
// 2. The system is open for extension - we can add new customer types and discount strategies
//    without modifying existing code, just by creating new strategy classes and registering them

// Example of extending the system with a new customer type without modifying existing code:
class GoldCustomerDiscount extends DiscountStrategy {
  calculateDiscount(order) {
    return order.total * 0.15; // 15% discount for gold customers
  }
}

// Register the new discount strategy
calculator.registerDiscountStrategy('gold', new GoldCustomerDiscount());

// Create a gold customer and order
const goldCustomer = new Customer('Emma', 'gold');
const goldOrder = new Order(goldCustomer, 100);

// Calculate discount for the new customer type
console.log(`Gold customer discount: $${calculator.calculateDiscount(goldOrder)}`); // $15