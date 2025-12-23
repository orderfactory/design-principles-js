/**
 * Temporal Decoupling Principle (TDP) - Violation
 *
 * The Temporal Decoupling Principle states that correctness should not depend on
 * implicit, undocumented, or hope-based assumptions about timing, ordering, or
 * execution speed. When temporal ordering is required, it should be explicit,
 * enforceable, observable, and testable.
 *
 * This file demonstrates violations of TDP through implicit temporal coupling
 * that works "most of the time" but fails under load, in CI, or in production.
 */

// ============================================================================
// VIOLATION 1: Using sleep() for coordination instead of explicit synchronization
// ============================================================================

class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.isReady = false;
  }

  // Simulates async initialization
  async initialize() {
    // Simulate loading configuration from external source
    setTimeout(() => {
      this.config = { maxItems: 100, timeout: 5000 };
      this.isReady = true;
      console.log('[DataProcessor] Initialization complete');
    }, 50); // Takes ~50ms "usually"
  }

  // VIOLATION: Assumes initialize() completes within 100ms
  async processData(items) {
    // "Wait a bit" for initialization - classic temporal coupling violation
    await this.sleep(100); // Hope-based timing: "50ms init + 50ms buffer should be enough"

    if (!this.isReady) {
      // This "never happens" in development, but fails in CI under load
      throw new Error('Processor not ready - increase sleep time?');
    }

    return items.slice(0, this.config.maxItems);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// VIOLATION 2: Assuming database operations complete in order
// ============================================================================

class UserService {
  constructor(database) {
    this.db = database;
  }

  // VIOLATION: Assumes INSERT completes before SELECT without explicit coordination
  async createAndFetchUser(userData) {
    // Fire off the insert (no await - "it's fast")
    this.db.insert('users', userData);

    // Immediately try to read - works locally, fails under load
    // The insert might not be committed yet!
    const user = await this.db.findOne('users', { email: userData.email });

    if (!user) {
      // "Weird, this sometimes happens in production..."
      console.log('[UserService] User not found after insert - retrying...');
      await this.sleep(50); // Another hope-based fix
      return this.db.findOne('users', { email: userData.email });
    }

    return user;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// VIOLATION 3: Relying on callback/event ordering
// ============================================================================

class EventProcessor {
  constructor() {
    this.events = [];
    this.processedCount = 0;
  }

  // VIOLATION: Assumes events arrive and are processed in send order
  async processEventsInOrder(eventIds) {
    const results = [];

    // Fire off all event fetches "in parallel for speed"
    eventIds.forEach(id => {
      this.fetchEvent(id).then(event => {
        // VIOLATION: Assumes these callbacks execute in the order events were sent
        // In reality, faster responses arrive first, scrambling order
        results.push(event);
        this.processedCount++;
      });
    });

    // VIOLATION: Assumes all callbacks complete within 200ms
    await this.sleep(200);

    // Results are in arrival order, not send order!
    return results;
  }

  async fetchEvent(id) {
    // Simulate variable network latency
    const latency = Math.random() * 100;
    await this.sleep(latency);
    return { id, fetchedAt: Date.now(), latency };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// VIOLATION 4: Cross-service timestamp comparison
// ============================================================================

class DistributedCache {
  constructor() {
    this.localCache = new Map();
  }

  // VIOLATION: Compares timestamps from different machines
  async getWithFreshness(key, remoteService) {
    const localEntry = this.localCache.get(key);
    const remoteEntry = await remoteService.get(key);

    if (!localEntry) {
      this.localCache.set(key, remoteEntry);
      return remoteEntry;
    }

    // VIOLATION: Assumes clocks are synchronized across machines
    // In reality, clock skew can be seconds or even minutes
    if (remoteEntry.timestamp > localEntry.timestamp) {
      // "Remote is newer" - but is it really? Clock skew says maybe not.
      console.log('[Cache] Remote entry is newer, updating local cache');
      this.localCache.set(key, remoteEntry);
      return remoteEntry;
    }

    return localEntry;
  }
}

// ============================================================================
// VIOLATION 5: Order-dependent initialization
// ============================================================================

class ApplicationBootstrap {
  constructor() {
    this.services = {};
  }

  // VIOLATION: Assumes services initialize in declaration order
  async startApplication() {
    // These are all async and may complete in any order
    this.initializeDatabase();
    this.initializeCache();
    this.initializeMessageQueue();
    this.initializeHttpServer();

    // VIOLATION: Assumes 500ms is "enough time" for everything
    await this.sleep(500);

    // Check if everything is ready - spoiler: sometimes it's not
    if (!this.services.database || !this.services.cache) {
      throw new Error('Services failed to initialize in time');
    }

    console.log('[Bootstrap] Application started successfully');
    return this.services;
  }

  async initializeDatabase() {
    await this.sleep(Math.random() * 300); // Variable init time
    this.services.database = { connected: true };
    console.log('[Bootstrap] Database initialized');
  }

  async initializeCache() {
    // VIOLATION: Assumes database is ready (it might not be!)
    if (!this.services.database) {
      console.log('[Bootstrap] Warning: Cache init before database ready');
    }
    await this.sleep(Math.random() * 200);
    this.services.cache = { connected: true };
    console.log('[Bootstrap] Cache initialized');
  }

  async initializeMessageQueue() {
    await this.sleep(Math.random() * 400);
    this.services.messageQueue = { connected: true };
    console.log('[Bootstrap] Message queue initialized');
  }

  async initializeHttpServer() {
    // VIOLATION: HTTP server might start accepting requests before dependencies ready
    await this.sleep(Math.random() * 100);
    this.services.httpServer = { listening: true };
    console.log('[Bootstrap] HTTP server started');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// VIOLATION 6: Race condition in concurrent updates
// ============================================================================

class AccountBalance {
  constructor(initialBalance = 0) {
    this.balance = initialBalance;
  }

  // VIOLATION: Read-modify-write without synchronization
  async transfer(amount, toAccount) {
    // Read current balance
    const currentBalance = this.balance;

    // Simulate some processing time (network call, validation, etc.)
    await this.sleep(Math.random() * 50);

    // VIOLATION: Assumes balance hasn't changed during processing
    // Another concurrent transfer could have modified it!
    if (currentBalance >= amount) {
      this.balance = currentBalance - amount;
      toAccount.balance += amount;
      return { success: true, newBalance: this.balance };
    }

    return { success: false, reason: 'Insufficient funds' };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// VIOLATION 7: Flaky test due to timing assumptions
// ============================================================================

class NotificationService {
  constructor() {
    this.sentNotifications = [];
  }

  async sendNotification(userId, message) {
    // Simulate async notification sending
    setTimeout(() => {
      this.sentNotifications.push({ userId, message, sentAt: Date.now() });
    }, Math.random() * 100); // Variable latency
  }
}

// VIOLATION: Test relies on timing instead of explicit synchronization
async function testNotificationSending() {
  const service = new NotificationService();

  service.sendNotification('user1', 'Hello');
  service.sendNotification('user2', 'World');

  // VIOLATION: Assumes notifications are sent within 150ms
  // Passes locally, flakes in CI
  await new Promise(resolve => setTimeout(resolve, 150));

  const passed = service.sentNotifications.length === 2;
  console.log(`[Test] Notification test: ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`[Test] Sent ${service.sentNotifications.length} of 2 expected`);

  return passed;
}

// ============================================================================
// VIOLATION 8: Expiration logic using wall clock across boundaries
// ============================================================================

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(userId, ttlMs = 3600000) {
    const session = {
      userId,
      // VIOLATION: Uses wall clock for expiration
      // Clock adjustments, DST, or clock skew can break this
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now()
    };
    this.sessions.set(userId, session);
    return session;
  }

  // VIOLATION: Compares wall clock times that may have drifted
  isSessionValid(userId) {
    const session = this.sessions.get(userId);
    if (!session) return false;

    // If system clock was adjusted backward, sessions might never expire
    // If adjusted forward, sessions might expire prematurely
    return Date.now() < session.expiresAt;
  }
}

// ============================================================================
// Usage demonstration showing how these violations manifest
// ============================================================================

async function demonstrateViolations() {
  console.log('=== Temporal Decoupling Principle Violations ===\n');

  // Violation 1: Sleep-based coordination
  console.log('1. Sleep-based coordination (usually works, sometimes fails):');
  const processor = new DataProcessor();
  processor.initialize(); // Fire and forget
  try {
    const result = await processor.processData([1, 2, 3, 4, 5]);
    console.log(`   Processed: ${result.length} items`);
  } catch (e) {
    console.log(`   FAILED: ${e.message}`);
  }

  // Violation 3: Callback ordering assumptions
  console.log('\n2. Event ordering assumptions:');
  const eventProcessor = new EventProcessor();
  const events = await eventProcessor.processEventsInOrder(['A', 'B', 'C', 'D']);
  console.log(`   Expected order: A, B, C, D`);
  console.log(`   Actual order: ${events.map(e => e.id).join(', ')}`);
  console.log(`   Order preserved: ${events.map(e => e.id).join(',') === 'A,B,C,D' ? 'YES' : 'NO (race condition!)'}`);

  // Violation 5: Order-dependent initialization
  console.log('\n3. Order-dependent initialization:');
  const bootstrap = new ApplicationBootstrap();
  try {
    await bootstrap.startApplication();
  } catch (e) {
    console.log(`   FAILED: ${e.message}`);
  }

  // Violation 6: Race condition in concurrent updates
  console.log('\n4. Race condition in concurrent transfers:');
  const account1 = new AccountBalance(100);
  const account2 = new AccountBalance(0);

  // Two concurrent transfers of 80 each from account with 100 balance
  // Without proper synchronization, both might succeed (overdraft!)
  const [transfer1, transfer2] = await Promise.all([
    account1.transfer(80, account2),
    account1.transfer(80, account2)
  ]);

  console.log(`   Initial balance: 100`);
  console.log(`   Transfer 1 (80): ${transfer1.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   Transfer 2 (80): ${transfer2.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   Final balance: ${account1.balance}`);
  console.log(`   Both succeeded: ${transfer1.success && transfer2.success ? 'YES (BUG! Overdraft!)' : 'NO (correct rejection)'}`);

  // Violation 7: Flaky test
  console.log('\n5. Flaky test demonstration:');
  // Run multiple times to show flakiness
  let passes = 0;
  for (let i = 0; i < 5; i++) {
    if (await testNotificationSending()) passes++;
  }
  console.log(`   Test passed ${passes}/5 times (flaky if not 5/5)`);
}

// Run demonstrations
demonstrateViolations();

/**
 * This violates the Temporal Decoupling Principle because:
 *
 * 1. Sleep-based Coordination:
 *    - Uses sleep(100) to "wait for initialization" instead of explicit ready signals
 *    - Works when init takes < 100ms, fails under load or slow systems
 *    - The "fix" of increasing sleep time just delays the inevitable failure
 *
 * 2. Assumed Database Operation Order:
 *    - Fires INSERT without await, then immediately SELECTs
 *    - Assumes write commits before read executes
 *    - Fails when database is slow or under load
 *
 * 3. Callback Ordering Assumptions:
 *    - Assumes promise callbacks execute in request order
 *    - Actually executes in completion order (race condition)
 *    - Results arrive scrambled under variable latency
 *
 * 4. Cross-Machine Timestamp Comparison:
 *    - Compares Date.now() from different machines
 *    - Clock skew makes "newer" determination unreliable
 *    - Can lead to data loss or stale data being preferred
 *
 * 5. Order-Dependent Initialization:
 *    - Fires all initializations concurrently without coordination
 *    - Uses sleep(500) hoping everything finishes
 *    - Services may start before dependencies are ready
 *
 * 6. Race Condition in Concurrent Updates:
 *    - Read-modify-write without locking or atomic operations
 *    - Multiple transfers can read same balance, both succeed
 *    - Leads to negative balances (overdraft bug)
 *
 * 7. Flaky Tests:
 *    - Tests rely on setTimeout completing within expected time
 *    - Pass locally, fail in CI under load
 *    - "Fix" by increasing timeouts just makes tests slower
 *
 * 8. Wall Clock Expiration:
 *    - Uses Date.now() for session expiration across machines
 *    - Clock adjustments can break expiration logic
 *    - Sessions may never expire or expire prematurely
 *
 * These violations create systems that:
 * - Work during development but fail in production
 * - Have intermittent, hard-to-reproduce bugs
 * - Require "increase the timeout" as a recurring fix
 * - Generate flaky tests that erode confidence
 * - Fail catastrophically under load or adverse conditions
 */

module.exports = {
  DataProcessor,
  UserService,
  EventProcessor,
  DistributedCache,
  ApplicationBootstrap,
  AccountBalance,
  NotificationService,
  SessionManager
};
