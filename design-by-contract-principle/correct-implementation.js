/**
 * Design by Contract (DbC) Principle - Correct Implementation
 *
 * Design by Contract is a software design approach where components have formal, precise,
 * and verifiable interface specifications in the form of:
 *
 * 1. Preconditions: Conditions that must be true before a method executes
 * 2. Postconditions: Conditions that must be true after a method executes
 * 3. Invariants: Conditions that must remain true throughout the execution of a method
 *
 * Benefits of following DbC:
 * 1. Improved reliability - explicit checks ensure the system operates within expected parameters
 * 2. Better documentation - contracts clearly define expected behavior
 * 3. Easier debugging - contract violations pinpoint the source of errors
 * 4. Simplified testing - contracts define expected behavior for test cases
 * 5. Clearer interfaces - contracts make component interactions explicit
 *
 * In this example, we create a BankAccount class that follows DbC by explicitly
 * defining and enforcing contracts for each method.
 */

// Helper function to assert conditions (used for contract enforcement)
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Contract violation: ${message}`);
  }
}

// BankAccount class that follows the Design by Contract principle
class BankAccount {
  constructor(accountNumber, ownerName, initialBalance = 0) {
    // Preconditions
    assert(typeof accountNumber === 'string' && accountNumber.length > 0,
      'Account number must be a non-empty string');
    assert(typeof ownerName === 'string' && ownerName.trim().length > 0,
      'Owner name must be a non-empty string');
    assert(typeof initialBalance === 'number' && initialBalance >= 0,
      'Initial balance must be a non-negative number');

    this.accountNumber = accountNumber;
    this.ownerName = ownerName;
    this.balance = initialBalance;
    this.transactions = [];
    this.isActive = true;

    // Record initial deposit if any
    if (initialBalance > 0) {
      this.transactions.push({
        type: 'Initial deposit',
        amount: initialBalance,
        timestamp: new Date()
      });
    }

    // Postconditions
    assert(this.accountNumber === accountNumber, 'Account number was not set correctly');
    assert(this.ownerName === ownerName, 'Owner name was not set correctly');
    assert(this.balance === initialBalance, 'Balance was not set correctly');
    assert(Array.isArray(this.transactions), 'Transactions should be an array');
    assert(this.isActive === true, 'Account should be active upon creation');
  }

  // Class invariant check - can be called at the beginning and end of methods
  _checkInvariants() {
    assert(typeof this.accountNumber === 'string' && this.accountNumber.length > 0,
      'Account number must remain a non-empty string');
    assert(typeof this.ownerName === 'string' && this.ownerName.trim().length > 0,
      'Owner name must remain a non-empty string');
    assert(typeof this.balance === 'number' && !isNaN(this.balance),
      'Balance must remain a number');
    assert(Array.isArray(this.transactions),
      'Transactions must remain an array');
    assert(typeof this.isActive === 'boolean',
      'isActive must remain a boolean');
  }

  /**
   * Deposits money into the account
   * @param {number} amount - The amount to deposit
   */
  deposit(amount) {
    // Check invariants before method execution
    this._checkInvariants();

    // Preconditions
    assert(this.isActive, 'Account must be active to make deposits');
    assert(typeof amount === 'number', 'Deposit amount must be a number');
    assert(amount > 0, 'Deposit amount must be positive');
    assert(isFinite(amount), 'Deposit amount must be finite');

    const oldBalance = this.balance;

    // Method implementation
    this.balance += amount;
    this.transactions.push({
      type: 'Deposit',
      amount: amount,
      timestamp: new Date()
    });

    // Postconditions
    assert(this.balance === oldBalance + amount, 'Balance must increase by exactly the deposit amount');
    assert(this.transactions.length > 0, 'Transaction history must be updated');
    assert(this.transactions[this.transactions.length - 1].type === 'Deposit', 'Last transaction must be a deposit');
    assert(this.transactions[this.transactions.length - 1].amount === amount, 'Deposit amount must match the transaction record');

    // Check invariants after method execution
    this._checkInvariants();
  }

  /**
   * Withdraws money from the account
   * @param {number} amount - The amount to withdraw
   */
  withdraw(amount) {
    // Check invariants before method execution
    this._checkInvariants();

    // Preconditions
    assert(this.isActive, 'Account must be active to make withdrawals');
    assert(typeof amount === 'number', 'Withdrawal amount must be a number');
    assert(amount > 0, 'Withdrawal amount must be positive');
    assert(isFinite(amount), 'Withdrawal amount must be finite');
    assert(this.balance >= amount, 'Insufficient funds for withdrawal');

    const oldBalance = this.balance;
    const oldTransactionCount = this.transactions.length;

    // Method implementation
    this.balance -= amount;
    this.transactions.push({
      type: 'Withdrawal',
      amount: amount,
      timestamp: new Date()
    });

    // Postconditions
    assert(this.balance === oldBalance - amount, 'Balance must decrease by exactly the withdrawal amount');
    assert(this.transactions.length === oldTransactionCount + 1, 'Transaction history must be updated with exactly one new entry');
    assert(this.transactions[this.transactions.length - 1].type === 'Withdrawal', 'Last transaction must be a withdrawal');
    assert(this.transactions[this.transactions.length - 1].amount === amount, 'Withdrawal amount must match the transaction record');

    // Check invariants after method execution
    this._checkInvariants();
  }

  /**
   * Closes the account if balance is zero
   */
  closeAccount() {
    // Check invariants before method execution
    this._checkInvariants();

    // Preconditions
    assert(this.isActive, 'Account must be active to be closed');
    assert(this.balance === 0, 'Account balance must be zero to close the account');

    // Method implementation
    this.isActive = false;
    this.transactions.push({
      type: 'Account closed',
      amount: 0,
      timestamp: new Date()
    });

    // Postconditions
    assert(this.isActive === false, 'Account must be inactive after closing');
    assert(this.transactions[this.transactions.length - 1].type === 'Account closed', 'Last transaction must record account closure');

    // Check invariants after method execution
    this._checkInvariants();
  }

  /**
   * Gets the current balance
   * @returns {number} - The current balance
   */
  getBalance() {
    // Check invariants before method execution
    this._checkInvariants();

    // Preconditions
    // (No specific preconditions for this query method)

    // Method implementation
    const result = this.balance;

    // Postconditions
    assert(result === this.balance, 'Returned balance must match actual balance');

    // Check invariants after method execution
    this._checkInvariants();

    return result;
  }

  /**
   * Gets the transaction history
   * @returns {Array} - Copy of the transaction history
   */
  getTransactionHistory() {
    // Check invariants before method execution
    this._checkInvariants();

    // Preconditions
    // (No specific preconditions for this query method)

    // Method implementation
    const result = [...this.transactions];

    // Postconditions
    assert(Array.isArray(result), 'Result must be an array');
    assert(result.length === this.transactions.length, 'Result must contain all transactions');
    assert(result !== this.transactions, 'Result must be a copy, not the original array');

    // Check invariants after method execution
    this._checkInvariants();

    return result;
  }

  /**
   * Checks if the account is active
   * @returns {boolean} - Whether the account is active
   */
  isAccountActive() {
    // Check invariants before method execution
    this._checkInvariants();

    // Method implementation
    const result = this.isActive;

    // Check invariants after method execution
    this._checkInvariants();

    return result;
  }
}

// Usage example
function demonstrateDesignByContract() {
  console.log('Creating a new bank account:');
  const account = new BankAccount('12345678', 'John Doe', 1000);

  console.log(`Initial Balance: $${account.getBalance()}`);

  console.log('\nPerforming transactions:');

  try {
    console.log('Depositing $500...');
    account.deposit(500);
    console.log(`New Balance: $${account.getBalance()}`);

    console.log('\nWithdrawing $200...');
    account.withdraw(200);
    console.log(`New Balance: $${account.getBalance()}`);

    console.log('\nAttempting to withdraw more than the balance...');
    account.withdraw(2000); // This should violate a precondition
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  console.log('\nTransaction History:');
  const history = account.getTransactionHistory();
  history.forEach((transaction, index) => {
    console.log(`${index + 1}. ${transaction.type}: $${transaction.amount} at ${transaction.timestamp}`);
  });

  console.log('\nAttempting to close account with non-zero balance:');
  try {
    account.closeAccount(); // This should violate a precondition
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  console.log('\nWithdrawing remaining balance...');
  account.withdraw(1300);
  console.log(`New Balance: $${account.getBalance()}`);

  console.log('\nClosing account...');
  account.closeAccount();
  console.log(`Account active: ${account.isAccountActive()}`);
}

// Run the demonstration
demonstrateDesignByContract();

/**
 * This demonstrates good adherence to the Design by Contract principle because:
 *
 * 1. Explicit Contracts:
 *    - Preconditions verify that inputs and system state are valid before execution
 *    - Postconditions verify that the method has achieved its intended effect
 *    - Invariants ensure that the object remains in a consistent state
 *
 * 2. Clear Responsibility Boundaries:
 *    - The caller is responsible for meeting preconditions
 *    - The method is responsible for ensuring postconditions if preconditions are met
 *    - Both share responsibility for maintaining invariants
 *
 * 3. Self-Documenting Code:
 *    - Contracts explicitly document expected behavior
 *    - Contract violations provide clear error messages
 *    - Method behavior is predictable and verifiable
 *
 * 4. Defensive Programming:
 *    - Contracts catch errors early, at their source
 *    - Invalid states are prevented rather than handled after they occur
 *    - Errors are reported with specific, actionable messages
 *
 * 5. Improved Testability:
 *    - Contracts define expected behavior for test cases
 *    - Contract violations make test failures more informative
 *    - Contracts help ensure complete test coverage
 *
 * By following DbC, this implementation creates a more reliable, maintainable,
 * and understandable system with clear expectations for component behavior.
 */