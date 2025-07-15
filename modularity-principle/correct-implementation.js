/**
 * Modularity Principle - Correct Implementation
 *
 * Modularity is the practice of organizing code into separate, independent modules with clear interfaces.
 * Each module should have a single responsibility and minimal dependencies on other modules.
 *
 * Benefits of modularity:
 * 1. Maintainability: Easier to understand and modify isolated modules
 * 2. Reusability: Well-defined modules can be reused in different contexts
 * 3. Testability: Isolated modules are easier to test
 * 4. Scalability: Teams can work on different modules in parallel
 *
 * In this example, we create a simple e-commerce application with properly modularized components.
 * Each module has a clear responsibility and communicates through well-defined interfaces.
 */

// Product Module - Handles product-related functionality
const ProductModule = (function() {
  // Private data
  const products = [
    { id: 1, name: 'Laptop', price: 999.99, stock: 15 },
    { id: 2, name: 'Smartphone', price: 699.99, stock: 25 },
    { id: 3, name: 'Headphones', price: 149.99, stock: 30 }
  ];

  // Public API
  return {
    getAllProducts: function() {
      return [...products]; // Return a copy to prevent external modification
    },

    getProductById: function(id) {
      const product = products.find(p => p.id === id);
      return product ? {...product} : null; // Return a copy if found
    },

    updateStock: function(id, quantity) {
      const product = products.find(p => p.id === id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      product.stock -= quantity;
      return {...product}; // Return updated product copy
    }
  };
})();

// Cart Module - Handles shopping cart functionality
const CartModule = (function() {
  // Private data
  const items = [];

  // Private methods
  function findItemIndex(productId) {
    return items.findIndex(item => item.productId === productId);
  }

  // Public API
  return {
    addItem: function(productId, quantity = 1) {
      const product = ProductModule.getProductById(productId);

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const existingItemIndex = findItemIndex(productId);

      if (existingItemIndex >= 0) {
        // Update existing item
        items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        items.push({
          productId,
          name: product.name,
          price: product.price,
          quantity
        });
      }

      return this.getItems();
    },

    removeItem: function(productId) {
      const index = findItemIndex(productId);

      if (index >= 0) {
        items.splice(index, 1);
      }

      return this.getItems();
    },

    getItems: function() {
      return [...items]; // Return a copy
    },

    getTotal: function() {
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    clear: function() {
      items.length = 0;
      return [];
    }
  };
})();

// Order Module - Handles order processing
const OrderModule = (function() {
  // Private data
  const orders = [];
  let nextOrderId = 1000;

  // Public API
  return {
    createOrder: function(customerInfo) {
      // Validate customer info
      if (!customerInfo || !customerInfo.name || !customerInfo.address) {
        throw new Error('Customer information is incomplete');
      }

      // Get cart items
      const items = CartModule.getItems();

      if (items.length === 0) {
        throw new Error('Cannot create order with empty cart');
      }

      // Process inventory
      try {
        items.forEach(item => {
          ProductModule.updateStock(item.productId, item.quantity);
        });
      } catch (error) {
        throw new Error(`Order failed: ${error.message}`);
      }

      // Create order
      const order = {
        id: nextOrderId++,
        customer: {...customerInfo},
        items: [...items],
        total: CartModule.getTotal(),
        date: new Date()
      };

      orders.push(order);

      // Clear cart after successful order
      CartModule.clear();

      return {...order}; // Return a copy
    },

    getOrderById: function(orderId) {
      const order = orders.find(o => o.id === orderId);
      return order ? {...order} : null;
    },

    getAllOrders: function() {
      return orders.map(order => ({...order}));
    }
  };
})();

// Usage example
try {
  // Display available products
  console.log('Available Products:');
  ProductModule.getAllProducts().forEach(product => {
    console.log(`${product.name}: $${product.price} (${product.stock} in stock)`);
  });

  // Add items to cart
  console.log('\nAdding items to cart...');
  CartModule.addItem(1, 2); // Add 2 laptops
  CartModule.addItem(3, 1); // Add 1 headphones

  // Display cart
  console.log('\nCart Contents:');
  CartModule.getItems().forEach(item => {
    console.log(`${item.name} x${item.quantity}: $${item.price * item.quantity}`);
  });
  console.log(`Total: $${CartModule.getTotal()}`);

  // Create an order
  const order = OrderModule.createOrder({
    name: 'John Doe',
    address: '123 Main St, Anytown, USA',
    email: 'john@example.com'
  });

  console.log('\nOrder created successfully:');
  console.log(`Order ID: ${order.id}`);
  console.log(`Customer: ${order.customer.name}`);
  console.log(`Total: $${order.total}`);
  console.log(`Date: ${order.date}`);

  // Check updated inventory
  console.log('\nUpdated Inventory:');
  ProductModule.getAllProducts().forEach(product => {
    console.log(`${product.name}: ${product.stock} in stock`);
  });

} catch (error) {
  console.error(`Error: ${error.message}`);
}

/**
 * This demonstrates proper Modularity because:
 *
 * 1. Separation of Concerns:
 *    - ProductModule handles product data and inventory
 *    - CartModule manages shopping cart operations
 *    - OrderModule handles order creation and management
 *    - Each module has a single, well-defined responsibility
 *
 * 2. Information Hiding:
 *    - Each module uses an IIFE (Immediately Invoked Function Expression) to create private scope
 *    - Internal data structures (products, items, orders) are not directly accessible
 *    - Modules only expose a public API with well-defined methods
 *
 * 3. Loose Coupling:
 *    - Modules interact through their public interfaces only
 *    - Changes to a module's internal implementation won't affect other modules
 *    - Each module can be tested independently
 *
 * 4. High Cohesion:
 *    - Related functionality is grouped together within each module
 *    - Each module contains everything needed for its specific responsibility
 *
 * 5. Clear Dependencies:
 *    - Dependencies between modules are explicit and minimal
 *    - OrderModule depends on CartModule and ProductModule
 *    - CartModule depends on ProductModule
 */