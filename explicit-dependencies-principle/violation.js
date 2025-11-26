/**
 * VIOLATION: Explicit Dependencies Principle (EDP)
 *
 * This file demonstrates violations of the Explicit Dependencies Principle.
 * The code hides its dependencies through global state, singletons, service
 * locators, and implicit environment access. Components appear simple but are
 * actually tightly coupled to external systems, making them impossible to test
 * in isolation and dangerous to refactor.
 *
 * Problems demonstrated:
 * 1. Global mutable state - shared across all code, causes test pollution
 * 2. Singleton pattern - hidden instantiation, impossible to replace in tests
 * 3. Service locator - hides what services are actually needed
 * 4. Environment coupling - behavior changes based on invisible env vars
 * 5. Implicit time dependency - non-deterministic, untestable
 * 6. Implicit randomness - non-deterministic IDs
 * 7. Module-level side effects - import order matters, hidden initialization
 */

// =============================================================================
// VIOLATION 1: Global Mutable State
// =============================================================================

// Hidden dependency: anyone can read/write this, causing unpredictable behavior
let requestCount = 0;
const globalCache = {};
const globalConfig = {
  taxRate: 0.1,
  maxRetries: 3,
  apiBaseUrl: 'https://api.example.com'
};

// =============================================================================
// VIOLATION 2: Singleton Pattern
// =============================================================================

class Database {
  static instance = null;

  static getInstance() {
    if (!Database.instance) {
      // Hidden initialization - when does this happen? Who controls it?
      console.log('[Database] Creating singleton instance...');
      Database.instance = new Database();
    }
    return Database.instance;
  }

  constructor() {
    // Private constructor pattern - but in JS this isn't enforced
    this.connected = true;
    this.queryCount = 0;
  }

  query(sql, params = []) {
    this.queryCount++;
    console.log(`[Database] Executing: ${sql}`);
    // Simulated results
    if (sql.includes('SELECT * FROM users')) {
      return [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
    }
    if (sql.includes('SELECT * FROM products')) {
      return [
        { id: 101, name: 'Widget', price: 29.99 },
        { id: 102, name: 'Gadget', price: 49.99 }
      ];
    }
    return [];
  }

  // How do you reset this for tests? You can't easily.
  resetForTests() {
    this.queryCount = 0;
    // But what about other singleton state? Connection pools? Caches?
  }
}

// =============================================================================
// VIOLATION 3: Service Locator Pattern
// =============================================================================

const serviceLocator = {
  services: {},

  register(name, service) {
    this.services[name] = service;
  },

  get(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service;
  },

  // For "testing" - but this is fragile and error-prone
  clear() {
    this.services = {};
  }
};

// Services registered somewhere far from where they're used
// Who registered these? When? In what order?
serviceLocator.register('emailService', {
  send(to, subject, body) {
    console.log(`[Email] To: ${to}, Subject: ${subject}`);
    return { success: true, messageId: `msg-${Date.now()}` };
  }
});

serviceLocator.register('logger', {
  info(message, context = {}) {
    console.log(`[INFO] ${message}`, context);
  },
  error(message, context = {}) {
    console.error(`[ERROR] ${message}`, context);
  },
  warn(message, context = {}) {
    console.warn(`[WARN] ${message}`, context);
  }
});

serviceLocator.register('paymentGateway', {
  charge(amount, cardToken) {
    console.log(`[Payment] Charging ${amount} to ${cardToken}`);
    return { success: true, transactionId: `txn-${Date.now()}` };
  },
  refund(transactionId, amount) {
    console.log(`[Payment] Refunding ${amount} for ${transactionId}`);
    return { success: true };
  }
});

serviceLocator.register('inventoryService', {
  checkStock(productId) {
    return { productId, available: 100 };
  },
  reserve(productId, quantity) {
    console.log(`[Inventory] Reserving ${quantity} of product ${productId}`);
    return { success: true, reservationId: `res-${Date.now()}` };
  }
});

// =============================================================================
// VIOLATION 4: Business Logic with Hidden Dependencies
// =============================================================================

class OrderService {
  // Constructor reveals NOTHING about what this class needs
  // Looking at this signature, you'd think it has no dependencies
  constructor() {
    // No dependencies declared - they're all hidden!
  }

  async createOrder(userId, items) {
    // HIDDEN: Global mutable state
    requestCount++;

    // HIDDEN: Singleton database
    const db = Database.getInstance();

    // HIDDEN: Service locator - what services? Who knows from the constructor!
    const logger = serviceLocator.get('logger');
    const emailService = serviceLocator.get('emailService');
    const paymentGateway = serviceLocator.get('paymentGateway');
    const inventoryService = serviceLocator.get('inventoryService');

    // HIDDEN: Environment variable dependency
    const taxRate = parseFloat(process.env.TAX_RATE || globalConfig.taxRate);
    const enableEmailNotifications = process.env.ENABLE_EMAILS !== 'false';

    // HIDDEN: Global cache
    const cacheKey = `user_${userId}`;
    let user = globalCache[cacheKey];
    if (!user) {
      const users = db.query(`SELECT * FROM users WHERE id = ${userId}`);
      user = users[0];
      if (!user) {
        throw new Error('User not found');
      }
      globalCache[cacheKey] = user;
    }

    // HIDDEN: Current time (non-deterministic)
    const timestamp = new Date().toISOString();

    // HIDDEN: Random ID generation (non-deterministic)
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    logger.info('Creating order', { orderId, userId });

    // Check inventory for all items
    for (const item of items) {
      const stock = inventoryService.checkStock(item.productId);
      if (stock.available < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Reserve inventory
    const reservations = [];
    for (const item of items) {
      const reservation = inventoryService.reserve(item.productId, item.quantity);
      reservations.push(reservation);
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Process payment - HIDDEN: uses service locator
    const paymentResult = paymentGateway.charge(total, user.paymentToken || 'default-token');
    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }

    // Create order record
    const order = {
      orderId,
      userId,
      items,
      subtotal,
      tax,
      total,
      status: 'confirmed',
      paymentTransactionId: paymentResult.transactionId,
      reservations: reservations.map(r => r.reservationId),
      createdAt: timestamp
    };

    // Save to database
    db.query('INSERT INTO orders VALUES (...)', [order]);

    logger.info('Order created successfully', { orderId, total });

    // Send confirmation email
    if (enableEmailNotifications) {
      emailService.send(
        user.email,
        'Order Confirmed',
        `Your order ${orderId} for $${total.toFixed(2)} has been confirmed!`
      );
    }

    return order;
  }

  async getOrderHistory(userId) {
    // More hidden dependencies...
    const db = Database.getInstance();
    const logger = serviceLocator.get('logger');

    logger.info('Fetching order history', { userId });

    // HIDDEN: direct database access
    const orders = db.query(`SELECT * FROM orders WHERE userId = ${userId}`);
    return orders;
  }

  async cancelOrder(orderId) {
    const db = Database.getInstance();
    const logger = serviceLocator.get('logger');
    const paymentGateway = serviceLocator.get('paymentGateway');
    const emailService = serviceLocator.get('emailService');

    logger.info('Cancelling order', { orderId });

    // Fetch order, refund payment, update status, send email...
    // All using hidden dependencies

    return { success: true, orderId };
  }
}

// =============================================================================
// VIOLATION 5: Utility with Hidden Global State
// =============================================================================

class PricingCalculator {
  // Looks pure and simple, but...
  calculateDiscount(customerId, orderTotal) {
    // HIDDEN: Reads from global config
    const baseDiscountRate = globalConfig.discountRate || 0;

    // HIDDEN: Database singleton for customer tier
    const db = Database.getInstance();
    const [customer] = db.query(`SELECT * FROM customers WHERE id = ${customerId}`);

    // HIDDEN: Global cache for discount tiers
    if (!globalCache.discountTiers) {
      globalCache.discountTiers = {
        bronze: 0.05,
        silver: 0.10,
        gold: 0.15,
        platinum: 0.20
      };
    }

    const tierDiscount = globalCache.discountTiers[customer?.tier] || 0;

    // HIDDEN: Environment-based override
    const promoDiscount = parseFloat(process.env.PROMO_DISCOUNT || '0');

    return Math.max(baseDiscountRate, tierDiscount, promoDiscount);
  }
}

// =============================================================================
// VIOLATION 6: Module-Level Side Effects
// =============================================================================

// This runs when the module is imported - hidden initialization!
console.log('[Module] Initializing order module...');

// Hidden connection setup
const moduleDb = Database.getInstance();
console.log('[Module] Database connection established');

// Hidden feature flag check
const FEATURE_FLAGS = {
  newPricingEngine: process.env.FEATURE_NEW_PRICING === 'true',
  asyncInventory: process.env.FEATURE_ASYNC_INVENTORY === 'true'
};

// =============================================================================
// ATTEMPTING TO TEST THIS CODE
// =============================================================================

async function demonstrateTestingProblems() {
  console.log('\n========================================');
  console.log('DEMONSTRATING TESTING PROBLEMS');
  console.log('========================================\n');

  // Problem 1: Can't test OrderService in isolation
  console.log('Problem 1: Creating OrderService...');
  const orderService = new OrderService();

  // Q: What does this need to work?
  // A: Looking at the constructor... nothing?
  // Reality: Database, EmailService, PaymentGateway, InventoryService,
  //          Logger, global config, environment variables, cache, time, random

  // Problem 2: Can't control the database
  console.log('\nProblem 2: Cannot mock the database...');
  // The service reaches out to Database.getInstance() - we can't intercept that
  // without modifying global state or using complex mocking frameworks

  // Problem 3: Can't control time
  console.log('\nProblem 3: Cannot control time...');
  // The timestamp is generated inside the method using new Date()
  // Tests will have non-deterministic timestamps

  // Problem 4: Can't control IDs
  console.log('\nProblem 4: Cannot control IDs...');
  // Order IDs use Math.random() - tests will have different IDs each run

  // Problem 5: Test pollution through global state
  console.log('\nProblem 5: Global state pollution...');
  console.log(`Request count before: ${requestCount}`);

  // If we somehow run the service, it modifies global state
  // This affects other tests

  // Problem 6: Service locator must be set up correctly
  console.log('\nProblem 6: Service locator setup...');
  // If we forget to register a service, we get runtime errors
  // The test setup must mirror production setup exactly

  // Problem 7: Environment variables affect behavior
  console.log('\nProblem 7: Environment dependency...');
  console.log(`TAX_RATE from env: ${process.env.TAX_RATE || 'not set'}`);
  console.log(`ENABLE_EMAILS from env: ${process.env.ENABLE_EMAILS || 'not set'}`);
  // Different CI environments may have different env vars
  // Tests behave differently on different machines

  // Problem 8: Can't verify interactions
  console.log('\nProblem 8: Cannot verify interactions...');
  // Did the email get sent? Did we charge the right amount?
  // We'd need to set up spies on the service locator services
  // which is fragile and couples tests to implementation

  console.log('\n========================================');
  console.log('ATTEMPTING TO RUN (WILL PARTIALLY WORK)');
  console.log('========================================\n');

  try {
    // This "works" but is untestable and non-deterministic
    const order = await orderService.createOrder('user-1', [
      { productId: 101, name: 'Widget', price: 29.99, quantity: 2 }
    ]);

    console.log('\nOrder created (but with many problems):');
    console.log(JSON.stringify(order, null, 2));

    console.log('\n--- Test Assertions Would Fail ---');
    console.log(`Order ID is random: ${order.orderId}`);
    console.log(`Timestamp is current time: ${order.createdAt}`);
    console.log(`Global request count changed: ${requestCount}`);
    console.log(`Global cache modified: ${Object.keys(globalCache).length} entries`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// =============================================================================
// THE FUNDAMENTAL PROBLEMS
// =============================================================================

console.log('\n========================================');
console.log('FUNDAMENTAL PROBLEMS WITH HIDDEN DEPENDENCIES');
console.log('========================================\n');

console.log(`
1. UNTESTABLE IN ISOLATION
   - Cannot create OrderService with mock dependencies
   - Cannot control Database, EmailService, etc.
   - Tests require full system setup or complex mocking

2. NON-DETERMINISTIC
   - Time and random values change each run
   - Tests may pass or fail randomly
   - Cannot assert on specific values

3. TEST POLLUTION
   - Global state persists between tests
   - Order of test execution matters
   - Tests affect each other

4. HIDDEN COUPLING
   - Constructor hides true dependencies
   - Changes to globals break things mysteriously
   - Refactoring is dangerous

5. ENVIRONMENT-DEPENDENT
   - Behavior changes based on env vars
   - Works on dev machine, fails in CI
   - Difficult to reproduce issues

6. IMPOSSIBLE TO REASON ABOUT
   - What does OrderService need? Read all the code.
   - What might break if I change X? Who knows.
   - Why did this test fail? Investigate everything.
`);

// Run the demonstration
demonstrateTestingProblems();

module.exports = {
  OrderService,
  PricingCalculator,
  Database,
  serviceLocator,
  globalCache,
  globalConfig
};
