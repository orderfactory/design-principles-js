// Feedback Integrity Principle (FIP) — Correct Implementation
// Goal: Systems communicate outcomes that are honest about scope, appropriate to
// audience, and bounded by contract. Never claim more certainty than possessed.

/**
 * CORRECT: This code demonstrates systems that:
 * 1. Define success relative to explicit contract boundaries
 * 2. Distinguish acknowledgment from completion
 * 3. Report honest uncertainty rather than false confidence
 * 4. Layer truth appropriately for different audiences
 * 5. Track and communicate evolving status for async operations
 * 6. Provide health checks that reflect actual capability
 */

// ============================================================================
// Shared infrastructure for honest feedback
// ============================================================================

/**
 * Outcome represents the result of an operation with explicit certainty levels.
 * This prevents "success" from being used ambiguously.
 */
class Outcome {
  static acknowledged(data) {
    return { status: 'acknowledged', certainty: 'received', data };
  }
  static completed(data) {
    return { status: 'completed', certainty: 'confirmed', data };
  }
  static failed(error, certainty = 'confirmed') {
    return { status: 'failed', certainty, error };
  }
  static unknown(reason) {
    return { status: 'unknown', certainty: 'undetermined', reason };
  }
  static pending(trackingInfo) {
    return { status: 'pending', certainty: 'in_progress', ...trackingInfo };
  }
}

/**
 * OperationTracker provides honest status tracking for async operations.
 */
class OperationTracker {
  constructor() {
    this.operations = new Map();
  }

  create(operationId, metadata = {}) {
    const operation = {
      id: operationId,
      status: 'pending',
      certainty: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ status: 'pending', timestamp: new Date().toISOString() }],
      metadata
    };
    this.operations.set(operationId, operation);
    return operation;
  }

  update(operationId, status, details = {}) {
    const op = this.operations.get(operationId);
    if (!op) return null;

    op.status = status;
    op.updatedAt = new Date().toISOString();
    op.history.push({
      status,
      timestamp: op.updatedAt,
      ...details
    });
    Object.assign(op, details);
    return op;
  }

  get(operationId) {
    return this.operations.get(operationId) || null;
  }
}

// ============================================================================
// CORRECT 1: Honest acknowledgment vs completion distinction
// ============================================================================

class OrderService {
  constructor(tracker, paymentService, inventoryService) {
    this.tracker = tracker;
    this.payment = paymentService;
    this.inventory = inventoryService;
    this.orders = new Map();
  }

  /**
   * CORRECT: Clearly distinguishes "accepted" from "completed".
   * Returns 202 Accepted-style response with status tracking URL.
   */
  async submitOrder(orderData) {
    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

    // Create trackable operation
    this.tracker.create(orderId, {
      type: 'order',
      items: orderData.items,
      customerId: orderData.customerId
    });

    // Store order in pending state
    this.orders.set(orderId, {
      ...orderData,
      id: orderId,
      status: 'pending'
    });

    // Start async processing (but don't wait for it)
    this.processOrderAsync(orderId).catch(err => {
      // Ensure failures are tracked, not swallowed
      this.tracker.update(orderId, 'failed', {
        error: { code: err.code || 'PROCESSING_ERROR', message: err.message }
      });
    });

    // HONEST RESPONSE: Clearly indicates this is acknowledgment, not completion
    return {
      // Status clearly indicates accepted-but-not-done
      status: 'accepted',
      message: 'Order received and queued for processing',

      // Contract boundary: what we guarantee at this point
      guarantees: {
        received: true,
        persisted: true,
        processed: false  // Explicitly false - not done yet
      },

      // How to track actual completion
      orderId,
      statusUrl: `/orders/${orderId}/status`,
      expectedCompletionSeconds: 30,

      // Timestamp for client-side tracking
      acceptedAt: new Date().toISOString()
    };
  }

  /**
   * CORRECT: Status endpoint that honestly reports current state,
   * including uncertainty when applicable.
   */
  getOrderStatus(orderId) {
    const tracked = this.tracker.get(orderId);
    if (!tracked) {
      return Outcome.failed({
        code: 'ORDER_NOT_FOUND',
        message: 'No order found with this ID',
        suggestion: 'Verify the order ID or contact support'
      });
    }

    // Return complete status history for transparency
    return {
      orderId,
      currentStatus: tracked.status,
      certainty: tracked.certainty,
      createdAt: tracked.createdAt,
      updatedAt: tracked.updatedAt,
      history: tracked.history,
      // Include any completion data if available
      ...(tracked.completionData && { result: tracked.completionData })
    };
  }

  async processOrderAsync(orderId) {
    const order = this.orders.get(orderId);

    // Update status as we progress through steps
    this.tracker.update(orderId, 'processing', { step: 'validating' });

    // Step 1: Validate inventory
    this.tracker.update(orderId, 'processing', { step: 'checking_inventory' });
    const inventoryResult = await this.inventory.checkAvailability(order.items);
    if (!inventoryResult.available) {
      this.tracker.update(orderId, 'failed', {
        error: { code: 'INSUFFICIENT_INVENTORY', items: inventoryResult.unavailable }
      });
      return;
    }

    // Step 2: Process payment
    this.tracker.update(orderId, 'processing', { step: 'processing_payment' });
    const paymentResult = await this.payment.charge(order.customerId, order.totalCents);
    if (paymentResult.status === 'failed') {
      this.tracker.update(orderId, 'failed', { error: paymentResult.error });
      return;
    }

    // Step 3: Reserve inventory
    this.tracker.update(orderId, 'processing', { step: 'reserving_inventory' });
    await this.inventory.reserve(order.items);

    // Success - update with completion data
    this.tracker.update(orderId, 'completed', {
      completionData: {
        paymentId: paymentResult.transactionId,
        reservationId: inventoryResult.reservationId,
        completedAt: new Date().toISOString()
      }
    });
  }
}

// ============================================================================
// CORRECT 2: Honest health checks that reflect actual capability
// ============================================================================

class HealthChecker {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  /**
   * CORRECT: Health check that actually verifies capability to serve requests.
   * Reports honest degraded state rather than lying about being healthy.
   */
  async check() {
    const checks = {};
    let overallHealthy = true;
    let degraded = false;

    // Check each dependency with timeout
    for (const [name, dep] of Object.entries(this.dependencies)) {
      try {
        const start = Date.now();
        const result = await Promise.race([
          dep.healthCheck?.() || Promise.resolve({ ok: true }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), 2000)
          )
        ]);

        checks[name] = {
          status: result.ok ? 'healthy' : 'unhealthy',
          latencyMs: Date.now() - start,
          details: result.details
        };

        if (!result.ok) {
          if (dep.critical) {
            overallHealthy = false;
          } else {
            degraded = true;
          }
        }
      } catch (error) {
        checks[name] = {
          status: 'unhealthy',
          error: error.message,
          // HONEST: Report what we know and don't know
          certainty: error.message.includes('timeout') ? 'uncertain' : 'confirmed'
        };

        if (dep.critical !== false) {
          overallHealthy = false;
        } else {
          degraded = true;
        }
      }
    }

    // HONEST status that reflects actual capability
    let status;
    if (!overallHealthy) {
      status = 'unhealthy';
    } else if (degraded) {
      status = 'degraded';  // Honest about partial capability
    } else {
      status = 'healthy';
    }

    return {
      status,
      // What this health check actually guarantees
      capabilities: {
        canAcceptRequests: overallHealthy,
        fullFunctionality: overallHealthy && !degraded,
        readOnly: degraded && overallHealthy  // Example of degraded mode
      },
      checks,
      checkedAt: new Date().toISOString()
    };
  }
}

// ============================================================================
// CORRECT 3: Honest error reporting without false precision
// ============================================================================

class PaymentService {
  constructor(logger) {
    this.log = logger;
  }

  /**
   * CORRECT: Reports what we actually know about failures.
   * Does not fabricate causes when uncertain.
   */
  async charge(customerId, amountCents) {
    const correlationId = 'pay_' + Date.now();

    try {
      const response = await this.callGateway({ customerId, amountCents });
      return Outcome.completed({
        transactionId: response.id,
        amountCents,
        correlationId
      });
    } catch (error) {
      // HONEST ERROR REPORTING: Report what we know, acknowledge what we don't

      // Layer 1: Technical details for operators (logged)
      this.log?.error('payment.failed', {
        correlationId,
        customerId,
        amountCents,
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorCode: error.code,
        stack: error.stack?.split('\n').slice(0, 3)
      });

      // Determine what we actually know
      const errorInfo = this.classifyError(error);

      // Layer 2: Structured error for API consumers
      return Outcome.failed({
        code: errorInfo.code,
        message: errorInfo.message,
        // HONEST: Indicate certainty level
        certainty: errorInfo.certainty,
        // Actionable guidance based on what we know
        suggestion: errorInfo.suggestion,
        // For support escalation
        correlationId,
        // If we're uncertain, say so
        ...(errorInfo.certainty === 'uncertain' && {
          note: 'The exact cause could not be determined. Please retry or contact support.'
        })
      });
    }
  }

  /**
   * Classifies errors honestly, acknowledging uncertainty.
   */
  classifyError(error) {
    // Known, certain errors
    if (error.code === 'CARD_DECLINED') {
      return {
        code: 'PAYMENT_DECLINED',
        message: 'The payment was declined by the card issuer',
        certainty: 'confirmed',
        suggestion: 'Please try a different payment method'
      };
    }

    if (error.code === 'INVALID_CARD') {
      return {
        code: 'INVALID_PAYMENT_METHOD',
        message: 'The card number is invalid',
        certainty: 'confirmed',
        suggestion: 'Please check the card number and try again'
      };
    }

    // Timeout - we genuinely don't know the outcome
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return {
        code: 'PAYMENT_UNCERTAIN',
        message: 'The payment request timed out',
        certainty: 'uncertain',  // HONEST: We don't know what happened
        suggestion: 'Please check your payment history before retrying'
      };
    }

    // Unknown error - be honest about not knowing
    return {
      code: 'PAYMENT_ERROR',
      message: 'An error occurred while processing the payment',
      certainty: 'uncertain',
      suggestion: 'Please try again or contact support with the correlation ID'
    };
  }

  async callGateway(data) {
    // Simulate external call with various outcomes
    const rand = Math.random();
    if (rand < 0.1) {
      const err = new Error('Connection timeout');
      err.code = 'ETIMEDOUT';
      throw err;
    }
    if (rand < 0.2) {
      const err = new Error('Card declined');
      err.code = 'CARD_DECLINED';
      throw err;
    }
    return { id: 'txn_' + Date.now() };
  }

  async healthCheck() {
    try {
      // Actually verify we can reach the payment gateway
      await Promise.race([
        this.callGateway({ test: true, amountCents: 0 }),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 1000))
      ]);
      return { ok: true };
    } catch {
      return { ok: false, details: 'Cannot reach payment gateway' };
    }
  }
}

// ============================================================================
// CORRECT 4: Cache responses that indicate staleness
// ============================================================================

class CachingProfileService {
  constructor(database, cache) {
    this.db = database;
    this.cache = cache;
  }

  /**
   * CORRECT: Returns data with explicit freshness indicators.
   * Caller always knows if data is cached and how old it is.
   */
  async getProfile(userId) {
    // Check cache first
    const cached = this.cache?.get(userId);
    if (cached) {
      const ageMs = Date.now() - cached.cachedAt;
      const isStale = ageMs > 60000; // > 1 minute is considered stale

      return {
        data: cached.data,
        // HONEST: Clear indicators of data freshness
        source: 'cache',
        freshness: {
          cachedAt: new Date(cached.cachedAt).toISOString(),
          ageMs,
          isStale,
          // Guidance for caller
          note: isStale
            ? 'Data may be outdated. Refresh recommended for critical operations.'
            : 'Data is recent.'
        }
      };
    }

    // Fetch fresh data
    try {
      const data = await this.db.query(`SELECT * FROM users WHERE id = ?`, [userId]);

      if (!data) {
        return Outcome.failed({
          code: 'USER_NOT_FOUND',
          message: `No user found with ID: ${userId}`
        });
      }

      // Cache for future requests
      this.cache?.set(userId, { data, cachedAt: Date.now() });

      return {
        data,
        source: 'database',
        freshness: {
          fetchedAt: new Date().toISOString(),
          isStale: false
        }
      };
    } catch (error) {
      // HONEST: Don't return fake defaults, report the failure
      return Outcome.failed({
        code: 'DATABASE_ERROR',
        message: 'Unable to retrieve user profile',
        certainty: 'confirmed',
        // For debugging
        correlationId: 'db_' + Date.now()
      });
    }
  }
}

// ============================================================================
// CORRECT 5: Notification service with delivery tracking
// ============================================================================

class NotificationService {
  constructor(emailProvider, tracker) {
    this.email = emailProvider;
    this.tracker = tracker;
  }

  /**
   * CORRECT: Tracks notification delivery and reports honest status.
   */
  async sendNotification(userId, message, options = {}) {
    const notificationId = 'notif_' + Date.now();

    // Create tracked operation
    this.tracker.create(notificationId, { userId, type: 'notification' });

    if (options.async) {
      // Async: acknowledge receipt, track delivery separately
      this.deliverAsync(notificationId, userId, message);

      return {
        status: 'accepted',
        message: 'Notification queued for delivery',
        notificationId,
        statusUrl: `/notifications/${notificationId}/status`,
        // HONEST: Clear about what we guarantee
        guarantees: {
          queued: true,
          delivered: false  // Not yet
        }
      };
    }

    // Sync: wait for delivery confirmation
    try {
      const result = await this.email.send(userId, message);
      this.tracker.update(notificationId, 'delivered', { deliveryId: result.id });

      return {
        status: 'delivered',
        notificationId,
        deliveryId: result.id,
        guarantees: {
          queued: true,
          delivered: true
        }
      };
    } catch (error) {
      this.tracker.update(notificationId, 'failed', { error: error.message });

      return Outcome.failed({
        code: 'DELIVERY_FAILED',
        message: 'Failed to deliver notification',
        notificationId,
        // Can retry
        retryable: true
      });
    }
  }

  async deliverAsync(notificationId, userId, message) {
    try {
      this.tracker.update(notificationId, 'sending');
      const result = await this.email.send(userId, message);
      this.tracker.update(notificationId, 'delivered', { deliveryId: result.id });
    } catch (error) {
      this.tracker.update(notificationId, 'failed', { error: error.message });
      // Move to dead letter queue for retry/investigation
      this.deadLetterQueue?.push({ notificationId, userId, message, error: error.message });
    }
  }

  /**
   * CORRECT: Bulk operation with per-item status tracking.
   */
  async sendBulkNotifications(userIds, message) {
    const batchId = 'batch_' + Date.now();
    const results = [];

    for (const userId of userIds) {
      const result = await this.sendNotification(userId, message, { async: true });
      results.push({ userId, ...result });
    }

    // HONEST: Report exactly what happened
    const succeeded = results.filter(r => r.status === 'accepted').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
      batchId,
      summary: {
        total: userIds.length,
        accepted: succeeded,
        failed,
        // HONEST about partial success
        allSucceeded: failed === 0
      },
      results,  // Full per-item breakdown
      statusUrl: `/notifications/batch/${batchId}/status`
    };
  }
}

// ============================================================================
// CORRECT 6: Metrics that measure actual outcomes
// ============================================================================

class HonestMetrics {
  constructor() {
    this.counters = new Map();
    this.outcomes = new Map();
  }

  /**
   * CORRECT: Records operation start separately from outcome.
   * Never counts start as success.
   */
  startOperation(name) {
    const key = `${name}_started`;
    this.counters.set(key, (this.counters.get(key) || 0) + 1);

    return {
      succeed: (details = {}) => {
        const successKey = `${name}_succeeded`;
        this.counters.set(successKey, (this.counters.get(successKey) || 0) + 1);
        this.recordOutcome(name, 'success', details);
      },
      fail: (details = {}) => {
        const failKey = `${name}_failed`;
        this.counters.set(failKey, (this.counters.get(failKey) || 0) + 1);
        this.recordOutcome(name, 'failure', details);
      },
      unknown: (details = {}) => {
        const unknownKey = `${name}_unknown`;
        this.counters.set(unknownKey, (this.counters.get(unknownKey) || 0) + 1);
        this.recordOutcome(name, 'unknown', details);
      }
    };
  }

  recordOutcome(name, outcome, details) {
    const outcomes = this.outcomes.get(name) || [];
    outcomes.push({ outcome, timestamp: Date.now(), ...details });
    this.outcomes.set(name, outcomes);
  }

  /**
   * CORRECT: Success rate based on actual confirmed outcomes.
   */
  getStats(name) {
    const started = this.counters.get(`${name}_started`) || 0;
    const succeeded = this.counters.get(`${name}_succeeded`) || 0;
    const failed = this.counters.get(`${name}_failed`) || 0;
    const unknown = this.counters.get(`${name}_unknown`) || 0;

    const completed = succeeded + failed;
    const inFlight = started - completed - unknown;

    return {
      started,
      completed,
      succeeded,
      failed,
      unknown,
      inFlight,
      // HONEST: Success rate only counts confirmed outcomes
      successRate: completed > 0 ? (succeeded / completed) * 100 : null,
      // Flag if we have significant unknowns
      hasUncertainty: unknown > 0,
      uncertaintyRate: started > 0 ? (unknown / started) * 100 : 0
    };
  }
}

// ============================================================================
// Supporting mock classes for the demo
// ============================================================================

class MockDatabase {
  async query(sql, params) {
    if (params[0] === 'unknown_user') return null;
    return { id: params[0], name: 'Test User', email: 'test@example.com' };
  }
}

class MockCache {
  constructor() { this.data = new Map(); }
  get(key) { return this.data.get(key); }
  set(key, value) { this.data.set(key, value); }
}

class MockInventory {
  async checkAvailability(items) {
    return { available: true, reservationId: 'res_' + Date.now() };
  }
  async reserve(items) { return true; }
}

class MockEmailProvider {
  async send(userId, message) {
    if (Math.random() < 0.1) throw new Error('Email service unavailable');
    return { id: 'email_' + Date.now() };
  }
}

// ============================================================================
// Demo showing correct FIP implementation
// ============================================================================

async function demonstrateCorrectFIP() {
  console.log('=== Feedback Integrity Principle - Correct Implementation ===\n');

  const tracker = new OperationTracker();
  const metrics = new HonestMetrics();
  const logger = { error: (msg, data) => console.log('LOG:', msg, JSON.stringify(data)) };

  // 1. Order service with honest acknowledgment
  console.log('--- 1. Honest Order Acknowledgment ---');
  const orderService = new OrderService(
    tracker,
    new PaymentService(logger),
    new MockInventory()
  );

  const orderResult = await orderService.submitOrder({
    customerId: 'cust_123',
    items: [{ sku: 'WIDGET-1', qty: 2 }],
    totalCents: 4999
  });
  console.log('Order response:', JSON.stringify(orderResult, null, 2));
  console.log('Note: status is "accepted", not "success" - caller knows to check status\n');

  // Wait and check status
  await new Promise(r => setTimeout(r, 100));
  const status = orderService.getOrderStatus(orderResult.orderId);
  console.log('Order status check:', JSON.stringify(status, null, 2), '\n');

  // 2. Honest health check
  console.log('--- 2. Honest Health Check ---');
  const healthChecker = new HealthChecker({
    database: { healthCheck: async () => ({ ok: true }), critical: true },
    cache: { healthCheck: async () => ({ ok: false, details: 'Connection refused' }), critical: false },
    payment: new PaymentService(logger)
  });

  const health = await healthChecker.check();
  console.log('Health status:', JSON.stringify(health, null, 2));
  console.log('Note: Reports "degraded" not "healthy" when cache is down\n');

  // 3. Payment with honest error reporting
  console.log('--- 3. Honest Payment Error Reporting ---');
  const paymentService = new PaymentService(logger);

  // Force a few attempts to show different error classifications
  for (let i = 0; i < 3; i++) {
    const op = metrics.startOperation('payment');
    const result = await paymentService.charge('cust_123', 2999);
    if (result.status === 'completed') {
      op.succeed();
      console.log('Payment succeeded:', result.data.transactionId);
    } else if (result.error?.certainty === 'uncertain') {
      op.unknown();
      console.log('Payment uncertain:', result.error.message);
    } else {
      op.fail();
      console.log('Payment failed:', result.error.message);
    }
  }
  console.log('\nPayment metrics:', metrics.getStats('payment'), '\n');

  // 4. Cached data with freshness indicators
  console.log('--- 4. Cache with Freshness Indicators ---');
  const profileService = new CachingProfileService(new MockDatabase(), new MockCache());

  const profile1 = await profileService.getProfile('user_123');
  console.log('First fetch:', JSON.stringify(profile1, null, 2));

  const profile2 = await profileService.getProfile('user_123');
  console.log('Second fetch (cached):', JSON.stringify(profile2, null, 2));
  console.log('Note: Cached response clearly indicates source and age\n');

  // 5. Notification with delivery tracking
  console.log('--- 5. Notification with Delivery Tracking ---');
  const notificationService = new NotificationService(new MockEmailProvider(), tracker);

  const notifyResult = await notificationService.sendNotification('user_123', 'Hello!', { async: true });
  console.log('Notification response:', JSON.stringify(notifyResult, null, 2));
  console.log('Note: Status is "accepted" with explicit guarantees about what is/isn\'t done\n');

  // 6. Bulk notification with per-item tracking
  console.log('--- 6. Bulk Notification with Per-Item Status ---');
  const bulkResult = await notificationService.sendBulkNotifications(
    ['user_1', 'user_2', 'user_3'],
    'Bulk message'
  );
  console.log('Bulk notification response:', JSON.stringify(bulkResult, null, 2));
  console.log('Note: Full breakdown of what happened to each item\n');
}

if (require.main === module) {
  demonstrateCorrectFIP().catch(console.error);
}

module.exports = {
  Outcome,
  OperationTracker,
  OrderService,
  HealthChecker,
  PaymentService,
  CachingProfileService,
  NotificationService,
  HonestMetrics,
};
