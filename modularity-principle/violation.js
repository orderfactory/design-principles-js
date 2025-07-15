/**
 * Modularity Principle - Violation
 *
 * Modularity is the practice of organizing code into separate, independent modules with clear interfaces.
 * Each module should have a single responsibility and minimal dependencies on other modules.
 *
 * This file demonstrates a violation of modularity by creating a monolithic application
 * where code is not properly separated into modules, leading to tight coupling,
 * low cohesion, and difficulty in maintenance and testing.
 */

// A monolithic e-commerce application with poor modularity
const ECommerceApp = {
  // Data - All application data mixed together
  products: [
    { id: 1, name: 'Laptop', price: 999.99, stock: 15 },
    { id: 2, name: 'Smartphone', price: 699.99, stock: 25 },
    { id: 3, name: 'Headphones', price: 149.99, stock: 30 }
  ],

  cartItems: [],

  orders: [],
  nextOrderId: 1000,

  // Product-related functions
  getAllProducts: function() {
    return this.products;
  },

  getProductById: function(id) {
    return this.products.find(p => p.id === id);
  },

  // Cart-related functions
  addToCart: function(productId, quantity = 1) {
    const product = this.getProductById(productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const existingItemIndex = this.cartItems.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      this.cartItems[existingItemIndex].quantity += quantity;
    } else {
      this.cartItems.push({
        productId,
        name: product.name,
        price: product.price,
        quantity
      });
    }

    return this.cartItems;
  },

  removeFromCart: function(productId) {
    const index = this.cartItems.findIndex(item => item.productId === productId);

    if (index >= 0) {
      this.cartItems.splice(index, 1);
    }

    return this.cartItems;
  },

  getCartTotal: function() {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  clearCart: function() {
    this.cartItems = [];
    return this.cartItems;
  },

  // Order-related functions
  createOrder: function(customerInfo) {
    // Validate customer info
    if (!customerInfo || !customerInfo.name || !customerInfo.address) {
      throw new Error('Customer information is incomplete');
    }

    if (this.cartItems.length === 0) {
      throw new Error('Cannot create order with empty cart');
    }

    // Update inventory and check stock
    for (const item of this.cartItems) {
      const product = this.getProductById(item.productId);

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      product.stock -= item.quantity;
    }

    // Create order
    const order = {
      id: this.nextOrderId++,
      customer: customerInfo,
      items: [...this.cartItems],
      total: this.getCartTotal(),
      date: new Date()
    };

    this.orders.push(order);

    // Clear cart after successful order
    this.clearCart();

    return order;
  },

  getOrderById: function(orderId) {
    return this.orders.find(o => o.id === orderId);
  },

  getAllOrders: function() {
    return this.orders;
  },

  // UI-related functions
  displayProducts: function() {
    console.log('Available Products:');
    this.products.forEach(product => {
      console.log(`${product.name}: $${product.price} (${product.stock} in stock)`);
    });
  },

  displayCart: function() {
    console.log('\nCart Contents:');
    if (this.cartItems.length === 0) {
      console.log('Cart is empty');
      return;
    }

    this.cartItems.forEach(item => {
      console.log(`${item.name} x${item.quantity}: $${item.price * item.quantity}`);
    });
    console.log(`Total: $${this.getCartTotal()}`);
  },

  displayOrder: function(order) {
    console.log('\nOrder Details:');
    console.log(`Order ID: ${order.id}`);
    console.log(`Customer: ${order.customer.name}`);
    console.log(`Total: $${order.total}`);
    console.log(`Date: ${order.date}`);
  }
};

// Usage example
try {
  // Display products
  ECommerceApp.displayProducts();

  // Add items to cart
  console.log('\nAdding items to cart...');
  ECommerceApp.addToCart(1, 2); // Add 2 laptops
  ECommerceApp.addToCart(3, 1); // Add 1 headphones

  // Display cart
  ECommerceApp.displayCart();

  // Create an order
  const order = ECommerceApp.createOrder({
    name: 'John Doe',
    address: '123 Main St, Anytown, USA',
    email: 'john@example.com'
  });

  // Display order
  ECommerceApp.displayOrder(order);

  // Check updated inventory
  console.log('\nUpdated Inventory:');
  ECommerceApp.getAllProducts().forEach(product => {
    console.log(`${product.name}: ${product.stock} in stock`);
  });

  // PROBLEM: Direct manipulation of internal data
  console.log('\nDirect manipulation of data:');

  // Directly modify product data
  ECommerceApp.products[0].price = 899.99;
  console.log(`Modified laptop price: $${ECommerceApp.products[0].price}`);

  // Directly add an order without proper validation
  ECommerceApp.orders.push({
    id: 9999,
    customer: { name: 'Fake Customer' },
    items: [{ name: 'Fake Item', price: 0.01, quantity: 1 }],
    total: 0.01,
    date: new Date()
  });
  console.log(`Added fake order: ${ECommerceApp.orders[ECommerceApp.orders.length - 1].id}`);

} catch (error) {
  console.error(`Error: ${error.message}`);
}

/**
 * This violates Modularity because:
 *
 * 1. No Separation of Concerns:
 *    - All functionality (products, cart, orders, UI) is mixed together in one object
 *    - There are no clear boundaries between different parts of the application
 *
 * 2. No Information Hiding:
 *    - All data is directly accessible and modifiable (products, cartItems, orders)
 *    - No private variables or methods to protect internal implementation
 *
 * 3. Tight Coupling:
 *    - All functions directly access and modify shared state
 *    - Changes to one part of the code can easily break other parts
 *
 * 4. Low Cohesion:
 *    - The ECommerceApp object handles too many responsibilities
 *    - Functions that should be grouped by functionality are mixed together
 *
 * 5. Problems Demonstrated:
 *    - Direct manipulation of internal data structures is possible
 *    - No protection against invalid state changes
 *    - Difficult to test individual components in isolation
 *    - Hard to maintain as the application grows
 *    - Difficult for multiple developers to work on different parts simultaneously
 */