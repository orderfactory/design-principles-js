/**
 * Design by Contract (DbC) Principle - Violation
 *
 * Design by Contract is a software design approach where components have formal, precise,
 * and verifiable interface specifications in the form of:
 *
 * 1. Preconditions: Conditions that must be true before a method executes
 * 2. Postconditions: Conditions that must be true after a method executes
 * 3. Invariants: Conditions that must remain true throughout the execution of a method
 *
 * This file demonstrates violations of the DbC principle by:
 * 1. Missing or incomplete precondition checks
 * 2. Failing to enforce postconditions
 * 3. Not maintaining object invariants
 * 4. Inconsistent error handling
 * 5. Allowing the object to enter invalid states
 */

// BankAccount class that violates the Design by Contract principle
class BankAccount {
  constructor(accountNumber, ownerName, initialBalance = 0) {
    // VIOLATION 1: Missing precondition checks
    // No validation for accountNumber or ownerName

    this.accountNumber = accountNumber;
    this.ownerName = ownerName;

    // VIOLATION 2: Incomplete validation
    // Only checks if initialBalance is negative, but doesn't check type
    if (initialBalance < 0) {
      // VIOLATION 3: Inconsistent error handling
      // Sometimes throws errors, sometimes sets default values
      console.warn('Negative initial balance provided, setting to 0');
      this.balance = 0;
    } else {
      this.balance = initialBalance;
    }

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

    // VIOLATION 4: No postcondition checks
    // No verification that the object was constructed correctly
  }

  /**
   * Deposits money into the account
   * @param {number} amount - The amount to deposit
   * @returns {number} - The new balance
   */
  deposit(amount) {
    // VIOLATION 5: Incomplete precondition checks
    // Only checks if amount is positive, but not if it's a number or if account is active
    if (amount <= 0) {
      console.error('Deposit amount must be positive');
      return this.balance; // Returns without making changes
    }

    // VIOLATION 6: No protection against invalid state
    // Doesn't check if this.balance is a valid number before operating on it
    this.balance += amount;

    // VIOLATION 7: Inconsistent record keeping
    // Sometimes updates transaction history, sometimes doesn't
    if (amount > 100) {
      this.transactions.push({
        type: 'Deposit',
        amount: amount,
        timestamp: new Date()
      });
    }

    // VIOLATION 8: No postcondition checks
    // No verification that the balance was updated correctly

    // VIOLATION 9: Returns state information (mixing command and query)
    return this.balance;
  }

  /**
   * Withdraws money from the account
   * @param {number} amount - The amount to withdraw
   * @returns {boolean} - Whether the withdrawal was successful
   */
  withdraw(amount) {
    // VIOLATION 10: Incomplete precondition checks
    // Doesn't check if amount is a number or if account is active

    // VIOLATION 11: Implicit type conversion
    // Uses loose equality which can lead to unexpected behavior
    if (amount <= 0) {
      return false; // Returns failure without explanation
    }

    // VIOLATION 12: Inconsistent error handling
    // Sometimes returns boolean, sometimes throws error
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // VIOLATION 13: No protection against invalid state
    this.balance -= amount;

    // VIOLATION 14: Inconsistent record keeping
    this.transactions.push({
      type: 'Withdrawal',
      amount: amount,
      timestamp: new Date()
    });

    // VIOLATION 15: No postcondition checks

    return true; // Returns success without verification
  }

  /**
   * Closes the account
   * @returns {boolean} - Whether the account was closed successfully
   */
  closeAccount() {
    // VIOLATION 16: Missing precondition checks
    // Doesn't check if account is already closed or if balance is zero

    // VIOLATION 17: Allows object to enter invalid state
    // Closes account even if balance is not zero
    this.isActive = false;

    // VIOLATION 18: Inconsistent record keeping
    // No transaction record for account closure

    // VIOLATION 19: No postcondition checks

    return true;
  }

  /**
   * Transfers money to another account
   * @param {BankAccount} targetAccount - The account to transfer to
   * @param {number} amount - The amount to transfer
   * @returns {boolean} - Whether the transfer was successful
   */
  transferTo(targetAccount, amount) {
    // VIOLATION 20: Insufficient precondition checks
    // Doesn't verify that targetAccount is a valid BankAccount object

    if (amount <= 0) {
      console.error('Transfer amount must be positive');
      return false;
    }

    if (this.balance < amount) {
      console.error('Insufficient funds for transfer');
      return false;
    }

    // VIOLATION 21: No protection against exceptions in called methods
    // If targetAccount.deposit throws an exception, this account will still be debited
    this.balance -= amount;

    // VIOLATION 22: Assumes other objects follow contracts
    // No verification that targetAccount.deposit works correctly
    targetAccount.deposit(amount);

    this.transactions.push({
      type: 'Transfer out',
      amount: amount,
      timestamp: new Date()
    });

    // VIOLATION 23: No postcondition checks
    // No verification that both accounts were updated correctly

    return true;
  }

  /**
   * Gets the current balance
   * @returns {number} - The current balance
   */
  getBalance() {
    // VIOLATION 24: Side effect in query method
    // Records access to balance, violating command-query separation
    this.transactions.push({
      type: 'Balance checked',
      amount: 0,
      timestamp: new Date()
    });

    return this.balance;
  }

  /**
   * Gets the transaction history
   * @returns {Array} - The transaction history
   */
  getTransactionHistory() {
    // VIOLATION 25: Returns reference to internal state
    // Allows external code to modify internal state
    return this.transactions;
  }

  /**
   * Applies interest to the account
   * @param {number} rate - The interest rate
   * @returns {number} - The amount of interest added
   */
  applyInterest(rate) {
    // VIOLATION 26: Missing precondition checks
    // Doesn't check if rate is valid or if account is active

    // VIOLATION 27: No protection against invalid calculations
    const interest = this.balance * rate;
    this.balance += interest;

    // VIOLATION 28: Inconsistent record keeping
    // No transaction record for interest

    // VIOLATION 29: No postcondition checks

    return interest;
  }
}

// Usage example
function demonstrateDesignByContractViolation() {
  console.log('Creating a new bank account:');

  // VIOLATION 30: Passing invalid arguments without checks
  const account1 = new BankAccount('', '', '1000'); // Empty strings and string instead of number
  console.log(`Account 1 Balance: $${account1.getBalance()}`);

  const account2 = new BankAccount('12345678', 'Jane Doe', 500);
  console.log(`Account 2 Balance: $${account2.getBalance()}`);

  console.log('\nPerforming transactions:');

  // VIOLATION 31: Calling methods with invalid arguments
  console.log('Depositing invalid amount...');
  account1.deposit('100'); // String instead of number
  console.log(`New Balance: $${account1.getBalance()}`);

  console.log('\nWithdrawing from account...');
  const success = account1.withdraw(50);
  console.log(`Withdrawal successful: ${success}`);
  console.log(`New Balance: $${account1.getBalance()}`);

  // VIOLATION 32: Modifying internal state directly
  console.log('\nDirectly modifying balance...');
  account1.balance = account1.balance + 1000;
  console.log(`Modified Balance: $${account1.getBalance()}`);

  // VIOLATION 33: Modifying returned collections
  console.log('\nModifying transaction history...');
  const history = account1.getTransactionHistory();
  history.push({
    type: 'FAKE TRANSACTION',
    amount: 9999,
    timestamp: new Date()
  });

  console.log('\nTransaction History (after external modification):');
  account1.getTransactionHistory().forEach((transaction, index) => {
    console.log(`${index + 1}. ${transaction.type}: $${transaction.amount} at ${transaction.timestamp}`);
  });

  // VIOLATION 34: Transferring without proper validation
  console.log('\nTransferring between accounts...');
  account1.transferTo(account2, 200);
  console.log(`Account 1 Balance: $${account1.getBalance()}`);
  console.log(`Account 2 Balance: $${account2.getBalance()}`);

  // VIOLATION 35: Closing account with non-zero balance
  console.log('\nClosing account with non-zero balance...');
  account1.closeAccount();
  console.log(`Account closed: ${!account1.isActive}`);
  console.log(`Remaining balance: $${account1.getBalance()}`);

  // VIOLATION 36: Operating on closed account
  console.log('\nDepositing to closed account...');
  account1.deposit(100);
  console.log(`New Balance: $${account1.getBalance()}`);
}

// Run the demonstration
demonstrateDesignByContractViolation();

/**
 * This violates the Design by Contract principle because:
 *
 * 1. Missing or Incomplete Contracts:
 *    - Preconditions are often missing or incomplete
 *    - Postconditions are not verified
 *    - Object invariants are not maintained
 *
 * 2. Inconsistent Error Handling:
 *    - Some methods throw errors, others return false, others just log warnings
 *    - Error messages are not specific about which contract was violated
 *    - Some errors are silently ignored
 *
 * 3. Allowing Invalid States:
 *    - Objects can enter invalid states (e.g., closed account with non-zero balance)
 *    - Internal state can be modified directly or through returned references
 *    - No protection against invalid operations
 *
 * 4. Unpredictable Behavior:
 *    - Methods have side effects not indicated by their names
 *    - Query methods modify state
 *    - Behavior changes based on undocumented conditions
 *
 * 5. Poor Testability:
 *    - No clear contracts to test against
 *    - Inconsistent behavior makes automated testing difficult
 *    - Side effects complicate test setup and verification
 *
 * These violations make the code unreliable, hard to understand, and difficult to maintain.
 * Without clear contracts, developers cannot reason about the code's behavior without
 * examining its implementation details, leading to bugs and integration problems.
 */