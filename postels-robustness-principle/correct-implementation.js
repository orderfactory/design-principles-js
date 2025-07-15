/**
 * Postel's Robustness Principle - Correct Implementation
 *
 * Postel's Robustness Principle (also known as the Law of Robustness) states:
 * "Be conservative in what you do, be liberal in what you accept from others."
 *
 * In programming, this means:
 * 1. Be liberal in what you accept: Accept a wide range of inputs, handling edge cases gracefully
 * 2. Be conservative in what you send: Produce only well-formed, standard-compliant outputs
 *
 * Benefits of following Postel's Principle:
 * 1. Improved interoperability between systems
 * 2. More resilient and fault-tolerant applications
 * 3. Better user experience with fewer errors
 * 4. Easier integration with third-party systems
 * 5. More maintainable and adaptable code
 *
 * In this example, we create a user profile API that demonstrates Postel's Principle
 * by accepting various input formats but always returning standardized outputs.
 */

// UserProfileService class that follows Postel's Robustness Principle
class UserProfileService {
  constructor() {
    this.users = new Map();
  }

  // Liberal in what it accepts - handles various input formats and edge cases
  createUser(userData) {
    // Handle missing data gracefully
    if (!userData) {
      return { success: false, error: 'User data is required' };
    }

    // Generate a user ID if not provided
    const userId = userData.id || this.generateUserId();

    // Normalize name (trim whitespace, handle missing names)
    const name = this.normalizeName(userData.name);

    // Normalize and validate email (case insensitive, basic format check)
    const emailResult = this.normalizeEmail(userData.email);
    if (!emailResult.valid) {
      return { success: false, error: emailResult.error };
    }

    // Normalize age (handle strings, floats, invalid values)
    const ageResult = this.normalizeAge(userData.age);

    // Create standardized user object (conservative in what we store)
    const user = {
      id: userId,
      name: name,
      email: emailResult.email,
      age: ageResult.age,
      preferences: this.normalizePreferences(userData.preferences),
      createdAt: new Date()
    };

    // Store the user
    this.users.set(userId, user);

    // Return a standardized response (conservative in what we send)
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  // Liberal in accepting different ID formats or generating a new one
  generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Liberal in accepting different name formats
  normalizeName(name) {
    // Handle missing name
    if (!name) return 'Anonymous User';

    // Convert to string if not already
    const nameStr = String(name);

    // Trim whitespace and normalize multiple spaces
    return nameStr.trim().replace(/\s+/g, ' ');
  }

  // Liberal in accepting different email formats
  normalizeEmail(email) {
    // Handle missing email
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }

    // Convert to string and trim
    const emailStr = String(email).trim().toLowerCase();

    // Basic email validation (simple check for demonstration)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true, email: emailStr };
  }

  // Liberal in accepting different age formats
  normalizeAge(age) {
    // Handle missing age
    if (age === undefined || age === null) {
      return { age: null };
    }

    // Convert string to number if needed
    let numAge = age;
    if (typeof age === 'string') {
      numAge = parseFloat(age);
    }

    // Handle NaN or negative values
    if (isNaN(numAge) || numAge < 0) {
      return { age: null };
    }

    // Round to nearest integer
    return { age: Math.round(numAge) };
  }

  // Liberal in accepting different preference formats
  normalizePreferences(prefs) {
    // Handle missing preferences
    if (!prefs) return {};

    // If it's a string, try to parse it as JSON
    if (typeof prefs === 'string') {
      try {
        return JSON.parse(prefs);
      } catch (e) {
        return {};
      }
    }

    // If it's not an object, return empty object
    if (typeof prefs !== 'object') return {};

    // Return a copy to avoid reference issues
    return { ...prefs };
  }

  // Conservative in what we send - always returns well-formed data
  getUserProfile(userId) {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Return a standardized response with consistent structure
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    };
  }
}

// Usage example
function demonstratePostelsPrinciple() {
  const userService = new UserProfileService();

  console.log('Creating user with complete data:');
  const result1 = userService.createUser({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 32,
    preferences: { theme: 'dark', notifications: true }
  });
  console.log(result1);

  console.log('\nCreating user with minimal data:');
  const result2 = userService.createUser({
    name: '  Jane Smith  ', // Extra whitespace
    email: 'JANE.SMITH@EXAMPLE.COM', // Uppercase email
  });
  console.log(result2);

  console.log('\nCreating user with unusual data formats:');
  const result3 = userService.createUser({
    name: 123, // Number instead of string
    email: 'bob@example.com',
    age: '45.7', // String instead of number
    preferences: JSON.stringify({ theme: 'light' }) // JSON string instead of object
  });
  console.log(result3);

  console.log('\nRetrieving user profile:');
  const profile = userService.getUserProfile(result1.user.id);
  console.log(profile);
}

// Run the demonstration
demonstratePostelsPrinciple();

/**
 * This demonstrates good adherence to Postel's Robustness Principle because:
 *
 * 1. Liberal in What It Accepts:
 *    - The service accepts various input formats (strings, numbers, objects)
 *    - It handles missing data gracefully by providing defaults
 *    - It normalizes inputs (trims whitespace, converts types, etc.)
 *    - It's forgiving of common mistakes (case sensitivity in emails, extra spaces)
 *    - It tries to make sense of unusual inputs rather than rejecting them outright
 *
 * 2. Conservative in What It Sends:
 *    - The service always returns well-structured, consistent responses
 *    - All outputs follow a standard format (success/error with appropriate data)
 *    - User objects always have the same properties in the same format
 *    - Sensitive or unnecessary information is not included in responses
 *    - Error messages are clear and consistent
 *
 * 3. Robust Error Handling:
 *    - The service doesn't throw exceptions for expected error cases
 *    - It returns meaningful error messages instead of crashing
 *    - It validates inputs but tries to work with what it's given
 *
 * 4. Interoperability:
 *    - The service can work with various client implementations
 *    - It doesn't require clients to be perfect in their requests
 *    - It maintains a consistent contract for its responses
 *
 * By following Postel's Principle, this implementation creates a more robust,
 * user-friendly, and interoperable system that can adapt to various usage patterns
 * while maintaining its own integrity and consistency.
 */