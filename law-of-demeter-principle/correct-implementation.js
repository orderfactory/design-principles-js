/**
 * Law of Demeter (LoD) - Correct Implementation
 *
 * The Law of Demeter (LoD), also known as the "Principle of Least Knowledge" or
 * "Don't Talk to Strangers," states that an object should only interact with its
 * immediate collaborators and not with the "neighbors of neighbors."
 *
 * In this example, we demonstrate proper adherence to the Law of Demeter by ensuring
 * that objects only call methods on:
 * 1. The object itself
 * 2. Objects passed as parameters
 * 3. Objects created within the method
 * 4. Direct component objects
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

  getAddress() {
    return this.address.getFormattedAddress(); // Returns formatted address, not the address object
  }

  makePayment(amount) {
    // Customer handles the interaction with their wallet
    return this.wallet.removeMoney(amount);
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

  getFormattedAddress() {
    return `${this.street}, ${this.city}, ${this.zipCode}`;
  }
}

// OrderProcessor processes customer orders
class OrderProcessor {
  processOrder(customer, order) {
    console.log(`Processing order for ${customer.getName()}`);
    console.log(`Shipping to: ${customer.getAddress()}`);

    const totalAmount = order.calculateTotal();
    console.log(`Order total: $${totalAmount.toFixed(2)}`);

    // Ask the customer to make the payment (not directly accessing the customer's wallet)
    if (customer.makePayment(totalAmount)) {
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

// This demonstrates the Law of Demeter because:
// 1. OrderProcessor only interacts with the customer and order objects passed to it
// 2. OrderProcessor asks the customer to make a payment rather than accessing the wallet directly
// 3. Customer encapsulates the interaction with its wallet
// 4. Each object only knows about its immediate collaborators