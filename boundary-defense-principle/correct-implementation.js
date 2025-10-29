/**
 * Boundary Defense Principle - Correct Implementation
 *
 * The Boundary Defense Principle states that every system boundary should be treated as a trust boundary.
 * All data crossing boundaries (API inputs, user input, files, databases, external services) must be
 * validated, sanitized, and normalized at the boundary before being used internally.
 *
 * This implementation demonstrates:
 * 1. Explicit validation at every boundary (API, database, external services, files)
 * 2. Input sanitization to prevent injection attacks
 * 3. Type coercion and normalization to ensure data consistency
 * 4. Separation between untrusted external data and trusted internal data
 * 5. Clear error messages when validation fails
 */

// Domain types representing validated, trusted internal data
class User {
  constructor(id, email, age, role) {
    this.id = id;
    this.email = email;
    this.age = age;
    this.role = role; // Only 'admin' or 'user', never from client input
    this.createdAt = new Date();
  }
}

class Order {
  constructor(id, amount, items, userId) {
    this.id = id;
    this.amount = amount;
    this.items = items;
    this.userId = userId;
  }
}

// Validation utilities - the boundary defense layer
class Validator {
  static isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }

  static isPositiveNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }

  static isValidRole(role) {
    return role === 'admin' || role === 'user';
  }

  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    // Remove potentially dangerous characters
    return input.replace(/[<>'";&|`$()]/g, '');
  }

  static validateAndSanitizeId(id) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      throw new Error(`Invalid ID: ${id}`);
    }
    return numId;
  }
}

// User service with boundary defense
class UserService {
  constructor() {
    this.users = new Map();
  }

  // CORRECT: Validates and normalizes API input at the boundary
  createUser(untrustedData) {
    // Validate at the boundary - treat all input as untrusted
    if (!untrustedData || typeof untrustedData !== 'object') {
      throw new Error('Invalid user data: must be an object');
    }

    // Validate each field explicitly
    const id = Validator.validateAndSanitizeId(untrustedData.id);

    if (!Validator.isValidEmail(untrustedData.email)) {
      throw new Error(`Invalid email: ${untrustedData.email}`);
    }
    const email = Validator.sanitizeString(untrustedData.email);

    const age = Number(untrustedData.age);
    if (!Number.isInteger(age) || age < 0 || age > 150) {
      throw new Error(`Invalid age: ${untrustedData.age}`);
    }

    // IMPORTANT: Never trust client-provided roles/permissions
    // Always derive from server-side logic
    const role = 'user'; // Default to least privilege

    // Create validated internal domain object
    const user = new User(id, email, age, role);
    this.users.set(user.id, user);
    return user;
  }

  // CORRECT: Validates database data at the boundary
  getUserFromDatabase(dbRecord) {
    // Even database data should be validated at the boundary
    // Databases can be corrupted, migrated, or compromised
    try {
      const id = Validator.validateAndSanitizeId(dbRecord.id);

      if (!Validator.isValidEmail(dbRecord.email)) {
        throw new Error(`Corrupted email in database: ${dbRecord.email}`);
      }
      const email = dbRecord.email;

      const age = Number(dbRecord.age);
      if (!Number.isInteger(age) || age < 0 || age > 150) {
        throw new Error(`Corrupted age in database: ${dbRecord.age}`);
      }

      if (!Validator.isValidRole(dbRecord.role)) {
        throw new Error(`Invalid role in database: ${dbRecord.role}`);
      }
      const role = dbRecord.role;

      return new User(id, email, age, role);
    } catch (error) {
      console.error('Database validation error:', error.message);
      throw new Error('Failed to load user: data integrity issue');
    }
  }

  // CORRECT: Validates external service response at the boundary
  async syncWithExternalService(externalUserId) {
    const rawResponse = await this.fetchFromExternalAPI(externalUserId);

    // Validate and sanitize external service data
    try {
      // Deep clone to prevent prototype pollution
      const safeData = JSON.parse(JSON.stringify(rawResponse));

      const id = Validator.validateAndSanitizeId(safeData.id);

      if (!Validator.isValidEmail(safeData.email)) {
        throw new Error('Invalid email from external service');
      }
      const email = Validator.sanitizeString(safeData.email);

      const age = Number(safeData.age);
      if (!Number.isInteger(age) || age < 0 || age > 150) {
        throw new Error('Invalid age from external service');
      }

      // Create validated user
      const user = new User(id, email, age, 'user');
      this.users.set(user.id, user);
      return user;
    } catch (error) {
      console.error('External service validation error:', error.message);
      throw new Error('Failed to sync: external data validation failed');
    }
  }

  async fetchFromExternalAPI(userId) {
    // Simulated external API that could return malicious data
    return {
      id: userId,
      email: "valid@example.com",
      age: 25,
      metadata: { __proto__: { isAdmin: true } }, // Attack attempt
    };
  }
}

// Order service with boundary defense for file imports
class OrderService {
  constructor() {
    this.orders = [];
  }

  // CORRECT: Validates file content at the boundary
  importOrdersFromFile(fileContent) {
    let rawData;

    try {
      rawData = JSON.parse(fileContent);
    } catch (error) {
      throw new Error('Invalid JSON in file');
    }

    if (!Array.isArray(rawData)) {
      throw new Error('File must contain an array of orders');
    }

    const validatedOrders = [];

    for (let i = 0; i < rawData.length; i++) {
      const item = rawData[i];

      try {
        // Validate each order at the boundary
        const id = Validator.validateAndSanitizeId(item.id);

        if (!Validator.isPositiveNumber(item.amount)) {
          throw new Error(`Order ${i}: amount must be positive`);
        }
        const amount = Number(item.amount);

        if (!Array.isArray(item.items)) {
          throw new Error(`Order ${i}: items must be an array`);
        }
        const items = item.items; // Could add deeper validation

        const userId = Validator.validateAndSanitizeId(item.userId);

        validatedOrders.push(new Order(id, amount, items, userId));
      } catch (error) {
        console.error(`Skipping invalid order at index ${i}:`, error.message);
        // Continue processing valid orders, skip invalid ones
      }
    }

    this.orders.push(...validatedOrders);
    return validatedOrders.length;
  }

  // CORRECT: Validates message queue data at the boundary
  processMessageFromQueue(message) {
    // Validate message structure
    if (!message || typeof message !== 'object' || !message.payload) {
      throw new Error('Invalid message format');
    }

    const data = message.payload;

    // Validate payload
    const id = Validator.validateAndSanitizeId(data.id);

    if (!Validator.isPositiveNumber(data.total)) {
      throw new Error('Invalid order total');
    }
    const total = Number(data.total);

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Invalid status: ${data.status}`);
    }
    const status = data.status;

    // Create validated order
    const order = new Order(id, total, [], data.userId || 0);
    order.status = status;
    this.orders.push(order);
    return order;
  }
}

// Payment service with proper input sanitization and parameterized queries
class PaymentService {
  // CORRECT: Uses parameterized queries to prevent SQL injection
  processPayment(userId, amount, cardNumber) {
    // Validate at boundary
    const validUserId = Validator.validateAndSanitizeId(userId);

    if (!Validator.isPositiveNumber(amount)) {
      throw new Error('Invalid payment amount');
    }
    const validAmount = Number(amount);

    // Sanitize card number (in real app, use proper PCI-compliant validation)
    const validCard = String(cardNumber).replace(/\D/g, '');
    if (validCard.length < 13 || validCard.length > 19) {
      throw new Error('Invalid card number');
    }

    // Use parameterized query (safe from SQL injection)
    const params = [validUserId, validAmount, validCard];
    const query = 'INSERT INTO payments (user_id, amount, card) VALUES (?, ?, ?)';

    console.log('Executing safe parameterized query:', query);
    console.log('With sanitized parameters:', params);
    return { success: true, paymentId: Date.now() };
  }

  // CORRECT: Validates and sanitizes before system operations
  generateReceipt(orderId, email) {
    // Validate at boundary
    const validOrderId = Validator.validateAndSanitizeId(orderId);

    if (!Validator.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    const safeEmail = Validator.sanitizeString(email);

    // Use array-based command execution (safe from command injection)
    // In Node.js: child_process.execFile or spawn with array arguments
    const command = 'node';
    const args = ['generate-pdf.js', '--order', String(validOrderId), '--email', safeEmail];

    console.log('Executing safe command with args:', command, args);
    return { success: true, receiptId: Date.now() };
  }
}

// Usage demonstrating proper boundary defense
console.log('=== Boundary Defense Principle - CORRECT IMPLEMENTATION ===\n');

const userService = new UserService();
const orderService = new OrderService();
const paymentService = new PaymentService();

// Example 1: Malicious input is rejected
console.log('1. Attempting to create user with malicious input:');
try {
  const maliciousUser = userService.createUser({
    id: 1,
    email: "admin@example.com'; DROP TABLE users; --",
    age: -5,
    isAdmin: true, // Client trying to escalate privileges
  });
} catch (error) {
  console.log('✓ Rejected:', error.message);
}

// Example 2: Valid input is accepted
console.log('\n2. Creating user with valid input:');
const validUser = userService.createUser({
  id: 2,
  email: 'user@example.com',
  age: 30,
  isAdmin: true, // This will be ignored - role is set server-side
});
console.log('✓ Created user:', validUser);
console.log('✓ Role is:', validUser.role, '(client cannot set admin flag)');

// Example 3: External service with prototype pollution attempt
console.log('\n3. Syncing with external service (with attack attempt):');
userService.syncWithExternalService(999).then(user => {
  console.log('✓ Synced user:', user);
  const obj = {};
  console.log('✓ Prototype pollution prevented - obj.isAdmin:', obj.isAdmin);
}).catch(err => console.log('Error:', err.message));

// Example 4: File import with mixed valid/invalid data
console.log('\n4. Importing orders from file (with invalid entries):');
const fileContent = JSON.stringify([
  { id: 1, amount: 100, items: ['item1'], userId: 5 }, // Valid
  { id: 2, amount: -50, items: [], userId: 6 }, // Invalid amount
  { id: 3, amount: 200, items: ['item2'], userId: 7 }, // Valid
  { id: 'bad', amount: 50, items: [], userId: 8 }, // Invalid ID
]);
const imported = orderService.importOrdersFromFile(fileContent);
console.log(`✓ Imported ${imported} valid orders (skipped ${4 - imported} invalid)`);
console.log('✓ Orders:', orderService.orders);

// Example 5: Safe payment processing
console.log('\n5. Processing payment with safe parameterized query:');
const payment = paymentService.processPayment(1, 100, '4111111111111111');
console.log('✓ Payment processed safely:', payment);

// Example 6: Safe receipt generation
console.log('\n6. Generating receipt with validated input:');
const receipt = paymentService.generateReceipt(123, 'user@example.com');
console.log('✓ Receipt generated safely:', receipt);

console.log('\n=== Benefits of Boundary Defense ===');
console.log('1. Security: Prevents injection attacks (SQL, command, XSS, prototype pollution)');
console.log('2. Data integrity: Only valid, normalized data enters the system');
console.log('3. Reliability: Invalid data is caught early, preventing cascading failures');
console.log('4. Maintainability: Clear validation layer makes security audits easier');
console.log('5. Defense in depth: Multiple boundaries provide layered protection');
console.log('6. Least privilege: Permissions/roles set server-side, not from client');
