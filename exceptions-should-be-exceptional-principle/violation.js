/**
 * Exceptions Should Be Exceptional Principle - Violation
 *
 * The "Exceptions Should Be Exceptional" principle states that exceptions should be used
 * only for exceptional conditions and not for regular flow control. Exceptions are expensive
 * operations in terms of performance and should be reserved for truly exceptional paths.
 *
 * This file demonstrates a violation of the principle by using exceptions for regular
 * flow control instead of using normal control structures like conditionals.
 */

// UserDataProcessor class with improper exception handling
class UserDataProcessor {
  constructor(database) {
    this.database = database;
  }

  // Process user data with improper error handling (using exceptions for normal flow)
  processUserData(userId) {
    try {
      // Throw exception for a normal, expected condition (missing parameter)
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Attempt to retrieve user data
      const userData = this.database.getUserById(userId);

      // Process the user data
      const processedData = this.transformUserData(userData);

      // Return successful result
      return { success: true, data: processedData };
    } catch (error) {
      // Using catch block for normal flow control
      console.error(`Error processing user data: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  transformUserData(userData) {
    try {
      // Throw exception for a normal, expected condition (null data)
      if (!userData) {
        throw new Error('User not found');
      }

      // Throw exception for invalid data instead of using conditionals
      if (!userData.name) {
        throw new Error('User name is missing');
      }

      if (!userData.email) {
        throw new Error('User email is missing');
      }

      if (typeof userData.age !== 'number') {
        throw new Error('User age is invalid');
      }

      // Transform user data for application use
      return {
        displayName: userData.name,
        contactEmail: userData.email,
        ageGroup: this.calculateAgeGroup(userData.age),
        lastProcessed: new Date()
      };
    } catch (error) {
      // Using catch block for normal flow control
      console.error(`Error transforming user data: ${error.message}`);
      throw error; // Re-throwing the exception for flow control
    }
  }

  calculateAgeGroup(age) {
    try {
      // Using exceptions for normal conditional logic
      if (age < 0) {
        throw new Error('Age cannot be negative');
      }

      if (age < 18) return 'minor';
      if (age < 65) return 'adult';
      return 'senior';
    } catch (error) {
      console.error(`Error calculating age group: ${error.message}`);
      return 'unknown'; // Fallback value
    }
  }

  // Improperly handle file operations with exceptions for normal flow
  saveUserReport(userId, reportData) {
    try {
      // Throw exception for a normal, expected condition (missing parameters)
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!reportData) {
        throw new Error('Report data is required');
      }

      // Attempt to save the report
      const filePath = this.database.saveUserReport(userId, reportData);

      // Return success result
      return { success: true, filePath };
    } catch (error) {
      // Using catch block for normal flow control
      console.error(`Error saving user report: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// Mock database that uses exceptions for normal flow control
class UserDatabase {
  constructor() {
    this.users = new Map();
    this.reports = new Map();

    // Add some sample users
    this.users.set('1', {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 32
    });

    this.users.set('2', {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 28
    });
  }

  getUserById(userId) {
    // Throw exception for a normal, expected condition (user not found)
    // instead of returning null/undefined
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }

  saveUserReport(userId, reportData) {
    // Throw exception for a normal, expected condition (user not found)
    if (!this.users.has(userId)) {
      throw new Error(`Cannot save report: User with ID ${userId} not found`);
    }

    // Generate a file path
    const filePath = `/reports/user_${userId}_${Date.now()}.json`;

    // Save the report
    this.reports.set(filePath, { userId, data: reportData, timestamp: new Date() });

    return filePath;
  }

  // Using exceptions for iteration control flow
  processAllUsers(callback) {
    let index = 0;

    try {
      while (true) {
        // This will eventually throw when we run out of users
        const userId = Array.from(this.users.keys())[index];
        if (!userId) {
          throw new Error('No more users');
        }

        const user = this.users.get(userId);
        callback(user);
        index++;
      }
    } catch (error) {
      // Using the catch block to exit the loop
      console.log('Finished processing all users');
    }
  }
}

// Usage example
function demonstrateUserDataProcessing() {
  const database = new UserDatabase();
  const processor = new UserDataProcessor(database);

  console.log('Processing existing user:');
  try {
    const result1 = processor.processUserData('1');
    console.log(result1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  console.log('\nProcessing non-existent user:');
  try {
    const result2 = processor.processUserData('999');
    console.log(result2);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  console.log('\nProcessing with missing user ID:');
  try {
    const result3 = processor.processUserData();
    console.log(result3);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  console.log('\nSaving user report:');
  try {
    const reportResult = processor.saveUserReport('1', { content: 'User activity report' });
    console.log(reportResult);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  console.log('\nSaving report for non-existent user:');
  try {
    const invalidReportResult = processor.saveUserReport('999', { content: 'Invalid user report' });
    console.log(invalidReportResult);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  console.log('\nProcessing all users:');
  database.processAllUsers(user => {
    console.log(`Processing user: ${user.name}`);
  });
}

// Run the demonstration
demonstrateUserDataProcessing();

/**
 * This violates the "Exceptions Should Be Exceptional" principle because:
 *
 * 1. Using Exceptions for Normal Flow Control:
 *    - The code throws exceptions for expected conditions like missing parameters,
 *      user not found, or invalid data
 *    - These are normal, expected scenarios that should be handled with conditionals
 *
 * 2. Exceptions for Validation:
 *    - The code uses exceptions for input validation instead of using if/else statements
 *    - Validation is a normal part of processing and not an exceptional condition
 *
 * 3. Exceptions for Iteration Control:
 *    - The processAllUsers method uses exceptions to terminate a loop
 *    - This is a misuse of exceptions when normal loop control structures would be more appropriate
 *
 * 4. Performance Issues:
 *    - Exception handling is expensive due to stack trace collection and unwinding
 *    - Using exceptions for normal flow significantly degrades performance
 *
 * 5. Obscured Intent:
 *    - When exceptions are used for normal flow, it becomes difficult to distinguish
 *      between actual exceptional conditions and normal program flow
 *    - This makes the code harder to understand and debug
 *
 * 6. Nested Exception Handling:
 *    - The code has nested try/catch blocks which further complicates the flow
 *    - This creates a confusing control flow that's difficult to follow
 *
 * Using exceptions for normal flow control leads to code that is less efficient,
 * harder to understand, and more difficult to maintain. It also dilutes the meaning
 * of exceptions, making it harder to identify and handle truly exceptional conditions.
 */