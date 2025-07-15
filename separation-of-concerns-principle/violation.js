/**
 * Separation of Concerns (SoC) Principle - Violation
 *
 * The Separation of Concerns principle states that a program should be divided into distinct sections,
 * where each section addresses a separate concern. A concern is a set of information that affects the
 * code of a computer program.
 *
 * This file demonstrates a violation of this principle by implementing a user management system
 * where all concerns (data structure, storage, business logic, and presentation) are mixed together
 * in a single monolithic class.
 */

// Monolithic UserManager class that violates Separation of Concerns
class UserManager {
  constructor() {
    // Data storage mixed with other concerns
    this.users = [];
    this.nextId = 1;
  }

  // Mixes data validation, business logic, data access, and even some UI concerns
  createUser(username, email, age) {
    // Data validation mixed with business logic
    if (!username || username.length < 3) {
      console.error('Error: Username must be at least 3 characters long');
      return null;
    }

    if (!email || !email.includes('@')) {
      console.error('Error: Email must be valid');
      return null;
    }

    if (!age || age < 18) {
      console.error('Error: User must be at least 18 years old');
      return null;
    }

    // Data creation and storage mixed together
    const user = {
      id: this.nextId++,
      username,
      email,
      age,
      createdAt: new Date()
    };

    this.users.push(user);

    // Presentation logic mixed with business logic
    console.log(`User created successfully: ${username} (${email})`);

    return user;
  }

  // Mixes data access with presentation
  displayUser(id) {
    // Data access logic
    const user = this.users.find(user => user.id === id);

    if (!user) {
      // Error handling mixed with presentation
      console.error(`Error: User with ID ${id} not found`);
      return;
    }

    // Presentation logic mixed with data access
    console.log(`
User Information:
ID: ${user.id}
Username: ${user.username}
Email: ${user.email}
Age: ${user.age}
Created: ${user.createdAt}
    `);
  }

  // Mixes data access with presentation and business logic
  displayAllUsers() {
    if (this.users.length === 0) {
      console.log('No users found');
      return;
    }

    console.log('User List:');

    // Business logic for sorting mixed with presentation
    const sortedUsers = this.users.sort((a, b) => a.username.localeCompare(b.username));

    // Presentation logic mixed with data access
    sortedUsers.forEach(user => {
      console.log(`- ${user.id}: ${user.username} (${user.email})`);
    });
  }

  // Mixes data access with business logic
  deleteUser(id) {
    const initialCount = this.users.length;

    // Data access logic
    this.users = this.users.filter(user => user.id !== id);

    // Business logic mixed with presentation
    if (this.users.length === initialCount) {
      console.error(`Error: User with ID ${id} not found`);
      return false;
    } else {
      console.log(`User with ID ${id} deleted successfully`);
      return true;
    }
  }

  // Mixes business logic with data access
  getUsersByAgeRange(minAge, maxAge) {
    // Validation mixed with business logic
    if (minAge > maxAge) {
      console.error('Error: Minimum age cannot be greater than maximum age');
      return [];
    }

    // Data filtering mixed with business logic
    const filteredUsers = this.users.filter(
      user => user.age >= minAge && user.age <= maxAge
    );

    // Presentation mixed with business logic
    console.log(`Found ${filteredUsers.length} users between ${minAge} and ${maxAge} years old`);

    return filteredUsers;
  }

  // Even includes email functionality - completely unrelated concern
  sendEmailToUser(id, subject, message) {
    // Data access logic
    const user = this.users.find(user => user.id === id);

    if (!user) {
      console.error(`Error: User with ID ${id} not found`);
      return false;
    }

    // Email sending logic (simulated)
    console.log(`Sending email to ${user.email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('Email sent successfully');

    return true;
  }
}

// Usage example
const userManager = new UserManager();

// Create some users
const user1 = userManager.createUser('johndoe', 'john@example.com', 30);
const user2 = userManager.createUser('janedoe', 'jane@example.com', 25);
const invalidUser = userManager.createUser('bob', 'invalid-email', 17); // Will show error

// Display users
userManager.displayUser(1);
userManager.displayAllUsers();

// Filter users by age
const youngUsers = userManager.getUsersByAgeRange(20, 25);

// Send an email
userManager.sendEmailToUser(1, 'Welcome!', 'Welcome to our platform!');

// Delete a user
userManager.deleteUser(2);
userManager.displayAllUsers();

/**
 * This violates Separation of Concerns because:
 *
 * 1. The UserManager class handles multiple concerns:
 *    - Data structure (user object definition)
 *    - Data storage (managing the users array)
 *    - Business logic (validation, filtering)
 *    - Presentation (console.log statements throughout the code)
 *    - Even email functionality (completely unrelated concern)
 *
 * 2. Problems with this approach:
 *    - The class is large and difficult to understand
 *    - Changes to one concern (e.g., how users are displayed) require modifying the same class
 *      that handles critical business logic
 *    - Testing is difficult because concerns are tightly coupled
 *    - Reusing components is nearly impossible (e.g., can't reuse just the validation logic)
 *    - Error handling is inconsistent and mixed with presentation
 *
 * 3. This leads to code that is:
 *    - Hard to maintain (changes in one area might affect others)
 *    - Difficult to test (can't test business logic without also testing presentation)
 *    - Not reusable (can't reuse just the data access or just the validation)
 *    - Prone to bugs (changes to display logic might accidentally break business logic)
 */