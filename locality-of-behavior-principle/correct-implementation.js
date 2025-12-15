/**
 * Locality of Behavior Principle - CORRECT IMPLEMENTATION
 *
 * This file demonstrates CORRECT application of the Locality of Behavior Principle.
 *
 * The Locality of Behavior Principle states:
 * Design systems so that understanding "what happens when X" requires minimal
 * navigational distance within well-defined boundaries. Optimize for traceability
 * and cognitive proximity—the ability to follow cause to effect through a clear,
 * explicit path.
 *
 * CORRECT: This code keeps the "place order" behavior LOCAL and TRACEABLE:
 * - Explicit orchestration in OrderService.placeOrder() - all steps visible
 * - Dependencies are injected, not located from globals
 * - No hidden event cascades for core business flow
 * - Side effects are visible at the call site
 * - Testing requires only simple dependency substitution
 *
 * To understand "what happens when a user places an order?", you:
 * 1. Read OrderService.placeOrder() - all steps are right there
 * 2. Done. You can see the complete flow in one place.
 *
 * Events are used ONLY for cross-boundary notifications (analytics, audit)
 * where decoupling is intentional and the events are "facts published"
 * rather than "control flow triggers."
 */

// ============================================================================
// DOMAIN ENTITIES (simple, no hidden behavior)
// ============================================================================

/**
 * Order entity - just data and simple calculations
 * No hidden base class behavior, no lifecycle hooks triggering events
 */
class Order {
  constructor(id, customerId, items) {
    this.id = id;
    this.customerId = customerId;
    this.items = items;
    this.status = 'pending';
    this.total = 0;
    this.createdAt = new Date();
    this.paymentId = null;
    this.inventoryReservationId = null;
  }

  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this.total;
  }

  markAsPaid(paymentId) {
    this.paymentId = paymentId;
    this.status = 'paid';
  }

  markAsConfirmed(reservationId) {
    this.inventoryReservationId = reservationId;
    this.status = 'confirmed';
  }

  markAsFailed(reason) {
    this.status = 'failed';
    this.failureReason = reason;
  }
}

// ============================================================================
// EXPLICIT DEPENDENCIES (interfaces for what we need)
// ============================================================================

/**
 * These interfaces define what the OrderService needs
 * Each dependency is explicit and injectable for testing
 */

class InventoryService {
  async reserveItems(orderId, items) {
    // In production: calls inventory microservice or database
    console.log(`  [Inventory] Reserving ${items.length} items for order ${orderId}`);
    const reservationId = `RES-${Date.now()}`;
    return { success: true, reservationId };
  }

  async releaseItems(reservationId) {
    console.log(`  [Inventory] Releasing reservation ${reservationId}`);
    return { success: true };
  }
}

class PaymentService {
  async processPayment(orderId, amount, customerId) {
    // In production: calls payment gateway
    console.log(`  [Payment] Processing $${amount.toFixed(2)} for order ${orderId}`);
    const paymentId = `PAY-${Date.now()}`;
    // Simulate occasional failure for demonstration
    const success = Math.random() > 0.2;
    if (success) {
      return { success: true, paymentId };
    } else {
      return { success: false, error: 'Card declined' };
    }
  }

  async refundPayment(paymentId) {
    console.log(`  [Payment] Refunding payment ${paymentId}`);
    return { success: true };
  }
}

class NotificationService {
  async sendOrderConfirmation(customerId, order) {
    console.log(`  [Notification] Sending order confirmation to customer ${customerId}`);
    return { success: true };
  }

  async sendPaymentReceipt(customerId, order, paymentId) {
    console.log(`  [Notification] Sending payment receipt to customer ${customerId}`);
    return { success: true };
  }

  async sendOrderFailure(customerId, orderId, reason) {
    console.log(`  [Notification] Sending failure notice to customer ${customerId}: ${reason}`);
    return { success: true };
  }
}

class OrderRepository {
  constructor() {
    this.orders = new Map();
  }

  async save(order) {
    console.log(`  [Repository] Saving order ${order.id}`);
    this.orders.set(order.id, order);
    return order;
  }

  async findById(orderId) {
    return this.orders.get(orderId);
  }
}

/**
 * Event publisher for cross-boundary notifications
 * Used ONLY for fire-and-forget facts (analytics, audit)
 * NOT for core business flow control
 */
class EventPublisher {
  async publish(eventType, data) {
    // In production: publishes to Kafka/SQS/etc for external consumers
    // These are notification events (facts), not control-flow events
    console.log(`  [Events] Publishing ${eventType} (for analytics/audit)`);
  }
}

// ============================================================================
// ORDER SERVICE - EXPLICIT ORCHESTRATION (the heart of locality)
// ============================================================================

/**
 * OrderService with explicit orchestration
 *
 * KEY PRINCIPLE: Reading this one class tells you EVERYTHING that happens
 * when an order is placed. No hidden behaviors, no event cascades,
 * no base class magic.
 *
 * All dependencies are:
 * - Declared in the constructor (visible)
 * - Injected from outside (testable)
 * - Used explicitly in methods (traceable)
 */
class OrderService {
  /**
   * Constructor explicitly declares ALL dependencies
   * Looking at this signature tells you what OrderService needs to work
   */
  constructor(dependencies) {
    this.inventoryService = dependencies.inventoryService;
    this.paymentService = dependencies.paymentService;
    this.notificationService = dependencies.notificationService;
    this.orderRepository = dependencies.orderRepository;
    this.eventPublisher = dependencies.eventPublisher;
    this.logger = dependencies.logger;
  }

  /**
   * Place an order - ALL BEHAVIOR IS VISIBLE RIGHT HERE
   *
   * Reading this method tells you the complete flow:
   * 1. Validate input
   * 2. Create order and calculate total
   * 3. Reserve inventory (and handle failure)
   * 4. Process payment (and handle failure with compensation)
   * 5. Save order
   * 6. Send notifications
   * 7. Publish event for analytics (fire-and-forget)
   *
   * No hidden behaviors. No event cascades. No surprises.
   * A new developer can understand this in one reading.
   */
  async placeOrder(customerId, items) {
    this.logger.info('Starting order placement', { customerId, itemCount: items.length });

    // Step 1: Validate input (explicit, right here)
    const validationResult = this.validateOrderInput(customerId, items);
    if (!validationResult.valid) {
      this.logger.warn('Order validation failed', { errors: validationResult.errors });
      return { success: false, errors: validationResult.errors };
    }

    // Step 2: Create order and calculate total
    const orderId = this.generateOrderId();
    const order = new Order(orderId, customerId, items);
    order.calculateTotal();
    this.logger.info('Order created', { orderId, total: order.total });

    // Step 3: Reserve inventory (explicit call, visible here)
    const inventoryResult = await this.inventoryService.reserveItems(orderId, items);
    if (!inventoryResult.success) {
      this.logger.error('Inventory reservation failed', { orderId });
      return {
        success: false,
        error: 'Items not available',
        orderId
      };
    }
    this.logger.info('Inventory reserved', { orderId, reservationId: inventoryResult.reservationId });

    // Step 4: Process payment (explicit, with compensation on failure)
    const paymentResult = await this.paymentService.processPayment(
      orderId,
      order.total,
      customerId
    );

    if (!paymentResult.success) {
      // Compensation: release inventory (visible here, not hidden in event handler)
      this.logger.warn('Payment failed, releasing inventory', { orderId });
      await this.inventoryService.releaseItems(inventoryResult.reservationId);

      order.markAsFailed(paymentResult.error);
      await this.orderRepository.save(order);

      // Notify customer of failure (explicit)
      await this.notificationService.sendOrderFailure(customerId, orderId, paymentResult.error);

      return {
        success: false,
        error: paymentResult.error,
        orderId
      };
    }

    // Step 5: Update and save order
    order.markAsPaid(paymentResult.paymentId);
    order.markAsConfirmed(inventoryResult.reservationId);
    await this.orderRepository.save(order);
    this.logger.info('Order saved', { orderId, status: order.status });

    // Step 6: Send notifications (explicit calls, visible here)
    await this.notificationService.sendOrderConfirmation(customerId, order);
    await this.notificationService.sendPaymentReceipt(customerId, order, paymentResult.paymentId);

    // Step 7: Publish event for analytics/audit (fire-and-forget notification, not control flow)
    // This is a "fact published" - external systems can react, but core flow is complete
    await this.eventPublisher.publish('order:completed', {
      orderId,
      customerId,
      total: order.total,
      itemCount: items.length,
      timestamp: new Date().toISOString()
    });

    this.logger.info('Order placement complete', { orderId });

    return {
      success: true,
      orderId,
      total: order.total,
      status: order.status
    };
  }

  /**
   * Validation is a private method in the same class
   * Not hidden in a decorator or base class - right here where you need it
   */
  validateOrderInput(customerId, items) {
    const errors = [];

    if (!customerId || typeof customerId !== 'string') {
      errors.push('Valid customerId is required');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('At least one item is required');
    } else {
      items.forEach((item, index) => {
        if (!item.id) errors.push(`Item ${index}: id is required`);
        if (!item.price || item.price <= 0) errors.push(`Item ${index}: valid price is required`);
        if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index}: valid quantity is required`);
      });
    }

    return { valid: errors.length === 0, errors };
  }

  generateOrderId() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get order - simple, no hidden caching decorators
   */
  async getOrder(orderId) {
    this.logger.info('Fetching order', { orderId });
    return this.orderRepository.findById(orderId);
  }
}

// ============================================================================
// SIMPLE LOGGER (no hidden behavior)
// ============================================================================

class Logger {
  info(message, data = {}) {
    console.log(`[INFO] ${message}`, JSON.stringify(data));
  }

  warn(message, data = {}) {
    console.log(`[WARN] ${message}`, JSON.stringify(data));
  }

  error(message, data = {}) {
    console.log(`[ERROR] ${message}`, JSON.stringify(data));
  }
}

// ============================================================================
// CONTROLLER (thin layer, delegates to service)
// ============================================================================

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  /**
   * Controller is thin - just extracts request data and delegates
   * All business logic is in OrderService where it's visible and testable
   */
  async placeOrder(req) {
    const { customerId, items } = req.body;
    return this.orderService.placeOrder(customerId, items);
  }
}

// ============================================================================
// COMPOSITION ROOT (where dependencies are wired together)
// ============================================================================

/**
 * Factory function creates the fully-wired OrderService
 * All dependencies are created and injected here
 * This is the ONLY place where wiring happens
 */
function createOrderService() {
  const dependencies = {
    inventoryService: new InventoryService(),
    paymentService: new PaymentService(),
    notificationService: new NotificationService(),
    orderRepository: new OrderRepository(),
    eventPublisher: new EventPublisher(),
    logger: new Logger()
  };

  return new OrderService(dependencies);
}

/**
 * For testing: create with mock dependencies
 * No need for complex mocking frameworks - just pass different objects
 */
function createOrderServiceForTesting(overrides = {}) {
  const defaults = {
    inventoryService: {
      reserveItems: async () => ({ success: true, reservationId: 'TEST-RES-1' }),
      releaseItems: async () => ({ success: true })
    },
    paymentService: {
      processPayment: async () => ({ success: true, paymentId: 'TEST-PAY-1' }),
      refundPayment: async () => ({ success: true })
    },
    notificationService: {
      sendOrderConfirmation: async () => ({ success: true }),
      sendPaymentReceipt: async () => ({ success: true }),
      sendOrderFailure: async () => ({ success: true })
    },
    orderRepository: {
      save: async (order) => order,
      findById: async () => null
    },
    eventPublisher: {
      publish: async () => {}
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {}
    }
  };

  return new OrderService({ ...defaults, ...overrides });
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateLocalBehavior() {
  console.log('='.repeat(70));
  console.log('LOCALITY OF BEHAVIOR PRINCIPLE - CORRECT IMPLEMENTATION');
  console.log('='.repeat(70));

  console.log('\n--- SUCCESSFUL ORDER ---\n');

  const orderService = createOrderService();
  const controller = new OrderController(orderService);

  const successResult = await controller.placeOrder({
    body: {
      customerId: 'CUST-123',
      items: [
        { id: 'ITEM-1', name: 'Widget', price: 29.99, quantity: 2 },
        { id: 'ITEM-2', name: 'Gadget', price: 49.99, quantity: 1 }
      ]
    }
  });

  console.log('\nRESULT:', successResult);

  console.log('\n--- TESTING IS SIMPLE ---\n');

  // Testing: just override the dependencies you care about
  const testService = createOrderServiceForTesting({
    paymentService: {
      processPayment: async () => ({ success: false, error: 'Card declined' })
    },
    logger: {
      info: (msg) => console.log(`  [TEST LOG] ${msg}`),
      warn: (msg) => console.log(`  [TEST LOG] ${msg}`),
      error: (msg) => console.log(`  [TEST LOG] ${msg}`)
    }
  });

  console.log('Testing payment failure scenario:');
  const failResult = await testService.placeOrder('CUST-456', [
    { id: 'ITEM-1', price: 10, quantity: 1 }
  ]);
  console.log('RESULT:', failResult);

  console.log('\n' + '='.repeat(70));
  console.log(`
BENEFITS OF THIS APPROACH:

1. TRACEABILITY: To understand "what happens when order is placed?"
   Read OrderService.placeOrder() - all 7 steps are right there.

2. DEBUGGING: Stack traces show exactly where you are in the flow.
   No mysterious event handlers appearing from nowhere.

3. TESTING: Just create OrderService with mock dependencies.
   No global state, no event bus to mock, no hidden side effects.

4. ONBOARDING: New developer reads placeOrder(), understands the flow.
   No need to grep for event listeners across the codebase.

5. CHANGES ARE SAFE: Modifying the flow is done in one place.
   No risk of breaking unknown event handlers.

6. FAILURES ARE VISIBLE: Payment failure triggers compensation
   (inventory release) right in the same method - you can see it.

7. ORDER OF OPERATIONS: Steps execute in the order you read them.
   No registration-order dependencies.

THE LOCALITY GRADIENT IN ACTION:

- HIGH LOCALITY: Core business flow (placeOrder) - all steps visible
- MEDIUM LOCALITY: Services (InventoryService, PaymentService) - clear interfaces
- ACCEPTABLE INDIRECTION: Event publishing for analytics - fire-and-forget notification

Events are used ONLY for cross-boundary notifications (analytics, audit)
where the core business flow doesn't depend on them succeeding.

The "What happens when X?" question is answered by reading, not archaeology.
`);
}

// Run demonstration
demonstrateLocalBehavior().catch(console.error);

module.exports = {
  Order,
  OrderService,
  OrderController,
  createOrderService,
  createOrderServiceForTesting,
  // Export services for composition
  InventoryService,
  PaymentService,
  NotificationService,
  OrderRepository,
  EventPublisher,
  Logger
};
