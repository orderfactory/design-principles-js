/**
 * Encapsulation Principle - Correct Implementation
 *
 * Encapsulation is the bundling of data and methods that operate on that data within a single unit (class),
 * and restricting access to some of the object's components. It hides the internal state and requires all
 * interaction to be performed through an object's methods.
 *
 * Benefits of encapsulation:
 * 1. Data hiding: Internal representation of an object is hidden from the outside
 * 2. Increased flexibility: Implementation details can change without affecting the public interface
 * 3. Better control: Access to data can be restricted and validated
 * 4. Reduced complexity: Users of the class only need to know its public interface, not its implementation
 *
 * In this example, we create a BankAccount class that properly encapsulates its data (balance)
 * and provides controlled access through methods.
 */

// BankAccount class with proper encapsulation
class BankAccount {
  // Private fields using # syntax (ES2022)
  #accountNumber;
  #balance;
  #owner;
  #transactionHistory;

  constructor(owner, initialBalance = 0) {
    this.#accountNumber = this.#generateAccountNumber();
    this.#balance = initialBalance;
    this.#owner = owner;
    this.#transactionHistory = [];

    // Record initial deposit if there is one
    if (initialBalance > 0) {
      this.#addTransaction('Initial deposit', initialBalance);
    }
  }

  // Private method to generate account number
  #generateAccountNumber() {
    return 'ACCT-' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  }

  // Private method to add a transaction to history
  #addTransaction(type, amount, newBalance = this.#balance) {
    this.#transactionHistory.push({
      type,
      amount,
      balance: newBalance,
      date: new Date()
    });
  }

  // Public methods that provide controlled access to private data
  getAccountNumber() {
    return this.#accountNumber;
  }

  getBalance() {
    return this.#balance;
  }

  getOwner() {
    return this.#owner;
  }

  deposit(amount) {
    // Validate input
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    // Update balance
    this.#balance += amount;

    // Record transaction
    this.#addTransaction('Deposit', amount);

    return this.#balance;
  }

  withdraw(amount) {
    // Validate input
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }

    // Update balance
    this.#balance -= amount;

    // Record transaction
    this.#addTransaction('Withdrawal', -amount);

    return this.#balance;
  }

  getTransactionHistory() {
    // Return a copy to prevent external modification
    return [...this.#transactionHistory];
  }

  // Method to print account statement
  printStatement() {
    console.log(`\nAccount Statement for ${this.#accountNumber}`);
    console.log(`Owner: ${this.#owner}`);
    console.log(`Current Balance: $${this.#balance.toFixed(2)}`);
    console.log('\nTransaction History:');

    this.#transactionHistory.forEach((transaction, index) => {
      console.log(`${index + 1}. ${transaction.type}: $${Math.abs(transaction.amount).toFixed(2)} | Balance: $${transaction.balance.toFixed(2)} | ${transaction.date.toLocaleString()}`);
    });
  }
}

// Usage example
try {
  // Create a new bank account
  const account = new BankAccount('John Doe', 1000);

  // Access information through public methods
  console.log(`Account Number: ${account.getAccountNumber()}`);
  console.log(`Initial Balance: $${account.getBalance()}`);
  console.log(`Owner: ${account.getOwner()}`);

  // Perform transactions
  account.deposit(500);
  console.log(`Balance after deposit: $${account.getBalance()}`);

  account.withdraw(200);
  console.log(`Balance after withdrawal: $${account.getBalance()}`);

  // Try to access private fields directly (will not work)
  console.log('Trying to access private fields directly:');
  console.log(`Direct access to balance: ${account.#balance}`); // This will cause an error

  // Print account statement
  account.printStatement();

} catch (error) {
  console.error(`Error: ${error.message}`);
  console.log('\nNote: The error above is expected when trying to access private fields directly.');
}

/**
 * This demonstrates proper Encapsulation because:
 *
 * 1. Data Hiding:
 *    - The account balance, account number, owner, and transaction history are private fields (using #)
 *    - These fields cannot be accessed or modified directly from outside the class
 *
 * 2. Controlled Access:
 *    - Public methods (deposit, withdraw, getBalance, etc.) provide the only way to interact with the data
 *    - These methods include validation to ensure data integrity
 *
 * 3. Implementation Hiding:
 *    - Internal methods like #generateAccountNumber and #addTransaction are hidden
 *    - The class can change these implementations without affecting code that uses the class
 *
 * 4. Benefits Demonstrated:
 *    - Data integrity: Can't set balance to invalid values
 *    - Validation: Deposit and withdrawal amounts are validated
 *    - Abstraction: Users of the class don't need to know how transactions are recorded
 *    - Flexibility: Internal implementation can change without breaking client code
 */