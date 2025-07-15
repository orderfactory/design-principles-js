/**
 * Postel's Robustness Principle - Violation
 *
 * Postel's Robustness Principle (also known as the Law of Robustness) states:
 * "Be conservative in what you do, be liberal in what you accept from others."
 *
 * This file demonstrates a violation of the principle by:
 * 1. Being strict (not liberal) in what it accepts - rejecting inputs that don't exactly match expectations
 * 2. Being inconsistent (not conservative) in what it sends - returning varying output formats
 */

// UserProfileService class that violates Postel's Robustness Principle
class UserProfileService {
  constructor() {
    this.users = new Map();
  }

  // Strict in what it accepts - rejects inputs that don't exactly match expectations
  createUser(userData) {
    // Throw error for missing data instead of handling gracefully
    if (!userData) {
      throw new Error('User data is required');
    }

    // Require ID instead of generating one
    if (!userData.id) {
      throw new Error('User ID is required');
    }

    // Strict name validation - must be a string with specific format
    if (typeof userData.name !== 'string' || userData.name.trim() === '') {
      throw new Error('Name must be a non-empty string');
    }

    // Strict email validation - must be lowercase and match exact format
    if (typeof userData.email !== 'string' || userData.email !== userData.email.toLowerCase()) {
      throw new Error('Email must be a lowercase string');
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Strict age validation - must be a number between 18 and 100
    if (typeof userData.age !== 'number' || userData.age < 18 || userData.age > 100 || !Number.isInteger(userData.age)) {
      throw new Error('Age must be an integer between 18 and 100');
    }

    // Strict preferences validation - must be an object
    if (!userData.preferences || typeof userData.preferences !== 'object' || Array.isArray(userData.preferences)) {
      throw new Error('Preferences must be an object');
    }

    // Store the user exactly as provided (no normalization)
    this.users.set(userData.id, {
      ...userData,
      createdAt: new Date()
    });

    // Inconsistent return format - sometimes returns user object, sometimes just ID
    return userData.id;
  }

  // Inconsistent in what it sends - returns different formats based on internal conditions
  getUserProfile(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Inconsistent return format - sometimes returns different structures
    // This makes it hard for clients to rely on a consistent interface

    // If user has preferences, return one format
    if (Object.keys(user.preferences).length > 0) {
      return {
        userData: {
          identifier: user.id,
          personalInfo: {
            fullName: user.name,
            contactEmail: user.email,
            yearOfBirth: new Date().getFullYear() - user.age
          },
          settings: user.preferences
        }
      };
    }

    // Otherwise return a completely different format
    return {
      id: user.id,
      basic_info: `${user.name} (${user.email})`,
      age_data: user.age,
      // Sometimes omit createdAt
    };
  }

  // Inconsistent error handling - sometimes throws, sometimes returns null
  updateUserEmail(userId, newEmail) {
    // No validation for userId
    const user = this.users.get(userId);

    // Return null instead of consistent error format
    if (!user) {
      return null;
    }

    // Strict email validation with no normalization
    if (typeof newEmail !== 'string' || newEmail !== newEmail.toLowerCase()) {
      throw new Error('Email must be a lowercase string');
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Invalid email format');
    }

    // Update user
    user.email = newEmail;
    this.users.set(userId, user);

    // Inconsistent return value - just returns true
    return true;
  }
}

// Usage example
function demonstratePostelsPrincipleViolation() {
  const userService = new UserProfileService();

  try {
    console.log('Creating user with valid data:');
    const userId = userService.createUser({
      id: 'user123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 32,
      preferences: { theme: 'dark', notifications: true }
    });
    console.log('User created with ID:', userId);

    console.log('\nTrying to create user with uppercase email:');
    userService.createUser({
      id: 'user456',
      name: 'Jane Smith',
      email: 'JANE.SMITH@EXAMPLE.COM', // Uppercase email - will be rejected
      age: 28,
      preferences: {}
    });
  } catch (error) {
    console.error('Error:', error.message);
  }

  try {
    console.log('\nTrying to create user with string age:');
    userService.createUser({
      id: 'user789',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: '45', // String instead of number - will be rejected
      preferences: {}
    });
  } catch (error) {
    console.error('Error:', error.message);
  }

  try {
    console.log('\nRetrieving user profile:');
    const profile = userService.getUserProfile('user123');
    console.log(profile);

    console.log('\nUpdating user email:');
    const updateResult = userService.updateUserEmail('user123', 'john.updated@example.com');
    console.log('Update result:', updateResult);

    console.log('\nRetrieving updated user profile:');
    const updatedProfile = userService.getUserProfile('user123');
    console.log(updatedProfile);

    console.log('\nTrying to update non-existent user:');
    const failedUpdate = userService.updateUserEmail('nonexistent', 'test@example.com');
    console.log('Failed update result:', failedUpdate);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demonstration
demonstratePostelsPrincipleViolation();

/**
 * This violates Postel's Robustness Principle because:
 *
 * 1. Not Liberal in What It Accepts:
 *    - The service is extremely strict about input formats
 *    - It rejects inputs that don't exactly match expectations (case sensitivity, types)
 *    - It doesn't attempt to normalize or adapt to different input formats
 *    - It throws exceptions instead of handling edge cases gracefully
 *    - It requires all fields to be present and in specific formats
 *
 * 2. Not Conservative in What It Sends:
 *    - The service returns inconsistent response formats
 *    - Different methods have different error handling approaches (throws vs. returns null)
 *    - The structure of returned objects changes based on internal conditions
 *    - Some methods return objects, others return primitives
 *    - Error formats are inconsistent
 *
 * 3. Poor Interoperability:
 *    - Clients must perfectly match the service's expectations
 *    - Clients cannot rely on consistent response formats
 *    - Integration with this service would be difficult and error-prone
 *    - Changes to the service would likely break client implementations
 *
 * 4. Brittle Implementation:
 *    - The code is fragile and breaks easily with slight variations in input
 *    - Error handling is inconsistent and unpredictable
 *    - The service puts the burden of perfect formatting on the client
 *
 * This implementation would be difficult to use, hard to maintain, and would
 * likely cause integration problems. It demonstrates why following Postel's
 * Principle leads to more robust and interoperable systems.
 */