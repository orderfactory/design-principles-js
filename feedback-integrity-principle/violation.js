// Feedback Integrity Principle (FIP) — Violation
// Anti-patterns: lying about outcomes, false precision, hidden uncertainty,
// fire-and-forget without tracking, health checks that misrepresent capability.

/**
 * VIOLATION: This code demonstrates systems that misrepresent their state,
 * claim more certainty than they possess, and hide uncertainty behind
 * confident-sounding responses.
 *
 * Key violations:
 * 1. Returning "success" for operations that are merely queued
 * 2. Health checks that report "healthy" when degraded
 * 3. Swallowing errors and returning defaults silently
 * 4. False precision in error messages (guessing causes)
 * 5. Fire-and-forget operations with no outcome tracking
 * 6. Metrics that measure attempts, not actual outcomes
 */

// ============================================================================
// VIOLATION 1: Claiming success for merely-acknowledged work
// ============================================================================

class OrderService {
  constructor() {
    this.queue = [];
    this.processedCount = 0;
    this.failedCount = 0;
  }

  /**
   * VIOLATION: Returns "success" immediately when the order is only queued.
   * The order might fail during async processing, but caller believes it succeeded.
   */
  async createOrder(orderData) {
    // Just push to queue - actual processing happens later
    this.queue.push({
      id: 'order_' + Date.now(),
      data: orderData,
      status: 'pending'
    });

    // LIE: Claiming the order was "created successfully" when it was only queued
    // Caller has no way to know if it actually succeeds later
    return {
      success: true,  // This is a lie - we don't know yet
      message: 'Order created successfully',
      orderId: this.queue[this.queue.length - 1].id
    };
  }

  // Background processor that might fail - but caller never finds out
  async processQueue() {
    for (const order of this.queue) {
      try {
        // Simulate processing that might fail
        if (Math.random() < 0.3) {
          throw new Error('Payment declined');
        }
        order.status = 'completed';
        this.processedCount++;
      } catch (e) {
        order.status = 'failed';
        this.failedCount++;
        // Failure is silent - original caller was told "success"
      }
    }
  }
}

// ============================================================================
// VIOLATION 2: Health check that lies about actual capability
// ============================================================================

class HealthChecker {
  constructor(dependencies) {
    this.db = dependencies.db;
    this.cache = dependencies.cache;
    this.paymentGateway = dependencies.paymentGateway;
  }

  /**
   * VIOLATION: Only checks if process is running, not actual capability.
   * Reports "healthy" even when critical dependencies are down.
   */
  async check() {
    // LIE: Just checking if we can respond, not if we can actually serve requests
    return {
      status: 'healthy',
      uptime: process.uptime?.() || 12345
    };

    // Never checks:
    // - Can we reach the database?
    // - Is the cache responding?
    // - Is the payment gateway available?
    // - Are we serving errors to users?
  }
}

// ============================================================================
// VIOLATION 3: Swallowing errors and returning plausible defaults
// ============================================================================

class UserProfileService {
  constructor(database) {
    this.db = database;
  }

  /**
   * VIOLATION: Swallows database errors and returns default data.
   * Caller believes they got real user data when they got fabricated defaults.
   */
  async getProfile(userId) {
    try {
      return await this.db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
    } catch (error) {
      // VIOLATION: Swallow the error, return fake "default" profile
      // Caller has no idea they're getting fabricated data
      console.log('DB error, returning default');
      return {
        id: userId,
        name: 'User',           // Fabricated
        email: 'unknown',       // Fabricated
        preferences: {},        // Fabricated
        // No indication this is fake/default data
      };
    }
  }

  /**
   * VIOLATION: Returns cached data without indicating staleness.
   * Caller believes they have authoritative data when it might be hours old.
   */
  async getProfileWithCache(userId) {
    const cached = this.cache?.get(userId);
    if (cached) {
      // LIE: Returns cached data as if it were fresh
      // No indication of cache hit, no staleness indicator
      return cached;
    }

    const fresh = await this.db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
    this.cache?.set(userId, fresh);
    return fresh;
  }
}

// ============================================================================
// VIOLATION 4: False precision in error reporting
// ============================================================================

class PaymentProcessor {
  /**
   * VIOLATION: Guesses at error causes and reports them as fact.
   * When we don't know why something failed, we make up plausible-sounding reasons.
   */
  async processPayment(paymentData) {
    try {
      const response = await this.callPaymentGateway(paymentData);
      return { success: true, transactionId: response.id };
    } catch (error) {
      // VIOLATION: We don't know WHY it failed, but we guess and report as fact
      let fabricatedReason;

      if (error.message?.includes('timeout')) {
        // FALSE PRECISION: Could be network, could be gateway overloaded, could be anything
        fabricatedReason = 'Payment gateway is temporarily unavailable';
      } else if (error.message?.includes('400')) {
        // FALSE PRECISION: Could be our bug, could be data issue, could be gateway bug
        fabricatedReason = 'Invalid card number provided';
      } else {
        // FALSE PRECISION: We have no idea what happened
        fabricatedReason = 'Card was declined by issuing bank';
      }

      return {
        success: false,
        error: fabricatedReason,  // Reported as fact, but it's a guess
        // No indication of uncertainty
        // No correlation ID for debugging
        // Original error details lost
      };
    }
  }

  async callPaymentGateway(data) {
    // Simulate external call
    if (Math.random() < 0.5) {
      throw new Error('timeout after 5000ms');
    }
    return { id: 'txn_' + Date.now() };
  }
}

// ============================================================================
// VIOLATION 5: Fire-and-forget with no outcome tracking
// ============================================================================

class NotificationService {
  /**
   * VIOLATION: Fire-and-forget with no way to know if notification was delivered.
   * Returns immediately, claims "sent", but has no idea if it actually worked.
   */
  async sendNotification(userId, message) {
    // Fire and forget - no tracking, no callback, no status check
    this.emailService?.send(userId, message).catch(() => {
      // Silently swallow failures
    });

    // LIE: Claiming "sent" when we only attempted to send
    return {
      success: true,
      message: 'Notification sent successfully'
    };
  }

  /**
   * VIOLATION: Bulk operation with no per-item status tracking.
   * Returns aggregate "success" even if many items failed.
   */
  async sendBulkNotifications(userIds, message) {
    let attempted = 0;
    let silentFailures = 0;

    for (const userId of userIds) {
      attempted++;
      try {
        await this.emailService?.send(userId, message);
      } catch (e) {
        silentFailures++;
        // Failures are counted but not reported to caller
      }
    }

    // LIE: Reports success even with failures
    // Caller has no idea 40% of notifications failed
    return {
      success: true,
      message: `Sent ${attempted} notifications`
      // silentFailures is hidden from caller
    };
  }
}

// ============================================================================
// VIOLATION 6: Metrics that lie about reality
// ============================================================================

class MetricsCollector {
  constructor() {
    this.requestsAttempted = 0;
    this.requestsSucceeded = 0;  // But we don't actually track this correctly
  }

  /**
   * VIOLATION: Counts attempt as success before knowing outcome.
   * Dashboard shows 99% success rate while users experience 50% failures.
   */
  recordRequest(operation) {
    this.requestsAttempted++;
    // VIOLATION: Incrementing "success" before we know the outcome
    this.requestsSucceeded++;  // Lies on the dashboard
  }

  getSuccessRate() {
    // Reports artificially high success rate
    return (this.requestsSucceeded / this.requestsAttempted) * 100;
  }
}

// ============================================================================
// VIOLATION 7: Async status that never updates
// ============================================================================

class AsyncJobService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * VIOLATION: Creates job with status endpoint, but status is never updated.
   * Caller polls forever seeing "processing" even after job completes or fails.
   */
  async submitJob(jobData) {
    const jobId = 'job_' + Date.now();

    this.jobs.set(jobId, {
      status: 'processing',  // Set once, never updated
      createdAt: new Date().toISOString()
    });

    // Start async processing
    this.processJobAsync(jobId, jobData);

    return {
      jobId,
      statusUrl: `/jobs/${jobId}/status`
    };
  }

  async processJobAsync(jobId, data) {
    await new Promise(r => setTimeout(r, 1000));
    // VIOLATION: Job completes but status is never updated
    // Caller polling /jobs/{id}/status sees "processing" forever
    console.log(`Job ${jobId} finished, but status not updated`);
  }

  getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { error: 'Job not found' };
    }
    // Always returns stale status - never reflects actual completion
    return { status: job.status };
  }
}

// ============================================================================
// Demo showing the problems
// ============================================================================

async function demonstrateViolations() {
  console.log('=== Feedback Integrity Violations Demo ===\n');

  // Violation 1: False success for queued work
  const orderService = new OrderService();
  const orderResult = await orderService.createOrder({ item: 'widget', qty: 1 });
  console.log('Order API response:', orderResult);
  console.log('Caller thinks order succeeded, but it might fail in processing...\n');

  // Violation 2: Health check lies
  const healthChecker = new HealthChecker({ db: null, cache: null });
  const health = await healthChecker.check();
  console.log('Health check (with null dependencies):', health);
  console.log('Reports healthy even though DB and cache are null!\n');

  // Violation 4: False precision
  const paymentProcessor = new PaymentProcessor();
  const paymentResult = await paymentProcessor.processPayment({ amount: 100 });
  console.log('Payment result:', paymentResult);
  console.log('Error message sounds authoritative but is fabricated\n');

  // Violation 5: Fire and forget
  const notificationService = new NotificationService();
  const notifyResult = await notificationService.sendNotification('user1', 'Hello');
  console.log('Notification result:', notifyResult);
  console.log('Says "sent successfully" but emailService is undefined!\n');

  // Violation 6: Lying metrics
  const metrics = new MetricsCollector();
  metrics.recordRequest('op1');
  metrics.recordRequest('op2');
  metrics.recordRequest('op3');
  console.log('Success rate:', metrics.getSuccessRate() + '%');
  console.log('Shows 100% even though no operations actually completed\n');

  // Violation 7: Stale async status
  const jobService = new AsyncJobService();
  const job = await jobService.submitJob({ task: 'process' });
  console.log('Job submitted:', job);
  await new Promise(r => setTimeout(r, 1500)); // Wait for job to "complete"
  console.log('Job status after completion:', jobService.getJobStatus(job.jobId));
  console.log('Still shows "processing" even though job finished!\n');
}

if (require.main === module) {
  demonstrateViolations().catch(console.error);
}

module.exports = {
  OrderService,
  HealthChecker,
  UserProfileService,
  PaymentProcessor,
  NotificationService,
  MetricsCollector,
  AsyncJobService,
};
