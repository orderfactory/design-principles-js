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

### 3. Dependency Inversion Principle (DIP)

The Dependency Inversion Principle states that high-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

**Location:** [dependency-inversion-principle](./dependency-inversion-principle)

**Files:**
- [correct-implementation.js](./dependency-inversion-principle/correct-implementation.js) - Shows a proper implementation of DIP using a notification system with dependency injection
- [violation.js](./dependency-inversion-principle/violation.js) - Demonstrates a violation of DIP with a notification service that directly depends on concrete implementations

**Key Concept:**
The DIP is violated when high-level modules directly depend on low-level modules instead of abstractions. In the violation example, the NotificationService directly instantiates and uses concrete implementations, creating tight coupling. The correct implementation uses dependency injection and abstractions to decouple the high-level module from the specific implementations.

### 4. Interface Segregation Principle (ISP)

The Interface Segregation Principle states that clients should not be forced to depend upon interfaces that they do not use.

**Location:** [interface-segregation-principle](./interface-segregation-principle)

**Files:**
- [correct-implementation.js](./interface-segregation-principle/correct-implementation.js) - Shows a proper implementation of ISP using specific, focused interfaces for different device capabilities
- [violation.js](./interface-segregation-principle/violation.js) - Demonstrates a violation of ISP with a "fat interface" that forces classes to implement methods they don't need

**Key Concept:**
The ISP is violated when interfaces are too large and force implementing classes to provide implementations for methods they don't use. In the violation example, a MultiFunctionDevice interface forces BasicPrinter and BasicScanner to implement methods they don't support, leading to runtime errors. The correct implementation uses smaller, focused interfaces and composition to create objects with exactly the capabilities they need.

### 5. Single Responsibility Principle (SRP)

The Single Responsibility Principle states that a class should have only one reason to change, meaning it should have only one responsibility.

**Location:** [single-responsibility-principle](./single-responsibility-principle)

**Files:**
- [correct-implementation.js](./single-responsibility-principle/correct-implementation.js) - Shows a proper implementation of SRP using separate classes for user data, validation, and persistence
- [violation.js](./single-responsibility-principle/violation.js) - Demonstrates a violation of SRP with a single class handling multiple responsibilities

**Key Concept:**
The SRP is violated when a class takes on multiple responsibilities, giving it multiple reasons to change. In the violation example, a User class handles data management, validation, persistence, and reporting, making it difficult to maintain and test. The correct implementation separates these concerns into distinct classes, each with a single responsibility, making the code more modular, easier to understand, and simpler to maintain.

### 6. You Ain't Gonna Need It (YAGNI)

The YAGNI principle suggests that you shouldn't add functionality until it's actually needed. It's about avoiding speculative development and focusing only on current requirements.

**Location:** [yagni-principle](./yagni-principle)

**Files:**
- [correct-implementation.js](./yagni-principle/correct-implementation.js) - Shows a proper implementation of YAGNI with a simple, focused solution that only implements what's currently needed
- [violation.js](./yagni-principle/violation.js) - Demonstrates a violation of YAGNI with an over-engineered solution containing many speculative features

**Key Concept:**
The YAGNI principle is violated when developers implement features that aren't currently required, based on speculation about future needs. In the violation example, an authentication system is built with many speculative features like password reset, email verification, session management, and two-factor authentication, adding unnecessary complexity. The correct implementation focuses only on the current requirements (basic user registration and login), making the code simpler, faster to develop, and easier to maintain.

### 7. Don't Repeat Yourself (DRY)

The DRY principle states that "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system." This means avoiding duplication of code and logic.

**Location:** [dry-principle](./dry-principle)

**Files:**
- [correct-implementation.js](./dry-principle/correct-implementation.js) - Shows a proper implementation of DRY by centralizing calculation logic and reusing methods
- [violation.js](./dry-principle/violation.js) - Demonstrates a violation of DRY with repeated code and duplicated logic

**Key Concept:**
The DRY principle is violated when the same piece of logic or knowledge is duplicated in multiple places. In the violation example, a shopping cart implementation repeats calculation logic for subtotal, tax, shipping, and discounts across multiple methods. The correct implementation centralizes each calculation in a single method and reuses these methods where needed, making the code more maintainable, less prone to errors, and easier to modify when requirements change.

### 8. Keep It Simple, Stupid (KISS)

The KISS principle states that most systems work best if they are kept simple rather than made complex. Simplicity should be a key goal in design, and unnecessary complexity should be avoided.

**Location:** [kiss-principle](./kiss-principle)

**Files:**
- [correct-implementation.js](./kiss-principle/correct-implementation.js) - Shows a proper implementation of KISS with a simple, straightforward calculator
- [violation.js](./kiss-principle/violation.js) - Demonstrates a violation of KISS with an over-engineered calculator that adds unnecessary complexity

**Key Concept:**
The KISS principle is violated when solutions are made more complex than necessary. In the violation example, a simple calculator is over-engineered with unnecessary abstractions, class hierarchies, and features that don't add value. The correct implementation solves the same problem with a simple, straightforward approach that's easy to understand and maintain, demonstrating that the simplest solution is often the best.
