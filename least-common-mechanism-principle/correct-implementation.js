/**
 * Least Common Mechanism Principle (LCM) - Correct Implementation
 *
 * The Least Common Mechanism Principle states that we should minimize the amount of
 * functionality or mechanism that is shared between different parts of a system.
 * Each component should have its own specialized mechanisms rather than relying on
 * shared, general-purpose mechanisms.
 *
 * Benefits of LCM:
 * 1. Reduced complexity and coupling between components
 * 2. Improved security by limiting potential attack vectors
 * 3. Better maintainability as components can be modified independently
 * 4. Increased reliability as failures in one mechanism don't affect others
 * 5. Enhanced testability with clearer component boundaries
 *
 * In this example, we create a user management system that follows LCM by providing
 * specialized mechanisms for different user types rather than a single shared mechanism.
 */

// Specialized user classes with their own mechanisms
class AdminUser {
  constructor(username) {
    this.username = username;
    this.role = 'admin';
    this.permissions = ['read', 'write', 'delete', 'manage-users'];
  }

  // Admin-specific authentication method
  authenticate(credentials) {
    // Admin authentication requires two-factor authentication
    if (!credentials.password || !credentials.twoFactorCode) {
      return false;
    }

    console.log(`Admin ${this.username} authenticated with 2FA`);
    return this.verifyCredentials(credentials.password, credentials.twoFactorCode);
  }

  // Admin-specific credential verification
  verifyCredentials(password, twoFactorCode) {
    // Simulate admin credential verification with 2FA
    const passwordValid = password === 'admin-password'; // Simplified for example
    const twoFactorValid = twoFactorCode === '123456'; // Simplified for example

    return passwordValid && twoFactorValid;
  }

  // Admin-specific action
  manageUsers() {
    console.log(`Admin ${this.username} is managing users`);
    // Admin-specific user management logic
  }
}

class RegularUser {
  constructor(username) {
    this.username = username;
    this.role = 'user';
    this.permissions = ['read', 'write'];
  }

  // Regular user-specific authentication method
  authenticate(credentials) {
    // Regular users only need password authentication
    if (!credentials.password) {
      return false;
    }

    console.log(`User ${this.username} authenticated with password`);
    return this.verifyCredentials(credentials.password);
  }

  // Regular user-specific credential verification
  verifyCredentials(password) {
    // Simulate regular user credential verification
    return password === 'user-password'; // Simplified for example
  }

  // Regular user-specific action
  updateProfile(profileData) {
    console.log(`User ${this.username} is updating their profile`);
    // Regular user profile update logic
  }
}

class GuestUser {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.username = `guest-${sessionId}`;
    this.role = 'guest';
    this.permissions = ['read'];
  }

  // Guest-specific authentication method
  authenticate() {
    // Guests don't need authentication, just session tracking
    console.log(`Guest ${this.sessionId} session validated`);
    return true;
  }

  // Guest-specific action
  browseContent() {
    console.log(`Guest ${this.sessionId} is browsing content`);
    // Guest browsing logic
  }
}

// User factory that creates the appropriate user type
class UserFactory {
  static createUser(type, identifier) {
    switch (type) {
      case 'admin':
        return new AdminUser(identifier);
      case 'user':
        return new RegularUser(identifier);
      case 'guest':
        return new GuestUser(identifier);
      default:
        throw new Error(`Unknown user type: ${type}`);
    }
  }
}

// Usage example
function demonstrateUserSystem() {
  // Create different types of users
  const admin = UserFactory.createUser('admin', 'admin1');
  const regularUser = UserFactory.createUser('user', 'user1');
  const guestUser = UserFactory.createUser('guest', '12345');

  // Authenticate users with their specialized mechanisms
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

  // Use type-specific actions
  if (adminAuthenticated) {
    admin.manageUsers();
  }

  if (userAuthenticated) {
    regularUser.updateProfile({ name: 'Updated Name' });
  }

  if (guestAuthenticated) {
    guestUser.browseContent();
  }

  // Display user information
  console.log('\nUser Information:');
  [admin, regularUser, guestUser].forEach(user => {
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
    console.log(`Permissions: ${user.permissions.join(', ')}`);
    console.log('---');
  });
}

// Run the demonstration
demonstrateUserSystem();

/**
 * This demonstrates good adherence to the Least Common Mechanism Principle because:
 *
 * 1. Specialized Mechanisms:
 *    - Each user type has its own specialized authentication mechanism
 *    - AdminUser requires two-factor authentication
 *    - RegularUser uses simple password authentication
 *    - GuestUser uses session validation without credentials
 *
 * 2. Minimal Shared Functionality:
 *    - There's no shared authentication method that all user types must use
 *    - Each user type implements only the methods it needs
 *    - No unnecessary functionality is exposed to user types that don't need it
 *
 * 3. Clear Boundaries:
 *    - Each user type has well-defined responsibilities and capabilities
 *    - The interfaces are tailored to the specific needs of each user type
 *    - There's no "one-size-fits-all" approach that would add complexity
 *
 * 4. Improved Security:
 *    - Admin users have stronger authentication requirements
 *    - Regular users have appropriate authentication for their access level
 *    - Guest users have limited functionality without needing credentials
 *
 * 5. Enhanced Maintainability:
 *    - Changes to one user type don't affect others
 *    - New user types can be added without modifying existing ones
 *    - Each user type can evolve independently based on its specific requirements
 *
 * By following LCM, this code reduces complexity and coupling, improves security,
 * and makes the system more maintainable and reliable.
 */