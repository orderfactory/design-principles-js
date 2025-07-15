/**
 * Keep It Simple, Stupid (KISS) Principle - Violation
 *
 * The KISS principle states that most systems work best if they are kept simple rather than made complex.
 * This file demonstrates a violation of this principle by implementing a calculator with
 * unnecessary complexity, over-engineering, and excessive abstraction.
 *
 * In this example, we create an over-engineered calculator that adds unnecessary complexity
 * to solve a simple problem.
 */

// Abstract operation interface
class Operation {
  constructor(name, symbol) {
    this.name = name;
    this.symbol = symbol;
  }

  execute(a, b) {
    throw new Error('Method not implemented');
  }

  getDescription() {
    return `${this.name} operation (${this.symbol})`;
  }
}

// Concrete operation implementations
class AddOperation extends Operation {
  constructor() {
    super('Addition', '+');
  }

  execute(a, b) {
    return a + b;
  }
}

class SubtractOperation extends Operation {
  constructor() {
    super('Subtraction', '-');
  }

  execute(a, b) {
    return a - b;
  }
}

class MultiplyOperation extends Operation {
  constructor() {
    super('Multiplication', '*');
  }

  execute(a, b) {
    return a * b;
  }
}

class DivideOperation extends Operation {
  constructor() {
    super('Division', '/');
  }

  execute(a, b) {
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }
}

// Operation factory
class OperationFactory {
  static createOperation(type) {
    switch (type.toLowerCase()) {
      case 'add':
        return new AddOperation();
      case 'subtract':
        return new SubtractOperation();
      case 'multiply':
        return new MultiplyOperation();
      case 'divide':
        return new DivideOperation();
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }
}

// Calculator with unnecessary complexity
class OverEngineeredCalculator {
  constructor() {
    this.operations = {};
    this.history = [];
    this.memoryValue = 0;
    this.initializeOperations();
  }

  initializeOperations() {
    const operationTypes = ['add', 'subtract', 'multiply', 'divide'];
    operationTypes.forEach(type => {
      this.operations[type] = OperationFactory.createOperation(type);
    });
  }

  performOperation(type, a, b) {
    if (!this.operations[type]) {
      throw new Error(`Operation not supported: ${type}`);
    }

    const operation = this.operations[type];
    const result = operation.execute(a, b);

    // Log the operation to history
    this.history.push({
      timestamp: new Date(),
      operation: operation.getDescription(),
      operands: { a, b },
      result
    });

    return result;
  }

  add(a, b) {
    return this.performOperation('add', a, b);
  }

  subtract(a, b) {
    return this.performOperation('subtract', a, b);
  }

  multiply(a, b) {
    return this.performOperation('multiply', a, b);
  }

  divide(a, b) {
    return this.performOperation('divide', a, b);
  }

  // Unnecessary memory functions
  memoryStore(value) {
    this.memoryValue = value;
  }

  memoryRecall() {
    return this.memoryValue;
  }

  memoryClear() {
    this.memoryValue = 0;
  }

  memoryAdd(value) {
    this.memoryValue += value;
  }

  // Unnecessary history functions
  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  getLastOperation() {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  // Unnecessary analytics
  getOperationCounts() {
    const counts = {};
    this.history.forEach(entry => {
      const opName = entry.operation.split(' ')[0];
      counts[opName] = (counts[opName] || 0) + 1;
    });
    return counts;
  }

  getAverageResult() {
    if (this.history.length === 0) return 0;
    const sum = this.history.reduce((acc, entry) => acc + entry.result, 0);
    return sum / this.history.length;
  }
}

// Usage example
const calculator = new OverEngineeredCalculator();

// Perform some calculations
console.log(`Addition: 5 + 3 = ${calculator.add(5, 3)}`);
console.log(`Subtraction: 10 - 4 = ${calculator.subtract(10, 4)}`);
console.log(`Multiplication: 6 * 7 = ${calculator.multiply(6, 7)}`);
console.log(`Division: 20 / 5 = ${calculator.divide(20, 5)}`);

// Use unnecessary memory functions
calculator.memoryStore(10);
console.log(`Memory value: ${calculator.memoryRecall()}`);
calculator.memoryAdd(5);
console.log(`Updated memory value: ${calculator.memoryRecall()}`);

// Display operation history
console.log('Operation history:');
calculator.getHistory().forEach(entry => {
  console.log(`${entry.timestamp.toISOString()} - ${entry.operation}: ${entry.operands.a} ${entry.operation.split(' ')[0][0]} ${entry.operands.b} = ${entry.result}`);
});

// Display analytics
console.log('Operation counts:', calculator.getOperationCounts());
console.log(`Average result: ${calculator.getAverageResult()}`);

/**
 * This violates KISS because:
 * 1. It uses an unnecessary class hierarchy and inheritance for simple operations
 * 2. It implements a factory pattern that adds complexity without real benefit
 * 3. It includes unnecessary features like operation history and memory functions
 * 4. It adds analytics that aren't needed for basic calculations
 * 5. The code is much harder to understand, maintain, and debug
 *
 * All of this complexity is unnecessary for a simple calculator that just needs to perform
 * basic arithmetic operations. The solution is over-engineered and violates the KISS principle
 * by making things more complex than they need to be.
 */