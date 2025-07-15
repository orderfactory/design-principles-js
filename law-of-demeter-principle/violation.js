/**
 * Law of Demeter (LoD) - Violation Example
 *
 * This example demonstrates a violation of the Law of Demeter where objects
 * directly interact with the internal components of other objects, creating
 * tight coupling and dependencies on the internal structure of other classes.
 *
 * The Law of Demeter is violated when an object accesses the internal components
 * of another object and then calls methods on those components ("talking to strangers").
 */

// Customer class represents a person with an address and payment information
class Customer {
  constructor(name) {
    this.name = name;
    this.wallet = new Wallet(100); // Customer has a wallet
    this.address = new Address("123 Main St", "Anytown", "12345");
  }

  getName() {
    return this.name;
  }

  // Exposes internal components directly
  getWallet() {
    return this.wallet;
  }

  // Exposes internal components directly
  getAddress() {
    return this.address;
  }
}

// Wallet class manages a customer's money
class Wallet {
  constructor(initialAmount) {
    this.amount = initialAmount;
  }

  removeMoney(amountToRemove) {
    if (amountToRemove <= this.amount) {
      this.amount -= amountToRemove;
      return true;
    }
    return false;
  }

  getBalance() {
    return this.amount;
  }
}

// Address class manages address information
class Address {
  constructor(street, city, zipCode) {
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
  }

  getStreet() {
    return this.street;
  }

  getCity() {
    return this.city;
  }

  getZipCode() {
    return this.zipCode;
  }
}

// OrderProcessor processes customer orders
class OrderProcessor {
  processOrder(customer, order) {
    console.log(`Processing order for ${customer.getName()}`);

    // Violation: Directly accessing customer's address object and its internal properties
    const address = customer.getAddress();
    console.log(`Shipping to: ${address.getStreet()}, ${address.getCity()}, ${address.getZipCode()}`);

    const totalAmount = order.calculateTotal();
    console.log(`Order total: $${totalAmount.toFixed(2)}`);

    // Violation: Directly accessing customer's wallet and manipulating it
    const wallet = customer.getWallet();
    if (wallet.getBalance() >= totalAmount) {
      wallet.removeMoney(totalAmount);
      console.log("Payment successful");
      order.setStatus("Paid");
      return true;
    } else {
      console.log("Payment failed");
      order.setStatus("Payment Failed");
      return false;
    }
  }
}

// Order class represents a customer order
class Order {
  constructor(items = []) {
    this.items = items;
    this.status = "New";
  }

  addItem(item) {
    this.items.push(item);
  }

  calculateTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  setStatus(status) {
    this.status = status;
  }

  getStatus() {
    return this.status;
  }
}

// Item class represents a product in an order
class Item {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

// Usage
const customer = new Customer("John Doe");
const order = new Order();
order.addItem(new Item("Book", 15.99));
order.addItem(new Item("Coffee Mug", 8.99));

const processor = new OrderProcessor();
processor.processOrder(customer, order);

console.log(`Order status: ${order.getStatus()}`);

// This violates the Law of Demeter because:
// 1. OrderProcessor directly accesses the customer's wallet and address objects
// 2. OrderProcessor calls methods on these internal components of the customer
// 3. OrderProcessor knows too much about the internal structure of the Customer class
// 4. Changes to the Customer, Wallet, or Address classes would likely require changes to OrderProcessor
// 5. This creates tight coupling between classes, making the system harder to maintain and modify