/**
 * Encapsulation Principle - Violation
 *
 * Encapsulation is the bundling of data and methods that operate on that data within a single unit (class),
 * and restricting access to some of the object's components. It hides the internal state and requires all
 * interaction to be performed through an object's methods.
 *
 * This file demonstrates a violation of encapsulation by exposing internal data directly,
 * allowing it to be modified without any control or validation.
 */

// BankAccount class with poor encapsulation
class BankAccount {
  constructor(owner, initialBalance = 0) {
    // Public properties - directly accessible and modifiable from outside
    this.accountNumber = this.generateAccountNumber();
    this.balance = initialBalance;
    this.owner = owner;
    this.transactionHistory = [];

    // Record initial deposit if there is one
    if (initialBalance > 0) {
      this.addTransaction('Initial deposit', initialBalance);
    }
  }

  // Public method that should be private
  generateAccountNumber() {
    return 'ACCT-' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  }

  // Public method that should be private
  addTransaction(type, amount) {
    this.transactionHistory.push({
      type,
      amount,
      balance: this.balance,
      date: new Date()
    });
  }

  deposit(amount) {
    // No validation of input
    this.balance += amount;
    this.addTransaction('Deposit', amount);
    return this.balance;
  }

  withdraw(amount) {
    // No validation of input or balance check
    this.balance -= amount;
    this.addTransaction('Withdrawal', -amount);
    return this.balance;
  }

  printStatement() {
    console.log(`\nAccount Statement for ${this.accountNumber}`);
    console.log(`Owner: ${this.owner}`);
    console.log(`Current Balance: $${this.balance.toFixed(2)}`);
    console.log('\nTransaction History:');

    this.transactionHistory.forEach((transaction, index) => {
      console.log(`${index + 1}. ${transaction.type}: $${Math.abs(transaction.amount).toFixed(2)} | Balance: $${transaction.balance.toFixed(2)} | ${transaction.date.toLocaleString()}`);
    });
  }
}

// Usage example demonstrating the problems with poor encapsulation
// Create a new bank account
const account = new BankAccount('John Doe', 1000);

console.log(`Account Number: ${account.accountNumber}`);
console.log(`Initial Balance: $${account.balance}`);

// Perform a proper deposit
account.deposit(500);
console.log(`Balance after deposit: $${account.balance}`);

// PROBLEM 1: Direct modification of balance bypassing validation
account.balance = 10000000;
console.log(`Balance after direct modification: $${account.balance}`);

// PROBLEM 2: Setting balance to invalid value
account.balance = -5000;
console.log(`Balance after setting negative amount: $${account.balance}`);

// PROBLEM 3: Withdrawal doesn't check for sufficient funds
account.withdraw(20000000);
console.log(`Balance after excessive withdrawal: $${account.balance}`);

// PROBLEM 4: Transaction history can be manipulated
account.transactionHistory.push({
  type: 'Fake deposit',
  amount: 1000000,
  balance: 1000000,
  date: new Date()
});

// PROBLEM 5: Can call internal methods directly
account.addTransaction('Unauthorized transfer', -500000);

// PROBLEM 6: Can completely replace methods
const originalWithdraw = account.withdraw;
account.withdraw = function(amount) {
  console.log(`Intercepted withdrawal of $${amount}`);
  // Don't actually withdraw anything
  this.addTransaction('Withdrawal attempt', 0);
  return this.balance;
};

account.withdraw(100);
console.log(`Balance after intercepted withdrawal: $${account.balance}`);

// Print the manipulated statement
account.printStatement();

/**
 * This violates Encapsulation because:
 *
 * 1. Exposed Internal State:
 *    - All properties (balance, accountNumber, owner, transactionHistory) are public
 *    - Any code can directly access and modify these properties without restrictions
 *
 * 2. No Data Protection:
 *    - Balance can be set to invalid values (negative amounts)
 *    - Transactions can be added directly to the history without proper recording
 *    - No validation in methods like withdraw (allowing overdrafts)
 *
 * 3. Exposed Implementation Details:
 *    - Internal methods like generateAccountNumber and addTransaction are public
 *    - These methods can be called directly or even replaced
 *
 * 4. Problems Demonstrated:
 *    - Data integrity: Balance can be set to any value, including invalid ones
 *    - Security: No control over who can modify the account data
 *    - Reliability: Methods can be replaced or bypassed
 *    - Maintainability: Changes to implementation would affect all code that directly
 *      accesses the internal properties
 */