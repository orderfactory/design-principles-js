/**
 * Blast Radius Containment Principle (BRCP) - VIOLATION
 *
 * This file demonstrates violations of the Blast Radius Containment Principle.
 *
 * BRCP states: Design systems so that when any component fails, the impact is
 * contained to the smallest business-meaningful scope. Failures should be isolated
 * by domain, tenant, request, or feature—remaining highly visible—while never
 * trading correctness or safety for availability.
 *
 * VIOLATIONS DEMONSTRATED:
 * 1. Shared connection pool across all tenants (one tenant's storm affects everyone)
 * 2. No circuit breakers (cascading timeouts exhaust resources)
 * 3. Critical path depends on non-critical services (recommendations break checkout)
 * 4. Shared state undermines service isolation (Redis thundering herd)
 * 5. No request isolation (slow requests starve fast ones)
 * 6. Admin actions with unlimited blast radius (bulk updates without safeguards)
 * 7. Silent degradation without visibility (failures hidden, not contained)
 */

// ============================================================================
// VIOLATION 1: Shared Connection Pool Across All Tenants
// One tenant's runaway queries exhaust connections for everyone
// ============================================================================

class SharedDatabasePool {
  constructor() {
    // Single pool shared by ALL tenants - massive blast radius
    this.connections = [];
    this.maxConnections = 10;
    this.activeConnections = 0;
  }

  async getConnection(tenantId) {
    // No per-tenant limits - one tenant can consume all connections
    if (this.activeConnections >= this.maxConnections) {
      // ALL tenants blocked when pool exhausted
      throw new Error('Connection pool exhausted');
    }

    this.activeConnections++;
    return {
      tenantId,
      query: async (sql) => {
        // Simulate query - no timeout protection
        await this.simulateQuery(sql);
        return { rows: [] };
      },
      release: () => {
        this.activeConnections--;
      }
    };
  }

  async simulateQuery(sql) {
    // Some queries take forever - no protection
    const delay = sql.includes('SLOW') ? 30000 : 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Usage showing the problem:
class TenantService {
  constructor() {
    // All tenants share one pool
    this.db = new SharedDatabasePool();
  }

  async getDataForTenant(tenantId, query) {
    // Tenant A's slow query blocks Tenants B, C, D, E...
    const conn = await this.db.getConnection(tenantId);
    try {
      return await conn.query(query);
    } finally {
      conn.release();
    }
  }
}

// ============================================================================
// VIOLATION 2: No Circuit Breakers - Cascading Timeout Exhaustion
// Failed dependency causes caller to hang, exhausting its resources
// ============================================================================

class PaymentService {
  constructor() {
    this.paymentGatewayUrl = 'https://payments.example.com';
  }

  async processPayment(orderId, amount) {
    // No circuit breaker - keeps trying even when gateway is down
    // No timeout - waits forever
    // No fallback - complete failure if gateway unavailable

    try {
      const response = await this.callPaymentGateway(orderId, amount);
      return response;
    } catch (error) {
      // Just rethrow - cascades up to caller
      // Caller's thread/connection is blocked the whole time
      throw error;
    }
  }

  async callPaymentGateway(orderId, amount) {
    // Simulating a hanging service - no timeout
    // In real code: fetch without AbortController timeout
    await new Promise((_, reject) => {
      // Gateway is down - hangs for 30 seconds before timeout
      setTimeout(() => reject(new Error('Gateway timeout')), 30000);
    });
  }
}

class OrderService {
  constructor() {
    this.paymentService = new PaymentService();
    this.activeRequests = 0;
    this.maxConcurrentRequests = 100;
  }

  async placeOrder(order) {
    this.activeRequests++;

    try {
      // Each order ties up a "thread" waiting for payment
      // When payment gateway is slow, all 100 slots fill up
      // New orders start failing even though order processing is fine
      await this.paymentService.processPayment(order.id, order.total);
      return { success: true, orderId: order.id };
    } finally {
      this.activeRequests--;
    }
  }
}

// ============================================================================
// VIOLATION 3: Critical Path Depends on Non-Critical Services
// Recommendation engine failure breaks checkout
// ============================================================================

class ProductPage {
  constructor() {
    this.productService = new ProductService();
    this.recommendationService = new RecommendationService();
    this.reviewService = new ReviewService();
  }

  async renderProductPage(productId) {
    // All services called in sequence - any failure breaks the whole page
    // Recommendations are nice-to-have but treated as critical

    const product = await this.productService.getProduct(productId);

    // If recommendations fail, the ENTIRE page fails
    // This is a non-critical feature breaking a critical path
    const recommendations = await this.recommendationService.getRecommendations(productId);

    // Reviews failure also breaks the page
    const reviews = await this.reviewService.getReviews(productId);

    return {
      product,
      recommendations,
      reviews,
      // User can't even see the product if any service fails
    };
  }
}

class RecommendationService {
  async getRecommendations(productId) {
    // Simulating an unreliable service
    if (Math.random() < 0.3) {
      throw new Error('Recommendation service unavailable');
    }
    return ['rec1', 'rec2', 'rec3'];
  }
}

class ReviewService {
  async getReviews(productId) {
    if (Math.random() < 0.2) {
      throw new Error('Review service unavailable');
    }
    return [{ rating: 5, text: 'Great!' }];
  }
}

class ProductService {
  async getProduct(productId) {
    return { id: productId, name: 'Widget', price: 29.99 };
  }
}

// ============================================================================
// VIOLATION 4: Shared State Undermines Service Isolation
// Services look isolated but share Redis - one bad key pattern kills everyone
// ============================================================================

class SharedCache {
  constructor() {
    // Single Redis instance shared by all services
    this.cache = new Map();
    this.maxSize = 10000;
  }

  async get(key) {
    // No namespace isolation - services can collide
    // No per-service limits
    return this.cache.get(key);
  }

  async set(key, value, ttl) {
    // One service can evict another's critical data
    if (this.cache.size >= this.maxSize) {
      // Evict oldest - might be critical data from another service!
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  async keys(pattern) {
    // KEYS command on production Redis - blocks everything
    // One service running KEYS * affects all services
    const allKeys = Array.from(this.cache.keys());
    return allKeys.filter(k => k.includes(pattern.replace('*', '')));
  }
}

// All services share the same cache instance
const globalCache = new SharedCache();

class ServiceA {
  async getData(id) {
    // Uses shared cache - no isolation
    const cached = await globalCache.get(`serviceA:${id}`);
    if (cached) return cached;

    const data = await this.fetchData(id);
    await globalCache.set(`serviceA:${id}`, data, 3600);
    return data;
  }

  async fetchData(id) {
    return { id, source: 'A' };
  }

  async debugCache() {
    // Dangerous operation that blocks all services
    return await globalCache.keys('serviceA:*');
  }
}

class ServiceB {
  async getData(id) {
    // Same shared cache - ServiceA's cache stampede affects ServiceB
    const cached = await globalCache.get(`serviceB:${id}`);
    if (cached) return cached;

    const data = await this.fetchData(id);
    await globalCache.set(`serviceB:${id}`, data, 3600);
    return data;
  }

  async fetchData(id) {
    return { id, source: 'B' };
  }
}

// ============================================================================
// VIOLATION 5: No Request Isolation - Slow Requests Starve Fast Ones
// Single thread pool with no prioritization or timeouts
// ============================================================================

class RequestHandler {
  constructor() {
    this.activeRequests = 0;
    this.maxConcurrent = 10;
    this.queue = [];
  }

  async handleRequest(request) {
    // No request timeout - slow requests hold slots forever
    // No priority - bulk export and checkout share the same pool
    // No fairness - one user can consume all slots

    if (this.activeRequests >= this.maxConcurrent) {
      // Queue with no limit - memory grows unbounded
      return new Promise((resolve, reject) => {
        this.queue.push({ request, resolve, reject });
      });
    }

    return this.processRequest(request);
  }

  async processRequest(request) {
    this.activeRequests++;

    try {
      // Some requests take 30 seconds (reports, exports)
      // Others take 50ms (API calls)
      // They all share the same pool
      const processingTime = request.type === 'export' ? 30000 : 50;
      await new Promise(resolve => setTimeout(resolve, processingTime));

      return { success: true, requestId: request.id };
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { request, resolve } = this.queue.shift();
      this.processRequest(request).then(resolve);
    }
  }
}

// ============================================================================
// VIOLATION 6: Admin Actions with Unlimited Blast Radius
// One click affects all users with no safeguards
// ============================================================================

class AdminService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async updateAllUserSettings(newSettings) {
    // No confirmation required
    // No gradual rollout
    // No blast radius limit
    // No undo capability

    const allUsers = await this.userRepository.getAllUsers();

    // Update ALL users at once
    for (const user of allUsers) {
      await this.userRepository.updateUser(user.id, newSettings);
    }

    // If settings are wrong, ALL users are affected
    // No way to quickly undo
    return { updated: allUsers.length };
  }

  async deleteInactiveUsers() {
    // Dangerous bulk operation with no safeguards
    const inactiveUsers = await this.userRepository.getInactiveUsers();

    // What if the query is wrong? Deletes everyone.
    for (const user of inactiveUsers) {
      await this.userRepository.deleteUser(user.id);
    }

    return { deleted: inactiveUsers.length };
  }

  async deployFeatureFlag(flagName, enabled) {
    // Global toggle - affects all users instantly
    // No gradual rollout
    // No ability to target specific segments first
    await this.featureFlagStore.set(flagName, enabled);

    // If the feature is broken, everyone sees it immediately
    return { flag: flagName, enabled, affectedUsers: 'all' };
  }
}

class UserRepository {
  constructor() {
    this.users = [];
  }

  async getAllUsers() {
    return this.users;
  }

  async getInactiveUsers() {
    // Bug: wrong date comparison could return ALL users
    return this.users.filter(u => u.lastActive < Date.now());
  }

  async updateUser(id, settings) {
    const user = this.users.find(u => u.id === id);
    if (user) Object.assign(user, settings);
  }

  async deleteUser(id) {
    this.users = this.users.filter(u => u.id !== id);
  }
}

// ============================================================================
// VIOLATION 7: Silent Degradation - Failures Hidden, Not Contained
// Circuit breaker without observability becomes failure concealment
// ============================================================================

class SilentlyDegradingService {
  constructor() {
    this.failureCount = 0;
    this.isOpen = false;
    // No metrics
    // No logging
    // No alerts
  }

  async callExternalService() {
    if (this.isOpen) {
      // Return fallback silently - no one knows the service is down
      return this.getFallback();
    }

    try {
      return await this.externalCall();
    } catch (error) {
      this.failureCount++;

      if (this.failureCount > 5) {
        // Open circuit silently - no metrics, no logs
        this.isOpen = true;
        // No alert that we're now in degraded mode
        // No tracking of how long we've been degraded
      }

      // Return fallback - user doesn't know they're getting stale data
      return this.getFallback();
    }
  }

  getFallback() {
    // Stale data from a month ago - but no indication to user or operators
    return { data: 'fallback', stale: true, staleSince: '2024-01-01' };
  }

  async externalCall() {
    // Simulating frequent failures
    if (Math.random() < 0.8) {
      throw new Error('External service unavailable');
    }
    return { data: 'fresh', stale: false };
  }
}

// ============================================================================
// DEMONSTRATION: Cascading Failure Scenario
// Shows how lack of isolation causes total system failure
// ============================================================================

class ECommerceSystem {
  constructor() {
    this.tenantService = new TenantService();
    this.orderService = new OrderService();
    this.productPage = new ProductPage();
    this.requestHandler = new RequestHandler();
  }

  async demonstrateCascadingFailure() {
    console.log('=== BRCP Violation: Cascading Failure Demonstration ===\n');

    // Scenario: Tenant A runs a slow query
    console.log('1. Tenant A runs an expensive analytics query...');

    // This blocks the shared connection pool
    const tenantAPromise = this.tenantService.getDataForTenant('tenant-A', 'SELECT SLOW...');

    // Meanwhile, Tenants B, C, D try to do simple operations
    console.log('2. Tenants B, C, D try simple queries...');

    try {
      await Promise.race([
        this.tenantService.getDataForTenant('tenant-B', 'SELECT * FROM orders LIMIT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
      ]);
    } catch (error) {
      console.log('   Tenant B: BLOCKED - ' + error.message);
    }

    console.log('\n3. Recommendation service starts failing...');

    // Product page fails completely because recommendations fail
    try {
      await this.productPage.renderProductPage('product-123');
      console.log('   Product page: rendered successfully');
    } catch (error) {
      console.log('   Product page: COMPLETELY FAILED - ' + error.message);
      console.log('   (Users cannot even see product details!)');
    }

    console.log('\n4. All request slots consumed by slow exports...');

    // Slow requests consume all slots
    for (let i = 0; i < 10; i++) {
      this.requestHandler.handleRequest({ id: i, type: 'export' });
    }

    // Fast API requests now queued indefinitely
    const apiRequestPromise = this.requestHandler.handleRequest({ id: 'api-1', type: 'api' });

    try {
      await Promise.race([
        apiRequestPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);
    } catch (error) {
      console.log('   Fast API request: QUEUED INDEFINITELY - ' + error.message);
    }

    console.log('\n5. Silent degradation hides real problems...');

    const degradingService = new SilentlyDegradingService();
    for (let i = 0; i < 10; i++) {
      const result = await degradingService.callExternalService();
      if (result.stale) {
        console.log(`   Request ${i + 1}: Serving STALE data (no visibility into this!)`);
      }
    }

    console.log('\n=== Result: Total System Degradation ===');
    console.log('- One tenant blocked all tenants');
    console.log('- Non-critical failure broke critical path');
    console.log('- Slow requests starved fast requests');
    console.log('- Degradation is hidden, not visible');
    console.log('- Blast radius: ENTIRE SYSTEM\n');
  }
}

// ============================================================================
// Run demonstration
// ============================================================================

const system = new ECommerceSystem();
system.demonstrateCascadingFailure().catch(console.error);

module.exports = {
  SharedDatabasePool,
  TenantService,
  PaymentService,
  OrderService,
  ProductPage,
  SharedCache,
  RequestHandler,
  AdminService,
  SilentlyDegradingService,
  ECommerceSystem
};
