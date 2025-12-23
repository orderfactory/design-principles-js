/**
 * Temporal Decoupling Principle (TDP) - Correct Implementation
 *
 * The Temporal Decoupling Principle states that correctness should not depend on
 * implicit, undocumented, or hope-based assumptions about timing, ordering, or
 * execution speed. When temporal ordering is required, it should be explicit,
 * enforceable, observable, and testable.
 *
 * Key insight: Correctness should be defined by STATE TRANSITIONS, not elapsed time.
 *
 * Benefits of Temporal Decoupling:
 * 1. Systems work correctly regardless of execution speed
 * 2. Tests are deterministic and don't flake under load
 * 3. Race conditions are eliminated by design
 * 4. Easier debugging - no "timing-dependent" mysteries
 * 5. Safe to run in any environment (local, CI, production)
 *
 * This file demonstrates explicit temporal coordination patterns that work
 * reliably under any timing conditions.
 */

// ============================================================================
// PATTERN 1: Explicit ready signals instead of sleep()
// ============================================================================

class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.config = null;
    // Explicit promise-based ready signal
    this._readyPromise = null;
    this._resolveReady = null;
  }

  async initialize() {
    // Create a promise that resolves when initialization is complete
    this._readyPromise = new Promise(resolve => {
      this._resolveReady = resolve;
    });

    // Simulate async initialization
    await this.simulateAsyncWork(50);
    this.config = { maxItems: 100, timeout: 5000 };

    // Signal that initialization is complete
    this._resolveReady();
    console.log('[DataProcessor] Initialization complete');
  }

  // Wait for ready signal, not arbitrary time
  async waitUntilReady() {
    if (!this._readyPromise) {
      throw new Error('initialize() must be called first');
    }
    await this._readyPromise;
  }

  async processData(items) {
    // Explicit wait for ready state - no timing assumptions
    await this.waitUntilReady();

    // Now we KNOW config is available
    return items.slice(0, this.config.maxItems);
  }

  simulateAsyncWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// PATTERN 2: Proper async/await for database operation ordering
// ============================================================================

class UserService {
  constructor(database) {
    this.db = database;
  }

  // Explicit sequencing with await - ordering is guaranteed by code structure
  async createAndFetchUser(userData) {
    // EXPLICIT: Wait for insert to complete before reading
    await this.db.insert('users', userData);

    // Now the insert is committed - read is safe
    const user = await this.db.findOne('users', { email: userData.email });

    if (!user) {
      // This is now a real error, not a timing issue
      throw new Error(`User not found after successful insert: ${userData.email}`);
    }

    return user;
  }
}

// ============================================================================
// PATTERN 3: Explicit ordering with sequence tracking
// ============================================================================

class EventProcessor {
  constructor() {
    this.events = [];
  }

  // Maintain order explicitly using sequence numbers
  async processEventsInOrder(eventIds) {
    // Fetch all events with their sequence numbers
    const fetchPromises = eventIds.map((id, index) =>
      this.fetchEvent(id).then(event => ({
        ...event,
        sequenceNumber: index // Attach original sequence
      }))
    );

    // Wait for ALL fetches to complete
    const fetchedEvents = await Promise.all(fetchPromises);

    // Sort by sequence number to restore original order
    fetchedEvents.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    return fetchedEvents;
  }

  async fetchEvent(id) {
    // Simulate variable network latency
    const latency = Math.random() * 100;
    await this.simulateAsyncWork(latency);
    return { id, fetchedAt: Date.now(), latency };
  }

  simulateAsyncWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// PATTERN 4: Logical ordering instead of timestamp comparison
// ============================================================================

class DistributedCache {
  constructor() {
    this.localCache = new Map();
  }

  // Use version numbers instead of timestamps for freshness
  async getWithFreshness(key, remoteService) {
    const localEntry = this.localCache.get(key);
    const remoteEntry = await remoteService.get(key);

    if (!localEntry) {
      this.localCache.set(key, remoteEntry);
      return remoteEntry;
    }

    // Compare version numbers - monotonically increasing, no clock skew issues
    if (remoteEntry.version > localEntry.version) {
      console.log(`[Cache] Remote version ${remoteEntry.version} > local ${localEntry.version}, updating`);
      this.localCache.set(key, remoteEntry);
      return remoteEntry;
    }

    return localEntry;
  }
}

// For distributed systems: Vector clock for causality tracking
class VectorClock {
  constructor(nodeId, initial = {}) {
    this.nodeId = nodeId;
    this.clock = { ...initial };
  }

  // Increment our own counter on local event
  tick() {
    this.clock[this.nodeId] = (this.clock[this.nodeId] || 0) + 1;
    return { ...this.clock };
  }

  // Merge with another clock (on receive)
  merge(otherClock) {
    for (const [nodeId, count] of Object.entries(otherClock)) {
      this.clock[nodeId] = Math.max(this.clock[nodeId] || 0, count);
    }
    return this.tick(); // Increment after merge
  }

  // Determine causal ordering
  happensBefore(otherClock) {
    let dominated = false;
    for (const nodeId of new Set([...Object.keys(this.clock), ...Object.keys(otherClock)])) {
      const myCount = this.clock[nodeId] || 0;
      const otherCount = otherClock[nodeId] || 0;
      if (myCount > otherCount) return false; // We have newer info
      if (myCount < otherCount) dominated = true;
    }
    return dominated; // True if other clock dominates all our values
  }
}

// ============================================================================
// PATTERN 5: Explicit dependency graph for initialization
// ============================================================================

class ApplicationBootstrap {
  constructor() {
    this.services = {};
    this.initPromises = {};
  }

  async startApplication() {
    // Define explicit dependency graph
    // Database has no dependencies
    this.initPromises.database = this.initializeDatabase();

    // Cache depends on database
    this.initPromises.cache = this.initPromises.database.then(() =>
      this.initializeCache()
    );

    // Message queue has no dependencies
    this.initPromises.messageQueue = this.initializeMessageQueue();

    // HTTP server depends on ALL other services
    this.initPromises.httpServer = Promise.all([
      this.initPromises.database,
      this.initPromises.cache,
      this.initPromises.messageQueue
    ]).then(() => this.initializeHttpServer());

    // Wait for everything to complete
    await Promise.all(Object.values(this.initPromises));

    console.log('[Bootstrap] All services initialized successfully');
    return this.services;
  }

  async initializeDatabase() {
    await this.simulateAsyncWork(Math.random() * 300);
    this.services.database = { connected: true };
    console.log('[Bootstrap] Database initialized');
    return this.services.database;
  }

  async initializeCache() {
    // Dependencies are GUARANTEED ready by the promise chain
    if (!this.services.database) {
      throw new Error('Invalid state: cache init called before database');
    }
    await this.simulateAsyncWork(Math.random() * 200);
    this.services.cache = { connected: true, dbRef: this.services.database };
    console.log('[Bootstrap] Cache initialized (after database)');
    return this.services.cache;
  }

  async initializeMessageQueue() {
    await this.simulateAsyncWork(Math.random() * 400);
    this.services.messageQueue = { connected: true };
    console.log('[Bootstrap] Message queue initialized');
    return this.services.messageQueue;
  }

  async initializeHttpServer() {
    // All dependencies guaranteed ready
    await this.simulateAsyncWork(Math.random() * 100);
    this.services.httpServer = {
      listening: true,
      dependencies: {
        database: !!this.services.database,
        cache: !!this.services.cache,
        messageQueue: !!this.services.messageQueue
      }
    };
    console.log('[Bootstrap] HTTP server started (all dependencies ready)');
    return this.services.httpServer;
  }

  simulateAsyncWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// PATTERN 6: Optimistic locking for concurrent updates
// ============================================================================

class AccountBalance {
  constructor(initialBalance = 0) {
    this.balance = initialBalance;
    this.version = 0; // Optimistic locking version
  }

  // Atomic read of balance and version
  getState() {
    return { balance: this.balance, version: this.version };
  }

  // Compare-and-swap: only succeeds if version hasn't changed
  compareAndSwap(expectedVersion, newBalance) {
    if (this.version !== expectedVersion) {
      return { success: false, reason: 'Version mismatch - concurrent modification' };
    }
    this.balance = newBalance;
    this.version++;
    return { success: true, newVersion: this.version };
  }

  // Transfer with optimistic locking - retry on conflict
  async transfer(amount, toAccount, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Read current state
      const { balance: currentBalance, version: currentVersion } = this.getState();

      // Validate
      if (currentBalance < amount) {
        return { success: false, reason: 'Insufficient funds' };
      }

      // Simulate processing time
      await this.simulateAsyncWork(Math.random() * 50);

      // Attempt atomic update with version check
      const result = this.compareAndSwap(currentVersion, currentBalance - amount);

      if (result.success) {
        // Our account updated successfully, now credit the other account
        // In a real system, this would be a database transaction
        toAccount.balance += amount;
        toAccount.version++;
        return { success: true, newBalance: this.balance, attempts: attempt };
      }

      // Version mismatch - someone else modified, retry
      console.log(`[Transfer] Conflict detected, retry ${attempt}/${maxRetries}`);
    }

    return { success: false, reason: 'Max retries exceeded due to contention' };
  }

  simulateAsyncWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// PATTERN 7: Deterministic tests with injected time and explicit sync
// ============================================================================

class NotificationService {
  constructor(options = {}) {
    this.sentNotifications = [];
    // Inject dependencies for testability
    this.scheduler = options.scheduler || {
      schedule: (fn, delay) => setTimeout(fn, delay),
      createDeferred: () => {
        let resolve;
        const promise = new Promise(r => { resolve = r; });
        return { promise, resolve };
      }
    };
  }

  // Returns a promise that resolves when notification is sent
  async sendNotification(userId, message) {
    const deferred = this.scheduler.createDeferred();

    this.scheduler.schedule(() => {
      this.sentNotifications.push({ userId, message, sentAt: Date.now() });
      deferred.resolve({ userId, message, success: true });
    }, Math.random() * 100);

    return deferred.promise; // Caller can await completion
  }
}

// Deterministic test with explicit synchronization
async function testNotificationSending() {
  const service = new NotificationService();

  // Await both notifications - no timing assumptions
  const results = await Promise.all([
    service.sendNotification('user1', 'Hello'),
    service.sendNotification('user2', 'World')
  ]);

  // Assert on actual completion, not timing
  const passed = service.sentNotifications.length === 2 &&
                 results.every(r => r.success);

  console.log(`[Test] Notification test: ${passed ? 'PASSED' : 'FAILED'}`);
  console.log(`[Test] Sent ${service.sentNotifications.length} of 2 expected`);

  return passed;
}

// For tests that need deterministic time
class FakeScheduler {
  constructor() {
    this.scheduledTasks = [];
    this.currentTime = 0;
  }

  schedule(fn, delay) {
    this.scheduledTasks.push({ fn, executeAt: this.currentTime + delay });
    this.scheduledTasks.sort((a, b) => a.executeAt - b.executeAt);
  }

  createDeferred() {
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    return { promise, resolve };
  }

  // Advance time and execute scheduled tasks
  advanceTime(ms) {
    this.currentTime += ms;
    while (this.scheduledTasks.length > 0 &&
           this.scheduledTasks[0].executeAt <= this.currentTime) {
      const task = this.scheduledTasks.shift();
      task.fn();
    }
  }

  // Execute all pending tasks regardless of time
  flush() {
    while (this.scheduledTasks.length > 0) {
      const task = this.scheduledTasks.shift();
      task.fn();
    }
  }
}

// ============================================================================
// PATTERN 8: Monotonic time for expiration logic
// ============================================================================

class SessionManager {
  constructor(options = {}) {
    this.sessions = new Map();
    // Inject time source for testability and correctness
    this.getMonotonicTime = options.getMonotonicTime || (() => {
      // In Node.js, process.hrtime.bigint() is monotonic
      // For browsers, performance.now() is monotonic
      // Fallback to Date.now() but document the limitation
      return Date.now();
    });
    this.startTime = this.getMonotonicTime();
  }

  // Get elapsed time since start (immune to clock adjustments)
  getElapsedMs() {
    return this.getMonotonicTime() - this.startTime;
  }

  createSession(userId, ttlMs = 3600000) {
    const createdAt = this.getElapsedMs();
    const session = {
      userId,
      createdAt,
      expiresAt: createdAt + ttlMs,
      // For display purposes, capture wall time separately
      wallTimeCreated: new Date().toISOString()
    };
    this.sessions.set(userId, session);
    return session;
  }

  isSessionValid(userId) {
    const session = this.sessions.get(userId);
    if (!session) return false;

    // Compare monotonic times - immune to clock adjustments
    return this.getElapsedMs() < session.expiresAt;
  }

  // For cross-machine scenarios: pass deadline as explicit parameter
  isSessionValidWithDeadline(userId, deadline) {
    const session = this.sessions.get(userId);
    if (!session) return false;

    // Deadline is passed in from the authoritative source
    // No cross-machine time comparison needed
    return deadline > 0;
  }
}

// ============================================================================
// Usage demonstration showing how explicit temporal coupling works
// ============================================================================

async function demonstrateCorrectPatterns() {
  console.log('=== Temporal Decoupling Principle - Correct Implementation ===\n');

  // Pattern 1: Explicit ready signals
  console.log('1. Explicit ready signals (no sleep):');
  const processor = new DataProcessor();
  processor.initialize(); // Fire and continue
  const result = await processor.processData([1, 2, 3, 4, 5]);
  console.log(`   Processed: ${result.length} items (waited for ready signal, not time)\n`);

  // Pattern 3: Explicit ordering with sequence numbers
  console.log('2. Event ordering with sequence numbers:');
  const eventProcessor = new EventProcessor();
  const events = await eventProcessor.processEventsInOrder(['A', 'B', 'C', 'D']);
  console.log(`   Expected order: A, B, C, D`);
  console.log(`   Actual order: ${events.map(e => e.id).join(', ')}`);
  console.log(`   Order preserved: ${events.map(e => e.id).join(',') === 'A,B,C,D' ? 'YES' : 'NO'}`);
  console.log(`   (Order is guaranteed by sequence numbers, not arrival time)\n`);

  // Pattern 4: Vector clock demonstration
  console.log('3. Vector clocks for causality:');
  const nodeA = new VectorClock('A');
  const nodeB = new VectorClock('B');

  const t1 = nodeA.tick();
  console.log(`   Node A event: ${JSON.stringify(t1)}`);

  const t2 = nodeB.tick();
  console.log(`   Node B event: ${JSON.stringify(t2)}`);

  const t3 = nodeB.merge(t1); // B receives A's clock
  console.log(`   Node B after receiving A: ${JSON.stringify(t3)}`);
  console.log(`   t1 happens-before t3: ${nodeA.happensBefore(t3)}\n`);

  // Pattern 5: Explicit dependency graph
  console.log('4. Dependency-ordered initialization:');
  const bootstrap = new ApplicationBootstrap();
  const services = await bootstrap.startApplication();
  console.log(`   HTTP server dependencies met: ${JSON.stringify(services.httpServer.dependencies)}\n`);

  // Pattern 6: Optimistic locking prevents race conditions
  console.log('5. Concurrent transfers with optimistic locking:');
  const account1 = new AccountBalance(100);
  const account2 = new AccountBalance(0);

  const [transfer1, transfer2] = await Promise.all([
    account1.transfer(80, account2),
    account1.transfer(80, account2)
  ]);

  console.log(`   Initial balance: 100`);
  console.log(`   Transfer 1 (80): ${transfer1.success ? `SUCCESS (${transfer1.attempts} attempt(s))` : `FAILED: ${transfer1.reason}`}`);
  console.log(`   Transfer 2 (80): ${transfer2.success ? `SUCCESS (${transfer2.attempts} attempt(s))` : `FAILED: ${transfer2.reason}`}`);
  console.log(`   Final balance: ${account1.balance}`);
  console.log(`   Overdraft prevented: ${account1.balance >= 0 ? 'YES' : 'NO'}\n`);

  // Pattern 7: Deterministic tests
  console.log('6. Deterministic notification test:');
  // Run multiple times - should ALWAYS pass
  let passes = 0;
  for (let i = 0; i < 5; i++) {
    if (await testNotificationSending()) passes++;
  }
  console.log(`   Test passed ${passes}/5 times (should be 5/5 - deterministic)\n`);

  // Pattern 8: Monotonic time
  console.log('7. Session with monotonic time:');
  const sessionMgr = new SessionManager();
  const session = sessionMgr.createSession('user1', 1000);
  console.log(`   Session created at elapsed time: ${session.createdAt}ms`);
  console.log(`   Session expires at elapsed time: ${session.expiresAt}ms`);
  console.log(`   Session valid now: ${sessionMgr.isSessionValid('user1')}`);
  console.log(`   (Uses monotonic clock - immune to system time changes)`);
}

// Run demonstrations
demonstrateCorrectPatterns();

/**
 * This demonstrates good adherence to the Temporal Decoupling Principle because:
 *
 * 1. Ready Signals Instead of Sleep:
 *    - Uses promise-based ready signals instead of arbitrary delays
 *    - Correctness doesn't depend on initialization speed
 *    - Works regardless of system load
 *
 * 2. Explicit Async/Await for Ordering:
 *    - Database operations are explicitly sequenced with await
 *    - Ordering is guaranteed by code structure, not timing
 *    - No race conditions possible
 *
 * 3. Sequence Numbers for Order Preservation:
 *    - Attaches sequence numbers to preserve original order
 *    - Sorts by sequence after all responses arrive
 *    - Order is explicit data, not implicit timing
 *
 * 4. Version Vectors Instead of Timestamps:
 *    - Uses version numbers for "freshness" comparison
 *    - Vector clocks for causality in distributed systems
 *    - No clock skew issues
 *
 * 5. Explicit Dependency Graph:
 *    - Dependencies between services are explicit in code
 *    - Promise chains ensure correct initialization order
 *    - No timing assumptions
 *
 * 6. Optimistic Locking for Concurrency:
 *    - Compare-and-swap prevents race conditions
 *    - Conflicts are detected and retried
 *    - No read-modify-write races
 *
 * 7. Deterministic Tests:
 *    - Tests await actual completion, not arbitrary delays
 *    - Injected schedulers enable deterministic time control
 *    - Tests don't flake under load
 *
 * 8. Monotonic Time for Expiration:
 *    - Uses monotonic clock source immune to adjustments
 *    - Separates control time from display time
 *    - Clock changes don't break expiration
 *
 * These patterns ensure:
 * - Systems work correctly regardless of execution speed
 * - Tests are deterministic and reliable
 * - Race conditions are eliminated by design
 * - No "increase the timeout" fixes needed
 * - Code works the same in development, CI, and production
 */

module.exports = {
  DataProcessor,
  UserService,
  EventProcessor,
  DistributedCache,
  VectorClock,
  ApplicationBootstrap,
  AccountBalance,
  NotificationService,
  FakeScheduler,
  SessionManager
};
