/**
 * Command-Query Separation Principle - Correct Implementation
 *
 * The Command-Query Separation (CQS) principle states that every method should be either:
 * 1. A Command: Changes the state of the system but doesn't return a value (or returns void/undefined)
 * 2. A Query: Returns a value but doesn't change the state of the system
 *
 * Benefits of following CQS:
 * 1. Improved code readability - clear distinction between state-changing and data-retrieving operations
 * 2. Easier debugging - queries can be called multiple times without side effects
 * 3. Better testability - queries can be tested without setting up state changes
 * 4. Safer parallel execution - queries don't interfere with each other
 * 5. Simplified reasoning about code - reduces cognitive load when analyzing program behavior
 *
 * In this example, we create a BankAccount class that follows CQS by clearly separating
 * commands (deposit, withdraw) from queries (getBalance, getTransactionHistory).
 */

// BankAccount class that follows the Command-Query Separation principle
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

  // COMMANDS - change state but don't return values about the state

  /**
   * Deposits money into the account
   * @param {number} amount - The amount to deposit
   * @returns {undefined} - No return value (command)
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

    // Command doesn't return a value related to state
  }

  /**
   * Withdraws money from the account
   * @param {number} amount - The amount to withdraw
   * @returns {undefined} - No return value (command)
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

    // Command doesn't return a value related to state
  }

  /**
   * Sets a new owner name for the account
   * @param {string} newName - The new owner name
   * @returns {undefined} - No return value (command)
   */
  changeOwnerName(newName) {
    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
      throw new Error('Valid name is required');
    }

    this.ownerName = newName;
    this.transactions.push({
      type: 'Owner name changed',
      amount: 0,
      timestamp: new Date()
    });

    // Command doesn't return a value related to state
  }

  // QUERIES - return values but don't change state

  /**
   * Gets the current balance
   * @returns {number} - The current balance (query)
   */
  getBalance() {
    // Query returns a value but doesn't change state
    return this.balance;
  }

  /**
   * Gets the account owner's name
   * @returns {string} - The owner's name (query)
   */
  getOwnerName() {
    // Query returns a value but doesn't change state
    return this.ownerName;
  }

  /**
   * Gets the account number
   * @returns {string} - The account number (query)
   */
  getAccountNumber() {
    // Query returns a value but doesn't change state
    return this.accountNumber;
  }

  /**
   * Gets the transaction history
   * @returns {Array} - Copy of the transaction history (query)
   */
  getTransactionHistory() {
    // Query returns a value but doesn't change state
    // Return a copy to prevent external code from modifying internal state
    return [...this.transactions];
  }

  /**
   * Checks if the account has sufficient funds for a withdrawal
   * @param {number} amount - The amount to check
   * @returns {boolean} - Whether there are sufficient funds (query)
   */
  hasSufficientFunds(amount) {
    // Query returns a value but doesn't change state
    return this.balance >= amount;
  }
}

// Usage example
function demonstrateCommandQuerySeparation() {
  console.log('Creating a new bank account:');
  const account = new BankAccount('12345678', 'John Doe', 1000);

  // Using queries (no state changes)
  console.log(`Account Number: ${account.getAccountNumber()}`);
  console.log(`Owner: ${account.getOwnerName()}`);
  console.log(`Initial Balance: $${account.getBalance()}`);

  // Using commands (changing state)
  console.log('\nPerforming transactions:');

  console.log('Depositing $500...');
  account.deposit(500);

  console.log('Withdrawing $200...');
  account.withdraw(200);

  console.log('Changing owner name...');
  account.changeOwnerName('John Smith');

  // Using queries again to see the results
  console.log('\nUpdated account information:');
  console.log(`Owner: ${account.getOwnerName()}`);
  console.log(`Current Balance: $${account.getBalance()}`);

  // Check if we can withdraw a certain amount
  const withdrawalAmount = 2000;
  console.log(`\nCan withdraw $${withdrawalAmount}? ${account.hasSufficientFunds(withdrawalAmount) ? 'Yes' : 'No'}`);

  // Get transaction history
  console.log('\nTransaction History:');
  const history = account.getTransactionHistory();
  history.forEach((transaction, index) => {
    console.log(`${index + 1}. ${transaction.type}: $${transaction.amount} at ${transaction.timestamp}`);
  });
}

// Run the demonstration
demonstrateCommandQuerySeparation();

/**
 * This demonstrates good adherence to the Command-Query Separation principle because:
 *
 * 1. Clear Separation of Commands and Queries:
 *    - Commands (deposit, withdraw, changeOwnerName) modify state but don't return values
 *    - Queries (getBalance, getOwnerName, getAccountNumber, getTransactionHistory,
 *      hasSufficientFunds) return values but don't modify state
 *
 * 2. Predictable Behavior:
 *    - Queries can be called multiple times with the same result
 *    - Commands have clear, single responsibilities
 *    - No method both changes state AND returns state information
 *
 * 3. Defensive Programming:
 *    - Queries return copies of collections (getTransactionHistory) to prevent
 *      external code from modifying internal state
 *    - Commands validate inputs before changing state
 *
 * 4. Improved Testability:
 *    - Queries can be tested without worrying about side effects
 *    - Commands can be verified by querying the state before and after execution
 *
 * 5. Self-Documenting Code:
 *    - Method names clearly indicate whether they are commands or queries
 *    - Commands use verbs (deposit, withdraw, change)
 *    - Queries use "get" or other retrieval-oriented prefixes
 *
 * By following CQS, this implementation creates a more maintainable, testable,
 * and understandable system with clear boundaries between state-changing operations
 * and data retrieval operations.
 */