# Design Principles in JavaScript

This project demonstrates various programming design principles in JavaScript. Each principle is organized in its own folder with two JavaScript files:

1. A file demonstrating the correct implementation of the principle
2. A file demonstrating a violation of the principle

## Principles Implemented

### 1. Liskov Substitution Principle (LSP)

The Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program.

**Location:** [liskov-substitution-principle](./liskov-substitution-principle)

**Files:**
- [correct-implementation.js](./liskov-substitution-principle/correct-implementation.js) - Shows a proper implementation of LSP using Shape, Rectangle, and Square classes
- [violation.js](./liskov-substitution-principle/violation.js) - Demonstrates a common LSP violation by making Square a subclass of Rectangle

**Key Concept:**
The LSP is violated when a subclass doesn't properly fulfill the contract of its parent class. In the violation example, a Square is implemented as a subclass of Rectangle, but because a square has the constraint that all sides must be equal (which a rectangle doesn't have), it cannot be substituted for a Rectangle in all cases without breaking the program's correctness.

### 2. Open/Closed Principle (OCP)

The Open/Closed Principle states that software entities (classes, modules, functions, etc.) should be open for extension but closed for modification.

**Location:** [open-closed-principle](./open-closed-principle)

**Files:**
- [correct-implementation.js](./open-closed-principle/correct-implementation.js) - Shows a proper implementation of OCP using a discount calculator system with strategy pattern
- [violation.js](./open-closed-principle/violation.js) - Demonstrates a violation of OCP with a discount calculator that requires modification to add new customer types

**Key Concept:**
The OCP is violated when adding new functionality requires modifying existing code. In the violation example, adding a new customer type requires modifying the DiscountCalculator class. The correct implementation uses the strategy pattern to allow adding new customer types without modifying existing code.
