/**
 * Fail Fast Principle - Correct Implementation
 *
 * This example demonstrates the Fail Fast principle by validating inputs early
 * and throwing errors immediately when problems are detected, rather than
 * allowing invalid data to propagate through the system.
 */

// User registration system that validates inputs immediately
class UserRegistration {
  /**
   * Registers a new user with the system
   * @param {Object} userData - User data for registration
   * @returns {Object} - Registered user object
   * @throws {Error} - If any validation fails
   */
  registerUser(userData) {
    // Validate all inputs immediately before proceeding
    this.validateUserData(userData);

    // If we get here, all validations have passed
    const user = {
      id: this.generateUserId(),
      ...userData,
      createdAt: new Date()
    };

    // Save user to database (simplified)
    this.saveUserToDatabase(user);

    return user;
  }

  /**
   * Validates all user data and throws errors immediately if any validation fails
   * @param {Object} userData - User data to validate
   * @throws {Error} - If any validation fails
   */
  validateUserData(userData) {
    // Check if userData exists
    if (!userData) {
      throw new Error('User data is required');
    }

    // Check required fields
    if (!userData.username) {
      throw new Error('Username is required');
    }

    if (!userData.email) {
      throw new Error('Email is required');
    }

    if (!userData.password) {
      throw new Error('Password is required');
    }

    // Validate username format
    if (userData.username.length < 3 || userData.username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(userData.password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(userData.password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(userData.password)) {
      throw new Error('Password must contain at least one number');
    }
  }

  /**
   * Generates a unique user ID
   * @returns {string} - A unique user ID
   */
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Saves user to database (simplified)
   * @param {Object} user - User object to save
   */
  saveUserToDatabase(user) {
    // In a real implementation, this would save to a database
    console.log('User saved to database:', user);
  }
}

// Example usage
const registration = new UserRegistration();

try {
  // This will fail fast with a clear error message
  const invalidUser = registration.registerUser({
    username: 'jo', // Too short
    email: 'not-an-email',
    password: 'weak'
  });
} catch (error) {
  console.error('Registration failed:', error.message);
  // Output: Registration failed: Username must be between 3 and 20 characters
}

try {
  // This will succeed because all validations pass
  const validUser = registration.registerUser({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'StrongPass123'
  });
  console.log('User registered successfully:', validUser);
} catch (error) {
  console.error('Registration failed:', error.message);
}