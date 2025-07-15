/**
 * Exceptions Should Be Exceptional Principle - Correct Implementation
 *
 * The "Exceptions Should Be Exceptional" principle states that exceptions should be used
 * only for exceptional conditions and not for regular flow control. Exceptions are expensive
 * operations in terms of performance and should be reserved for truly exceptional paths.
 *
 * Benefits of using exceptions correctly:
 * 1. Improved performance (avoiding the overhead of exception handling for normal flows)
 * 2. Clearer code intent (exceptions indicate exceptional conditions)
 * 3. Better error handling (exceptions are used for their intended purpose)
 * 4. More maintainable code (normal flow is handled with normal control structures)
 * 5. Easier debugging (exceptions point to actual problems, not normal conditions)
 *
 * In this example, we create a user data processing system that demonstrates proper
 * exception handling by using conditional checks for expected scenarios and reserving
 * exceptions for truly exceptional conditions.
 */

// UserDataProcessor class with proper exception handling
class UserDataProcessor {
  constructor(database) {
    this.database = database;
  }

  // Process user data with proper error handling
  processUserData(userId) {
    // Check if userId is provided - use normal control flow for expected conditions
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      // Attempt to retrieve user data
      const userData = this.database.getUserById(userId);

      // Use normal control flow for expected conditions (user not found)
      if (!userData) {
        return { success: false, error: 'User not found' };
      }

      // Check if user data is valid before processing
      if (!this.isValidUserData(userData)) {
        return { success: false, error: 'Invalid user data' };
      }

      // Process the user data
      const processedData = this.transformUserData(userData);

      // Return successful result
      return { success: true, data: processedData };
    } catch (error) {
      // Use exceptions only for unexpected errors (database connection issues, etc.)
      console.error(`Unexpected error processing user data: ${error.message}`);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  isValidUserData(userData) {
    // Check if required fields exist
    return userData &&
           userData.name &&
           userData.email &&
           typeof userData.age === 'number';
  }

  transformUserData(userData) {
    // Transform user data for application use
    return {
      displayName: userData.name,
      contactEmail: userData.email,
      ageGroup: this.calculateAgeGroup(userData.age),
      lastProcessed: new Date()
    };
  }

  calculateAgeGroup(age) {
    if (age < 18) return 'minor';
    if (age < 65) return 'adult';
    return 'senior';
  }

  // Properly handle file operations with conditional checks for expected scenarios
  saveUserReport(userId, reportData) {
    // Check parameters using normal control flow
    if (!userId || !reportData) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      // Attempt to save the report
      const filePath = this.database.saveUserReport(userId, reportData);

      // Return success result
      return { success: true, filePath };
    } catch (error) {
      // Use exceptions for unexpected errors (file system issues, etc.)
      console.error(`Error saving user report: ${error.message}`);
      return { success: false, error: 'Failed to save report' };
    }
  }
}

// Mock database for demonstration
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
    // Return user if found, undefined otherwise (no exception for not found)
    return this.users.get(userId);
  }

  saveUserReport(userId, reportData) {
    // Check if user exists
    if (!this.users.has(userId)) {
      // Return null instead of throwing an exception for an expected condition
      return null;
    }

    // Generate a file path
    const filePath = `/reports/user_${userId}_${Date.now()}.json`;

    // Save the report
    this.reports.set(filePath, { userId, data: reportData, timestamp: new Date() });

    return filePath;
  }

  // This method might throw an exception for a truly exceptional condition
  connectToDatabase() {
    // Simulate a database connection error (truly exceptional)
    const connectionFailed = Math.random() < 0.1; // 10% chance of failure

    if (connectionFailed) {
      throw new Error('Database connection failed');
    }

    return true;
  }
}

// Usage example
function demonstrateUserDataProcessing() {
  const database = new UserDatabase();
  const processor = new UserDataProcessor(database);

  console.log('Processing existing user:');
  const result1 = processor.processUserData('1');
  console.log(result1);

  console.log('\nProcessing non-existent user:');
  const result2 = processor.processUserData('999');
  console.log(result2);

  console.log('\nProcessing with missing user ID:');
  const result3 = processor.processUserData();
  console.log(result3);

  console.log('\nSaving user report:');
  const reportResult = processor.saveUserReport('1', { content: 'User activity report' });
  console.log(reportResult);

  console.log('\nSaving report for non-existent user:');
  const invalidReportResult = processor.saveUserReport('999', { content: 'Invalid user report' });
  console.log(invalidReportResult);

  try {
    console.log('\nAttempting database connection:');
    database.connectToDatabase();
    console.log('Database connection successful');
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
  }
}

// Run the demonstration
demonstrateUserDataProcessing();

/**
 * This demonstrates good adherence to the "Exceptions Should Be Exceptional" principle because:
 *
 * 1. Normal Flow Control Uses Conditionals:
 *    - The code uses if/else statements for expected conditions like missing parameters,
 *      user not found, or invalid data
 *    - Return values (like objects with success/error properties) indicate the result
 *      of operations instead of throwing exceptions
 *
 * 2. Exceptions Reserved for Exceptional Conditions:
 *    - Exceptions are only caught for truly unexpected errors like database connection failures
 *    - The try/catch blocks are focused on operations that might fail due to external factors
 *      beyond the application's control
 *
 * 3. Predictable Error Handling:
 *    - The code returns structured error responses for expected error conditions
 *    - This makes error handling more predictable and easier to work with
 *
 * 4. Performance Considerations:
 *    - By avoiding exceptions for normal flow control, the code avoids the performance
 *      overhead associated with exception handling
 *    - Exception handling involves stack trace collection and other expensive operations
 *
 * 5. Clear Intent:
 *    - When an exception does occur, it clearly indicates an exceptional condition
 *    - This makes debugging easier as exceptions point to actual problems
 *
 * By following this principle, the code is more maintainable, performs better, and
 * communicates intent more clearly. Exceptions are used for their intended purpose -
 * to handle exceptional conditions that should not occur during normal operation.
 */