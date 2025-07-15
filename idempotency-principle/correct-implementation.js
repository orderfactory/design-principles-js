/**
 * Idempotency Principle (I) - Correct Implementation
 *
 * The Idempotency Principle states that an operation can be applied multiple times
 * without changing the result beyond the initial application. In other words, if f(x) = f(f(x)),
 * then f is idempotent. This is particularly important in distributed systems, APIs,
 * and error recovery scenarios where operations might be repeated.
 *
 * Benefits of Idempotency:
 * 1. Improved reliability in distributed systems
 * 2. Safer retry mechanisms for failed operations
 * 3. Simplified error handling
 * 4. Better user experience when users might accidentally repeat actions
 * 5. Reduced side effects from duplicate operations
 *
 * In this example, we demonstrate idempotent operations in a user profile management system.
 */

// User profile management system with idempotent operations
class UserProfileManager {
  constructor() {
    // Initialize with empty user profiles
    this.userProfiles = new Map();
  }

  // Idempotent operation: Creating a user profile
  // If the user already exists, it returns the existing profile without changing it
  createUserProfile(userId, initialData = {}) {
    // If the user profile already exists, return it without modification
    if (this.userProfiles.has(userId)) {
      console.log(`User profile ${userId} already exists, returning existing profile`);
      return this.userProfiles.get(userId);
    }

    // Create a new profile with the initial data and a creation timestamp
    const profile = {
      userId,
      ...initialData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store the new profile
    this.userProfiles.set(userId, profile);
    console.log(`Created new user profile for ${userId}`);
    return profile;
  }

  // Idempotent operation: Setting user preferences
  // No matter how many times you set the same preferences, the result is the same
  setUserPreferences(userId, preferences) {
    // Get the user profile or create one if it doesn't exist
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createUserProfile(userId);
    }

    // Replace the entire preferences object (not merging)
    // This ensures idempotency - setting the same preferences multiple times has the same result
    profile.preferences = { ...preferences };
    profile.updatedAt = new Date().toISOString();

    console.log(`Set preferences for user ${userId}`);
    return profile;
  }

  // Idempotent operation: Activating a user account
  // Once activated, calling this again doesn't change the state
  activateUserAccount(userId) {
    // Get the user profile or create one if it doesn't exist
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createUserProfile(userId);
    }

    // If the account is already active, don't change anything
    if (profile.isActive === true) {
      console.log(`User account ${userId} is already active`);
      return profile;
    }

    // Activate the account
    profile.isActive = true;
    profile.activatedAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();

    console.log(`Activated user account ${userId}`);
    return profile;
  }

  // Idempotent operation: Deactivating a user account
  // Once deactivated, calling this again doesn't change the state
  deactivateUserAccount(userId) {
    // Get the user profile or create one if it doesn't exist
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createUserProfile(userId);
    }

    // If the account is already inactive, don't change anything
    if (profile.isActive === false) {
      console.log(`User account ${userId} is already inactive`);
      return profile;
    }

    // Deactivate the account
    profile.isActive = false;
    profile.deactivatedAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();

    console.log(`Deactivated user account ${userId}`);
    return profile;
  }

  // Get a user profile (read-only operation, naturally idempotent)
  getUserProfile(userId) {
    return this.userProfiles.get(userId);
  }
}

// Usage example
function demonstrateIdempotentOperations() {
  const profileManager = new UserProfileManager();

  console.log('\n1. Creating a user profile:');
  // First creation
  let profile1 = profileManager.createUserProfile('user1', { name: 'John Doe', email: 'john@example.com' });
  console.log(profile1);

  // Repeated creation with the same ID (idempotent - returns existing profile)
  let profile1Again = profileManager.createUserProfile('user1', { name: 'Different Name', email: 'different@example.com' });
  console.log(profile1Again);
  // Notice that the profile wasn't changed despite different input data on the second call

  console.log('\n2. Setting user preferences:');
  // Set preferences
  const preferences = { theme: 'dark', notifications: true };
  profileManager.setUserPreferences('user1', preferences);

  // Set the same preferences again (idempotent - same result)
  profileManager.setUserPreferences('user1', preferences);

  console.log('\n3. Activating a user account:');
  // Activate account
  profileManager.activateUserAccount('user1');

  // Try to activate again (idempotent - no change)
  profileManager.activateUserAccount('user1');

  console.log('\n4. Deactivating a user account:');
  // Deactivate account
  profileManager.deactivateUserAccount('user1');

  // Try to deactivate again (idempotent - no change)
  profileManager.deactivateUserAccount('user1');

  // Final state of the profile
  console.log('\nFinal user profile:');
  console.log(profileManager.getUserProfile('user1'));
}

// Run the demonstration
demonstrateIdempotentOperations();

/**
 * This demonstrates good adherence to the Idempotency Principle because:
 *
 * 1. Create Operation:
 *    - Creating a user profile with the same ID multiple times returns the same result
 *    - Subsequent calls don't modify the existing profile
 *
 * 2. Set Preferences Operation:
 *    - Setting the same preferences multiple times produces the same final state
 *    - The operation replaces the entire preferences object rather than incrementally modifying it
 *
 * 3. Activate/Deactivate Operations:
 *    - Once an account is activated, further activation calls don't change anything
 *    - Once an account is deactivated, further deactivation calls don't change anything
 *    - The state after multiple calls is the same as after a single call
 *
 * 4. Get Operation:
 *    - Reading operations are naturally idempotent as they don't modify state
 *
 * These idempotent operations provide several benefits:
 * - They allow safe retries in case of network failures
 * - They prevent duplicate operations from causing unexpected side effects
 * - They simplify client code that might need to retry operations
 * - They make the system more predictable and reliable
 *
 * By following the Idempotency Principle, this code creates a more robust system
 * that can handle repeated operations gracefully, which is especially important
 * in distributed systems and web services.
 */