/**
 * Locality of Behavior Principle - VIOLATION
 *
 * This file demonstrates a VIOLATION of the Locality of Behavior Principle.
 *
 * The Locality of Behavior Principle states:
 * Design systems so that understanding "what happens when X" requires minimal
 * navigational distance within well-defined boundaries. Optimize for traceability
 * and cognitive proximity—the ability to follow cause to effect through a clear,
 * explicit path.
 *
 * VIOLATION: This code scatters the "place order" behavior across:
 * - Event emitters and listeners (OrderCreated triggers 5+ handlers)
 * - Base class inheritance (hidden behavior in BaseService, BaseEntity)
 * - Decorator pattern (invisible logging, caching, validation)
 * - Global middleware (request enrichment happens invisibly)
 * - Convention-based magic (auto-registration, naming conventions)
 *
 * To understand "what happens when a user places an order?", you must:
 * 1. Read OrderController.placeOrder()
 * 2. Find OrderService (inherits from BaseService - check there too)
 * 3. Discover OrderService emits 'order:created' event
 * 4. Search codebase for all 'order:created' listeners
 * 5. Find InventoryListener, PaymentListener, NotificationListener, AuditListener, AnalyticsListener
 * 6. Notice PaymentListener emits 'payment:processed' - search for those handlers
 * 7. Realize decorators add logging, caching, validation invisibly
 * 8. Check BaseService for hidden lifecycle hooks
 * 9. Check middleware for request enrichment
 * 10. Trace through 15+ files to understand one user action
 *
 * This makes debugging nightmarish, onboarding slow, and changes risky.
 */

// ============================================================================
// SCATTERED INFRASTRUCTURE (you need to know these exist)
// ============================================================================

/**
 * Global event bus - the source of "action at a distance"
 * Events fired here trigger handlers registered elsewhere in the codebase
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    // Handlers execute invisibly - caller has no idea what happens
    handlers.forEach(handler => handler(data));
  }
}

const eventBus = new EventBus();

/**
 * Global service locator - hides dependencies
 * Services retrieve other services at runtime, invisible in signatures
 */
class ServiceLocator {
  constructor() {
    this.services = new Map();
  }

  register(name, service) {
    this.services.set(name, service);
  }

  get(name) {
    return this.services.get(name);
  }
}

const serviceLocator = new ServiceLocator();

// ============================================================================
// BASE CLASSES WITH HIDDEN BEHAVIOR (inheritance fog)
// ============================================================================

/**
 * BaseEntity - hidden behavior that all entities inherit
 * You must read this to understand what happens on save/update
 */
class BaseEntity {
  constructor() {
    this.createdAt = null;
    this.updatedAt = null;
    this.version = 0;
  }

  // Hidden lifecycle hook - called automatically, not visible at call site
  beforeSave() {
    this.updatedAt = new Date();
    this.version++;
    // Hidden: emits event that triggers audit logging somewhere
    eventBus.emit('entity:saving', { entity: this.constructor.name, id: this.id });
  }

  // Hidden lifecycle hook
  afterSave() {
    // Hidden: emits event that might trigger cache invalidation
    eventBus.emit('entity:saved', { entity: this.constructor.name, id: this.id });
  }
}

/**
 * BaseService - hidden behavior all services inherit
 * Adds invisible logging, metrics, and lifecycle hooks
 */
class BaseService {
  constructor(name) {
    this.serviceName = name;
  }

  // Hidden: wraps all service calls with logging (you don't see this at call site)
  async executeWithLogging(operation, fn) {
    console.log(`[${this.serviceName}] Starting: ${operation}`);
    const start = Date.now();
    try {
      const result = await fn();
      console.log(`[${this.serviceName}] Completed: ${operation} in ${Date.now() - start}ms`);
      // Hidden: emits metrics event
      eventBus.emit('metrics:operation', {
        service: this.serviceName,
        operation,
        duration: Date.now() - start,
        success: true
      });
      return result;
    } catch (error) {
      console.log(`[${this.serviceName}] Failed: ${operation}`);
      // Hidden: emits error event that triggers alerting somewhere
      eventBus.emit('metrics:error', {
        service: this.serviceName,
        operation,
        error: error.message
      });
      throw error;
    }
  }

  // Hidden lifecycle hook - subclasses might override
  onOperationComplete(operation, result) {
    // Base implementation does nothing, but subclasses might add behavior
    // You have to check every subclass to know what happens
  }
}

// ============================================================================
// DECORATOR FUNCTIONS (invisible behavior wrapping)
// ============================================================================

/**
 * Decorators that wrap functions with invisible behavior
 * When you see `service.placeOrder()`, you don't see these running
 */

function withLogging(target, methodName) {
  const original = target[methodName];
  target[methodName] = async function (...args) {
    console.log(`[LOG] Entering ${methodName}`);
    const result = await original.apply(this, args);
    console.log(`[LOG] Exiting ${methodName}`);
    return result;
  };
}

function withCaching(target, methodName, cacheKey) {
  const original = target[methodName];
  const cache = new Map();
  target[methodName] = async function (...args) {
    const key = cacheKey(...args);
    if (cache.has(key)) {
      console.log(`[CACHE] Hit for ${methodName}`);
      return cache.get(key);
    }
    const result = await original.apply(this, args);
    cache.set(key, result);
    // Hidden: cache entries might affect subsequent calls in non-obvious ways
    return result;
  };
}

function withValidation(target, methodName, validator) {
  const original = target[methodName];
  target[methodName] = async function (...args) {
    // Hidden validation - errors come from here but you don't see it at call site
    const errors = validator(...args);
    if (errors.length > 0) {
      // Hidden: emits validation event
      eventBus.emit('validation:failed', { method: methodName, errors });
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    return original.apply(this, args);
  };
}

function withRetry(target, methodName, maxRetries = 3) {
  const original = target[methodName];
  target[methodName] = async function (...args) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        lastError = error;
        // Hidden: retry behavior you don't see at call site
        console.log(`[RETRY] Attempt ${i + 1} failed for ${methodName}`);
        eventBus.emit('operation:retry', { method: methodName, attempt: i + 1 });
      }
    }
    throw lastError;
  };
}

// ============================================================================
// DOMAIN ENTITIES (with hidden base class behavior)
// ============================================================================

class Order extends BaseEntity {
  constructor(id, customerId, items) {
    super(); // Hidden: BaseEntity constructor sets up invisible behavior
    this.id = id;
    this.customerId = customerId;
    this.items = items;
    this.status = 'pending';
    this.total = 0;
    this.createdAt = new Date();
  }

  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this.total;
  }

  // Hidden: calls BaseEntity.beforeSave() which emits events
  save() {
    this.beforeSave();
    // Simulate save
    this.afterSave(); // Hidden: emits more events
    return this;
  }
}

// ============================================================================
// EVENT LISTENERS (scattered across the codebase in a real system)
// ============================================================================

/**
 * In a real codebase, these would be in separate files:
 * - listeners/InventoryListener.js
 * - listeners/PaymentListener.js
 * - listeners/NotificationListener.js
 * - listeners/AuditListener.js
 * - listeners/AnalyticsListener.js
 *
 * You'd have to search for 'order:created' to find all of them
 */

// LISTENER 1: Inventory (would be in /listeners/InventoryListener.js)
class InventoryListener {
  constructor() {
    // Hidden registration - you have to find this to know it exists
    eventBus.on('order:created', this.handleOrderCreated.bind(this));
    eventBus.on('order:cancelled', this.handleOrderCancelled.bind(this));
  }

  handleOrderCreated(data) {
    console.log(`[InventoryListener] Reserving inventory for order ${data.orderId}`);
    // Hidden: This might fail and you won't know from the original call site
    data.order.items.forEach(item => {
      // Simulate inventory reservation
      eventBus.emit('inventory:reserved', { orderId: data.orderId, itemId: item.id });
    });
  }

  handleOrderCancelled(data) {
    console.log(`[InventoryListener] Releasing inventory for order ${data.orderId}`);
  }
}

// LISTENER 2: Payment (would be in /listeners/PaymentListener.js)
class PaymentListener {
  constructor() {
    eventBus.on('order:created', this.handleOrderCreated.bind(this));
  }

  handleOrderCreated(data) {
    console.log(`[PaymentListener] Processing payment for order ${data.orderId}`);
    // Hidden: Payment processing happens here, invisible from OrderService
    const paymentSuccessful = Math.random() > 0.1; // Simulate payment

    if (paymentSuccessful) {
      // Hidden: emits another event that triggers more handlers
      eventBus.emit('payment:processed', {
        orderId: data.orderId,
        amount: data.order.total,
        status: 'success'
      });
    } else {
      eventBus.emit('payment:failed', {
        orderId: data.orderId,
        reason: 'Card declined'
      });
      // Hidden: This might trigger order cancellation somewhere else
    }
  }
}

// LISTENER 3: Notification (would be in /listeners/NotificationListener.js)
class NotificationListener {
  constructor() {
    eventBus.on('order:created', this.handleOrderCreated.bind(this));
    eventBus.on('payment:processed', this.handlePaymentProcessed.bind(this));
    eventBus.on('payment:failed', this.handlePaymentFailed.bind(this));
  }

  handleOrderCreated(data) {
    console.log(`[NotificationListener] Sending order confirmation to customer ${data.customerId}`);
    // Hidden: email sending happens here
  }

  handlePaymentProcessed(data) {
    console.log(`[NotificationListener] Sending payment receipt for order ${data.orderId}`);
  }

  handlePaymentFailed(data) {
    console.log(`[NotificationListener] Sending payment failure notice for order ${data.orderId}`);
  }
}

// LISTENER 4: Audit (would be in /listeners/AuditListener.js)
class AuditListener {
  constructor() {
    // Listens to EVERYTHING - hidden audit trail
    eventBus.on('order:created', (data) => this.log('ORDER_CREATED', data));
    eventBus.on('payment:processed', (data) => this.log('PAYMENT_PROCESSED', data));
    eventBus.on('payment:failed', (data) => this.log('PAYMENT_FAILED', data));
    eventBus.on('inventory:reserved', (data) => this.log('INVENTORY_RESERVED', data));
    eventBus.on('entity:saving', (data) => this.log('ENTITY_SAVING', data));
    eventBus.on('entity:saved', (data) => this.log('ENTITY_SAVED', data));
  }

  log(action, data) {
    console.log(`[AUDIT] ${action}: ${JSON.stringify(data)}`);
  }
}

// LISTENER 5: Analytics (would be in /listeners/AnalyticsListener.js)
class AnalyticsListener {
  constructor() {
    eventBus.on('order:created', this.trackOrderCreated.bind(this));
    eventBus.on('metrics:operation', this.trackOperation.bind(this));
  }

  trackOrderCreated(data) {
    console.log(`[Analytics] Tracking order ${data.orderId} - value: ${data.order.total}`);
  }

  trackOperation(data) {
    console.log(`[Analytics] Operation ${data.service}.${data.operation}: ${data.duration}ms`);
  }
}

// ============================================================================
// MAIN SERVICE (the "tip of the iceberg" - looks simple, hides complexity)
// ============================================================================

/**
 * OrderService looks simple, but understanding what actually happens
 * when you call placeOrder() requires reading 15+ other locations
 */
class OrderService extends BaseService {
  constructor() {
    super('OrderService');
    // Register with service locator (hidden dependency)
    serviceLocator.register('orderService', this);
  }

  /**
   * This method LOOKS simple - but what actually happens?
   *
   * To understand, you need to trace:
   * 1. BaseService.executeWithLogging (hidden wrapper)
   * 2. Order constructor -> BaseEntity (hidden behavior)
   * 3. order.calculateTotal() (straightforward)
   * 4. order.save() -> BaseEntity.beforeSave/afterSave (hidden events)
   * 5. eventBus.emit('order:created') triggers:
   *    - InventoryListener.handleOrderCreated
   *    - PaymentListener.handleOrderCreated -> emits payment:processed/failed
   *    - NotificationListener.handleOrderCreated
   *    - AuditListener (logs everything)
   *    - AnalyticsListener.trackOrderCreated
   * 6. payment:processed triggers more NotificationListener handlers
   * 7. inventory:reserved triggers AuditListener
   * 8. Decorators add logging, caching, validation, retry (invisible)
   *
   * Good luck debugging this when something goes wrong!
   */
  async placeOrder(customerId, items) {
    return this.executeWithLogging('placeOrder', async () => {
      const orderId = `ORD-${Date.now()}`;
      const order = new Order(orderId, customerId, items);

      order.calculateTotal();
      order.save(); // Hidden: triggers entity:saving, entity:saved events

      // This innocent-looking emit triggers 5+ handlers across the codebase
      eventBus.emit('order:created', {
        orderId,
        customerId,
        order
      });

      this.onOperationComplete('placeOrder', order);

      return order;
    });
  }

  async getOrder(orderId) {
    return this.executeWithLogging('getOrder', async () => {
      // In real code, this would fetch from database
      // But caching decorator might return stale data invisibly
      return { id: orderId, status: 'unknown' };
    });
  }
}

// Apply decorators (these wrap methods with invisible behavior)
const orderService = new OrderService();
withLogging(orderService, 'placeOrder');
withValidation(orderService, 'placeOrder', (customerId, items) => {
  const errors = [];
  if (!customerId) errors.push('customerId required');
  if (!items || items.length === 0) errors.push('items required');
  return errors;
});
withRetry(orderService, 'placeOrder', 3);
withCaching(orderService, 'getOrder', (orderId) => orderId);

// ============================================================================
// CONTROLLER (entry point - looks simple, iceberg beneath)
// ============================================================================

class OrderController {
  /**
   * A developer reading this thinks:
   * "placeOrder validates input, creates order, returns it"
   *
   * What actually happens:
   * 1. Validation decorator checks input (hidden)
   * 2. Retry decorator wraps call (hidden)
   * 3. Logging decorator logs entry/exit (hidden)
   * 4. BaseService.executeWithLogging adds more logging (hidden)
   * 5. Order created with BaseEntity behavior (hidden)
   * 6. order.save() triggers entity events (hidden)
   * 7. 'order:created' event triggers 5 listeners (hidden)
   * 8. Listeners emit more events triggering more handlers (hidden)
   * 9. Analytics, audit, notifications all happen (hidden)
   * 10. If payment fails, more events cascade (hidden)
   */
  async placeOrder(req) {
    const { customerId, items } = req.body;
    const order = await orderService.placeOrder(customerId, items);
    return { success: true, orderId: order.id };
  }
}

// ============================================================================
// INITIALIZATION (scattered setup you need to find)
// ============================================================================

// These initializations might be in separate files:
// - /bootstrap/listeners.js
// - /config/services.js
// You have to find them to know what's registered

function initializeListeners() {
  // These constructors register event handlers as side effects
  new InventoryListener();
  new PaymentListener();
  new NotificationListener();
  new AuditListener();
  new AnalyticsListener();
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateScatteredBehavior() {
  console.log('='.repeat(70));
  console.log('LOCALITY OF BEHAVIOR PRINCIPLE - VIOLATION');
  console.log('='.repeat(70));
  console.log('\nCalling orderController.placeOrder()...');
  console.log('Watch how many hidden things happen:\n');

  // Initialize all the hidden listeners
  initializeListeners();

  const controller = new OrderController();

  // This simple call triggers a cascade of hidden behavior
  const result = await controller.placeOrder({
    body: {
      customerId: 'CUST-123',
      items: [
        { id: 'ITEM-1', name: 'Widget', price: 29.99, quantity: 2 },
        { id: 'ITEM-2', name: 'Gadget', price: 49.99, quantity: 1 }
      ]
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('RESULT:', result);
  console.log('='.repeat(70));

  console.log(`
PROBLEMS WITH THIS APPROACH:

1. TRACEABILITY: To understand "what happens when order is placed?"
   you must read: OrderController, OrderService, BaseService, BaseEntity,
   Order, EventBus, 5 Listeners, 4 Decorators = 14+ locations

2. DEBUGGING: When something fails, the stack trace shows event handlers
   that seem unrelated to the original call

3. TESTING: You can't test OrderService without mocking the global
   EventBus and all listeners - or you get unexpected side effects

4. ONBOARDING: New developers see "eventBus.emit('order:created')"
   and have no idea what happens next without grep-ing the codebase

5. CHANGES ARE RISKY: Adding a new listener affects all orders,
   modifying event payload might break unknown handlers

6. HIDDEN FAILURES: If PaymentListener fails, OrderService returns
   success but payment wasn't processed - no one knows

7. ORDER OF OPERATIONS: Listeners execute in registration order,
   which is scattered across initialization code

The "What happens when X?" question requires archaeology, not reading.
`);
}

// Run demonstration
demonstrateScatteredBehavior().catch(console.error);

module.exports = {
  OrderService,
  OrderController,
  EventBus,
  eventBus,
  serviceLocator
};
