/**
 * You Ain't Gonna Need It (YAGNI) Principle - Correct Implementation
 *
 * The YAGNI principle suggests that you shouldn't add functionality until it's actually needed.
 * It's about avoiding speculative development and focusing only on current requirements.
 *
 * In this example, we create a simple UserProfile class that only implements
 * the features that are currently needed, without adding speculative functionality.
 */

// UserProfile class - implements only what's currently needed
class UserProfile {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  // Only methods that are currently required are implemented
}

// Simple authentication service that only handles what's needed now
class AuthenticationService {
  constructor() {
    this.users = [];
  }

  registerUser(name, email, password) {
    // Simple validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    const user = new UserProfile(name, email);
    this.users.push({
      profile: user,
      password: password // In a real app, this would be hashed
    });

    return user;
  }

  login(email, password) {
    const userAccount = this.users.find(u => u.profile.getEmail() === email && u.password === password);
    return userAccount ? userAccount.profile : null;
  }
}

// Usage example
const auth = new AuthenticationService();

// Register a new user
const user = auth.registerUser('John Doe', 'john@example.com', 'password123');
console.log(`User registered: ${user.getName()}`);

// Login
const loggedInUser = auth.login('john@example.com', 'password123');
if (loggedInUser) {
  console.log(`Login successful: ${loggedInUser.getName()}`);
} else {
  console.log('Login failed');
}

/**
 * This demonstrates YAGNI because:
 * 1. The UserProfile class only contains the properties and methods that are currently needed
 * 2. The AuthenticationService only implements basic registration and login functionality
 * 3. We didn't add speculative features like:
 *    - Password reset functionality
 *    - User roles and permissions
 *    - Profile picture handling
 *    - Email verification
 *    - Session management
 *    - Two-factor authentication
 *
 * These features would only be added when they become an actual requirement,
 * not because we think we might need them in the future.
 */