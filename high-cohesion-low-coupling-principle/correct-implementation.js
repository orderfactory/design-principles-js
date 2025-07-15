/**
 * High Cohesion and Low Coupling (HCLC) Principle - Correct Implementation
 *
 * High Cohesion: Each module or class should have a single, well-defined responsibility
 * and all its methods should be strongly related to that responsibility.
 *
 * Low Coupling: Modules should have minimal dependencies on other modules, communicating
 * through well-defined interfaces rather than directly accessing each other's implementation details.
 *
 * In this example, we create an e-commerce order processing system with:
 * 1. Product - Responsible for product information
 * 2. ShoppingCart - Responsible for managing cart items
 * 3. OrderProcessor - Responsible for processing orders
 * 4. PaymentService - Responsible for payment processing
 * 5. NotificationService - Responsible for sending notifications
 *
 * Each component has high cohesion (focused on one responsibility) and low coupling (minimal dependencies).
 */

// 1. PRODUCT - Responsible for product information (high cohesion)
class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  getDescription() {
    return `${this.name} - $${this.price.toFixed(2)}`;
  }
}

// 2. SHOPPING CART - Responsible for managing cart items (high cohesion)
class ShoppingCart {
  constructor() {
    this.items = [];
  }

  addItem(product, quantity = 1) {
    this.items.push({ product, quantity });
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
    }
  }

  getItems() {
    return [...this.items];
  }

  getTotalPrice() {
    return this.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  clear() {
    this.items = [];
  }
}

// 3. ORDER PROCESSOR - Responsible for processing orders (high cohesion)
class OrderProcessor {
  constructor(paymentService, notificationService) {
    // Low coupling: depends on interfaces, not implementations
    this.paymentService = paymentService;
    this.notificationService = notificationService;
  }

  processOrder(cart, customerInfo) {
    // Validate order
    if (cart.getItems().length === 0) {
      throw new Error("Cannot process an empty cart");
    }

    if (!customerInfo.email) {
      throw new Error("Customer email is required");
    }

    // Create order
    const orderTotal = cart.getTotalPrice();
    const order = {
      id: this.generateOrderId(),
      items: cart.getItems(),
      total: orderTotal,
      customer: customerInfo,
      date: new Date()
    };

    // Process payment
    const paymentResult = this.paymentService.processPayment(
      customerInfo,
      orderTotal
    );

    if (paymentResult.success) {
      // Send notification
      this.notificationService.sendOrderConfirmation(
        customerInfo.email,
        order
      );

      // Clear cart after successful order
      cart.clear();

      return {
        success: true,
        order: order,
        message: "Order processed successfully"
      };
    } else {
      return {
        success: false,
        message: paymentResult.message
      };
    }
  }

  generateOrderId() {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

// 4. PAYMENT SERVICE - Responsible for payment processing (high cohesion)
class PaymentService {
  processPayment(customerInfo, amount) {
    // Simulate payment processing
    console.log(`Processing payment of $${amount.toFixed(2)} for ${customerInfo.name}`);

    // In a real implementation, this would integrate with a payment gateway
    if (customerInfo.paymentMethod === "credit-card") {
      return {
        success: true,
        transactionId: `TX-${Date.now()}`,
        message: "Payment processed successfully"
      };
    } else {
      return {
        success: false,
        message: "Unsupported payment method"
      };
    }
  }
}

// 5. NOTIFICATION SERVICE - Responsible for sending notifications (high cohesion)
class NotificationService {
  sendOrderConfirmation(email, order) {
    // Simulate sending an email notification
    console.log(`Sending order confirmation to ${email}`);
    console.log(`Order ID: ${order.id}`);
    console.log(`Total: $${order.total.toFixed(2)}`);
    console.log("Items:");
    order.items.forEach(item => {
      console.log(`- ${item.product.name} x${item.quantity}`);
    });
  }
}

// Usage example
// Create instances of our components
const paymentService = new PaymentService();
const notificationService = new NotificationService();
const orderProcessor = new OrderProcessor(paymentService, notificationService);
const cart = new ShoppingCart();

// Create some products
const laptop = new Product(1, "Laptop", 1299.99);
const headphones = new Product(2, "Headphones", 99.99);
const mouse = new Product(3, "Wireless Mouse", 29.99);

// Add products to cart
cart.addItem(laptop);
cart.addItem(headphones, 2);
cart.addItem(mouse);

// Customer information
const customer = {
  name: "John Doe",
  email: "john@example.com",
  address: "123 Main St, Anytown, USA",
  paymentMethod: "credit-card"
};

try {
  // Process the order
  const result = orderProcessor.processOrder(cart, customer);
  console.log(result.message);
} catch (error) {
  console.error(`Error: ${error.message}`);
}

/**
 * This demonstrates High Cohesion and Low Coupling because:
 *
 * 1. High Cohesion:
 *    - Each class has a single, well-defined responsibility:
 *      - Product: Manages product information
 *      - ShoppingCart: Manages cart items and calculations
 *      - OrderProcessor: Handles the order processing workflow
 *      - PaymentService: Handles payment processing
 *      - NotificationService: Handles sending notifications
 *    - Methods within each class are strongly related to the class's responsibility
 *
 * 2. Low Coupling:
 *    - Classes interact through well-defined interfaces, not implementation details
 *    - OrderProcessor depends on PaymentService and NotificationService interfaces,
 *      not their specific implementations (dependency injection)
 *    - Components can be replaced without affecting others (e.g., we could replace
 *      PaymentService with a different implementation without changing OrderProcessor)
 *    - Changes to one component don't require changes to others
 *
 * 3. Benefits:
 *    - Improved maintainability: Changes to one component don't affect others
 *    - Better testability: Components can be tested in isolation
 *    - Enhanced reusability: Components can be reused in different contexts
 *    - Easier to understand: Each component has a clear, focused purpose
 *    - Simplified development: Different teams can work on different components
 */