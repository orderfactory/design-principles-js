/**
 * Boundary Defense Principle - Violation
 *
 * The Boundary Defense Principle states that every system boundary should be treated as a trust boundary.
 * All data crossing boundaries (API inputs, user input, files, databases, external services) must be
 * validated, sanitized, and normalized at the boundary before being used internally.
 *
 * This violation demonstrates what happens when data is trusted across boundaries without validation,
 * leading to security vulnerabilities, data corruption, and system instability.
 */

// Violation: User service that trusts external input without validation
class UserService {
  constructor() {
    this.users = new Map();
  }

  // VIOLATION: Directly trusts API input without validation
  createUser(userData) {
    // No validation - assumes external data is safe
    const user = {
      id: userData.id,
      email: userData.email,
      age: userData.age,
      role: userData.role,
      isAdmin: userData.isAdmin, // Security risk: trusting client-provided admin flag
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  // VIOLATION: Trusts database data without validation
  getUserFromDatabase(dbRecord) {
    // Assumes database always returns valid data
    // What if the database was corrupted or compromised?
    return {
      id: dbRecord.id,
      email: dbRecord.email,
      age: dbRecord.age,
      role: dbRecord.role,
      preferences: dbRecord.preferences, // Could be malformed JSON
    };
  }

  // VIOLATION: Trusts external service response
  async syncWithExternalService(externalUserId) {
    // Simulating external API call
    const externalUser = await this.fetchFromExternalAPI(externalUserId);

    // Directly using external data without validation
    this.users.set(externalUser.id, {
      id: externalUser.id,
      email: externalUser.email,
      age: externalUser.age,
      // External service could send malicious data
      metadata: externalUser.metadata,
    });
  }

  async fetchFromExternalAPI(userId) {
    // Simulated external API that could return malicious data
    return {
      id: userId,
      email: "attacker@evil.com'; DROP TABLE users; --",
      age: "not-a-number",
      metadata: { __proto__: { isAdmin: true } }, // Prototype pollution attack
    };
  }
}

// Violation: Order service that doesn't validate at boundaries
class OrderService {
  constructor() {
    this.orders = [];
  }

  // VIOLATION: No validation of file upload data
  importOrdersFromFile(fileContent) {
    // Assumes file content is safe
    const orders = JSON.parse(fileContent); // Could throw or parse malicious JSON

    orders.forEach(order => {
      // Directly using file data without validation
      this.orders.push({
        id: order.id,
        amount: order.amount, // Could be negative or non-numeric
        items: order.items, // Could be malformed
        userId: order.userId,
      });
    });
  }

  // VIOLATION: Trusting message queue data
  processMessageFromQueue(message) {
    // Assumes message format is correct
    const orderData = message.payload;

    // No validation of message structure
    this.orders.push({
      id: orderData.id,
      total: orderData.total,
      status: orderData.status, // Could be an invalid status
      // If message is from a compromised service, could contain malicious data
    });
  }
}

// Violation: Payment service with no input sanitization
class PaymentService {
  // VIOLATION: SQL injection vulnerability
  processPayment(userId, amount, cardNumber) {
    // Building SQL directly from user input - DANGEROUS
    const query = `INSERT INTO payments (user_id, amount, card) VALUES ('${userId}', ${amount}, '${cardNumber}')`;

    console.log('Executing SQL:', query);
    // If userId = "1'); DROP TABLE payments; --", system is compromised
  }

  // VIOLATION: Command injection vulnerability
  generateReceipt(orderId, email) {
    // Passing user input directly to system command - DANGEROUS
    const command = `node generate-pdf.js --order=${orderId} --email=${email}`;

    console.log('Executing command:', command);
    // If email = "user@test.com; rm -rf /", system is compromised
  }
}

// Usage demonstrating the vulnerabilities
console.log('=== Boundary Defense Principle - VIOLATION ===\n');

const userService = new UserService();
const orderService = new OrderService();
const paymentService = new PaymentService();

// Example 1: Malicious API input
console.log('1. Creating user with malicious input:');
const maliciousUser = userService.createUser({
  id: 1,
  email: "admin@example.com'; DROP TABLE users; --",
  age: -5, // Invalid age
  role: 'user',
  isAdmin: true, // Client trying to escalate privileges
});
console.log('Created user:', maliciousUser);
console.log('Security issue: Client set isAdmin=true!\n');

// Example 2: Prototype pollution from external service
console.log('2. Syncing with compromised external service:');
userService.syncWithExternalService(999).then(() => {
  const obj = {};
  console.log('Prototype pollution check - obj.isAdmin:', obj.isAdmin);
  console.log('System compromised via prototype pollution!\n');
});

// Example 3: Malicious file content
console.log('3. Importing orders from untrusted file:');
const maliciousFile = JSON.stringify([
  { id: 1, amount: -1000, items: [], userId: '../../../etc/passwd' },
  { id: 2, amount: 'invalid', items: null, userId: '<script>alert("xss")</script>' },
]);
try {
  orderService.importOrdersFromFile(maliciousFile);
  console.log('Imported orders:', orderService.orders);
  console.log('Accepted negative amounts and invalid data!\n');
} catch (e) {
  console.log('Error:', e.message);
}

// Example 4: SQL injection vulnerability
console.log('4. Payment with SQL injection:');
paymentService.processPayment("1'); DROP TABLE payments; --", 100, '1234567890123456');
console.log('SQL injection executed!\n');

// Example 5: Command injection vulnerability
console.log('5. Receipt generation with command injection:');
paymentService.generateReceipt(123, 'user@test.com; cat /etc/passwd');
console.log('Command injection executed!\n');

console.log('=== Why This is Bad ===');
console.log('1. Security vulnerabilities: SQL injection, command injection, XSS, prototype pollution');
console.log('2. Data corruption: Invalid data (negative amounts, wrong types) enters the system');
console.log('3. Privilege escalation: Clients can set admin flags');
console.log('4. System instability: Malformed data causes crashes or undefined behavior');
console.log('5. No defense in depth: One breach anywhere compromises the entire system');
