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

### 9. Tell Don't Ask (TDA)

The Tell Don't Ask principle suggests that objects should tell other objects what to do rather than asking for their state and making decisions based on that state. This promotes encapsulation and reduces coupling between objects.

**Location:** [tell-dont-ask-principle](./tell-dont-ask-principle)

**Files:**
- [correct-implementation.js](./tell-dont-ask-principle/correct-implementation.js) - Shows a proper implementation of TDA using a shopping cart system where objects tell other objects what to do
- [violation.js](./tell-dont-ask-principle/violation.js) - Demonstrates a violation of TDA where objects expose their internal state and other objects make decisions based on that state

**Key Concept:**
The Tell Don't Ask principle is violated when objects expose their internal state and other objects make decisions based on that state. In the violation example, a shopping cart exposes its items and discount rate, and an order processor asks for this state to perform calculations that should be encapsulated in the cart. The correct implementation encapsulates behavior within objects and has objects tell other objects what to do, promoting better encapsulation and reducing coupling.

### 10. Convention over Configuration (CoC)

The Convention over Configuration principle suggests that software should use sensible defaults and follow established conventions, reducing the need for explicit configuration. This makes development faster and easier by minimizing the number of decisions developers need to make.

**Location:** [convention-over-configuration-principle](./convention-over-configuration-principle)

**Files:**
- [correct-implementation.js](./convention-over-configuration-principle/correct-implementation.js) - Shows a proper implementation of CoC using a form validation library that automatically determines validation rules based on naming conventions
- [violation.js](./convention-over-configuration-principle/violation.js) - Demonstrates a violation of CoC where every aspect of the system requires explicit configuration, even for common patterns

**Key Concept:**
The Convention over Configuration principle is violated when software requires explicit configuration for every aspect, even when following common patterns that could be inferred through conventions. In the violation example, a form validation library requires developers to explicitly configure every validation rule for every field, creating unnecessary complexity and verbosity. The correct implementation uses naming conventions to automatically determine validation rules, providing sensible defaults and only requiring explicit configuration for exceptions to the conventions, making the code more concise, maintainable, and developer-friendly.

### 11. Law of Demeter (LoD)

The Law of Demeter (LoD), also known as the "Principle of Least Knowledge" or "Don't Talk to Strangers," states that an object should only interact with its immediate collaborators and not with the "neighbors of neighbors." This promotes loose coupling and better encapsulation.

**Location:** [law-of-demeter-principle](./law-of-demeter-principle)

**Files:**
- [correct-implementation.js](./law-of-demeter-principle/correct-implementation.js) - Shows a proper implementation of LoD using a customer order system where objects only interact with their immediate collaborators
- [violation.js](./law-of-demeter-principle/violation.js) - Demonstrates a violation of LoD where objects directly access and manipulate the internal components of other objects

**Key Concept:**
The Law of Demeter is violated when an object accesses the internal components of another object and then calls methods on those components ("talking to strangers"). In the violation example, an OrderProcessor directly accesses a customer's wallet and address objects and manipulates them, creating tight coupling between classes. The correct implementation encapsulates these interactions within the Customer class, which acts as a mediator, ensuring that each object only interacts with its immediate collaborators, making the system more maintainable and adaptable to change.

### 12. Composition over Inheritance (COI)

The Composition over Inheritance principle suggests that you should favor object composition over class inheritance when designing your code. Instead of creating complex inheritance hierarchies, compose objects by combining simpler objects and behaviors.

**Location:** [composition-over-inheritance-principle](./composition-over-inheritance-principle)

**Files:**
- [correct-implementation.js](./composition-over-inheritance-principle/correct-implementation.js) - Shows a proper implementation of COI using a game character system where characters are composed of various abilities
- [violation.js](./composition-over-inheritance-principle/violation.js) - Demonstrates a violation of COI with a rigid inheritance hierarchy that becomes increasingly complex

**Key Concept:**
The Composition over Inheritance principle is violated when code relies heavily on inheritance hierarchies to reuse code and create specialized types. In the violation example, a game character system uses deep inheritance to create different character types, leading to code duplication, rigid hierarchies, and exponential growth of classes as new abilities are added. The correct implementation uses composition to create characters by combining simple, focused ability components, making the code more flexible, eliminating duplication, and allowing for easy creation of characters with arbitrary combinations of abilities.

### 13. Principle of Least Astonishment (PoLA)

The Principle of Least Astonishment states that a component of a system should behave in a way that users expect it to behave, reducing surprise or astonishment when they interact with it. This principle is about designing intuitive interfaces that align with users' mental models.

**Location:** [principle-of-least-astonishment](./principle-of-least-astonishment)

**Files:**
- [correct-implementation.js](./principle-of-least-astonishment/correct-implementation.js) - Shows a proper implementation of PoLA using intuitive function behavior with consistent parameter ordering, clear naming, and expected return values
- [violation.js](./principle-of-least-astonishment/violation.js) - Demonstrates a violation of PoLA with functions that behave in surprising or counterintuitive ways

**Key Concept:**
The Principle of Least Astonishment is violated when code behaves in ways that surprise or confuse users. In the violation example, functions and methods have misleading names, inconsistent parameter ordering, unexpected return values, and hidden side effects that modify data unexpectedly. The correct implementation follows established conventions with intuitive method names, consistent parameter ordering, predictable return values, and no surprising side effects, making the code more intuitive, easier to use correctly, and less prone to bugs caused by misunderstandings.

### 14. Big Design Up Front (BDUF)

The Big Design Up Front (BDUF) principle advocates for comprehensive planning and design before any implementation begins. It involves creating detailed specifications, architecture, and design documents upfront to guide the development process.

**Location:** [big-design-up-front-principle](./big-design-up-front-principle)

**Files:**
- [correct-implementation.js](./big-design-up-front-principle/correct-implementation.js) - Shows a proper implementation of BDUF using a well-planned e-commerce system with clear architecture and interfaces defined upfront
- [violation.js](./big-design-up-front-principle/violation.js) - Demonstrates a violation of BDUF with a system that evolves haphazardly without proper planning

**Key Concept:**
The BDUF principle is violated when development proceeds without adequate upfront planning and design. In the violation example, an e-commerce system grows organically with features added ad-hoc, resulting in duplicate code, inconsistent interfaces, inefficient data structures, and tightly coupled components. The correct implementation demonstrates a well-designed system with comprehensive domain models, clear service interfaces, dependency injection, proper error handling, and separation of concerns, making the code more maintainable, modular, and adaptable to change.

### 15. Dynamic Systems Development Method (DSDM)

The Dynamic Systems Development Method (DSDM) is an agile project delivery framework that focuses on delivering the right solution at the right time. It emphasizes active user involvement, empowered teams, frequent delivery, integrated testing, and stakeholder collaboration.

**Location:** [dynamic-systems-development-method](./dynamic-systems-development-method)

**Files:**
- [correct-implementation.js](./dynamic-systems-development-method/correct-implementation.js) - Shows a proper implementation of DSDM using a project management system with MoSCoW prioritization, timeboxed development, and phased delivery
- [violation.js](./dynamic-systems-development-method/violation.js) - Demonstrates a violation of DSDM with a project that lacks prioritization, timeboxing, and proper stakeholder involvement

**Key Concept:**
The DSDM principle is violated when projects lack proper prioritization, timeboxing, and stakeholder involvement. In the violation example, a project proceeds without MoSCoW prioritization, leading to work on non-essential features before core functionality, and without timeboxed iterations, resulting in scattered focus and poor time management. The correct implementation demonstrates a well-structured project with clear phases (Feasibility, Foundations, Evolutionary Development, Deployment), MoSCoW prioritization (Must have, Should have, Could have, Won't have), timeboxed development, and active stakeholder involvement, ensuring that the most critical functionality is always prioritized and delivered, even if time constraints require some less critical features to be deferred.

### 16. Fail Fast Principle (FF)

The Fail Fast Principle suggests that a system should detect and report errors as early as possible rather than allowing them to propagate. This helps identify issues quickly, makes debugging easier, and prevents cascading failures.

**Location:** [fail-fast-principle](./fail-fast-principle)

**Files:**
- [correct-implementation.js](./fail-fast-principle/correct-implementation.js) - Shows a proper implementation of FF using a user registration system that validates inputs immediately and throws errors as soon as problems are detected
- [violation.js](./fail-fast-principle/violation.js) - Demonstrates a violation of FF with a system that delays validation, allows invalid data to propagate, and silently handles errors

**Key Concept:**
The Fail Fast principle is violated when a system delays validation, allows invalid data to propagate through the system, or silently handles errors without proper reporting. In the violation example, a user registration system processes data before validating it, collects errors instead of throwing them immediately, and allows processing to continue with invalid data, making it harder to trace the source of problems. The correct implementation validates all inputs immediately before proceeding, throws specific errors as soon as problems are detected, and prevents invalid data from propagating through the system, making debugging easier and preventing cascading failures.

### 17. Occam's Razor Principle (OR)

The Occam's Razor Principle states that "entities should not be multiplied without necessity" or more simply, "the simplest solution is usually the best one." In programming, this means choosing the simplest solution that meets the requirements, avoiding unnecessary complexity, and not adding features or abstractions unless they're needed.

**Location:** [occams-razor-principle](./occams-razor-principle)

**Files:**
- [correct-implementation.js](./occams-razor-principle/correct-implementation.js) - Shows a proper implementation of OR using a simple text formatter that uses the simplest approach for each task
- [violation.js](./occams-razor-principle/violation.js) - Demonstrates a violation of OR with an over-engineered text formatter that adds unnecessary complexity and abstractions

**Key Concept:**
The Occam's Razor principle is violated when solutions are made more complex than necessary, with unnecessary abstractions, features, or patterns that don't provide real benefits for the current requirements. In the violation example, a simple text formatter is over-engineered with class hierarchies, factory patterns, caching mechanisms, and analytics features that aren't needed. The correct implementation solves the same problem with a simple, straightforward approach that's easy to understand and maintain, demonstrating that the simplest solution that meets the requirements is usually the best one.

### 18. Separation of Concerns Principle (SoC)

The Separation of Concerns principle states that a program should be divided into distinct sections, where each section addresses a separate concern. A concern is a set of information that affects the code of a computer program. This principle improves maintainability, reusability, and testability by ensuring that different aspects of the application are independent of each other.

**Location:** [separation-of-concerns-principle](./separation-of-concerns-principle)

**Files:**
- [correct-implementation.js](./separation-of-concerns-principle/correct-implementation.js) - Shows a proper implementation of SoC using a user management system with clear separation between data model, data access, business logic, and presentation
- [violation.js](./separation-of-concerns-principle/violation.js) - Demonstrates a violation of SoC with a monolithic class that mixes multiple concerns together

**Key Concept:**
The Separation of Concerns principle is violated when different concerns (like data storage, business logic, and presentation) are mixed together in the same components. In the violation example, a monolithic UserManager class handles data structure, storage, business logic, presentation, and even email functionality, making the code difficult to understand, test, and maintain. The correct implementation separates these concerns into distinct classes (User, UserRepository, UserService, and UserView), each with a single responsibility, making the code more modular, easier to understand, and simpler to maintain.

### 19. High Cohesion and Low Coupling Principle (HCLC)

The High Cohesion and Low Coupling principle suggests that components should have high cohesion (focused on a single responsibility) and low coupling (minimal dependencies on other components). This creates more maintainable, reusable, and testable code by ensuring that components are well-focused and independent.

**Location:** [high-cohesion-low-coupling-principle](./high-cohesion-low-coupling-principle)

**Files:**
- [correct-implementation.js](./high-cohesion-low-coupling-principle/correct-implementation.js) - Shows a proper implementation of HCLC using an e-commerce order processing system with focused components and minimal dependencies
- [violation.js](./high-cohesion-low-coupling-principle/violation.js) - Demonstrates a violation of HCLC with a monolithic class that has low cohesion and high coupling

**Key Concept:**
The High Cohesion and Low Coupling principle is violated when components have multiple unrelated responsibilities (low cohesion) and tight dependencies on other components (high coupling). In the violation example, a monolithic ECommerceSystem class handles product management, shopping cart, customer management, order processing, payment processing, and notifications, making it difficult to understand, test, and maintain. The correct implementation separates these concerns into distinct classes (Product, ShoppingCart, OrderProcessor, PaymentService, NotificationService), each with a single responsibility and minimal dependencies, making the code more modular, easier to understand, and simpler to maintain.

### 20. Encapsulation Principle (E)

Encapsulation is the bundling of data and methods that operate on that data within a single unit (class), and restricting access to some of the object's components. It hides the internal state and requires all interaction to be performed through an object's methods.

**Location:** [encapsulation-principle](./encapsulation-principle)

**Files:**
- [correct-implementation.js](./encapsulation-principle/correct-implementation.js) - Shows a proper implementation of encapsulation using a BankAccount class with private fields and controlled access through methods
- [violation.js](./encapsulation-principle/violation.js) - Demonstrates a violation of encapsulation with a BankAccount class that exposes its internal state and lacks proper data protection

**Key Concept:**
The Encapsulation principle is violated when internal state is directly exposed and can be modified without any control or validation. In the violation example, a BankAccount class exposes all its properties publicly, allowing direct modification of the balance, manipulation of transaction history, and even replacement of methods, leading to data integrity issues and security vulnerabilities. The correct implementation uses private fields and methods (using the # syntax in JavaScript) and provides controlled access through public methods that include validation, ensuring data integrity and hiding implementation details from users of the class.

### 21. Abstraction Principle (A)

Abstraction is the concept of hiding complex implementation details and exposing only the necessary parts of an object. It allows us to model real-world entities by focusing on what an object does rather than how it does it.

**Location:** [abstraction-principle](./abstraction-principle)

**Files:**
- [correct-implementation.js](./abstraction-principle/correct-implementation.js) - Shows a proper implementation of abstraction using a MediaPlayer hierarchy that hides complex implementation details
- [violation.js](./abstraction-principle/violation.js) - Demonstrates a violation of abstraction by exposing too many implementation details and forcing clients to understand internal workings

**Key Concept:**
The Abstraction principle is violated when implementation details are exposed and clients are forced to understand the internal workings of an object. In the violation example, a MediaPlayer class exposes internal details like buffers, codecs, and decoder states, forcing clients to understand these details and follow a complex sequence of method calls. The correct implementation uses an abstract base class with a clear interface, hiding complex implementation details in concrete subclasses, and providing a factory to further abstract the creation process. This makes the code more maintainable, extensible, and easier to use, as clients can focus on what the object does rather than how it does it.
