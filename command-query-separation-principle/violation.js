/**
 * Command-Query Separation Principle - Violation
 *
 * The Command-Query Separation (CQS) principle states that every method should be either:
 * 1. A Command: Changes the state of the system but doesn't return a value (or returns void/undefined)
 * 2. A Query: Returns a value but doesn't change the state of the system
 *
 * This file demonstrates a violation of the principle by:
 * 1. Mixing commands and queries - methods that both change state AND return values
 * 2. Having side effects in query methods
 * 3. Creating unpredictable behavior due to state changes in query methods
 */

// BankAccount class that violates the Command-Query Separation principle
class BankAccount {
  constructor(accountNumber, ownerName, initialBalance = 0) {
    this.accountNumber = accountNumber;
    this.ownerName = ownerName;
    this.balance = initialBalance;
    this.transactions = [];

    // Record initial deposit if any
    if (initialBalance > 0) {
      this.transactions.push({
        type: 'Initial deposit',
        amount: initialBalance,
        timestamp: new Date()
      });
    }
  }

  // VIOLATION 1: Method both changes state AND returns a value
  /**
   * Deposits money into the account and returns the new balance
   * @param {number} amount - The amount to deposit
   * @returns {number} - The new balance after deposit
   */
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    this.balance += amount;
    this.transactions.push({
      type: 'Deposit',
      amount: amount,
      timestamp: new Date()
    });

    // Violation: Command returns state information
    return this.balance;
  }

  // VIOLATION 2: Method both changes state AND returns a value
  /**
   * Withdraws money from the account and returns the new balance
   * @param {number} amount - The amount to withdraw
   * @returns {number} - The new balance after withdrawal
   */
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }

    this.balance -= amount;
    this.transactions.push({
      type: 'Withdrawal',
      amount: amount,
      timestamp: new Date()
    });

    // Violation: Command returns state information
    return this.balance;
  }

  // VIOLATION 3: Query method with side effect
  /**
   * Gets the transaction history but also logs an access event
   * @returns {Array} - The transaction history
   */
  getTransactionHistory() {
    // Violation: Query method has a side effect (modifies state)
    this.transactions.push({
      type: 'History accessed',
      amount: 0,
      timestamp: new Date()
    });

    // Returns the actual array, not a copy, allowing external modification
    return this.transactions;
  }

  // VIOLATION 4: Method that conditionally changes state and returns different types
  /**
   * Gets the balance or adds interest if the balance is above a threshold
   * @param {boolean} addInterestIfEligible - Whether to add interest
   * @returns {number|object} - Either the balance or an object with old and new balance
   */
  getBalanceWithPossibleInterest(addInterestIfEligible = false) {
    if (addInterestIfEligible && this.balance >= 1000) {
      // Violation: Query method conditionally changes state
      const oldBalance = this.balance;
      const interest = this.balance * 0.05;
      this.balance += interest;

      this.transactions.push({
        type: 'Interest added',
        amount: interest,
        timestamp: new Date()
      });

      // Returns an object with different information
      return {
        oldBalance: oldBalance,
        interestAdded: interest,
        newBalance: this.balance
      };
    }

    // Just returns the balance in other cases
    return this.balance;
  }

  // VIOLATION 5: Method that both changes state and returns inconsistent values
  /**
   * Changes the owner name and returns different values based on conditions
   * @param {string} newName - The new owner name
   * @returns {boolean|string|object} - Different return types based on conditions
   */
  changeOwnerName(newName) {
    if (!newName || typeof newName !== 'string') {
      return false; // Indicates failure
    }

    if (newName.trim() === '') {
      return 'Invalid name'; // Returns error message
    }

    const oldName = this.ownerName;
    this.ownerName = newName;

    this.transactions.push({
      type: 'Owner name changed',
      amount: 0,
      timestamp: new Date()
    });

    // Inconsistent return value - sometimes returns an object
    if (oldName === newName) {
      return 'No change needed';
    } else {
      return {
        success: true,
        oldName: oldName,
        newName: newName
      };
    }
  }

  // VIOLATION 6: Method that performs multiple unrelated state changes
  /**
   * Performs a monthly account maintenance
   * @returns {object} - Summary of changes made
   */
  performMonthlyMaintenance() {
    // Multiple state changes in one method
    let maintenanceFee = 0;
    if (this.balance < 500) {
      maintenanceFee = 25;
      this.balance -= maintenanceFee;
    }

    // Add interest if eligible
    let interestAdded = 0;
    if (this.balance > 1000) {
      interestAdded = this.balance * 0.03;
      this.balance += interestAdded;
    }

    // Reset some internal tracking
    const transactionCount = this.transactions.length;

    // Only keep last 10 transactions
    if (this.transactions.length > 10) {
      this.transactions = this.transactions.slice(-10);
    }

    // Return detailed information about all the changes
    return {
      maintenanceFee,
      interestAdded,
      newBalance: this.balance,
      transactionsPruned: transactionCount - this.transactions.length
    };
  }
}

// Usage example
function demonstrateCommandQuerySeparationViolation() {
  console.log('Creating a new bank account:');
  const account = new BankAccount('12345678', 'John Doe', 1000);

  // Using methods that both change state and return values
  console.log('\nPerforming transactions:');

  console.log('Depositing $500...');
  const newBalanceAfterDeposit = account.deposit(500);
  console.log(`New balance returned from deposit: $${newBalanceAfterDeposit}`);

  console.log('\nWithdrawing $200...');
  const newBalanceAfterWithdrawal = account.withdraw(200);
  console.log(`New balance returned from withdrawal: $${newBalanceAfterWithdrawal}`);

  // Using a query method with side effects
  console.log('\nGetting transaction history (which also logs an access event):');
  const history = account.getTransactionHistory();
  console.log(`Transaction count: ${history.length}`);

  // Demonstrating that the returned array is the actual internal array
  console.log('\nModifying the returned history array (which affects internal state):');
  history.push({
    type: 'EXTERNAL MODIFICATION',
    amount: 999,
    timestamp: new Date()
  });

  // Getting balance with possible interest
  console.log('\nGetting balance with possible interest:');
  const balanceResult = account.getBalanceWithPossibleInterest(true);
  console.log('Result:', balanceResult);

  // Changing owner name with inconsistent return value
  console.log('\nChanging owner name:');
  const nameChangeResult = account.changeOwnerName('Jane Doe');
  console.log('Name change result:', nameChangeResult);

  // Performing monthly maintenance
  console.log('\nPerforming monthly maintenance:');
  const maintenanceResult = account.performMonthlyMaintenance();
  console.log('Maintenance result:', maintenanceResult);

  // Getting transaction history again to see all changes
  console.log('\nFinal transaction history:');
  const finalHistory = account.getTransactionHistory();
  finalHistory.forEach((transaction, index) => {
    console.log(`${index + 1}. ${transaction.type}: $${transaction.amount} at ${transaction.timestamp}`);
  });
}

// Run the demonstration
demonstrateCommandQuerySeparationViolation();

/**
 * This violates the Command-Query Separation principle because:
 *
 * 1. Methods Both Change State and Return Values:
 *    - deposit() and withdraw() change the balance and return the new balance
 *    - getBalanceWithPossibleInterest() sometimes modifies the balance by adding interest
 *    - changeOwnerName() changes the name and returns different values based on conditions
 *    - performMonthlyMaintenance() makes multiple state changes and returns details
 *
 * 2. Query Methods Have Side Effects:
 *    - getTransactionHistory() adds a new transaction record when called
 *    - getBalanceWithPossibleInterest() can modify the balance
 *
 * 3. Unpredictable Behavior:
 *    - Methods return different types based on conditions (boolean, string, object)
 *    - Calling the same method multiple times can produce different results
 *    - External code can modify internal state through returned references
 *
 * 4. Poor Testability:
 *    - Testing is complicated because queries have side effects
 *    - Methods have multiple responsibilities
 *    - Return values are inconsistent
 *
 * 5. Reduced Readability:
 *    - Method names don't clearly indicate whether they change state
 *    - Behavior is unpredictable without reading implementation details
 *
 * These violations make the code harder to understand, test, and maintain.
 * They increase the cognitive load required to reason about the program's behavior
 * and make it more prone to bugs, especially in concurrent environments.
 */