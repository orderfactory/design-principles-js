/**
 * Keep It Simple, Stupid (KISS) Principle - Correct Implementation
 *
 * The KISS principle states that most systems work best if they are kept simple rather than made complex.
 * Simplicity should be a key goal in design, and unnecessary complexity should be avoided.
 *
 * In this example, we create a simple calculator that performs basic operations
 * in a straightforward way, without unnecessary complexity.
 */

// Simple Calculator class that follows the KISS principle
class Calculator {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }
}

// Usage example
const calculator = new Calculator();

// Perform some calculations
console.log(`Addition: 5 + 3 = ${calculator.add(5, 3)}`);
console.log(`Subtraction: 10 - 4 = ${calculator.subtract(10, 4)}`);
console.log(`Multiplication: 6 * 7 = ${calculator.multiply(6, 7)}`);
console.log(`Division: 20 / 5 = ${calculator.divide(20, 5)}`);

try {
  console.log(`Division by zero: 10 / 0 = ${calculator.divide(10, 0)}`);
} catch (error) {
  console.log(`Error: ${error.message}`);
}

/**
 * This demonstrates KISS because:
 * 1. The Calculator class has a clear, focused purpose
 * 2. Each method does exactly what it needs to do, nothing more
 * 3. The implementation is straightforward and easy to understand
 * 4. There's no unnecessary abstraction or complexity
 * 5. Error handling is simple but effective
 *
 * The code solves the problem (basic calculations) in the simplest way possible,
 * making it easy to understand, maintain, and extend if needed.
 */