// Big Design Up Front (BDUF) Principle - Violation
// This file demonstrates a violation of the BDUF principle by showing an implementation
// that lacks upfront planning and design, resulting in a system that evolves haphazardly.

// Example: An e-commerce system that grows organically without proper planning

// Initial implementation: Just a simple product listing
let products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Smartphone', price: 800 },
  { id: 3, name: 'Headphones', price: 200 }
];

// Function to display products
function displayProducts() {
  console.log('Available Products:');
  products.forEach(product => {
    console.log(`${product.id}. ${product.name} - $${product.price}`);
  });
}

// Later, we need to add a shopping cart feature
// But we didn't plan for this initially, so we just add it ad-hoc
let cart = [];

function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (product) {
    // We didn't plan for quantities initially, so we just push multiple items
    for (let i = 0; i < quantity; i++) {
      cart.push(product);
    }
    console.log(`Added ${quantity} ${product.name} to cart`);
  } else {
    console.log('Product not found');
  }
}

function displayCart() {
  console.log('Shopping Cart:');
  // Since we didn't plan for quantities, we need to count items manually
  const itemCounts = {};
  cart.forEach(item => {
    itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
  });

  let total = 0;
  Object.keys(itemCounts).forEach(id => {
    const product = products.find(p => p.id === parseInt(id));
    const quantity = itemCounts[id];
    const subtotal = product.price * quantity;
    console.log(`${product.name} x ${quantity} - $${subtotal}`);
    total += subtotal;
  });

  console.log(`Total: $${total}`);
}

// Now we need to add user accounts - another ad-hoc addition
let users = [];
let currentUser = null;

function createUser(name, email) {
  // We didn't plan for user IDs, so we just use the array length
  const user = {
    id: users.length + 1,
    name,
    email,
    // We didn't anticipate that users would need their own carts
    // So we don't have a proper data structure for this
  };
  users.push(user);
  console.log(`User created: ${name}`);
  return user;
}

function login(email) {
  currentUser = users.find(u => u.email === email);
  if (currentUser) {
    console.log(`Logged in as ${currentUser.name}`);
    // We didn't plan for user-specific carts, so we just clear the global cart
    cart = [];
  } else {
    console.log('User not found');
  }
}

// Now we need to add order processing - yet another ad-hoc addition
let orders = [];

function placeOrder() {
  if (!currentUser) {
    console.log('Please log in to place an order');
    return;
  }

  if (cart.length === 0) {
    console.log('Your cart is empty');
    return;
  }

  // We didn't plan for order structure, so we create it on the fly
  const order = {
    id: orders.length + 1,
    userId: currentUser.id,
    items: [...cart], // Just a copy of the cart items without proper structure
    total: cart.reduce((sum, item) => sum + item.price, 0),
    status: 'pending',
    createdAt: new Date()
  };

  orders.push(order);
  console.log(`Order placed: #${order.id}`);

  // Clear the cart after order
  cart = [];

  return order;
}

// Oh wait, we need inventory management now
// But we didn't plan for this, so we add it as an afterthought
let inventory = {
  1: 10, // 10 laptops
  2: 15, // 15 smartphones
  3: 20  // 20 headphones
};

// We need to modify addToCart to check inventory
// But this breaks our existing implementation
function addToCartWithInventoryCheck(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.log('Product not found');
    return;
  }

  // Check inventory
  if (inventory[productId] < quantity) {
    console.log(`Sorry, only ${inventory[productId]} ${product.name} available`);
    return;
  }

  // Update inventory
  inventory[productId] -= quantity;

  // Add to cart
  for (let i = 0; i < quantity; i++) {
    cart.push(product);
  }

  console.log(`Added ${quantity} ${product.name} to cart`);
}

// But now we realize we need to update placeOrder too
// Since we're not actually checking inventory there
function placeOrderWithInventoryCheck() {
  if (!currentUser) {
    console.log('Please log in to place an order');
    return;
  }

  if (cart.length === 0) {
    console.log('Your cart is empty');
    return;
  }

  // We need to count items and check inventory again
  // Duplicating logic from displayCart
  const itemCounts = {};
  cart.forEach(item => {
    itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
  });

  // Check inventory again (duplicating logic from addToCartWithInventoryCheck)
  let inventoryOk = true;
  Object.keys(itemCounts).forEach(id => {
    const numericId = parseInt(id);
    if (inventory[numericId] < itemCounts[id]) {
      const product = products.find(p => p.id === numericId);
      console.log(`Sorry, only ${inventory[numericId]} ${product.name} available`);
      inventoryOk = false;
    }
  });

  if (!inventoryOk) {
    return;
  }

  // Create order (duplicating logic from placeOrder)
  const order = {
    id: orders.length + 1,
    userId: currentUser.id,
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price, 0),
    status: 'pending',
    createdAt: new Date()
  };

  orders.push(order);
  console.log(`Order placed: #${order.id}`);

  // Clear the cart after order
  cart = [];

  return order;
}

// Now we need to add payment processing
// But our system wasn't designed with this in mind
function processPayment(orderId, paymentMethod) {
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    console.log('Order not found');
    return;
  }

  // We didn't plan for different payment methods
  if (paymentMethod === 'credit') {
    console.log(`Processing credit card payment of $${order.total}`);
    order.status = 'paid';
  } else if (paymentMethod === 'paypal') {
    console.log(`Processing PayPal payment of $${order.total}`);
    order.status = 'paid';
  } else {
    console.log('Unsupported payment method');
  }
}

// Usage example demonstrating the poorly designed system
function demonstrateViolation() {
  // Display products
  displayProducts();

  // Create a user
  const user = createUser('John Doe', 'john@example.com');
  login('john@example.com');

  // Add products to cart
  // We have two different functions for adding to cart now!
  addToCart(1); // This doesn't check inventory
  addToCartWithInventoryCheck(3, 2); // This does check inventory

  // Display cart
  displayCart();

  // Place order
  // We have two different functions for placing orders now!
  const order = placeOrderWithInventoryCheck(); // This checks inventory

  // Process payment
  if (order) {
    processPayment(order.id, 'credit');
  }
}

// Run the demonstration
demonstrateViolation();

/*
Key problems with this implementation that violate BDUF:

1. Ad-hoc Development: Features are added as needed without considering the overall system design,
   resulting in duplicate code and inconsistent interfaces.

2. Lack of Data Modeling: Data structures evolve haphazardly, leading to inefficient representations
   (e.g., storing individual cart items instead of quantities).

3. Function Proliferation: Multiple functions with similar purposes (addToCart vs. addToCartWithInventoryCheck)
   as requirements change.

4. Inconsistent Error Handling: Error handling is added inconsistently as new edge cases are discovered.

5. No Separation of Concerns: Business logic, data access, and presentation are mixed together.

6. Global State: Heavy reliance on global variables (products, cart, users, etc.) makes the code hard to test and maintain.

7. No Interfaces or Abstractions: Direct manipulation of data structures makes it difficult to change implementations.

This approach might seem faster initially but leads to technical debt, bugs, and maintenance challenges as the system grows.
Each new feature becomes increasingly difficult to implement as developers must understand and work around the existing
haphazard structure.
*/