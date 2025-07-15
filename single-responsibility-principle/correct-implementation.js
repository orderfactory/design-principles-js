/**
 * Single Responsibility Principle - Correct Implementation
 *
 * The Single Responsibility Principle states that a class should have only one reason to change,
 * meaning it should have only one responsibility.
 *
 * In this example, we have separated the responsibilities of:
 * 1. User data management (User class)
 * 2. User validation (UserValidator class)
 * 3. User persistence (UserRepository class)
 *
 * Each class has a single responsibility and a single reason to change.
 */

// User class - responsible only for user data
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  // Only methods related to user data belong here
}

// UserValidator class - responsible only for validation
class UserValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateName(name) {
    return name && name.trim().length > 0;
  }

  static validateUser(user) {
    return this.validateName(user.getName()) &&
           this.validateEmail(user.getEmail());
  }

  // Only methods related to validation belong here
}

// UserRepository class - responsible only for persistence
class UserRepository {
  constructor() {
    this.users = [];
  }

  save(user) {
    // In a real application, this would save to a database
    if (!UserValidator.validateUser(user)) {
      throw new Error('Cannot save invalid user');
    }

    this.users.push(user);
    console.log(`User ${user.getName()} saved successfully`);
    return true;
  }

  findById(id) {
    return this.users.find(user => user.id === id);
  }

  // Only methods related to persistence belong here
}

// Usage
const user = new User(1, 'John Doe', 'john.doe@example.com');
const validator = new UserValidator();
const repository = new UserRepository();

// Each class is used for its specific responsibility
if (UserValidator.validateUser(user)) {
  repository.save(user);
}

// This demonstrates SRP because:
// 1. User class is only responsible for user data
// 2. UserValidator class is only responsible for validation
// 3. UserRepository class is only responsible for persistence
// If any of these responsibilities need to change, only one class needs to be modified