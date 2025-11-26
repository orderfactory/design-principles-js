/**
 * CORRECT: Explicit Dependencies Principle (EDP)
 *
 * This file demonstrates proper implementation of the Explicit Dependencies
 * Principle. All dependencies are declared in constructors and function
 * parameters, making the code honest about its requirements, testable in
 * isolation, and safe to refactor.
 *
 * Key practices demonstrated:
 * 1. Constructor injection - all dependencies passed explicitly
 * 2. Dependency interfaces - abstract contracts for flexibility
 * 3. Composition root - centralized wiring separate from business logic
 * 4. Grouped dependencies - cohesive config and infrastructure objects
 * 5. Explicit time/randomness - deterministic testing enabled
 * 6. Test doubles - simple fakes that don't require mocking frameworks
 * 7. The Honesty Test - constructors reveal all requirements
 */

// =============================================================================
// DEPENDENCY INTERFACES (Ports)
// =============================================================================

/**
 * Repository interface for user data access.
 * Heavy dependency - always explicit.
 */
class UserRepository {
  async findById(userId) {
    throw new Error('Not implemented');
  }

  async findByEmail(email) {
    throw new Error('Not implemented');
  }
}

/**
 * Repository interface for order persistence.
 * Heavy dependency - always explicit.
 */
class OrderRepository {
  async save(order) {
    throw new Error('Not implemented');
  }

  async findById(orderId) {
    throw new Error('Not implemented');
  }

  async findByUserId(userId) {
    throw new Error('Not implemented');
  }
}

/**
 * Email service interface.
 * Heavy dependency - always explicit.
 */
class EmailService {
  async sendOrderConfirmation(to, orderId, total) {
    throw new Error('Not implemented');
  }

  async sendOrderCancellation(to, orderId) {
    throw new Error('Not implemented');
  }
}

/**
 * Payment gateway interface.
 * Heavy dependency - always explicit (financial operations).
 */
class PaymentGateway {
  async charge(amount, paymentToken) {
    throw new Error('Not implemented');
  }

  async refund(transactionId, amount) {
    throw new Error('Not implemented');
  }
}

/**
 * Inventory service interface.
 * Heavy dependency - always explicit.
 */
class InventoryService {
  async checkStock(productId) {
    throw new Error('Not implemented');
  }

  async reserve(productId, quantity) {
    throw new Error('Not implemented');
  }

  async release(reservationId) {
    throw new Error('Not implemented');
  }
}

/**
 * Logger interface.
 * Medium-weight dependency - explicit for testability.
 */
class Logger {
  info(message, context = {}) {
    throw new Error('Not implemented');
  }

  error(message, context = {}) {
    throw new Error('Not implemented');
  }

  warn(message, context = {}) {
    throw new Error('Not implemented');
  }
}

/**
 * Cache interface.
 * Medium-weight dependency - explicit when behavior matters.
 */
class Cache {
  get(key) {
    throw new Error('Not implemented');
  }

  set(key, value, ttlMs) {
    throw new Error('Not implemented');
  }

  delete(key) {
    throw new Error('Not implemented');
  }
}

/**
 * Clock abstraction - makes time explicit and testable.
 * Medium-weight dependency - explicit when time-sensitive logic needs testing.
 */
class Clock {
  now() {
    return new Date();
  }

  isoTimestamp() {
    return this.now().toISOString();
  }
}

/**
 * ID generator abstraction - makes randomness explicit and testable.
 * Medium-weight dependency - explicit when determinism matters.
 */
class IdGenerator {
  generateOrderId() {
    return `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  generateReservationId() {
    return `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

// =============================================================================
// GROUPED DEPENDENCIES (Cohesive Configuration Objects)
// =============================================================================

/**
 * Order-related configuration.
 * Grouping related config values into an immutable object.
 */
class OrderConfig {
  constructor({
    taxRate = 0.1,
    cacheTtlMs = 60000,
    maxItemsPerOrder = 100,
    enableEmailNotifications = true
  } = {}) {
    this.taxRate = taxRate;
    this.cacheTtlMs = cacheTtlMs;
    this.maxItemsPerOrder = maxItemsPerOrder;
    this.enableEmailNotifications = enableEmailNotifications;

    // Validate configuration
    if (this.taxRate < 0 || this.taxRate > 1) {
      throw new Error('Tax rate must be between 0 and 1');
    }
    if (this.maxItemsPerOrder < 1) {
      throw new Error('Max items per order must be at least 1');
    }

    // Make immutable
    Object.freeze(this);
  }
}

/**
 * Infrastructure context for cross-cutting concerns.
 * Grouping related infrastructure dependencies.
 */
class InfrastructureContext {
  constructor({ logger, cache, clock, idGenerator }) {
    if (!logger) throw new Error('logger is required');
    if (!cache) throw new Error('cache is required');
    if (!clock) throw new Error('clock is required');
    if (!idGenerator) throw new Error('idGenerator is required');

    this.logger = logger;
    this.cache = cache;
    this.clock = clock;
    this.idGenerator = idGenerator;

    Object.freeze(this);
  }
}

// =============================================================================
// BUSINESS LOGIC WITH EXPLICIT DEPENDENCIES
// =============================================================================

/**
 * Order service with explicit dependencies.
 *
 * THE HONESTY TEST:
 * 1. Constructor fully describes what this class needs
 * 2. Can be instantiated with only those declared dependencies
 * 3. Makes no calls to obtain additional dependencies at runtime
 * 4. No unused dependencies (each one is used)
 */
class OrderService {
  /**
   * Constructor declares ALL dependencies explicitly.
   * Looking at this signature tells you exactly what OrderService needs.
   */
  constructor({
    userRepository,
    orderRepository,
    emailService,
    paymentGateway,
    inventoryService,
    config,
    infra
  }) {
    // Validate all dependencies - fail fast if missing
    if (!userRepository) throw new Error('userRepository is required');
    if (!orderRepository) throw new Error('orderRepository is required');
    if (!emailService) throw new Error('emailService is required');
    if (!paymentGateway) throw new Error('paymentGateway is required');
    if (!inventoryService) throw new Error('inventoryService is required');
    if (!config) throw new Error('config is required');
    if (!infra) throw new Error('infra is required');

    // Store dependencies as instance properties
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.emailService = emailService;
    this.paymentGateway = paymentGateway;
    this.inventoryService = inventoryService;
    this.config = config;
    this.infra = infra;
  }

  /**
   * Create a new order.
   * All dependencies accessed through explicit instance properties.
   */
  async createOrder(userId, items) {
    const { logger, cache, clock, idGenerator } = this.infra;

    // Generate deterministic (in tests) ID and timestamp
    const orderId = idGenerator.generateOrderId();
    const timestamp = clock.isoTimestamp();

    logger.info('Creating order', { orderId, userId, itemCount: items.length });

    // Validate items
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    if (items.length > this.config.maxItemsPerOrder) {
      throw new Error(`Order cannot exceed ${this.config.maxItemsPerOrder} items`);
    }

    // Get user (with caching) - using explicit cache dependency
    const user = await this.getUserWithCache(userId);

    // Check and reserve inventory - using explicit inventory dependency
    const reservations = await this.reserveInventory(items, orderId);

    // Calculate totals - using explicit config
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * this.config.taxRate;
    const total = subtotal + tax;

    // Process payment - using explicit payment gateway
    let paymentResult;
    try {
      paymentResult = await this.paymentGateway.charge(total, user.paymentToken);
    } catch (error) {
      // Payment gateway threw an error (network issue, etc.)
      await this.releaseReservations(reservations);
      throw error;
    }

    // Check if payment was declined (no error thrown, but unsuccessful)
    if (!paymentResult.success) {
      await this.releaseReservations(reservations);
      throw new Error('Payment declined');
    }

    // Create order object
    const order = {
      orderId,
      userId,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      tax,
      total,
      status: 'confirmed',
      paymentTransactionId: paymentResult.transactionId,
      reservationIds: reservations.map(r => r.reservationId),
      createdAt: timestamp
    };

    // Persist order - using explicit repository
    await this.orderRepository.save(order);

    logger.info('Order created successfully', { orderId, userId, total });

    // Send confirmation email (fire-and-forget with error handling)
    if (this.config.enableEmailNotifications) {
      this.emailService.sendOrderConfirmation(user.email, orderId, total)
        .catch(err => logger.error('Failed to send confirmation email', {
          orderId,
          error: err.message
        }));
    }

    return order;
  }

  /**
   * Get user with caching.
   * Private helper that uses explicit dependencies.
   */
  async getUserWithCache(userId) {
    const { cache, logger } = this.infra;
    const cacheKey = `user:${userId}`;

    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('User found in cache', { userId });
      return cached;
    }

    // Fetch from repository
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Cache for future requests
    cache.set(cacheKey, user, this.config.cacheTtlMs);

    return user;
  }

  /**
   * Reserve inventory for all items.
   */
  async reserveInventory(items, orderId) {
    const { logger } = this.infra;
    const reservations = [];

    for (const item of items) {
      // Check stock
      const stock = await this.inventoryService.checkStock(item.productId);
      if (stock.available < item.quantity) {
        // Release any reservations we've made
        await this.releaseReservations(reservations);
        throw new Error(`Insufficient stock for product ${item.productId}: need ${item.quantity}, have ${stock.available}`);
      }

      // Reserve
      const reservation = await this.inventoryService.reserve(item.productId, item.quantity);
      reservations.push(reservation);

      logger.info('Inventory reserved', {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        reservationId: reservation.reservationId
      });
    }

    return reservations;
  }

  /**
   * Release inventory reservations (for rollback).
   */
  async releaseReservations(reservations) {
    const { logger } = this.infra;
    for (const reservation of reservations) {
      try {
        await this.inventoryService.release(reservation.reservationId);
        logger.info('Reservation released', { reservationId: reservation.reservationId });
      } catch (error) {
        logger.error('Failed to release reservation', {
          reservationId: reservation.reservationId,
          error: error.message
        });
      }
    }
  }

  /**
   * Get order history for a user.
   */
  async getOrderHistory(userId) {
    const { logger } = this.infra;
    logger.info('Fetching order history', { userId });
    return this.orderRepository.findByUserId(userId);
  }

  /**
   * Cancel an order.
   */
  async cancelOrder(orderId) {
    const { logger, clock } = this.infra;

    logger.info('Cancelling order', { orderId });

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    // Refund payment
    await this.paymentGateway.refund(order.paymentTransactionId, order.total);

    // Release inventory
    for (const reservationId of order.reservationIds) {
      await this.inventoryService.release(reservationId);
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = clock.isoTimestamp();
    await this.orderRepository.save(order);

    // Notify user
    if (this.config.enableEmailNotifications) {
      const user = await this.userRepository.findById(order.userId);
      await this.emailService.sendOrderCancellation(user.email, orderId);
    }

    logger.info('Order cancelled successfully', { orderId });

    return { success: true, orderId };
  }
}

// =============================================================================
// PRODUCTION IMPLEMENTATIONS (Adapters)
// =============================================================================

/**
 * Production database-backed user repository.
 */
class PostgresUserRepository extends UserRepository {
  constructor(connectionPool) {
    super();
    if (!connectionPool) throw new Error('connectionPool is required');
    this.pool = connectionPool;
  }

  async findById(userId) {
    const result = await this.pool.query(
      'SELECT id, name, email, payment_token FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      paymentToken: row.payment_token
    };
  }

  async findByEmail(email) {
    const result = await this.pool.query(
      'SELECT id, name, email, payment_token FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      paymentToken: row.payment_token
    };
  }
}

/**
 * Production order repository.
 */
class PostgresOrderRepository extends OrderRepository {
  constructor(connectionPool) {
    super();
    if (!connectionPool) throw new Error('connectionPool is required');
    this.pool = connectionPool;
  }

  async save(order) {
    await this.pool.query(
      `INSERT INTO orders (id, user_id, items, subtotal, tax, total, status,
       payment_transaction_id, reservation_ids, created_at, cancelled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status, cancelled_at = EXCLUDED.cancelled_at`,
      [
        order.orderId, order.userId, JSON.stringify(order.items),
        order.subtotal, order.tax, order.total, order.status,
        order.paymentTransactionId, JSON.stringify(order.reservationIds),
        order.createdAt, order.cancelledAt || null
      ]
    );
  }

  async findById(orderId) {
    const result = await this.pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId) {
    const result = await this.pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }
}

/**
 * Production email service using SMTP.
 */
class SmtpEmailService extends EmailService {
  constructor(smtpClient) {
    super();
    if (!smtpClient) throw new Error('smtpClient is required');
    this.smtp = smtpClient;
  }

  async sendOrderConfirmation(to, orderId, total) {
    await this.smtp.send({
      to,
      subject: 'Order Confirmed',
      body: `Your order ${orderId} for $${total.toFixed(2)} has been confirmed!`
    });
  }

  async sendOrderCancellation(to, orderId) {
    await this.smtp.send({
      to,
      subject: 'Order Cancelled',
      body: `Your order ${orderId} has been cancelled. A refund will be processed.`
    });
  }
}

/**
 * Production logger with structured JSON output.
 */
class StructuredLogger extends Logger {
  constructor(serviceName) {
    super();
    this.serviceName = serviceName;
  }

  log(level, message, context) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context
    };
    console.log(JSON.stringify(entry));
  }

  info(message, context = {}) {
    this.log('info', message, context);
  }

  error(message, context = {}) {
    this.log('error', message, context);
  }

  warn(message, context = {}) {
    this.log('warn', message, context);
  }
}

/**
 * In-memory cache with TTL support.
 */
class InMemoryCache extends Cache {
  constructor() {
    super();
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  delete(key) {
    this.store.delete(key);
  }
}

// =============================================================================
// COMPOSITION ROOT
// =============================================================================

/**
 * Creates a fully-wired OrderService for production.
 * This is the ONLY place where dependencies are assembled.
 * Business logic never knows about wiring.
 */
function createProductionOrderService(connectionPool, smtpClient) {
  // Create infrastructure dependencies
  const logger = new StructuredLogger('order-service');
  const cache = new InMemoryCache();
  const clock = new Clock();
  const idGenerator = new IdGenerator();

  // Create infrastructure context (grouped)
  const infra = new InfrastructureContext({
    logger,
    cache,
    clock,
    idGenerator
  });

  // Create configuration from environment
  const config = new OrderConfig({
    taxRate: parseFloat(process.env.TAX_RATE || '0.1'),
    cacheTtlMs: parseInt(process.env.CACHE_TTL_MS || '60000', 10),
    maxItemsPerOrder: parseInt(process.env.MAX_ITEMS_PER_ORDER || '100', 10),
    enableEmailNotifications: process.env.ENABLE_EMAILS !== 'false'
  });

  // Create repositories (would use real implementations in production)
  const userRepository = new PostgresUserRepository(connectionPool);
  const orderRepository = new PostgresOrderRepository(connectionPool);

  // Create external service clients
  const emailService = new SmtpEmailService(smtpClient);

  // Payment gateway and inventory service would be similar...
  // For this example, we'll create inline implementations
  const paymentGateway = {
    async charge(amount, token) {
      console.log(`[Production] Charging $${amount} to ${token}`);
      return { success: true, transactionId: `txn-${Date.now()}` };
    },
    async refund(transactionId, amount) {
      console.log(`[Production] Refunding $${amount} for ${transactionId}`);
      return { success: true };
    }
  };

  const inventoryService = {
    async checkStock(productId) {
      return { productId, available: 100 };
    },
    async reserve(productId, quantity) {
      return { reservationId: `res-${Date.now()}`, productId, quantity };
    },
    async release(reservationId) {
      console.log(`[Production] Released reservation ${reservationId}`);
    }
  };

  // Wire everything together
  return new OrderService({
    userRepository,
    orderRepository,
    emailService,
    paymentGateway,
    inventoryService,
    config,
    infra
  });
}

// =============================================================================
// TEST DOUBLES (Simple Fakes - No Mocking Framework Needed)
// =============================================================================

/**
 * Fake user repository for testing.
 */
class FakeUserRepository extends UserRepository {
  constructor(users = []) {
    super();
    this.users = new Map(users.map(u => [u.id, u]));
  }

  async findById(userId) {
    return this.users.get(userId) || null;
  }

  async findByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  // Test helper
  addUser(user) {
    this.users.set(user.id, user);
  }
}

/**
 * Fake order repository for testing.
 */
class FakeOrderRepository extends OrderRepository {
  constructor() {
    super();
    this.orders = new Map();
  }

  async save(order) {
    this.orders.set(order.orderId, { ...order });
  }

  async findById(orderId) {
    return this.orders.get(orderId) || null;
  }

  async findByUserId(userId) {
    return Array.from(this.orders.values())
      .filter(o => o.userId === userId);
  }

  // Test helpers
  getSavedOrders() {
    return Array.from(this.orders.values());
  }

  clear() {
    this.orders.clear();
  }
}

/**
 * Fake email service that records sent emails.
 */
class FakeEmailService extends EmailService {
  constructor() {
    super();
    this.sentEmails = [];
  }

  async sendOrderConfirmation(to, orderId, total) {
    this.sentEmails.push({
      type: 'confirmation',
      to,
      orderId,
      total
    });
  }

  async sendOrderCancellation(to, orderId) {
    this.sentEmails.push({
      type: 'cancellation',
      to,
      orderId
    });
  }

  // Test helpers
  getEmailsSentTo(email) {
    return this.sentEmails.filter(e => e.to === email);
  }

  clear() {
    this.sentEmails = [];
  }
}

/**
 * Fake payment gateway for testing.
 */
class FakePaymentGateway extends PaymentGateway {
  constructor() {
    super();
    this.charges = [];
    this.refunds = [];
    this.shouldFail = false;
  }

  async charge(amount, paymentToken) {
    if (this.shouldFail) {
      return { success: false, error: 'Payment declined' };
    }
    const transactionId = `txn-test-${this.charges.length + 1}`;
    this.charges.push({ amount, paymentToken, transactionId });
    return { success: true, transactionId };
  }

  async refund(transactionId, amount) {
    this.refunds.push({ transactionId, amount });
    return { success: true };
  }

  // Test helpers
  setFailure(shouldFail) {
    this.shouldFail = shouldFail;
  }

  getCharges() {
    return this.charges;
  }

  getRefunds() {
    return this.refunds;
  }
}

/**
 * Fake inventory service for testing.
 */
class FakeInventoryService extends InventoryService {
  constructor() {
    super();
    this.stock = new Map();
    this.reservations = [];
    this.releasedReservations = [];
  }

  async checkStock(productId) {
    const available = this.stock.get(productId) || 0;
    return { productId, available };
  }

  async reserve(productId, quantity) {
    const reservationId = `res-test-${this.reservations.length + 1}`;
    this.reservations.push({ reservationId, productId, quantity });
    return { reservationId, productId, quantity };
  }

  async release(reservationId) {
    this.releasedReservations.push(reservationId);
  }

  // Test helpers
  setStock(productId, quantity) {
    this.stock.set(productId, quantity);
  }

  getReservations() {
    return this.reservations;
  }

  getReleasedReservations() {
    return this.releasedReservations;
  }
}

/**
 * Fake clock for deterministic time in tests.
 */
class FakeClock extends Clock {
  constructor(fixedTime) {
    super();
    this.fixedTime = fixedTime instanceof Date ? fixedTime : new Date(fixedTime);
  }

  now() {
    return new Date(this.fixedTime);
  }

  // Test helper - advance time
  advance(ms) {
    this.fixedTime = new Date(this.fixedTime.getTime() + ms);
  }
}

/**
 * Fake ID generator for deterministic IDs in tests.
 */
class FakeIdGenerator extends IdGenerator {
  constructor(orderIds = [], reservationIds = []) {
    super();
    this.orderIds = [...orderIds];
    this.reservationIds = [...reservationIds];
    this.orderIdIndex = 0;
    this.reservationIdIndex = 0;
  }

  generateOrderId() {
    if (this.orderIdIndex >= this.orderIds.length) {
      return `ORD-AUTO-${this.orderIdIndex++}`;
    }
    return this.orderIds[this.orderIdIndex++];
  }

  generateReservationId() {
    if (this.reservationIdIndex >= this.reservationIds.length) {
      return `RES-AUTO-${this.reservationIdIndex++}`;
    }
    return this.reservationIds[this.reservationIdIndex++];
  }
}

/**
 * Null logger for tests that don't care about logging.
 */
class NullLogger extends Logger {
  info() {}
  error() {}
  warn() {}
}

/**
 * Recording logger for tests that verify logging behavior.
 */
class RecordingLogger extends Logger {
  constructor() {
    super();
    this.logs = [];
  }

  info(message, context = {}) {
    this.logs.push({ level: 'info', message, context });
  }

  error(message, context = {}) {
    this.logs.push({ level: 'error', message, context });
  }

  warn(message, context = {}) {
    this.logs.push({ level: 'warn', message, context });
  }

  // Test helpers
  getLogsWithMessage(message) {
    return this.logs.filter(l => l.message.includes(message));
  }

  clear() {
    this.logs = [];
  }
}

// =============================================================================
// TESTS - NOW TRIVIAL BECAUSE DEPENDENCIES ARE EXPLICIT
// =============================================================================

/**
 * Helper to create a fully configured test OrderService.
 */
function createTestOrderService(overrides = {}) {
  const userRepository = overrides.userRepository || new FakeUserRepository([
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', paymentToken: 'tok-123' }
  ]);

  const orderRepository = overrides.orderRepository || new FakeOrderRepository();
  const emailService = overrides.emailService || new FakeEmailService();
  const paymentGateway = overrides.paymentGateway || new FakePaymentGateway();
  const inventoryService = overrides.inventoryService || new FakeInventoryService();

  // Set up default stock
  if (inventoryService instanceof FakeInventoryService && !overrides.inventoryService) {
    inventoryService.setStock(101, 100);
    inventoryService.setStock(102, 50);
  }

  const config = overrides.config || new OrderConfig({
    taxRate: 0.1,
    enableEmailNotifications: true
  });

  const infra = overrides.infra || new InfrastructureContext({
    logger: overrides.logger || new NullLogger(),
    cache: overrides.cache || new InMemoryCache(),
    clock: overrides.clock || new FakeClock('2024-01-15T10:00:00Z'),
    idGenerator: overrides.idGenerator || new FakeIdGenerator(['ORD-TEST-001'])
  });

  return new OrderService({
    userRepository,
    orderRepository,
    emailService,
    paymentGateway,
    inventoryService,
    config,
    infra
  });
}

async function runTests() {
  console.log('========================================');
  console.log('RUNNING TESTS WITH EXPLICIT DEPENDENCIES');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.log(`  FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 1: Create order successfully');
  // -------------------------------------------------------------------------
  {
    const orderRepo = new FakeOrderRepository();
    const emailService = new FakeEmailService();
    const paymentGateway = new FakePaymentGateway();

    const service = createTestOrderService({
      orderRepository: orderRepo,
      emailService,
      paymentGateway
    });

    const order = await service.createOrder('user-1', [
      { productId: 101, name: 'Widget', price: 29.99, quantity: 2 }
    ]);

    // Deterministic assertions - everything is controlled!
    assert(order.orderId === 'ORD-TEST-001', 'Order ID is deterministic');
    assert(order.timestamp !== undefined || order.createdAt === '2024-01-15T10:00:00.000Z', 'Timestamp is controlled');
    assert(order.subtotal === 59.98, 'Subtotal calculated correctly');
    assert(order.tax === 5.998, 'Tax calculated correctly (10%)');
    assert(order.total === 65.978, 'Total is subtotal + tax');
    assert(order.status === 'confirmed', 'Order status is confirmed');

    assert(orderRepo.getSavedOrders().length === 1, 'Order was saved');
    assert(paymentGateway.getCharges().length === 1, 'Payment was charged');
    assert(paymentGateway.getCharges()[0].amount === 65.978, 'Correct amount charged');

    // Wait a tick for async email
    await new Promise(r => setTimeout(r, 10));
    assert(emailService.sentEmails.length === 1, 'Confirmation email sent');
    assert(emailService.sentEmails[0].to === 'john@example.com', 'Email sent to correct address');
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 2: Payment failure rolls back inventory');
  // -------------------------------------------------------------------------
  {
    const paymentGateway = new FakePaymentGateway();
    paymentGateway.setFailure(true); // Configure fake to fail

    const inventoryService = new FakeInventoryService();
    inventoryService.setStock(101, 100);

    const service = createTestOrderService({
      paymentGateway,
      inventoryService
    });

    try {
      await service.createOrder('user-1', [
        { productId: 101, name: 'Widget', price: 29.99, quantity: 2 }
      ]);
      assert(false, 'Should have thrown error');
    } catch (error) {
      assert(error.message === 'Payment declined', 'Correct error thrown');
      assert(inventoryService.getReservations().length === 1, 'Reservation was made');
      assert(inventoryService.getReleasedReservations().length === 1, 'Reservation was released');
    }
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 3: Insufficient stock throws error');
  // -------------------------------------------------------------------------
  {
    const inventoryService = new FakeInventoryService();
    inventoryService.setStock(101, 1); // Only 1 in stock

    const service = createTestOrderService({ inventoryService });

    try {
      await service.createOrder('user-1', [
        { productId: 101, name: 'Widget', price: 29.99, quantity: 5 } // Want 5
      ]);
      assert(false, 'Should have thrown error');
    } catch (error) {
      assert(error.message.includes('Insufficient stock'), 'Correct error for stock');
    }
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 4: User not found throws error');
  // -------------------------------------------------------------------------
  {
    const userRepo = new FakeUserRepository([]); // No users
    const service = createTestOrderService({ userRepository: userRepo });

    try {
      await service.createOrder('nonexistent-user', [
        { productId: 101, name: 'Widget', price: 29.99, quantity: 1 }
      ]);
      assert(false, 'Should have thrown error');
    } catch (error) {
      assert(error.message.includes('User not found'), 'Correct error for missing user');
    }
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 5: Email disabled via config');
  // -------------------------------------------------------------------------
  {
    const emailService = new FakeEmailService();
    const config = new OrderConfig({ enableEmailNotifications: false });

    const service = createTestOrderService({ emailService, config });

    await service.createOrder('user-1', [
      { productId: 101, name: 'Widget', price: 29.99, quantity: 1 }
    ]);

    await new Promise(r => setTimeout(r, 10));
    assert(emailService.sentEmails.length === 0, 'No email sent when disabled');
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 6: Logging captures order creation');
  // -------------------------------------------------------------------------
  {
    const logger = new RecordingLogger();
    const infra = new InfrastructureContext({
      logger,
      cache: new InMemoryCache(),
      clock: new FakeClock('2024-01-15T10:00:00Z'),
      idGenerator: new FakeIdGenerator(['ORD-LOG-TEST'])
    });

    const service = createTestOrderService({ infra, logger });

    await service.createOrder('user-1', [
      { productId: 101, name: 'Widget', price: 29.99, quantity: 1 }
    ]);

    const creationLogs = logger.getLogsWithMessage('Creating order');
    const successLogs = logger.getLogsWithMessage('successfully');

    assert(creationLogs.length === 1, 'Order creation logged');
    assert(creationLogs[0].context.orderId === 'ORD-LOG-TEST', 'Log includes order ID');
    assert(successLogs.length === 1, 'Success logged');
  }

  // -------------------------------------------------------------------------
  console.log('\nTest 7: Cache is used for repeated user lookups');
  // -------------------------------------------------------------------------
  {
    const userRepo = new FakeUserRepository([
      { id: 'user-1', name: 'John', email: 'john@example.com', paymentToken: 'tok-1' }
    ]);

    // Spy on findById calls
    let findByIdCalls = 0;
    const originalFindById = userRepo.findById.bind(userRepo);
    userRepo.findById = async (userId) => {
      findByIdCalls++;
      return originalFindById(userId);
    };

    const cache = new InMemoryCache();
    const infra = new InfrastructureContext({
      logger: new NullLogger(),
      cache,
      clock: new FakeClock('2024-01-15T10:00:00Z'),
      idGenerator: new FakeIdGenerator(['ORD-1', 'ORD-2'])
    });

    const service = createTestOrderService({ userRepository: userRepo, infra });

    // First order - should fetch from repo
    await service.createOrder('user-1', [
      { productId: 101, name: 'Widget', price: 10, quantity: 1 }
    ]);

    // Second order - should use cache
    await service.createOrder('user-1', [
      { productId: 102, name: 'Gadget', price: 20, quantity: 1 }
    ]);

    assert(findByIdCalls === 1, 'User fetched from repo only once (cached)');
  }

  // -------------------------------------------------------------------------
  console.log('\n========================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('All tests demonstrate the benefits of explicit dependencies:');
    console.log('  - Deterministic results (controlled time, IDs)');
    console.log('  - Easy mocking (simple fakes, no framework)');
    console.log('  - Isolated testing (no global state pollution)');
    console.log('  - Verifiable interactions (check what was called)');
    console.log('  - Configurable behavior (flip switches in tests)');
  }
}

// Run the tests
runTests().catch(console.error);

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Interfaces
  UserRepository,
  OrderRepository,
  EmailService,
  PaymentGateway,
  InventoryService,
  Logger,
  Cache,
  Clock,
  IdGenerator,

  // Configuration
  OrderConfig,
  InfrastructureContext,

  // Business Logic
  OrderService,

  // Production Implementations
  PostgresUserRepository,
  PostgresOrderRepository,
  SmtpEmailService,
  StructuredLogger,
  InMemoryCache,

  // Composition
  createProductionOrderService,

  // Test Doubles
  FakeUserRepository,
  FakeOrderRepository,
  FakeEmailService,
  FakePaymentGateway,
  FakeInventoryService,
  FakeClock,
  FakeIdGenerator,
  NullLogger,
  RecordingLogger,
  createTestOrderService
};
