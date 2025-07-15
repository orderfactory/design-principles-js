/**
 * Fail Fast Principle - Violation
 *
 * This example demonstrates a violation of the Fail Fast principle by delaying validation
 * and allowing invalid data to propagate through the system, which makes errors harder
 * to trace and debug.
 */

// User registration system that delays validation
class UserRegistration {
  constructor() {
    // Store validation errors to report later
    this.validationErrors = [];
    // Database of registered users (simplified)
    this.userDatabase = [];
  }

  /**
   * Registers a new user with the system
   * @param {Object} userData - User data for registration
   * @returns {Object|null} - Registered user object or null if registration failed
   */
  registerUser(userData) {
    // Reset validation errors
    this.validationErrors = [];

    // Create user object without immediate validation
    const user = {
      id: this.generateUserId(),
      ...userData,
      createdAt: new Date()
    };

    // Process the user (validation happens inside)
    const success = this.processUser(user);

    // Only return the user if processing was successful
    if (success) {
      return user;
    } else {
      // Return null if there were errors (caller has to check)
      return null;
    }
  }

  /**
   * Processes a user, including delayed validation and database saving
   * @param {Object} user - User object to process
   * @returns {boolean} - Whether processing was successful
   */
  processUser(user) {
    // Perform business logic with potentially invalid data
    this.enrichUserData(user);

    // Only validate after processing (too late)
    const isValid = this.validateUserData(user);

    if (isValid) {
      // Save to database only if valid
      this.saveUserToDatabase(user);
      return true;
    } else {
      // Log errors but don't throw exceptions
      console.log('Validation errors:', this.validationErrors);
      return false;
    }
  }

  /**
   * Enriches user data with additional information
   * This could fail with invalid data but errors are not caught early
   * @param {Object} user - User object to enrich
   */
  enrichUserData(user) {
    // This might fail with invalid data
    try {
      // Add display name based on username
      user.displayName = user.username ? `${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}` : 'Anonymous';

      // Add email domain (will fail if email is invalid)
      if (user.email) {
        const emailParts = user.email.split('@');
        user.emailDomain = emailParts.length > 1 ? emailParts[1] : null;
      }

      // Calculate password strength (will fail if password is undefined)
      user.passwordStrength = this.calculatePasswordStrength(user.password || '');
    } catch (error) {
      // Silently catch errors and continue
      console.log('Error during data enrichment:', error.message);
    }
  }

  /**
   * Validates user data but only collects errors instead of failing fast
   * @param {Object} user - User data to validate
   * @returns {boolean} - Whether the user data is valid
   */
  validateUserData(user) {
    let isValid = true;

    // Check if user exists
    if (!user) {
      this.validationErrors.push('User data is required');
      return false;
    }

    // Check required fields
    if (!user.username) {
      this.validationErrors.push('Username is required');
      isValid = false;
    } else {
      // Validate username format
      if (user.username.length < 3 || user.username.length > 20) {
        this.validationErrors.push('Username must be between 3 and 20 characters');
        isValid = false;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(user.username)) {
        this.validationErrors.push('Username can only contain letters, numbers, and underscores');
        isValid = false;
      }
    }

    // Validate email
    if (!user.email) {
      this.validationErrors.push('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      this.validationErrors.push('Invalid email format');
      isValid = false;
    }

    // Validate password
    if (!user.password) {
      this.validationErrors.push('Password is required');
      isValid = false;
    } else {
      // Validate password strength
      if (user.password.length < 8) {
        this.validationErrors.push('Password must be at least 8 characters long');
        isValid = false;
      }

      if (!/[A-Z]/.test(user.password)) {
        this.validationErrors.push('Password must contain at least one uppercase letter');
        isValid = false;
      }

      if (!/[a-z]/.test(user.password)) {
        this.validationErrors.push('Password must contain at least one lowercase letter');
        isValid = false;
      }

      if (!/[0-9]/.test(user.password)) {
        this.validationErrors.push('Password must contain at least one number');
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Calculates password strength
   * @param {string} password - Password to evaluate
   * @returns {string} - Password strength rating
   */
  calculatePasswordStrength(password) {
    // This could throw errors with invalid input
    if (!password) return 'none';

    let score = 0;

    // Length check
    score += Math.min(password.length, 10);

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 2;
    if (/[a-z]/.test(password)) score += 2;
    if (/[0-9]/.test(password)) score += 2;
    if (/[^A-Za-z0-9]/.test(password)) score += 3;

    // Return strength rating
    if (score >= 15) return 'strong';
    if (score >= 10) return 'medium';
    return 'weak';
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
    this.userDatabase.push(user);
    console.log('User saved to database:', user);
  }

  /**
   * Gets validation errors
   * @returns {Array} - List of validation errors
   */
  getValidationErrors() {
    return this.validationErrors;
  }
}

// Example usage
const registration = new UserRegistration();

// This will not fail fast, but will return null
const invalidUser = registration.registerUser({
  username: 'jo', // Too short
  email: 'not-an-email',
  password: 'weak'
});

if (invalidUser) {
  console.log('User registered successfully:', invalidUser);
} else {
  console.log('Registration failed with errors:', registration.getValidationErrors());
  // Output: Registration failed with errors: [
  //   'Username must be between 3 and 20 characters',
  //   'Invalid email format',
  //   'Password must be at least 8 characters long',
  //   'Password must contain at least one uppercase letter'
  // ]
}

// This will succeed because all validations pass
const validUser = registration.registerUser({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'StrongPass123'
});

if (validUser) {
  console.log('User registered successfully:', validUser);
} else {
  console.log('Registration failed with errors:', registration.getValidationErrors());
}