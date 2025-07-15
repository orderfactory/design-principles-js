/**
 * Separation of Concerns (SoC) Principle - Correct Implementation
 *
 * The Separation of Concerns principle states that a program should be divided into distinct sections,
 * where each section addresses a separate concern. A concern is a set of information that affects the
 * code of a computer program. This principle improves maintainability, reusability, and testability
 * by ensuring that different aspects of the application are independent of each other.
 *
 * In this example, we create a simple user management system with clear separation between:
 * 1. Data Model - Responsible for user data structure
 * 2. Data Access - Responsible for storing and retrieving user data
 * 3. Business Logic - Responsible for user validation and business rules
 * 4. Presentation - Responsible for displaying user information
 */

// 1. DATA MODEL - Responsible for user data structure
class User {
  constructor(id, username, email, age) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.age = age;
  }
}

// 2. DATA ACCESS - Responsible for storing and retrieving user data
class UserRepository {
  constructor() {
    this.users = new Map();
  }

  save(user) {
    this.users.set(user.id, user);
    return user;
  }

  findById(id) {
    return this.users.get(id);
  }

  findAll() {
    return Array.from(this.users.values());
  }

  delete(id) {
    return this.users.delete(id);
  }
}

// 3. BUSINESS LOGIC - Responsible for user validation and business rules
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  createUser(userData) {
    // Validate user data
    this.validateUserData(userData);

    // Create and save user
    const user = new User(
      userData.id,
      userData.username,
      userData.email,
      userData.age
    );

    return this.userRepository.save(user);
  }

  validateUserData(userData) {
    if (!userData.username || userData.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (!userData.email || !userData.email.includes('@')) {
      throw new Error('Email must be valid');
    }

    if (!userData.age || userData.age < 18) {
      throw new Error('User must be at least 18 years old');
    }
  }

  getUserById(id) {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  getAllUsers() {
    return this.userRepository.findAll();
  }
}

// 4. PRESENTATION - Responsible for displaying user information
class UserView {
  displayUser(user) {
    console.log(`
User Information:
ID: ${user.id}
Username: ${user.username}
Email: ${user.email}
Age: ${user.age}
    `);
  }

  displayUserList(users) {
    console.log('User List:');
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.username} (${user.email})`);
    });
  }

  displayError(message) {
    console.error(`Error: ${message}`);
  }
}

// Usage example
// Create instances of our components
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userView = new UserView();

try {
  // Create some users
  const user1 = userService.createUser({
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    age: 30
  });

  const user2 = userService.createUser({
    id: 2,
    username: 'janedoe',
    email: 'jane@example.com',
    age: 25
  });

  // Display a single user
  const retrievedUser = userService.getUserById(1);
  userView.displayUser(retrievedUser);

  // Display all users
  const allUsers = userService.getAllUsers();
  userView.displayUserList(allUsers);
} catch (error) {
  userView.displayError(error.message);
}

/**
 * This demonstrates Separation of Concerns because:
 *
 * 1. Each class has a single, well-defined responsibility:
 *    - User: Data structure for user information
 *    - UserRepository: Data storage and retrieval
 *    - UserService: Business logic and validation
 *    - UserView: Presentation and display
 *
 * 2. The classes are independent and can be modified separately:
 *    - We can change how users are stored without affecting validation or display
 *    - We can change validation rules without affecting storage or display
 *    - We can change how users are displayed without affecting storage or validation
 *
 * 3. Dependencies flow in one direction:
 *    - UserService depends on UserRepository
 *    - The presentation layer uses UserService but UserService doesn't depend on presentation
 *
 * 4. Each component can be tested independently
 *
 * This separation makes the code more maintainable, reusable, and easier to understand.
 * It also facilitates teamwork as different developers can work on different concerns.
 */