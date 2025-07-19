// Write Everything Twice (WET) Principle - Violation
// This file demonstrates a violation of the WET principle by showing an implementation
// that uses excessive abstraction to avoid duplication (DRY), resulting in code that is
// harder to understand, maintain, and extend.

// Example: A user management system with a single, overly abstract validation system

// Generic validator with configuration options
class ConfigurableValidator {
  constructor(config = {}) {
    this.config = {
      username: {
        required: true,
        minLength: 5,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        patternMessage: 'Username can only contain letters, numbers, and underscores',
        ...config.username
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Invalid email format',
        checkDisposableDomains: false,
        disposableDomains: ['tempmail.com', 'throwaway.com', 'fakeemail.com'],
        ...config.email
      },
      password: {
        required: false,
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
        ...config.password
      },
      bio: {
        required: false,
        maxLength: 500,
        checkInappropriateContent: false,
        inappropriateWords: ['badword1', 'badword2', 'badword3'],
        ...config.bio
      }
    };
  }

  validate(field, value, context = {}) {
    const fieldConfig = this.config[field];

    if (!fieldConfig) {
      throw new Error(`No validation configuration for field: ${field}`);
    }

    // Check if required
    if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      throw new Error(`${field} is required`);
    }

    // Skip further validation if value is empty and not required
    if (!value && !fieldConfig.required) {
      return true;
    }

    // Type checking
    if (field === 'username' || field === 'email' || field === 'password' || field === 'bio') {
      if (typeof value !== 'string') {
        throw new Error(`${field} must be a string`);
      }
    }

    // Length validation
    if (fieldConfig.minLength !== undefined && value.length < fieldConfig.minLength) {
      throw new Error(`${field} must be at least ${fieldConfig.minLength} characters long`);
    }

    if (fieldConfig.maxLength !== undefined && value.length > fieldConfig.maxLength) {
      throw new Error(`${field} cannot exceed ${fieldConfig.maxLength} characters`);
    }

    // Pattern validation
    if (fieldConfig.pattern && !fieldConfig.pattern.test(value)) {
      throw new Error(fieldConfig.patternMessage || `Invalid ${field} format`);
    }

    // Field-specific validations
    if (field === 'email' && fieldConfig.checkDisposableDomains) {
      const domain = value.split('@')[1];
      if (fieldConfig.disposableDomains.includes(domain)) {
        throw new Error('Disposable email addresses are not allowed');
      }
    }

    if (field === 'password') {
      if (fieldConfig.requireUppercase && !/[A-Z]/.test(value)) {
        throw new Error(`${field} must contain at least one uppercase letter`);
      }

      if (fieldConfig.requireLowercase && !/[a-z]/.test(value)) {
        throw new Error(`${field} must contain at least one lowercase letter`);
      }

      if (fieldConfig.requireNumber && !/[0-9]/.test(value)) {
        throw new Error(`${field} must contain at least one number`);
      }

      if (fieldConfig.requireSpecial && !/[^A-Za-z0-9]/.test(value)) {
        throw new Error(`${field} must contain at least one special character`);
      }
    }

    if (field === 'bio' && fieldConfig.checkInappropriateContent) {
      if (fieldConfig.inappropriateWords.some(word => value.toLowerCase().includes(word))) {
        throw new Error('Content contains inappropriate language');
      }
    }

    return true;
  }

  validateObject(obj, fields, context = {}) {
    const errors = [];

    for (const field of fields) {
      try {
        this.validate(field, obj[field], context);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return true;
  }
}

// User service with a single validator for all operations
class UserService {
  constructor() {
    // Create a single validator with complex configuration
    this.validator = new ConfigurableValidator({
      email: {
        // This configuration tries to handle both registration and profile update cases
        checkDisposableDomains: true, // But this will apply to ALL email validations
      },
      password: {
        required: true, // But this will apply to ALL password validations
      },
      bio: {
        checkInappropriateContent: true, // But this will apply to ALL bio validations
      }
    });

    this.users = [];
  }

  registerUser(userData) {
    try {
      // Validate using the generic validator
      // We need to specify which fields to validate
      this.validator.validateObject(userData, ['username', 'email', 'password']);

      // Create new user
      const newUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        password: `hashed_${userData.password}`, // In a real app, this would be properly hashed
        createdAt: new Date()
      };

      this.users.push(newUser);
      console.log(`User registered: ${newUser.username}`);
      return { success: true, userId: newUser.id };
    } catch (error) {
      console.error(`Registration failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  updateUserProfile(userId, updateData) {
    try {
      // Find user
      const userIndex = this.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Validate using the same generic validator
      // We need to remember which fields to validate
      const fieldsToValidate = ['username', 'email'];
      if (updateData.bio !== undefined) {
        fieldsToValidate.push('bio');
      }

      // Problem: password is marked as required in the validator config,
      // but we don't want to require it for profile updates
      // Workaround: add a dummy password if not provided
      if (!updateData.password) {
        // This is a hack to work around the validator's limitations
        updateData.password = 'DummyPassword123!';
      }

      this.validator.validateObject(updateData, fieldsToValidate);

      // Update user
      const user = this.users[userIndex];
      this.users[userIndex] = {
        ...user,
        username: updateData.username || user.username,
        email: updateData.email || user.email,
        bio: updateData.bio !== undefined ? updateData.bio : user.bio,
        // Don't update the password if it was our dummy password
        password: updateData.password === 'DummyPassword123!' ? user.password : `hashed_${updateData.password}`,
        updatedAt: new Date()
      };

      console.log(`Profile updated for user: ${this.users[userIndex].username}`);
      return { success: true };
    } catch (error) {
      console.error(`Profile update failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// Usage example
function demonstrateViolation() {
  const userService = new UserService();

  console.log('--- User Registration ---');
  const registrationResult = userService.registerUser({
    username: 'johndoe123',
    email: 'john@example.com',
    password: 'P@ssw0rd123'
  });

  if (registrationResult.success) {
    console.log(`\n--- Profile Update ---`);
    // Note: We don't need to provide a password for profile update,
    // but our validator is configured to require it, so we have to use a workaround
    const updateResult = userService.updateUserProfile(registrationResult.userId, {
      username: 'johndoe_updated',
      email: 'john_new@example.com',
      bio: 'Software developer with 5 years of experience'
    });

    if (updateResult.success) {
      console.log('\n--- Attempting Updates with Invalid Data ---');

      // Try updating with invalid username
      console.log('\nAttempting update with invalid username:');
      userService.updateUserProfile(registrationResult.userId, {
        username: 'j@',
        email: 'john_new@example.com'
      });

      // Try registering with disposable email
      console.log('\nAttempting registration with disposable email:');
      userService.registerUser({
        username: 'tempuser',
        email: 'user@tempmail.com',
        password: 'Temp@123456'
      });

      // Try updating with disposable email
      // Problem: This will be rejected because our validator is configured to check
      // disposable domains for ALL email validations, not just during registration
      console.log('\nAttempting profile update with disposable email:');
      userService.updateUserProfile(registrationResult.userId, {
        username: 'johndoe_updated',
        email: 'john@tempmail.com'
      });
    }
  }
}

// Run the demonstration
demonstrateViolation();

/*
Key problems with this DRY implementation that violate the WET principle:

1. Overly Generic Abstraction: The ConfigurableValidator tries to handle all validation scenarios
   with a single class, making it complex and difficult to understand.

2. Configuration Complexity: The validator requires complex configuration objects that are hard
   to maintain and understand.

3. Inflexible Validation Rules: Because the validator is shared, it's difficult to have different
   validation rules for different operations (e.g., requiring password for registration but not
   for profile updates).

4. Workarounds and Hacks: The code needs workarounds (like adding a dummy password) to handle
   cases where the shared validator's rules don't fit the specific use case.

5. Hidden Business Logic: Important business rules (like allowing disposable emails for profile
   updates but not for registration) are buried in configuration objects rather than being
   explicitly expressed in the code.

6. Difficult to Extend: Adding new validation rules or changing existing ones requires careful
   consideration of all the places where the validator is used to avoid unintended side effects.

7. Reduced Clarity: The code doesn't clearly communicate the different validation requirements
   for different operations.

This approach demonstrates how excessive abstraction to avoid duplication (DRY) can lead to
code that is harder to understand, maintain, and extend. In this case, writing the validation
logic twice (WET) would have been a better approach, as it would allow each validator to be
tailored to its specific use case and evolve independently.
*/