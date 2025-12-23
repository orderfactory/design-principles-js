/**
 * Blast Radius Containment Principle (BRCP) - CORRECT IMPLEMENTATION
 *
 * This file demonstrates proper implementation of the Blast Radius Containment Principle.
 *
 * BRCP states: Design systems so that when any component fails, the impact is
 * contained to the smallest business-meaningful scope. Failures should be isolated
 * by domain, tenant, request, or feature—remaining highly visible—while never
 * trading correctness or safety for availability.
 *
 * PATTERNS DEMONSTRATED:
 * 1. Per-tenant connection pools with admission control
 * 2. Circuit breakers with observability and recovery
 * 3. Feature isolation with graceful degradation
 * 4. Isolated shared state with namespacing and limits
 * 5. Request isolation with bulkheads and timeouts
 * 6. Admin actions with blast radius limits and confirmation
 * 7. Observable degradation with metrics and alerts
 */

// ============================================================================
// PATTERN 1: Per-Tenant Connection Pools with Admission Control
// Each tenant has isolated resources; one tenant's storm can't affect others
// ============================================================================

class TenantIsolatedDatabasePool {
  constructor(config = {}) {
    this.globalMaxConnections = config.globalMax || 100;
    this.perTenantMax = config.perTenantMax || 10;
    this.tenantPools = new Map();
    this.metrics = new PoolMetrics();
  }

  async getConnection(tenantId) {
    let pool = this.tenantPools.get(tenantId);

    if (!pool) {
      pool = new TenantPool(tenantId, this.perTenantMax, this.metrics);
      this.tenantPools.set(tenantId, pool);
    }

    // Per-tenant limit - this tenant's storm only affects this tenant
    if (pool.activeConnections >= this.perTenantMax) {
      this.metrics.recordRejection(tenantId, 'tenant_pool_exhausted');
      throw new TenantPoolExhaustedError(tenantId);
    }

    // Global limit - prevents total resource exhaustion
    const totalActive = this.getTotalActiveConnections();
    if (totalActive >= this.globalMaxConnections) {
      this.metrics.recordRejection(tenantId, 'global_pool_exhausted');
      throw new GlobalPoolExhaustedError();
    }

    return pool.acquire();
  }

  getTotalActiveConnections() {
    let total = 0;
    for (const pool of this.tenantPools.values()) {
      total += pool.activeConnections;
    }
    return total;
  }

  getMetrics() {
    return {
      globalActive: this.getTotalActiveConnections(),
      globalMax: this.globalMaxConnections,
      tenantPools: Array.from(this.tenantPools.entries()).map(([id, pool]) => ({
        tenantId: id,
        active: pool.activeConnections,
        max: this.perTenantMax
      })),
      rejections: this.metrics.getRejections()
    };
  }
}

class TenantPool {
  constructor(tenantId, maxConnections, metrics) {
    this.tenantId = tenantId;
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.metrics = metrics;
  }

  async acquire() {
    this.activeConnections++;
    this.metrics.recordAcquisition(this.tenantId);

    const startTime = Date.now();

    return {
      tenantId: this.tenantId,
      query: async (sql, timeout = 5000) => {
        // Query timeout prevents indefinite blocking
        return this.executeWithTimeout(sql, timeout);
      },
      release: () => {
        this.activeConnections--;
        this.metrics.recordRelease(this.tenantId, Date.now() - startTime);
      }
    };
  }

  async executeWithTimeout(sql, timeout) {
    return Promise.race([
      this.executeQuery(sql),
      new Promise((_, reject) =>
        setTimeout(() => reject(new QueryTimeoutError(this.tenantId, sql, timeout)), timeout)
      )
    ]);
  }

  async executeQuery(sql) {
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 100));
    return { rows: [] };
  }
}

class PoolMetrics {
  constructor() {
    this.acquisitions = new Map();
    this.rejections = [];
    this.releaseTimes = [];
  }

  recordAcquisition(tenantId) {
    const count = this.acquisitions.get(tenantId) || 0;
    this.acquisitions.set(tenantId, count + 1);
  }

  recordRejection(tenantId, reason) {
    this.rejections.push({ tenantId, reason, timestamp: Date.now() });
    console.log(`[METRIC] Connection rejected: tenant=${tenantId} reason=${reason}`);
  }

  recordRelease(tenantId, holdTimeMs) {
    this.releaseTimes.push({ tenantId, holdTimeMs, timestamp: Date.now() });
  }

  getRejections() {
    return this.rejections;
  }
}

// Custom errors for clear failure signaling
class TenantPoolExhaustedError extends Error {
  constructor(tenantId) {
    super(`Connection pool exhausted for tenant: ${tenantId}`);
    this.tenantId = tenantId;
    this.retryable = true;
    this.httpStatus = 429; // Too Many Requests
  }
}

class GlobalPoolExhaustedError extends Error {
  constructor() {
    super('Global connection pool exhausted');
    this.retryable = true;
    this.httpStatus = 503; // Service Unavailable
  }
}

class QueryTimeoutError extends Error {
  constructor(tenantId, sql, timeout) {
    super(`Query timeout after ${timeout}ms for tenant ${tenantId}`);
    this.tenantId = tenantId;
    this.timeout = timeout;
  }
}

// ============================================================================
// PATTERN 2: Circuit Breaker with Observability and Recovery
// Fails fast when dependency is down, with clear visibility
// ============================================================================

class ObservableCircuitBreaker {
  constructor(name, config = {}) {
    this.name = name;
    this.failureThreshold = config.failureThreshold || 5;
    this.recoveryTimeout = config.recoveryTimeout || 30000;
    this.successThreshold = config.successThreshold || 3;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();

    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      stateChanges: []
    };
  }

  async call(fn, fallback = null) {
    this.metrics.totalCalls++;

    if (this.state === 'OPEN') {
      if (this.shouldAttemptRecovery()) {
        this.transitionTo('HALF_OPEN');
      } else {
        this.metrics.rejectedCalls++;
        this.logRejection();

        if (fallback) {
          return { result: await fallback(), degraded: true, circuitOpen: true };
        }
        throw new CircuitOpenError(this.name, this.getTimeUntilRecoveryAttempt());
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      this.metrics.successfulCalls++;
      return { result, degraded: false, circuitOpen: false };
    } catch (error) {
      this.onFailure(error);
      this.metrics.failedCalls++;

      if (fallback && this.state === 'OPEN') {
        return { result: await fallback(), degraded: true, circuitOpen: true };
      }
      throw error;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transitionTo('CLOSED');
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  onFailure(error) {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      this.transitionTo('OPEN');
    }

    console.log(`[CIRCUIT ${this.name}] Failure recorded: ${error.message} (count: ${this.failureCount}/${this.failureThreshold})`);
  }

  shouldAttemptRecovery() {
    return Date.now() - this.lastFailureTime >= this.recoveryTimeout;
  }

  getTimeUntilRecoveryAttempt() {
    return Math.max(0, this.recoveryTimeout - (Date.now() - this.lastFailureTime));
  }

  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();

    this.metrics.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: Date.now()
    });

    console.log(`[CIRCUIT ${this.name}] State change: ${oldState} -> ${newState}`);

    // ALERT: Open circuit indicates dependency problems
    if (newState === 'OPEN') {
      console.log(`[ALERT] Circuit ${this.name} OPENED - dependency may be down!`);
    }
    if (newState === 'CLOSED' && oldState === 'OPEN') {
      console.log(`[RECOVERY] Circuit ${this.name} recovered after ${Date.now() - this.lastFailureTime}ms`);
    }
  }

  logRejection() {
    console.log(`[CIRCUIT ${this.name}] Call rejected - circuit OPEN (retry in ${this.getTimeUntilRecoveryAttempt()}ms)`);
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      ...this.metrics,
      timeInCurrentState: Date.now() - this.lastStateChange
    };
  }
}

class CircuitOpenError extends Error {
  constructor(circuitName, retryAfterMs) {
    super(`Circuit ${circuitName} is open`);
    this.circuitName = circuitName;
    this.retryAfterMs = retryAfterMs;
    this.httpStatus = 503;
  }
}

// ============================================================================
// PATTERN 3: Feature Isolation with Graceful Degradation
// Non-critical features fail independently; critical path continues
// ============================================================================

class ResilientProductPage {
  constructor(dependencies) {
    this.productService = dependencies.productService;

    // Non-critical services wrapped in circuit breakers
    this.recommendationCircuit = new ObservableCircuitBreaker('recommendations', {
      failureThreshold: 3,
      recoveryTimeout: 10000
    });
    this.reviewCircuit = new ObservableCircuitBreaker('reviews', {
      failureThreshold: 3,
      recoveryTimeout: 10000
    });

    this.recommendationService = dependencies.recommendationService;
    this.reviewService = dependencies.reviewService;
  }

  async renderProductPage(productId) {
    // Critical: Product data MUST succeed
    const product = await this.productService.getProduct(productId);

    // Non-critical: Recommendations - fail gracefully
    const recommendationsResult = await this.recommendationCircuit.call(
      () => this.recommendationService.getRecommendations(productId),
      () => this.getDefaultRecommendations() // Fallback
    );

    // Non-critical: Reviews - fail gracefully
    const reviewsResult = await this.reviewCircuit.call(
      () => this.reviewService.getReviews(productId),
      () => this.getDefaultReviews() // Fallback
    );

    // Page always renders - degraded features are visible in response
    return {
      product,
      recommendations: {
        items: recommendationsResult.result,
        degraded: recommendationsResult.degraded
      },
      reviews: {
        items: reviewsResult.result,
        degraded: reviewsResult.degraded
      },
      _meta: {
        fullyFunctional: !recommendationsResult.degraded && !reviewsResult.degraded,
        degradedFeatures: [
          recommendationsResult.degraded && 'recommendations',
          reviewsResult.degraded && 'reviews'
        ].filter(Boolean)
      }
    };
  }

  getDefaultRecommendations() {
    return [{ id: 'popular-1', name: 'Popular Item', isDefault: true }];
  }

  getDefaultReviews() {
    return [{ message: 'Reviews temporarily unavailable', isDefault: true }];
  }

  getCircuitMetrics() {
    return {
      recommendations: this.recommendationCircuit.getMetrics(),
      reviews: this.reviewCircuit.getMetrics()
    };
  }
}

// ============================================================================
// PATTERN 4: Isolated Shared State with Namespacing and Limits
// Services have isolated cache namespaces with per-namespace limits
// ============================================================================

class IsolatedCache {
  constructor(config = {}) {
    this.namespaces = new Map();
    this.globalMaxSize = config.globalMaxSize || 10000;
    this.perNamespaceMax = config.perNamespaceMax || 1000;
    this.metrics = new CacheMetrics();
  }

  getNamespace(namespaceName) {
    if (!this.namespaces.has(namespaceName)) {
      this.namespaces.set(namespaceName, new CacheNamespace(namespaceName, this.perNamespaceMax, this.metrics));
    }
    return this.namespaces.get(namespaceName);
  }

  // Services get isolated access
  forService(serviceName) {
    const namespace = this.getNamespace(serviceName);
    return {
      get: (key) => namespace.get(key),
      set: (key, value, ttl) => namespace.set(key, value, ttl),
      delete: (key) => namespace.delete(key),
      // Safe keys operation - only within namespace
      keys: () => namespace.keys(),
      getMetrics: () => namespace.getMetrics()
    };
  }

  getGlobalMetrics() {
    const namespaceMetrics = {};
    for (const [name, namespace] of this.namespaces) {
      namespaceMetrics[name] = namespace.getMetrics();
    }
    return {
      totalSize: this.getTotalSize(),
      namespaces: namespaceMetrics
    };
  }

  getTotalSize() {
    let total = 0;
    for (const namespace of this.namespaces.values()) {
      total += namespace.size();
    }
    return total;
  }
}

class CacheNamespace {
  constructor(name, maxSize, metrics) {
    this.name = name;
    this.maxSize = maxSize;
    this.cache = new Map();
    this.metrics = metrics;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && item.expiresAt > Date.now()) {
      this.metrics.recordHit(this.name);
      return item.value;
    }
    if (item) {
      this.cache.delete(key); // Expired
    }
    this.metrics.recordMiss(this.name);
    return null;
  }

  set(key, value, ttl = 3600000) {
    // Per-namespace limit - one service can't evict another's data
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
      this.metrics.recordEviction(this.name, 'namespace_full');
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  delete(key) {
    return this.cache.delete(key);
  }

  keys() {
    // Safe - only returns keys from this namespace
    return Array.from(this.cache.keys());
  }

  size() {
    return this.cache.size;
  }

  evictOldest() {
    let oldest = null;
    let oldestKey = null;

    for (const [key, item] of this.cache) {
      if (!oldest || item.createdAt < oldest.createdAt) {
        oldest = item;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getMetrics() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100
    };
  }
}

class CacheMetrics {
  constructor() {
    this.hits = new Map();
    this.misses = new Map();
    this.evictions = [];
  }

  recordHit(namespace) {
    this.hits.set(namespace, (this.hits.get(namespace) || 0) + 1);
  }

  recordMiss(namespace) {
    this.misses.set(namespace, (this.misses.get(namespace) || 0) + 1);
  }

  recordEviction(namespace, reason) {
    this.evictions.push({ namespace, reason, timestamp: Date.now() });
  }
}

// ============================================================================
// PATTERN 5: Request Isolation with Bulkheads and Timeouts
// Different request types have separate resource pools
// ============================================================================

class BulkheadRequestHandler {
  constructor(config = {}) {
    // Separate pools for different workload types
    this.bulkheads = {
      critical: new Bulkhead('critical', config.criticalMax || 50),
      normal: new Bulkhead('normal', config.normalMax || 30),
      background: new Bulkhead('background', config.backgroundMax || 10)
    };

    this.requestTimeout = config.requestTimeout || 30000;
  }

  async handleRequest(request) {
    const bulkhead = this.getBulkhead(request.priority || 'normal');

    // Try to acquire slot
    if (!bulkhead.tryAcquire()) {
      bulkhead.metrics.recordRejection();
      throw new BulkheadFullError(bulkhead.name, request.id);
    }

    const startTime = Date.now();

    try {
      // Request timeout prevents indefinite blocking
      const result = await this.executeWithTimeout(request, this.getTimeout(request));
      bulkhead.metrics.recordSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      bulkhead.metrics.recordFailure(Date.now() - startTime, error);
      throw error;
    } finally {
      bulkhead.release();
    }
  }

  getBulkhead(priority) {
    return this.bulkheads[priority] || this.bulkheads.normal;
  }

  getTimeout(request) {
    // Critical requests get full timeout, background gets less
    const timeouts = {
      critical: this.requestTimeout,
      normal: this.requestTimeout / 2,
      background: this.requestTimeout / 4
    };
    return timeouts[request.priority] || timeouts.normal;
  }

  async executeWithTimeout(request, timeout) {
    return Promise.race([
      this.processRequest(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new RequestTimeoutError(request.id, timeout)), timeout)
      )
    ]);
  }

  async processRequest(request) {
    // Simulate processing
    const processingTime = request.type === 'export' ? 5000 : 50;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    return { success: true, requestId: request.id };
  }

  getMetrics() {
    const metrics = {};
    for (const [name, bulkhead] of Object.entries(this.bulkheads)) {
      metrics[name] = bulkhead.getMetrics();
    }
    return metrics;
  }
}

class Bulkhead {
  constructor(name, maxConcurrent) {
    this.name = name;
    this.maxConcurrent = maxConcurrent;
    this.activeCalls = 0;
    this.metrics = new BulkheadMetrics(name);
  }

  tryAcquire() {
    if (this.activeCalls >= this.maxConcurrent) {
      console.log(`[BULKHEAD ${this.name}] Rejected - at capacity (${this.activeCalls}/${this.maxConcurrent})`);
      return false;
    }
    this.activeCalls++;
    return true;
  }

  release() {
    this.activeCalls--;
  }

  getMetrics() {
    return {
      name: this.name,
      activeCalls: this.activeCalls,
      maxConcurrent: this.maxConcurrent,
      utilizationPercent: (this.activeCalls / this.maxConcurrent) * 100,
      ...this.metrics.getSummary()
    };
  }
}

class BulkheadMetrics {
  constructor(name) {
    this.name = name;
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.rejectedRequests = 0;
    this.totalLatencyMs = 0;
  }

  recordSuccess(latencyMs) {
    this.totalRequests++;
    this.successfulRequests++;
    this.totalLatencyMs += latencyMs;
  }

  recordFailure(latencyMs, error) {
    this.totalRequests++;
    this.failedRequests++;
    this.totalLatencyMs += latencyMs;
  }

  recordRejection() {
    this.totalRequests++;
    this.rejectedRequests++;
    console.log(`[METRIC] Bulkhead ${this.name} rejection`);
  }

  getSummary() {
    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      rejectedRequests: this.rejectedRequests,
      avgLatencyMs: this.totalRequests > 0 ? this.totalLatencyMs / (this.totalRequests - this.rejectedRequests) : 0
    };
  }
}

class BulkheadFullError extends Error {
  constructor(bulkheadName, requestId) {
    super(`Bulkhead ${bulkheadName} is full, request ${requestId} rejected`);
    this.bulkheadName = bulkheadName;
    this.httpStatus = 429;
    this.retryable = true;
  }
}

class RequestTimeoutError extends Error {
  constructor(requestId, timeoutMs) {
    super(`Request ${requestId} timed out after ${timeoutMs}ms`);
    this.httpStatus = 504;
  }
}

// ============================================================================
// PATTERN 6: Admin Actions with Blast Radius Limits
// Bulk operations require confirmation and have safeguards
// ============================================================================

class SafeAdminService {
  constructor(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.auditLog = dependencies.auditLog;
    this.featureFlagService = dependencies.featureFlagService;
  }

  async updateUserSettings(options) {
    const {
      userIds,        // Explicit list of users (not "all")
      settings,
      confirmedBy,    // Who approved this
      maxAffected = 100, // Safety limit
      dryRun = true   // Default to dry run
    } = options;

    // Blast radius limit
    if (userIds.length > maxAffected) {
      throw new BlastRadiusExceededError('updateUserSettings', userIds.length, maxAffected);
    }

    // Audit before action
    await this.auditLog.record({
      action: 'updateUserSettings',
      initiatedBy: confirmedBy,
      targetCount: userIds.length,
      settings,
      dryRun,
      timestamp: Date.now()
    });

    if (dryRun) {
      return {
        dryRun: true,
        wouldAffect: userIds.length,
        preview: userIds.slice(0, 5) // Show sample
      };
    }

    // Process in batches with progress tracking
    const batchSize = 10;
    const results = { updated: 0, failed: 0, errors: [] };

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      for (const userId of batch) {
        try {
          await this.userRepository.updateUser(userId, settings);
          results.updated++;
        } catch (error) {
          results.failed++;
          results.errors.push({ userId, error: error.message });
        }
      }

      // Progress logging
      console.log(`[ADMIN] updateUserSettings progress: ${results.updated + results.failed}/${userIds.length}`);
    }

    return results;
  }

  async deployFeatureFlag(options) {
    const {
      flagName,
      enabled,
      targetSegment = null, // Start with segment, not all
      rolloutPercent = 10,  // Gradual rollout
      confirmedBy
    } = options;

    // Never deploy to 100% immediately
    if (rolloutPercent > 50 && targetSegment === null) {
      throw new BlastRadiusExceededError(
        'deployFeatureFlag',
        `${rolloutPercent}% of all users`,
        '50% maximum for initial rollout'
      );
    }

    await this.auditLog.record({
      action: 'deployFeatureFlag',
      flagName,
      enabled,
      targetSegment,
      rolloutPercent,
      initiatedBy: confirmedBy,
      timestamp: Date.now()
    });

    await this.featureFlagService.deploy({
      name: flagName,
      enabled,
      segment: targetSegment,
      percent: rolloutPercent
    });

    return {
      deployed: true,
      flagName,
      affectedScope: targetSegment || `${rolloutPercent}% of users`,
      // Next step guidance
      nextStep: rolloutPercent < 100
        ? `To increase rollout, call with rolloutPercent > ${rolloutPercent}`
        : 'Fully deployed'
    };
  }

  async deleteInactiveUsers(options) {
    const {
      inactiveSinceDays,
      maxToDelete = 50,
      confirmedBy,
      dryRun = true,
      requireSecondApproval = true
    } = options;

    if (requireSecondApproval && !options.secondApprover) {
      throw new Error('Bulk delete requires second approver');
    }

    const inactiveUsers = await this.userRepository.getInactiveUsers(inactiveSinceDays);

    // Hard limit on blast radius
    if (inactiveUsers.length > maxToDelete) {
      console.log(`[ADMIN] Found ${inactiveUsers.length} inactive users, limiting to ${maxToDelete}`);
    }

    const toDelete = inactiveUsers.slice(0, maxToDelete);

    await this.auditLog.record({
      action: 'deleteInactiveUsers',
      foundCount: inactiveUsers.length,
      deletingCount: toDelete.length,
      inactiveSinceDays,
      initiatedBy: confirmedBy,
      secondApprover: options.secondApprover,
      dryRun,
      timestamp: Date.now()
    });

    if (dryRun) {
      return {
        dryRun: true,
        wouldDelete: toDelete.length,
        totalInactive: inactiveUsers.length,
        sample: toDelete.slice(0, 5).map(u => ({ id: u.id, lastActive: u.lastActive }))
      };
    }

    // Actual deletion with progress
    const results = { deleted: 0, failed: 0 };

    for (const user of toDelete) {
      try {
        await this.userRepository.softDelete(user.id); // Soft delete, recoverable
        results.deleted++;
      } catch (error) {
        results.failed++;
      }
    }

    return results;
  }
}

class BlastRadiusExceededError extends Error {
  constructor(operation, attempted, limit) {
    super(`Blast radius exceeded for ${operation}: attempted ${attempted}, limit ${limit}`);
    this.operation = operation;
    this.attempted = attempted;
    this.limit = limit;
    this.httpStatus = 400;
  }
}

// ============================================================================
// PATTERN 7: Observable Degradation with Metrics and Alerts
// Degraded state is visible, tracked, and time-bounded
// ============================================================================

class ObservableDegradationService {
  constructor(name, config = {}) {
    this.name = name;
    this.maxDegradedDuration = config.maxDegradedDuration || 300000; // 5 minutes

    this.state = {
      healthy: true,
      degradedSince: null,
      degradationReason: null,
      fallbacksServed: 0
    };

    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      fallbackCalls: 0,
      degradedDurationMs: 0
    };

    // Check for prolonged degradation
    this.degradationChecker = setInterval(() => this.checkDegradationDuration(), 10000);
  }

  async call(primaryFn, fallbackFn) {
    this.metrics.totalCalls++;

    try {
      const result = await primaryFn();

      // Recovered from degraded state
      if (!this.state.healthy) {
        this.recordRecovery();
      }

      this.metrics.successfulCalls++;
      return { result, degraded: false };
    } catch (error) {
      return this.handleFailure(error, fallbackFn);
    }
  }

  async handleFailure(error, fallbackFn) {
    // Record entry into degraded state
    if (this.state.healthy) {
      this.enterDegradedState(error.message);
    }

    this.state.fallbacksServed++;
    this.metrics.fallbackCalls++;

    // Serve fallback with clear indication
    const fallbackResult = await fallbackFn();

    console.log(`[DEGRADED ${this.name}] Serving fallback (count: ${this.state.fallbacksServed})`);

    return {
      result: fallbackResult,
      degraded: true,
      degradedSince: this.state.degradedSince,
      degradationReason: this.state.degradationReason
    };
  }

  enterDegradedState(reason) {
    this.state.healthy = false;
    this.state.degradedSince = Date.now();
    this.state.degradationReason = reason;
    this.state.fallbacksServed = 0;

    console.log(`[ALERT ${this.name}] Entered DEGRADED state: ${reason}`);
    // In production: emit alert to PagerDuty/Slack/etc.
  }

  recordRecovery() {
    const degradedDuration = Date.now() - this.state.degradedSince;
    this.metrics.degradedDurationMs += degradedDuration;

    console.log(`[RECOVERY ${this.name}] Recovered after ${degradedDuration}ms (${this.state.fallbacksServed} fallbacks served)`);

    this.state.healthy = true;
    this.state.degradedSince = null;
    this.state.degradationReason = null;
    this.state.fallbacksServed = 0;
  }

  checkDegradationDuration() {
    if (!this.state.healthy && this.state.degradedSince) {
      const duration = Date.now() - this.state.degradedSince;

      if (duration > this.maxDegradedDuration) {
        console.log(`[CRITICAL ALERT ${this.name}] Degraded for ${duration}ms (threshold: ${this.maxDegradedDuration}ms)`);
        // In production: escalate alert, page on-call
      }
    }
  }

  getMetrics() {
    return {
      name: this.name,
      healthy: this.state.healthy,
      degradedSince: this.state.degradedSince,
      degradationReason: this.state.degradationReason,
      currentDegradedDuration: this.state.degradedSince ? Date.now() - this.state.degradedSince : 0,
      ...this.metrics,
      degradationRate: this.metrics.totalCalls > 0
        ? (this.metrics.fallbackCalls / this.metrics.totalCalls * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  shutdown() {
    clearInterval(this.degradationChecker);
  }
}

// ============================================================================
// DEMONSTRATION: Contained Failure Scenario
// Shows how isolation prevents cascading failures
// ============================================================================

class ResilientECommerceSystem {
  constructor() {
    // Tenant-isolated database
    this.db = new TenantIsolatedDatabasePool({ perTenantMax: 5, globalMax: 50 });

    // Isolated cache per service
    this.cache = new IsolatedCache({ perNamespaceMax: 100 });

    // Request bulkheads
    this.requestHandler = new BulkheadRequestHandler({
      criticalMax: 20,
      normalMax: 15,
      backgroundMax: 5
    });

    // Product page with feature isolation
    this.productPage = new ResilientProductPage({
      productService: { getProduct: async (id) => ({ id, name: 'Widget', price: 29.99 }) },
      recommendationService: {
        getRecommendations: async () => {
          if (Math.random() < 0.5) throw new Error('Recommendations unavailable');
          return ['rec1', 'rec2'];
        }
      },
      reviewService: {
        getReviews: async () => {
          if (Math.random() < 0.3) throw new Error('Reviews unavailable');
          return [{ rating: 5 }];
        }
      }
    });

    // Observable degradation
    this.externalService = new ObservableDegradationService('external-api', {
      maxDegradedDuration: 60000
    });
  }

  async demonstrateContainedFailures() {
    console.log('=== BRCP Correct Implementation: Contained Failures ===\n');

    // 1. Tenant isolation
    console.log('1. Testing tenant isolation...');
    try {
      // Tenant A exhausts their pool
      for (let i = 0; i < 6; i++) {
        try {
          await this.db.getConnection('tenant-A');
        } catch (e) {
          console.log(`   Tenant A: ${e.message}`);
        }
      }

      // Tenant B still works fine
      const connB = await this.db.getConnection('tenant-B');
      console.log('   Tenant B: Connection acquired successfully!');
      connB.release();
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    console.log('   Tenant pool metrics:', JSON.stringify(this.db.getMetrics(), null, 2));

    // 2. Feature isolation
    console.log('\n2. Testing feature isolation...');
    for (let i = 0; i < 3; i++) {
      const page = await this.productPage.renderProductPage('product-123');
      console.log(`   Render ${i + 1}: Product shown=${!!page.product.name}, ` +
        `Recommendations degraded=${page.recommendations.degraded}, ` +
        `Reviews degraded=${page.reviews.degraded}`);
    }
    console.log('   (Product page ALWAYS renders, even when features fail)');

    // 3. Request bulkheads
    console.log('\n3. Testing request bulkheads...');

    // Fill up background bulkhead
    const backgroundPromises = [];
    for (let i = 0; i < 6; i++) {
      backgroundPromises.push(
        this.requestHandler.handleRequest({ id: `bg-${i}`, priority: 'background', type: 'export' })
          .catch(e => ({ error: e.message }))
      );
    }

    // Critical requests still work
    const criticalResult = await this.requestHandler.handleRequest({
      id: 'critical-1',
      priority: 'critical',
      type: 'checkout'
    });
    console.log(`   Critical request: ${criticalResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log('   (Critical path unaffected by background overload)');
    console.log('   Bulkhead metrics:', JSON.stringify(this.requestHandler.getMetrics(), null, 2));

    // 4. Observable degradation
    console.log('\n4. Testing observable degradation...');
    for (let i = 0; i < 5; i++) {
      const result = await this.externalService.call(
        async () => {
          if (Math.random() < 0.7) throw new Error('External API down');
          return { data: 'fresh' };
        },
        async () => ({ data: 'fallback', stale: true })
      );
      console.log(`   Call ${i + 1}: degraded=${result.degraded}`);
    }
    console.log('   Degradation metrics:', JSON.stringify(this.externalService.getMetrics(), null, 2));
    console.log('   (Degradation is VISIBLE, not hidden!)');

    // 5. Cache isolation
    console.log('\n5. Testing cache isolation...');
    const cacheA = this.cache.forService('serviceA');
    const cacheB = this.cache.forService('serviceB');

    // Service A fills its cache
    for (let i = 0; i < 50; i++) {
      cacheA.set(`key-${i}`, `value-${i}`);
    }

    // Service B's cache is unaffected
    cacheB.set('important-key', 'important-value');
    const value = cacheB.get('important-key');
    console.log(`   Service A cache size: ${cacheA.keys().length}`);
    console.log(`   Service B can still get its key: ${value}`);
    console.log('   (Cache namespaces prevent cross-service eviction)');

    console.log('\n=== Result: Failures Contained ===');
    console.log('- Tenant A\'s exhaustion didn\'t affect Tenant B');
    console.log('- Recommendation failures didn\'t break product page');
    console.log('- Background overload didn\'t block critical requests');
    console.log('- Degradation is visible with metrics and alerts');
    console.log('- Cache isolation prevents cross-service interference');
    console.log('- Blast radius: CONTAINED to affected scope\n');

    // Cleanup
    this.externalService.shutdown();
  }
}

// ============================================================================
// Run demonstration
// ============================================================================

const system = new ResilientECommerceSystem();
system.demonstrateContainedFailures().catch(console.error);

module.exports = {
  TenantIsolatedDatabasePool,
  TenantPool,
  ObservableCircuitBreaker,
  ResilientProductPage,
  IsolatedCache,
  CacheNamespace,
  BulkheadRequestHandler,
  Bulkhead,
  SafeAdminService,
  ObservableDegradationService,
  ResilientECommerceSystem,
  // Errors
  TenantPoolExhaustedError,
  GlobalPoolExhaustedError,
  CircuitOpenError,
  BulkheadFullError,
  BlastRadiusExceededError
};
