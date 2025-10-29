// Write Everything Twice (WET) Principle - Correct Implementation
// The WET principle suggests that in some cases, duplicating code can be more beneficial than
// trying to abstract it into a shared implementation, especially when the duplicated code
// serves different purposes or might evolve differently over time.
//
// ⚠️ IMPORTANT WARNINGS:
// 1. This is NOT a blanket permission to duplicate code freely.
// 2. DRY (Don't Repeat Yourself) should STILL be your default approach.
// 3. Only apply WET when:
//    - Code serves fundamentally different purposes despite looking similar
//    - Different pieces are likely to evolve independently over time
//    - Forced abstraction would create excessive complexity or coupling
//    - The duplication makes the code MORE maintainable, not less
// 4. Remember: Duplication is far cheaper than the wrong abstraction.
// 5. Use WET sparingly and intentionally, not as an excuse to avoid thinking about abstractions.

// Example: A user management system with separate validation for registration and profile update

// User registration validation
class UserRegistrationValidator {
  validateUsername(username) {
    // Username-specific validation for registration
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required');
    }

    if (username.length < 5 || username.length > 20) {
      throw new Error('Username must be between 5 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    return true;
  }

  validateEmail(email) {
    // Email validation for registration
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check for disposable email domains (simplified example)
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'fakeemail.com'];
    const domain = email.split('@')[1];

    if (disposableDomains.includes(domain)) {
      throw new Error('Disposable email addresses are not allowed for registration');
    }

    return true;
  }

  validatePassword(password) {
    // Password validation for registration
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    return true;
  }

  validateRegistration(userData) {
    this.validateUsername(userData.username);
    this.validateEmail(userData.email);
    this.validatePassword(userData.password);
    console.log('Registration validation passed');
    return true;
  }
}

// Profile update validation
class ProfileUpdateValidator {
  validateUsername(username) {
    // Username-specific validation for profile update
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required');
    }

    if (username.length < 5 || username.length > 20) {
      throw new Error('Username must be between 5 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    return true;
  }

  validateEmail(email) {
    // Email validation for profile update
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // No check for disposable domains during profile update
    // Existing users are allowed to change to any valid email

    return true;
  }

  validateBio(bio) {
    // Bio validation (only for profile updates, not for registration)
    if (bio && typeof bio === 'string') {
      if (bio.length > 500) {
        throw new Error('Bio cannot exceed 500 characters');
      }

      // Check for inappropriate content (simplified)
      const inappropriateWords = ['badword1', 'badword2', 'badword3'];
      if (inappropriateWords.some(word => bio.toLowerCase().includes(word))) {
        throw new Error('Bio contains inappropriate content');
      }
    }

    return true;
  }

  validateProfileUpdate(userData) {
    this.validateUsername(userData.username);
    this.validateEmail(userData.email);
    if (userData.bio !== undefined) {
      this.validateBio(userData.bio);
    }
    console.log('Profile update validation passed');
    return true;
  }
}

// User service that uses both validators
class UserService {
  constructor() {
    this.registrationValidator = new UserRegistrationValidator();
    this.profileUpdateValidator = new ProfileUpdateValidator();
    this.users = [];
  }

  registerUser(userData) {
    try {
      // Validate registration data
      this.registrationValidator.validateRegistration(userData);

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

      // Validate profile update data
      this.profileUpdateValidator.validateProfileUpdate(updateData);

      // Update user
      const user = this.users[userIndex];
      this.users[userIndex] = {
        ...user,
        username: updateData.username || user.username,
        email: updateData.email || user.email,
        bio: updateData.bio !== undefined ? updateData.bio : user.bio,
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
function demonstrateWET() {
  const userService = new UserService();

  console.log('--- User Registration ---');
  const registrationResult = userService.registerUser({
    username: 'johndoe123',
    email: 'john@example.com',
    password: 'P@ssw0rd123'
  });

  if (registrationResult.success) {
    console.log(`\n--- Profile Update ---`);
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

      // Try updating with disposable email (should be allowed for profile updates)
      console.log('\nAttempting profile update with disposable email:');
      userService.updateUserProfile(registrationResult.userId, {
        username: 'johndoe_updated',
        email: 'john@tempmail.com'
      });
    }
  }
}

// Run the demonstration
demonstrateWET();

/*
Key aspects of this WET implementation:

1. Deliberate Duplication: The validation logic for usernames and emails is duplicated between
   the UserRegistrationValidator and ProfileUpdateValidator classes, but with important differences
   in behavior.

2. Different Requirements: Registration has stricter validation (e.g., no disposable email domains)
   than profile updates, reflecting different business requirements for these operations.

3. Independent Evolution: The duplicated code can evolve independently. For example, registration
   validation might add checks for age verification, while profile updates might add validation
   for social media links.

4. Clarity and Separation of Concerns: By having separate validators, the code clearly communicates
   the different validation requirements for registration vs. profile updates.

5. Reduced Coupling: Changes to registration validation don't affect profile update validation
   and vice versa, reducing the risk of unintended side effects.

Benefits of this approach:

1. Clarity: The code clearly communicates the different validation requirements for different operations.
2. Maintainability: Each validator can be modified independently without affecting the other.
3. Testability: Each validator can be tested separately with its specific requirements.
4. Flexibility: New validation rules can be added to one validator without complicating the other.

While this approach does involve duplicating some code, the duplication is intentional and beneficial,
as it allows the code to better reflect the different business requirements and evolve independently.
*/