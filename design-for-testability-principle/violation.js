/**
 * Design for Testability Principle - Violation
 *
 * Design for Testability (DfT) is a software design principle that emphasizes creating code
 * that can be easily and thoroughly tested. Systems should be built so they can be easily
 * and reliably tested, which often means writing modular, loosely-coupled code and providing
 * hooks for automated tests.
 *
 * This file demonstrates a violation of the Design for Testability principle by creating
 * an authentication system that is difficult to test due to tight coupling, hidden dependencies,
 * and poor separation of concerns.
 */

// A poorly testable authentication service
class AuthService {
  constructor() {
    // Hard-coded database connection
    this.database = {
      users: [
        {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com',
          password: 'password123', // In a real app, this would be hashed
          roles: ['user'],
          active: true
        },
        {
          id: 2,
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin123', // In a real app, this would be hashed
          roles: ['user', 'admin'],
          active: true
        }
      ]
    };

    // Secret key hard-coded in the class
    this.secretKey = 'hard-coded-secret-key';
  }

  async login(username, password) {
    try {
      // Validate inputs
      if (!username || !password) {
        console.log(`[WARN] Login attempt with missing credentials`);
        return { success: false, message: 'Username and password are required' };
      }

      // Find user - direct database access
      const user = this.database.users.find(u => u.username === username);

      if (!user) {
        console.log(`[WARN] Login attempt for non-existent user: ${username}`);
        return { success: false, message: 'Invalid username or password' };
      }

      // Verify password - direct comparison without abstraction
      if (user.password !== password) {
        console.log(`[WARN] Failed login attempt for user: ${username}`);
        return { success: false, message: 'Invalid username or password' };
      }

      // Generate token - implementation directly in the method
      const token = JSON.stringify({
        userId: user.id,
        username: user.username,
        roles: user.roles,
        exp: Date.now() + 3600000 // 1 hour expiration
      });

      console.log(`[INFO] Successful login for user: ${username}`);

      // Update last login time directly in the database
      user.lastLogin = new Date();

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        token
      };
    } catch (error) {
      console.log(`[ERROR] Login error: ${error.message}`);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  validateToken(token) {
    try {
      // Token validation logic directly in the method
      const payload = JSON.parse(token);

      if (payload.exp < Date.now()) {
        console.log('[WARN] Expired token validation attempt');
        return { valid: false };
      }

      // Direct database access
      const user = this.database.users.find(u => u.id === payload.userId);

      if (!user || !user.active) {
        console.log(`[WARN] Token validation for inactive/deleted user: ${payload.userId}`);
        return { valid: false };
      }

      console.log(`[INFO] Token validated for user: ${user.username}`);

      // Side effect: update last activity
      user.lastActivity = new Date();

      return {
        valid: true,
        userId: user.id,
        username: user.username,
        roles: user.roles
      };
    } catch (error) {
      console.log(`[ERROR] Token validation error: ${error.message}`);
      return { valid: false };
    }
  }

  // Method with multiple responsibilities
  getUserAndUpdateStats(username) {
    const user = this.database.users.find(u => u.username === username);

    if (user) {
      // Update statistics
      user.accessCount = (user.accessCount || 0) + 1;
      user.lastAccess = new Date();

      // Send notification (would be an API call in a real app)
      console.log(`[INFO] Notification sent to ${user.email}`);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        accessCount: user.accessCount
      };
    }

    return null;
  }

  // Method with global side effects
  logout(userId) {
    const user = this.database.users.find(u => u.id === userId);

    if (user) {
      // Multiple side effects in one method
      user.lastLogout = new Date();
      user.isLoggedIn = false;

      // This would be a call to an external service in a real app
      console.log(`[INFO] User ${user.username} logged out`);
      console.log(`[INFO] Session data cleared for ${user.username}`);
      console.log(`[INFO] Audit log updated for ${user.username}`);

      return true;
    }

    return false;
  }
}

// Usage example
async function demonstrateAuthService() {
  // Create the authentication service
  const authService = new AuthService();

  console.log('Attempting login with valid credentials:');
  const loginResult = await authService.login('john_doe', 'password123');
  console.log(loginResult);

  if (loginResult.success) {
    console.log('\nValidating token:');
    const validationResult = authService.validateToken(loginResult.token);
    console.log(validationResult);

    console.log('\nGetting user info and updating stats:');
    const userInfo = authService.getUserAndUpdateStats('john_doe');
    console.log(userInfo);

    console.log('\nLogging out:');
    const logoutResult = authService.logout(loginResult.user.id);
    console.log(`Logout successful: ${logoutResult}`);
  }

  console.log('\nAttempting login with invalid credentials:');
  const failedLoginResult = await authService.login('john_doe', 'wrong_password');
  console.log(failedLoginResult);

  // PROBLEM: Trying to test specific scenarios is difficult
  console.log('\nDifficulties in testing:');
  console.log('1. Cannot test token validation without a successful login');
  console.log('2. Cannot mock the database for testing edge cases');
  console.log('3. Cannot isolate logging from business logic');
  console.log('4. Side effects make tests unpredictable');
}

// Run the demonstration
demonstrateAuthService().catch(error => {
  console.error('Demonstration error:', error);
});

/**
 * This violates Design for Testability because:
 *
 * 1. Hard-Coded Dependencies:
 *    - The database and secret key are hard-coded inside the AuthService class
 *    - There's no way to substitute these dependencies for testing
 *
 * 2. No Separation of Concerns:
 *    - The AuthService handles authentication, database access, logging, and token management
 *    - This makes it impossible to test components in isolation
 *
 * 3. Hidden Side Effects:
 *    - Methods modify the database directly without making these side effects explicit
 *    - This makes tests unpredictable and order-dependent
 *
 * 4. No Abstraction Layers:
 *    - Direct access to the database without repository or data access layer
 *    - No abstraction for token generation or validation
 *
 * 5. Multiple Responsibilities:
 *    - Methods like getUserAndUpdateStats and logout perform multiple unrelated operations
 *    - This makes it difficult to test specific behaviors
 *
 * 6. Global State:
 *    - The class maintains global state (database) that persists between method calls
 *    - This creates dependencies between tests and makes them order-dependent
 *
 * 7. Console Logging:
 *    - Direct console logging instead of using an injectable logger
 *    - Makes it difficult to verify that correct log messages are generated
 *
 * Testing challenges:
 * - Cannot test token validation with an expired token without waiting or modifying code
 * - Cannot test behavior with different database states
 * - Cannot verify that correct log messages are generated
 * - Cannot test error handling scenarios easily
 * - Tests would be slow, as they would need to work with the real implementation
 * - Tests would be brittle, as changes to one part affect many tests
 */