// Big Design Up Front (BDUF) Principle - Correct Implementation
// The BDUF principle advocates for comprehensive planning and design before any implementation begins.
// It involves creating detailed specifications, architecture, and design documents upfront.

// Example: A well-planned e-commerce system with clear architecture and interfaces defined upfront

// First, we define our domain models with clear interfaces
class Product {
  constructor(id, name, price, description, category) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.category = category;
  }
}

class User {
  constructor(id, name, email, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.address = address;
    this.cart = [];
  }

  addToCart(product, quantity = 1) {
    this.cart.push({ product, quantity });
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}

class Order {
  constructor(id, user, items, status = 'pending') {
    this.id = id;
    this.user = user;
    this.items = items;
    this.status = status;
    this.createdAt = new Date();
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  markAsShipped() {
    this.status = 'shipped';
  }

  markAsDelivered() {
    this.status = 'delivered';
  }
}

// Then, we define our service interfaces
class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  getProductById(id) {
    return this.productRepository.findById(id);
  }

  searchProducts(query) {
    return this.productRepository.search(query);
  }

  getProductsByCategory(category) {
    return this.productRepository.findByCategory(category);
  }
}

class OrderService {
  constructor(orderRepository, inventoryService, paymentService) {
    this.orderRepository = orderRepository;
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
  }

  createOrder(user, items) {
    // Check inventory
    for (const item of items) {
      if (!this.inventoryService.checkAvailability(item.product.id, item.quantity)) {
        throw new Error(`Product ${item.product.name} is not available in the requested quantity`);
      }
    }

    // Process payment
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const paymentResult = this.paymentService.processPayment(user, total);

    if (!paymentResult.success) {
      throw new Error(`Payment failed: ${paymentResult.message}`);
    }

    // Create order
    const order = new Order(Date.now().toString(), user, items);
    this.orderRepository.save(order);

    // Update inventory
    for (const item of items) {
      this.inventoryService.reduceStock(item.product.id, item.quantity);
    }

    return order;
  }

  getOrderById(id) {
    return this.orderRepository.findById(id);
  }

  getUserOrders(userId) {
    return this.orderRepository.findByUserId(userId);
  }
}

// Mock implementations of repositories and services for demonstration
class MockProductRepository {
  constructor() {
    this.products = [
      new Product('1', 'Laptop', 1200, 'Powerful laptop for developers', 'Electronics'),
      new Product('2', 'Smartphone', 800, 'Latest smartphone model', 'Electronics'),
      new Product('3', 'Headphones', 200, 'Noise-cancelling headphones', 'Audio')
    ];
  }

  findById(id) {
    return this.products.find(p => p.id === id);
  }

  search(query) {
    return this.products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  findByCategory(category) {
    return this.products.filter(p => p.category === category);
  }
}

class MockInventoryService {
  constructor() {
    this.inventory = {
      '1': 10,
      '2': 15,
      '3': 20
    };
  }

  checkAvailability(productId, quantity) {
    return this.inventory[productId] >= quantity;
  }

  reduceStock(productId, quantity) {
    this.inventory[productId] -= quantity;
  }
}

class MockPaymentService {
  processPayment(user, amount) {
    // Simulate payment processing
    console.log(`Processing payment of $${amount} for user ${user.name}`);
    return { success: true };
  }
}

class MockOrderRepository {
  constructor() {
    this.orders = [];
  }

  save(order) {
    this.orders.push(order);
    return order;
  }

  findById(id) {
    return this.orders.find(o => o.id === id);
  }

  findByUserId(userId) {
    return this.orders.filter(o => o.user.id === userId);
  }
}

// Usage example demonstrating the well-designed system
// Notice how all components are clearly defined and interact through well-defined interfaces
function demonstrateBDUF() {
  // Initialize our services with their dependencies
  const productRepository = new MockProductRepository();
  const inventoryService = new MockInventoryService();
  const paymentService = new MockPaymentService();
  const orderRepository = new MockOrderRepository();

  const productService = new ProductService(productRepository);
  const orderService = new OrderService(orderRepository, inventoryService, paymentService);

  // Create a user
  const user = new User('u1', 'John Doe', 'john@example.com', '123 Main St');

  // User searches for products
  const laptops = productService.searchProducts('laptop');
  console.log('Search results:', laptops.map(p => p.name));

  // User adds products to cart
  user.addToCart(laptops[0], 1);
  user.addToCart(productService.getProductById('3'), 2);
  console.log('Cart total:', user.getCartTotal());

  // User places an order
  try {
    const order = orderService.createOrder(user, user.cart);
    console.log('Order created:', order.id);
    console.log('Order total:', order.getTotal());

    // Later, the order is shipped
    order.markAsShipped();
    console.log('Order status:', order.status);
  } catch (error) {
    console.error('Error creating order:', error.message);
  }
}

// Run the demonstration
demonstrateBDUF();

/*
Key aspects of this BDUF implementation:

1. Comprehensive Domain Model: All entities (Product, User, Order) are fully defined upfront with their properties and behaviors.

2. Clear Service Interfaces: Services have well-defined responsibilities and interfaces, making the system modular and maintainable.

3. Dependency Injection: Services receive their dependencies through constructors, promoting loose coupling.

4. Error Handling: The system anticipates potential errors (inventory shortages, payment failures) and handles them appropriately.

5. Separation of Concerns: Each class has a single responsibility, making the system easier to understand and maintain.

This approach works well for stable domains where requirements are well-understood and unlikely to change significantly.
The upfront investment in design pays off in a coherent, maintainable system architecture.
*/