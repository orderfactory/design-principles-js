/**
 * Idempotency Principle (I) - Violation
 *
 * The Idempotency Principle states that an operation can be applied multiple times
 * without changing the result beyond the initial application. In other words, if f(x) = f(f(x)),
 * then f is idempotent.
 *
 * This file demonstrates a violation of the Idempotency Principle by implementing
 * a user profile management system with non-idempotent operations that produce
 * different results when called multiple times with the same input.
 */

// User profile management system with non-idempotent operations
class UserProfileManager {
  constructor() {
    // Initialize with empty user profiles
    this.userProfiles = new Map();
    this.operationCounter = 0; // Counter to track operations
  }

  // Non-idempotent operation: Creating a user profile
  // Each call creates a new profile or updates the existing one
  createUserProfile(userId, userData = {}) {
    this.operationCounter++;

    // Generate a unique profile ID that changes with each operation
    const profileId = `profile_${userId}_${this.operationCounter}`;

    // Create or update the profile with new timestamps and operation count
    const profile = {
      userId,
      profileId, // This changes with each call, making the operation non-idempotent
      ...userData,
      createdAt: new Date().toISOString(), // New timestamp on every call
      operationCount: (this.userProfiles.get(userId)?.operationCount || 0) + 1
    };

    // Store or overwrite the profile
    this.userProfiles.set(userId, profile);

    console.log(`Created/Updated user profile for ${userId} (Operation #${this.operationCounter})`);
    return profile;
  }

  // Non-idempotent operation: Updating user preferences
  // Each call adds to the existing preferences rather than replacing them
  updateUserPreferences(userId, newPreferences) {
    this.operationCounter++;

    // Get the user profile or create one if it doesn't exist
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createUserProfile(userId);
    }

    // Initialize preferences if they don't exist
    if (!profile.preferences) {
      profile.preferences = {};
    }

    // Merge new preferences with existing ones (accumulating values)
    // This makes the operation non-idempotent as repeated calls keep adding values
    profile.preferences = {
      ...profile.preferences,
      ...newPreferences,
      // If preferences contain arrays or counters, they'll accumulate with each call
      updateCount: (profile.preferences.updateCount || 0) + 1
    };

    // Add a timestamp for this update
    profile.lastUpdated = new Date().toISOString();

    console.log(`Updated preferences for user ${userId} (Update #${profile.preferences.updateCount})`);
    return profile;
  }

  // Non-idempotent operation: Toggling user account status
  // Each call flips the status, making it unpredictable after multiple calls
  toggleUserAccountStatus(userId) {
    this.operationCounter++;

    // Get the user profile or create one if it doesn't exist
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createUserProfile(userId);
      profile.isActive = false; // Default to inactive
    }

    // Toggle the active status (flips with each call)
    profile.isActive = !profile.isActive;

    // Add a status change record
    if (!profile.statusChanges) {
      profile.statusChanges = [];
    }

    profile.statusChanges.push({
      timestamp: new Date().toISOString(),
      newStatus: profile.isActive ? 'active' : 'inactive',
      operationNumber: this.operationCounter
    });

    console.log(`Toggled user ${userId} status to ${profile.isActive ? 'active' : 'inactive'} (Operation #${this.operationCounter})`);
    return profile;
  }

  // Non-idempotent operation: Adding user activity
  // Each call adds a new activity entry, accumulating data
  addUserActivity(userId, activity) {
    this.operationCounter++;

    // Get the user profile or create one if it doesn't exist
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createUserProfile(userId);
    }

    // Initialize activities array if it doesn't exist
    if (!profile.activities) {
      profile.activities = [];
    }

    // Add the new activity with a timestamp
    const activityEntry = {
      ...activity,
      timestamp: new Date().toISOString(),
      activityId: `activity_${this.operationCounter}`
    };

    // Push to the activities array (accumulating with each call)
    profile.activities.push(activityEntry);

    console.log(`Added activity for user ${userId} (Activity #${profile.activities.length})`);
    return profile;
  }

  // Get a user profile
  getUserProfile(userId) {
    return this.userProfiles.get(userId);
  }
}

// Usage example
function demonstrateNonIdempotentOperations() {
  const profileManager = new UserProfileManager();

  console.log('\n1. Creating a user profile multiple times:');
  // First creation
  let profile1 = profileManager.createUserProfile('user1', { name: 'John Doe', email: 'john@example.com' });
  console.log(profile1);

  // Repeated creation with the same ID (non-idempotent - creates a different profile)
  let profile1Again = profileManager.createUserProfile('user1', { name: 'John Doe', email: 'john@example.com' });
  console.log(profile1Again);
  // Notice that the profile changed despite the same input data

  console.log('\n2. Updating user preferences multiple times:');
  // Update preferences
  profileManager.updateUserPreferences('user1', { theme: 'dark' });

  // Update with the same preferences again (non-idempotent - accumulates values)
  profileManager.updateUserPreferences('user1', { theme: 'dark' });

  console.log('\n3. Toggling user account status multiple times:');
  // Toggle status first time
  profileManager.toggleUserAccountStatus('user1');

  // Toggle status again (non-idempotent - flips the status back)
  profileManager.toggleUserAccountStatus('user1');

  // Toggle status a third time (continues to flip with each call)
  profileManager.toggleUserAccountStatus('user1');

  console.log('\n4. Adding the same user activity multiple times:');
  // Add an activity
  profileManager.addUserActivity('user1', { type: 'login', device: 'mobile' });

  // Add the same activity again (non-idempotent - adds another entry)
  profileManager.addUserActivity('user1', { type: 'login', device: 'mobile' });

  // Final state of the profile
  console.log('\nFinal user profile:');
  console.log(JSON.stringify(profileManager.getUserProfile('user1'), null, 2));
}

// Run the demonstration
demonstrateNonIdempotentOperations();

/**
 * This violates the Idempotency Principle because:
 *
 * 1. Create Operation:
 *    - Creating a user profile with the same ID multiple times produces different results
 *    - Each call generates a new profileId and timestamps
 *    - The operation count increases with each call
 *
 * 2. Update Preferences Operation:
 *    - Updating with the same preferences multiple times accumulates values
 *    - The updateCount increases with each call
 *    - Each call adds a new timestamp
 *
 * 3. Toggle Status Operation:
 *    - Calling this operation multiple times produces unpredictable results
 *    - The status flips with each call rather than reaching a stable state
 *    - Status change history grows with each call
 *
 * 4. Add Activity Operation:
 *    - Adding the same activity multiple times creates duplicate entries
 *    - Each call adds a new entry to the activities array
 *    - Activities accumulate without deduplication
 *
 * These non-idempotent operations cause several problems:
 * - They make the system unpredictable when operations are retried
 * - They can lead to data corruption or unexpected states
 * - They complicate error handling and recovery
 * - They make it difficult to reason about the system's behavior
 *
 * In distributed systems, network failures, timeouts, or other issues might cause
 * operations to be retried. With non-idempotent operations, these retries can lead
 * to incorrect data states, making the system less reliable and harder to maintain.
 */