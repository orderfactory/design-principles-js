/**
 * High Cohesion and Low Coupling (HCLC) Principle - Violation
 *
 * High Cohesion: Each module or class should have a single, well-defined responsibility
 * and all its methods should be strongly related to that responsibility.
 *
 * Low Coupling: Modules should have minimal dependencies on other modules, communicating
 * through well-defined interfaces rather than directly accessing each other's implementation details.
 *
 * This file demonstrates a violation of these principles by implementing an e-commerce system
 * with low cohesion (classes with multiple unrelated responsibilities) and high coupling
 * (tight dependencies between components).
 */

// Monolithic ECommerceSystem class that violates both high cohesion and low coupling
class ECommerceSystem {
  constructor() {
    // Mixing multiple concerns in a single class
    this.products = []; // Product data
    this.cartItems = []; // Shopping cart data
    this.orders = []; // Order data
    this.customers = []; // Customer data
    this.nextOrderId = 1000;
  }

  // PRODUCT MANAGEMENT - Low cohesion: unrelated responsibility in same class
  addProduct(id, name, price, description, stockLevel) {
    const product = {
      id,
      name,
      price,
      description,
      stockLevel,
      createdAt: new Date()
    };
    this.products.push(product);
    console.log(`Product added: ${name}`);
    return product;
  }

  updateProductStock(productId, newStockLevel) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.stockLevel = newStockLevel;
      console.log(`Updated stock for ${product.name} to ${newStockLevel}`);
    } else {
      console.error(`Product with ID ${productId} not found`);
    }
  }

  // SHOPPING CART - Low cohesion: another unrelated responsibility
  addToCart(productId, quantity = 1) {
    // High coupling: direct access to products array
    const product = this.products.find(p => p.id === productId);

    if (!product) {
      console.error(`Product with ID ${productId} not found`);
      return false;
    }

    if (product.stockLevel < quantity) {
      console.error(`Not enough stock for ${product.name}`);
      return false;
    }

    // Directly modifying product stock when adding to cart - tight coupling
    product.stockLevel -= quantity;

    const existingItem = this.cartItems.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        productId,
        productName: product.name, // Duplicating data - violation of DRY principle
        price: product.price,      // Duplicating data - violation of DRY principle
        quantity
      });
    }

    console.log(`Added ${quantity} ${product.name} to cart`);
    return true;
  }

  removeFromCart(productId) {
    const itemIndex = this.cartItems.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      console.error(`Product with ID ${productId} not in cart`);
      return false;
    }

    const item = this.cartItems[itemIndex];

    // High coupling: directly modifying product stock when removing from cart
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.stockLevel += item.quantity;
    }

    this.cartItems.splice(itemIndex, 1);
    console.log(`Removed ${item.productName} from cart`);
    return true;
  }

  getCartTotal() {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // CUSTOMER MANAGEMENT - Low cohesion: yet another unrelated responsibility
  registerCustomer(name, email, address, paymentInfo) {
    if (!email.includes('@')) {
      console.error('Invalid email address');
      return null;
    }

    const customer = {
      id: Date.now(),
      name,
      email,
      address,
      paymentInfo,
      registeredAt: new Date()
    };

    this.customers.push(customer);
    console.log(`Customer registered: ${name}`);

    // Mixing email functionality with customer registration - low cohesion
    this.sendWelcomeEmail(customer);

    return customer;
  }

  // EMAIL FUNCTIONALITY - Low cohesion: unrelated responsibility
  sendWelcomeEmail(customer) {
    console.log(`Sending welcome email to ${customer.email}`);
    console.log(`Subject: Welcome to our store, ${customer.name}!`);
    console.log('Body: Thank you for registering with our store...');
  }

  // ORDER PROCESSING - Low cohesion: another unrelated responsibility
  checkout(customerEmail) {
    if (this.cartItems.length === 0) {
      console.error('Cannot checkout with empty cart');
      return null;
    }

    // High coupling: direct access to customers array
    const customer = this.customers.find(c => c.email === customerEmail);
    if (!customer) {
      console.error(`Customer with email ${customerEmail} not found`);
      return null;
    }

    const orderTotal = this.getCartTotal();

    // Payment processing mixed with order creation - low cohesion
    const paymentResult = this.processPayment(customer, orderTotal);
    if (!paymentResult.success) {
      console.error(`Payment failed: ${paymentResult.message}`);
      return null;
    }

    const order = {
      id: this.nextOrderId++,
      customerEmail,
      items: [...this.cartItems], // Copying cart items to order
      total: orderTotal,
      paymentId: paymentResult.transactionId,
      date: new Date()
    };

    this.orders.push(order);

    // Mixing notification with order processing - low cohesion
    this.sendOrderConfirmation(customer, order);

    // Clear cart after order
    this.cartItems = [];

    console.log(`Order #${order.id} processed successfully`);
    return order;
  }

  // PAYMENT PROCESSING - Low cohesion: another unrelated responsibility
  processPayment(customer, amount) {
    console.log(`Processing payment of $${amount.toFixed(2)} for ${customer.name}`);

    // Simulate payment processing
    if (customer.paymentInfo && customer.paymentInfo.type === 'credit-card') {
      return {
        success: true,
        transactionId: `TX-${Date.now()}`,
        message: 'Payment processed successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid payment method'
      };
    }
  }

  // NOTIFICATION - Low cohesion: another unrelated responsibility
  sendOrderConfirmation(customer, order) {
    console.log(`Sending order confirmation to ${customer.email}`);
    console.log(`Order #${order.id} confirmation`);
    console.log(`Total: $${order.total.toFixed(2)}`);

    // High coupling: directly accessing product details from product IDs in order items
    console.log('Items:');
    order.items.forEach(item => {
      console.log(`- ${item.productName} x${item.quantity}`);
    });
  }

  // ORDER HISTORY - Low cohesion: another unrelated responsibility
  getCustomerOrders(customerEmail) {
    return this.orders.filter(order => order.customerEmail === customerEmail);
  }
}

// Usage example
const ecommerce = new ECommerceSystem();

// Add products
const laptop = ecommerce.addProduct(1, 'Laptop', 1299.99, 'Powerful laptop', 10);
const headphones = ecommerce.addProduct(2, 'Headphones', 99.99, 'Noise-cancelling headphones', 20);
const mouse = ecommerce.addProduct(3, 'Wireless Mouse', 29.99, 'Ergonomic mouse', 30);

// Register a customer
const customer = ecommerce.registerCustomer(
  'John Doe',
  'john@example.com',
  '123 Main St, Anytown, USA',
  { type: 'credit-card', number: '1234-5678-9012-3456', expiry: '12/25' }
);

// Add items to cart
ecommerce.addToCart(1); // Add laptop
ecommerce.addToCart(2, 2); // Add 2 headphones
ecommerce.addToCart(3); // Add mouse

// Process the order
const order = ecommerce.checkout('john@example.com');

// Get customer's order history
const orderHistory = ecommerce.getCustomerOrders('john@example.com');
console.log(`Customer has ${orderHistory.length} orders`);

/**
 * This violates High Cohesion and Low Coupling because:
 *
 * 1. Low Cohesion Violations:
 *    - The ECommerceSystem class has multiple unrelated responsibilities:
 *      - Product management
 *      - Shopping cart management
 *      - Customer management
 *      - Order processing
 *      - Payment processing
 *      - Email notifications
 *    - Methods within the class are not strongly related to a single responsibility
 *    - The class is large, complex, and difficult to understand
 *
 * 2. High Coupling Violations:
 *    - Components directly access and modify each other's data:
 *      - Cart operations directly modify product stock levels
 *      - Order processing directly accesses customer data
 *      - Notification directly accesses product and order details
 *    - Changes to one aspect (e.g., how products are stored) would require changes
 *      throughout the system
 *    - Components cannot be tested or reused independently
 *
 * 3. Problems with this approach:
 *    - Poor maintainability: Changes to one feature affect multiple parts of the code
 *    - Difficult testing: Cannot test components in isolation
 *    - Limited reusability: Cannot reuse individual components
 *    - Reduced flexibility: Cannot easily replace one component with another
 *    - Increased complexity: The class becomes a "god object" that knows everything
 *    - Harder collaboration: Multiple developers cannot work on different features
 *      without conflicts
 */