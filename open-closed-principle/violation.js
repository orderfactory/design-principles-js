/**
 * Open/Closed Principle - Violation Example
 *
 * This example demonstrates a violation of the Open/Closed Principle
 * where adding new customer types requires modifying existing code.
 *
 * The problem occurs because the discount calculation logic is directly embedded
 * in the DiscountCalculator class, making it necessary to modify this class
 * whenever a new customer type is added.
 */

// Order class
class Order {
  constructor(customer, total) {
    this.customer = customer;
    this.total = total;
  }
}

// Customer class
class Customer {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

// Discount calculator that violates OCP
class DiscountCalculator {
  calculateDiscount(order) {
    // This method violates OCP because it contains all discount logic
    // Adding a new customer type requires modifying this method

    const customerType = order.customer.type;

    // Hard-coded discount logic for each customer type
    if (customerType === 'regular') {
      return order.total * 0.01; // 1% discount for regular customers
    }
    else if (customerType === 'premium') {
      return order.total * 0.10; // 10% discount for premium customers
    }
    else if (customerType === 'vip') {
      return order.total * 0.20; // 20% discount for VIP customers
    }

    return 0; // No discount for unknown customer types
  }
}

// Usage
const calculator = new DiscountCalculator();

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

// This demonstrates a violation of OCP because:
// 1. To add a new customer type (e.g., 'gold'), we must modify the DiscountCalculator class
// 2. Specifically, we need to add another if-else branch to the calculateDiscount method
// 3. This modification risks introducing bugs in existing functionality

// Example of how we would need to modify the DiscountCalculator class to add a new customer type:

/*
class DiscountCalculator {
  calculateDiscount(order) {
    const customerType = order.customer.type;

    if (customerType === 'regular') {
      return order.total * 0.01;
    }
    else if (customerType === 'premium') {
      return order.total * 0.10;
    }
    else if (customerType === 'vip') {
      return order.total * 0.20;
    }
    // New code added - violates OCP because we modified existing code
    else if (customerType === 'gold') {
      return order.total * 0.15; // 15% discount for gold customers
    }

    return 0;
  }
}
*/

// Let's try to use a gold customer with the current implementation
const goldCustomer = new Customer('Emma', 'gold');
const goldOrder = new Order(goldCustomer, 100);

// This will return 0 because our calculator doesn't know about 'gold' customers
console.log(`Gold customer discount: $${calculator.calculateDiscount(goldOrder)}`); // $0