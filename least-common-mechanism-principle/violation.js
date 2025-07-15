/**
 * Least Common Mechanism Principle (LCM) - Violation
 *
 * The Least Common Mechanism Principle states that we should minimize the amount of
 * functionality or mechanism that is shared between different parts of a system.
 *
 * This file demonstrates a violation of the Least Common Mechanism Principle by
 * implementing a user management system with a single, general-purpose mechanism
 * that is shared across different user types, leading to increased complexity,
 * reduced security, and maintenance issues.
 */

// A single User class with a general-purpose mechanism for all user types
class User {
  constructor(username, userType) {
    this.username = username;
    this.userType = userType; // 'admin', 'regular', or 'guest'

    // Set permissions based on user type
    if (userType === 'admin') {
      this.permissions = ['read', 'write', 'delete', 'manage-users'];
    } else if (userType === 'regular') {
      this.permissions = ['read', 'write'];
    } else if (userType === 'guest') {
      this.permissions = ['read'];
      this.sessionId = Math.floor(Math.random() * 1000000);
    }
  }

  // A single, general-purpose authentication method for all user types
  authenticate(credentials) {
    // Complex conditional logic to handle different authentication methods
    if (this.userType === 'admin') {
      // Admin authentication requires two-factor authentication
      if (!credentials || !credentials.password || !credentials.twoFactorCode) {
        console.log(`Admin ${this.username} authentication failed: missing credentials`);
        return false;
      }

      // Verify admin credentials
      const passwordValid = credentials.password === 'admin-password';
      const twoFactorValid = credentials.twoFactorCode === '123456';

      if (passwordValid && twoFactorValid) {
        console.log(`Admin ${this.username} authenticated with 2FA`);
        return true;
      } else {
        console.log(`Admin ${this.username} authentication failed: invalid credentials`);
        return false;
      }
    }
    else if (this.userType === 'regular') {
      // Regular user authentication requires only password
      if (!credentials || !credentials.password) {
        console.log(`User ${this.username} authentication failed: missing password`);
        return false;
      }

      // Verify regular user credentials
      const passwordValid = credentials.password === 'user-password';

      if (passwordValid) {
        console.log(`User ${this.username} authenticated with password`);
        return true;
      } else {
        console.log(`User ${this.username} authentication failed: invalid password`);
        return false;
      }
    }
    else if (this.userType === 'guest') {
      // Guests don't need authentication, just session tracking
      console.log(`Guest ${this.sessionId} session validated`);
      return true;
    }

    return false;
  }

  // A single, general-purpose action method for all user types
  performAction(actionType, data) {
    // Complex conditional logic to handle different actions
    if (actionType === 'manage-users' && this.userType === 'admin') {
      console.log(`Admin ${this.username} is managing users`);
      // Admin-specific user management logic
      return true;
    }
    else if (actionType === 'update-profile' && this.userType === 'regular') {
      console.log(`User ${this.username} is updating their profile with data:`, data);
      // Regular user profile update logic
      return true;
    }
    else if (actionType === 'browse-content') {
      if (this.userType === 'guest') {
        console.log(`Guest ${this.sessionId} is browsing content`);
      } else {
        console.log(`${this.username} is browsing content`);
      }
      // Content browsing logic
      return true;
    }
    else {
      console.log(`User ${this.username} does not have permission for action: ${actionType}`);
      return false;
    }
  }

  // A single, general-purpose method to check permissions
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  // A single, general-purpose method to get user information
  getUserInfo() {
    const info = {
      username: this.username,
      userType: this.userType,
      permissions: this.permissions
    };

    // Add session ID for guests
    if (this.userType === 'guest') {
      info.sessionId = this.sessionId;
    }

    return info;
  }
}

// Usage example
function demonstrateUserSystem() {
  // Create different types of users using the same class
  const admin = new User('admin1', 'admin');
  const regularUser = new User('user1', 'regular');
  const guestUser = new User('guest', 'guest');

  // Authenticate users with the same general-purpose mechanism
  const adminAuthenticated = admin.authenticate({
    password: 'admin-password',
    twoFactorCode: '123456'
  });

  const userAuthenticated = regularUser.authenticate({
    password: 'user-password'
  });

  const guestAuthenticated = guestUser.authenticate();

  console.log('\nAuthentication Results:');
  console.log(`Admin authenticated: ${adminAuthenticated}`);
  console.log(`Regular user authenticated: ${userAuthenticated}`);
  console.log(`Guest authenticated: ${guestAuthenticated}`);

  // Use the same general-purpose action method for different user types
  if (adminAuthenticated) {
    admin.performAction('manage-users');
  }

  if (userAuthenticated) {
    regularUser.performAction('update-profile', { name: 'Updated Name' });
  }

  if (guestAuthenticated) {
    guestUser.performAction('browse-content');
  }

  // Display user information using the same method
  console.log('\nUser Information:');
  [admin, regularUser, guestUser].forEach(user => {
    const info = user.getUserInfo();
    console.log(`Username: ${info.username}`);
    console.log(`User Type: ${info.userType}`);
    console.log(`Permissions: ${info.permissions.join(', ')}`);
    if (info.sessionId) {
      console.log(`Session ID: ${info.sessionId}`);
    }
    console.log('---');
  });
}

// Run the demonstration
demonstrateUserSystem();

/**
 * This violates the Least Common Mechanism Principle because:
 *
 * 1. Shared General-Purpose Mechanism:
 *    - A single User class handles all user types with conditional logic
 *    - The authenticate() method contains complex branching logic for different authentication types
 *    - The performAction() method handles all possible actions with conditional checks
 *
 * 2. Excessive Functionality:
 *    - Each user instance contains code for handling all user types
 *    - Users have access to methods they don't need (even if they can't use them)
 *    - The code is more complex than necessary for each specific user type
 *
 * 3. Reduced Security:
 *    - The shared authentication mechanism increases the attack surface
 *    - A bug in the shared code could affect all user types
 *    - It's harder to enforce strict security boundaries between user types
 *
 * 4. Maintenance Issues:
 *    - Changes to one user type's behavior might affect others
 *    - Adding a new user type requires modifying the existing User class
 *    - The conditional logic becomes increasingly complex as requirements evolve
 *
 * 5. Reduced Testability:
 *    - Testing is more complex due to the intertwined logic
 *    - It's harder to isolate and test specific user behaviors
 *    - Test cases need to account for all possible code paths
 *
 * By violating LCM, this code is more complex, less secure, and harder to maintain.
 * The shared mechanisms create unnecessary coupling between different user types,
 * making the system more brittle and error-prone.
 */