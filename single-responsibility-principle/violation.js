/**
 * Single Responsibility Principle - Violation Example
 *
 * This example demonstrates a violation of the Single Responsibility Principle
 * where a single class (User) is responsible for multiple concerns:
 * 1. User data management
 * 2. User validation
 * 3. User persistence
 *
 * This violates SRP because the class has multiple reasons to change.
 */

// User class with multiple responsibilities - violates SRP
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.users = []; // For storing users (persistence responsibility)
  }

  // Data management responsibility
  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  // Validation responsibility
  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validateName() {
    return this.name && this.name.trim().length > 0;
  }

  isValid() {
    return this.validateName() && this.validateEmail();
  }

  // Persistence responsibility
  save() {
    // In a real application, this would save to a database
    if (!this.isValid()) {
      throw new Error('Cannot save invalid user');
    }

    this.users.push(this);
    console.log(`User ${this.name} saved successfully`);
    return true;
  }

  findById(id) {
    return this.users.find(user => user.id === id);
  }

  // Reporting responsibility (yet another responsibility)
  generateUserReport() {
    return `User Report:
      ID: ${this.id}
      Name: ${this.name}
      Email: ${this.email}
      Valid: ${this.isValid()}`;
  }
}

// Usage
const user = new User(1, 'John Doe', 'john.doe@example.com');

// The User class is handling multiple responsibilities
if (user.isValid()) {
  user.save();
  console.log(user.generateUserReport());
}

// This violates SRP because:
// 1. The User class has multiple responsibilities (data, validation, persistence, reporting)
// 2. There are multiple reasons for the class to change:
//    - If validation rules change
//    - If persistence mechanism changes
//    - If reporting format changes
// 3. Changes to one responsibility might affect other responsibilities
// 4. The class becomes harder to understand, test, and maintain