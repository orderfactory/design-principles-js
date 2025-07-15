/**
 * Design for Testability Principle - Correct Implementation
 *
 * Design for Testability (DfT) is a software design principle that emphasizes creating code
 * that can be easily and thoroughly tested. Systems should be built so they can be easily
 * and reliably tested, which often means writing modular, loosely-coupled code and providing
 * hooks for automated tests.
 *
 * Benefits of Design for Testability:
 * 1. Early detection of bugs and issues
 * 2. Improved code quality and reliability
 * 3. Easier maintenance and refactoring
 * 4. Better documentation through tests
 * 5. Increased confidence in code changes
 *
 * In this example, we create a user authentication service that is designed to be easily testable.
 */

// A testable authentication service with dependency injection
class AuthenticationService {
  constructor(userRepository, tokenGenerator, logger) {
    // Dependencies are injected rather than created internally
    this.userRepository = userRepository;
    this.tokenGenerator = tokenGenerator;
    this.logger = logger;
  }

  async login(username, password) {
    try {
      // Validate inputs
      if (!username || !password) {
        this.logger.warn('Login attempt with missing credentials');
        return { success: false, message: 'Username and password are required' };
      }

      // Find user
      const user = await this.userRepository.findByUsername(username);

      if (!user) {
        this.logger.warn(`Login attempt for non-existent user: ${username}`);
        return { success: false, message: 'Invalid username or password' };
      }

      // Verify password
      const isPasswordValid = await this.userRepository.verifyPassword(user.id, password);

      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for user: ${username}`);
        return { success: false, message: 'Invalid username or password' };
      }

      // Generate token
      const token = this.tokenGenerator.generateToken({
        userId: user.id,
        username: user.username,
        roles: user.roles
      });

      this.logger.info(`Successful login for user: ${username}`);

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
      this.logger.error(`Login error: ${error.message}`);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  async validateToken(token) {
    try {
      const payload = this.tokenGenerator.verifyToken(token);

      if (!payload) {
        this.logger.warn('Invalid token validation attempt');
        return { valid: false };
      }

      // Check if user still exists and is active
      const user = await this.userRepository.findById(payload.userId);

      if (!user || !user.active) {
        this.logger.warn(`Token validation for inactive/deleted user: ${payload.userId}`);
        return { valid: false };
      }

      this.logger.info(`Token validated for user: ${user.username}`);

      return {
        valid: true,
        userId: user.id,
        username: user.username,
        roles: user.roles
      };
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      return { valid: false };
    }
  }
}

// Implementation of dependencies

// User Repository - handles user data operations
class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async findByUsername(username) {
    // In a real implementation, this would query a database
    return this.database.findUser({ username });
  }

  async findById(id) {
    return this.database.findUser({ id });
  }

  async verifyPassword(userId, password) {
    // In a real implementation, this would use secure password hashing
    const user = await this.findById(userId);
    return user && user.password === password; // Simplified for example
  }
}

// Token Generator - handles JWT token creation and validation
class TokenGenerator {
  constructor(secretKey, expiresIn = '1h') {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  generateToken(payload) {
    // In a real implementation, this would use a JWT library
    return JSON.stringify({
      ...payload,
      exp: Date.now() + 3600000 // 1 hour expiration
    });
  }

  verifyToken(token) {
    try {
      // In a real implementation, this would verify JWT signature
      const payload = JSON.parse(token);

      if (payload.exp < Date.now()) {
        return null; // Token expired
      }

      return payload;
    } catch (error) {
      return null; // Invalid token
    }
  }
}

// Logger - handles logging
class Logger {
  info(message) {
    console.log(`[INFO] ${message}`);
  }

  warn(message) {
    console.log(`[WARN] ${message}`);
  }

  error(message) {
    console.log(`[ERROR] ${message}`);
  }
}

// Mock Database for demonstration
class MockDatabase {
  constructor() {
    this.users = [
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
    ];
  }

  async findUser(query) {
    // Simple implementation for demonstration
    return this.users.find(user =>
      (query.id && user.id === query.id) ||
      (query.username && user.username === query.username)
    );
  }
}

// Usage example
async function demonstrateAuthService() {
  // Create dependencies
  const database = new MockDatabase();
  const userRepository = new UserRepository(database);
  const tokenGenerator = new TokenGenerator('secret-key');
  const logger = new Logger();

  // Create the authentication service with injected dependencies
  const authService = new AuthenticationService(userRepository, tokenGenerator, logger);

  console.log('Attempting login with valid credentials:');
  const loginResult = await authService.login('john_doe', 'password123');
  console.log(loginResult);

  if (loginResult.success) {
    console.log('\nValidating token:');
    const validationResult = await authService.validateToken(loginResult.token);
    console.log(validationResult);
  }

  console.log('\nAttempting login with invalid credentials:');
  const failedLoginResult = await authService.login('john_doe', 'wrong_password');
  console.log(failedLoginResult);
}

// Run the demonstration
demonstrateAuthService().catch(error => {
  console.error('Demonstration error:', error);
});

/**
 * This demonstrates good Design for Testability because:
 *
 * 1. Dependency Injection:
 *    - The AuthenticationService receives its dependencies (userRepository, tokenGenerator, logger)
 *      through constructor injection rather than creating them internally
 *    - This allows for easy substitution of real implementations with test doubles (mocks, stubs)
 *
 * 2. Separation of Concerns:
 *    - Each class has a single responsibility (authentication, user data access, token management)
 *    - This makes it easier to test each component in isolation
 *
 * 3. Clear Interfaces:
 *    - Each component has a well-defined interface that can be easily mocked
 *    - The AuthenticationService depends on abstractions rather than concrete implementations
 *
 * 4. Testable Methods:
 *    - Methods have clear inputs and outputs, making them easy to test
 *    - Side effects are minimized and contained within specific components
 *
 * 5. Error Handling:
 *    - Proper error handling makes it easier to test both success and failure scenarios
 *
 * 6. Pure Functions:
 *    - Many operations are implemented as pure functions with predictable outputs for given inputs
 *    - This makes assertions in tests straightforward
 *
 * With this design, we can easily write unit tests for the AuthenticationService by providing
 * mock implementations of its dependencies, allowing us to test various scenarios including:
 * - Successful login
 * - Failed login due to invalid credentials
 * - Failed login due to non-existent user
 * - Token validation
 * - Error handling
 */