# Design Principles in JavaScript

This project demonstrates 37 well-established programming design principles in JavaScript. Each principle is organized in its own folder with two JavaScript files:

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

### 14. Write Everything Twice (WET) Principle

**⚠️ IMPORTANT:** This is NOT a blanket permission to duplicate code. DRY (Don't Repeat Yourself) should still be your default approach. Only apply WET when duplication is genuinely more maintainable than abstraction, such as when code serves fundamentally different purposes or will evolve independently.

The Write Everything Twice (WET) principle suggests that in some cases, duplicating code can be more beneficial than trying to abstract it into a shared implementation, especially when the duplicated code serves different purposes or might evolve differently over time.

**Location:** [write-everything-twice-principle](./write-everything-twice-principle)

**Files:**
- [correct-implementation.js](./write-everything-twice-principle/correct-implementation.js) - Shows a proper implementation of WET using a user management system with separate validation for registration and profile updates
- [violation.js](./write-everything-twice-principle/violation.js) - Demonstrates a violation of WET with an overly abstract validation system that tries to avoid duplication but creates complexity

**Key Concept:**
The WET principle is violated when code uses excessive abstraction to avoid duplication (DRY), resulting in complex, hard-to-maintain systems. In the violation example, a user management system uses a single, overly configurable validator for all operations, leading to workarounds, hidden business logic, and reduced clarity. The correct implementation deliberately duplicates validation logic for registration and profile updates, allowing each validator to be tailored to its specific use case and evolve independently. This intentional duplication improves clarity, maintainability, and flexibility, demonstrating that sometimes writing code twice is better than forcing it into a single abstraction.

**When to Apply WET:** Only use when (1) code serves fundamentally different purposes, (2) pieces will evolve independently, (3) abstraction would be more complex than duplication, or (4) duplication is far cheaper than the wrong abstraction. Use sparingly—DRY remains the default.

### 15. Fail Fast Principle (FF)

The Fail Fast Principle suggests that a system should detect and report errors as early as possible rather than allowing them to propagate. This helps identify issues quickly, makes debugging easier, and prevents cascading failures.

**Location:** [fail-fast-principle](./fail-fast-principle)

**Files:**
- [correct-implementation.js](./fail-fast-principle/correct-implementation.js) - Shows a proper implementation of FF using a user registration system that validates inputs immediately and throws errors as soon as problems are detected
- [violation.js](./fail-fast-principle/violation.js) - Demonstrates a violation of FF with a system that delays validation, allows invalid data to propagate, and silently handles errors

**Key Concept:**
The Fail Fast principle is violated when a system delays validation, allows invalid data to propagate through the system, or silently handles errors without proper reporting. In the violation example, a user registration system processes data before validating it, collects errors instead of throwing them immediately, and allows processing to continue with invalid data, making it harder to trace the source of problems. The correct implementation validates all inputs immediately before proceeding, throws specific errors as soon as problems are detected, and prevents invalid data from propagating through the system, making debugging easier and preventing cascading failures.

### 16. Occam's Razor Principle (OR)

The Occam's Razor Principle states that "entities should not be multiplied without necessity" or more simply, "the simplest solution is usually the best one." In programming, this means choosing the simplest solution that meets the requirements, avoiding unnecessary complexity, and not adding features or abstractions unless they're needed.

**Location:** [occams-razor-principle](./occams-razor-principle)

**Files:**
- [correct-implementation.js](./occams-razor-principle/correct-implementation.js) - Shows a proper implementation of OR using a simple text formatter that uses the simplest approach for each task
- [violation.js](./occams-razor-principle/violation.js) - Demonstrates a violation of OR with an over-engineered text formatter that adds unnecessary complexity and abstractions

**Key Concept:**
The Occam's Razor principle is violated when solutions are made more complex than necessary, with unnecessary abstractions, features, or patterns that don't provide real benefits for the current requirements. In the violation example, a simple text formatter is over-engineered with class hierarchies, factory patterns, caching mechanisms, and analytics features that aren't needed. The correct implementation solves the same problem with a simple, straightforward approach that's easy to understand and maintain, demonstrating that the simplest solution that meets the requirements is usually the best one.

### 17. Separation of Concerns Principle (SoC)

The Separation of Concerns principle states that a program should be divided into distinct sections, where each section addresses a separate concern. A concern is a set of information that affects the code of a computer program. This principle improves maintainability, reusability, and testability by ensuring that different aspects of the application are independent of each other.

**Location:** [separation-of-concerns-principle](./separation-of-concerns-principle)

**Files:**
- [correct-implementation.js](./separation-of-concerns-principle/correct-implementation.js) - Shows a proper implementation of SoC using a user management system with clear separation between data model, data access, business logic, and presentation
- [violation.js](./separation-of-concerns-principle/violation.js) - Demonstrates a violation of SoC with a monolithic class that mixes multiple concerns together

**Key Concept:**
The Separation of Concerns principle is violated when different concerns (like data storage, business logic, and presentation) are mixed together in the same components. In the violation example, a monolithic UserManager class handles data structure, storage, business logic, presentation, and even email functionality, making the code difficult to understand, test, and maintain. The correct implementation separates these concerns into distinct classes (User, UserRepository, UserService, and UserView), each with a single responsibility, making the code more modular, easier to understand, and simpler to maintain.

### 18. High Cohesion and Low Coupling Principle (HCLC)

The High Cohesion and Low Coupling principle suggests that components should have high cohesion (focused on a single responsibility) and low coupling (minimal dependencies on other components). This creates more maintainable, reusable, and testable code by ensuring that components are well-focused and independent.

**Location:** [high-cohesion-low-coupling-principle](./high-cohesion-low-coupling-principle)

**Files:**
- [correct-implementation.js](./high-cohesion-low-coupling-principle/correct-implementation.js) - Shows a proper implementation of HCLC using an e-commerce order processing system with focused components and minimal dependencies
- [violation.js](./high-cohesion-low-coupling-principle/violation.js) - Demonstrates a violation of HCLC with a monolithic class that has low cohesion and high coupling

**Key Concept:**
The High Cohesion and Low Coupling principle is violated when components have multiple unrelated responsibilities (low cohesion) and tight dependencies on other components (high coupling). In the violation example, a monolithic ECommerceSystem class handles product management, shopping cart, customer management, order processing, payment processing, and notifications, making it difficult to understand, test, and maintain. The correct implementation separates these concerns into distinct classes (Product, ShoppingCart, OrderProcessor, PaymentService, NotificationService), each with a single responsibility and minimal dependencies, making the code more modular, easier to understand, and simpler to maintain.

### 19. Encapsulation Principle (E)

Encapsulation is the bundling of data and methods that operate on that data within a single unit (class), and restricting access to some of the object's components. It hides the internal state and requires all interaction to be performed through an object's methods.

**Location:** [encapsulation-principle](./encapsulation-principle)

**Files:**
- [correct-implementation.js](./encapsulation-principle/correct-implementation.js) - Shows a proper implementation of encapsulation using a BankAccount class with private fields and controlled access through methods
- [violation.js](./encapsulation-principle/violation.js) - Demonstrates a violation of encapsulation with a BankAccount class that exposes its internal state and lacks proper data protection

**Key Concept:**
The Encapsulation principle is violated when internal state is directly exposed and can be modified without any control or validation. In the violation example, a BankAccount class exposes all its properties publicly, allowing direct modification of the balance, manipulation of transaction history, and even replacement of methods, leading to data integrity issues and security vulnerabilities. The correct implementation uses private fields and methods (using the # syntax in JavaScript) and provides controlled access through public methods that include validation, ensuring data integrity and hiding implementation details from users of the class.

### 20. Abstraction Principle (A)

Abstraction is the concept of hiding complex implementation details and exposing only the necessary parts of an object. It allows us to model real-world entities by focusing on what an object does rather than how it does it.

**Location:** [abstraction-principle](./abstraction-principle)

**Files:**
- [correct-implementation.js](./abstraction-principle/correct-implementation.js) - Shows a proper implementation of abstraction using a MediaPlayer hierarchy that hides complex implementation details
- [violation.js](./abstraction-principle/violation.js) - Demonstrates a violation of abstraction by exposing too many implementation details and forcing clients to understand internal workings

**Key Concept:**
The Abstraction principle is violated when implementation details are exposed and clients are forced to understand the internal workings of an object. In the violation example, a MediaPlayer class exposes internal details like buffers, codecs, and decoder states, forcing clients to understand these details and follow a complex sequence of method calls. The correct implementation uses an abstract base class with a clear interface, hiding complex implementation details in concrete subclasses, and providing a factory to further abstract the creation process. This makes the code more maintainable, extensible, and easier to use, as clients can focus on what the object does rather than how it does it.

### 21. Modularity Principle (M)

Modularity is the practice of organizing code into separate, independent modules with clear interfaces. Each module should have a single responsibility and minimal dependencies on other modules.

**Location:** [modularity-principle](./modularity-principle)

**Files:**
- [correct-implementation.js](./modularity-principle/correct-implementation.js) - Shows a proper implementation of modularity using an e-commerce system with separate modules for products, cart, and orders
- [violation.js](./modularity-principle/violation.js) - Demonstrates a violation of modularity with a monolithic application that mixes all functionality together

**Key Concept:**
The Modularity principle is violated when code is not properly separated into independent modules with clear interfaces. In the violation example, an e-commerce application is implemented as a monolithic object with all functionality (products, cart, orders, UI) mixed together, leading to tight coupling, low cohesion, and difficulty in maintenance and testing. The correct implementation separates the application into distinct modules (ProductModule, CartModule, OrderModule), each with a single responsibility and well-defined interfaces, making the code more maintainable, reusable, and testable.

### 22. Design for Testability Principle (DfT)

Design for Testability is a software design principle that emphasizes creating code that can be easily and thoroughly tested. Systems should be built so they can be easily and reliably tested, which often means writing modular, loosely-coupled code and providing hooks for automated tests.

**Location:** [design-for-testability-principle](./design-for-testability-principle)

**Files:**
- [correct-implementation.js](./design-for-testability-principle/correct-implementation.js) - Shows a proper implementation of DfT using an authentication service with dependency injection and clear separation of concerns
- [violation.js](./design-for-testability-principle/violation.js) - Demonstrates a violation of DfT with a tightly coupled authentication service that is difficult to test

**Key Concept:**
The Design for Testability principle is violated when code is written in a way that makes it difficult or impossible to test in isolation. In the violation example, an authentication service has hard-coded dependencies, no separation of concerns, hidden side effects, and direct access to global state, making it nearly impossible to test specific behaviors without complex setup. The correct implementation uses dependency injection, clear separation of concerns, and well-defined interfaces to create a system that can be easily tested with mock objects, allowing for comprehensive unit tests that verify behavior in isolation.

### 23. Meaningful Naming Principle (MN)

The Meaningful Naming principle states that developers should use clear, descriptive names for variables, functions, classes, etc. Choosing good names significantly improves code readability and maintainability. Well-chosen identifiers act as documentation and reduce the mental overhead for anyone reading or modifying the code later.

**Location:** [meaningful-naming-principle](./meaningful-naming-principle)

**Files:**
- [correct-implementation.js](./meaningful-naming-principle/correct-implementation.js) - Shows a proper implementation of MN using a task management system with clear, descriptive names for classes, methods, and variables
- [violation.js](./meaningful-naming-principle/violation.js) - Demonstrates a violation of MN with cryptic, unclear, and inconsistent names that make the code difficult to understand

**Key Concept:**
The Meaningful Naming principle is violated when code uses unclear, cryptic, or inconsistent names that obscure the purpose and behavior of the code. In the violation example, a task management system uses abbreviated class names like 'TM' instead of 'Task', cryptic method names like 'mC' instead of 'markAsCompleted', and single-letter variable names that give no indication of their purpose. The correct implementation uses descriptive class names, intention-revealing method names, and consistent naming conventions, making the code self-documenting and easier to understand, maintain, and extend.

### 24. Exceptions Should Be Exceptional Principle (ESBE)

The Exceptions Should Be Exceptional principle states that exceptions should be used only for exceptional conditions and not for regular flow control. Exceptions are expensive operations in terms of performance and should be reserved for truly exceptional paths.

**Location:** [exceptions-should-be-exceptional-principle](./exceptions-should-be-exceptional-principle)

**Files:**
- [correct-implementation.js](./exceptions-should-be-exceptional-principle/correct-implementation.js) - Shows a proper implementation of ESBE using a user data processing system that uses conditional checks for expected scenarios and reserves exceptions for truly exceptional conditions
- [violation.js](./exceptions-should-be-exceptional-principle/violation.js) - Demonstrates a violation of ESBE by using exceptions for regular flow control instead of using normal control structures like conditionals

**Key Concept:**
The Exceptions Should Be Exceptional principle is violated when code uses exceptions for normal flow control, such as for expected conditions like missing parameters, user not found, or input validation. In the violation example, a user data processing system throws exceptions for normal, expected conditions and uses catch blocks for regular flow control, creating performance issues and obscuring the intent of the code. The correct implementation uses conditional checks for expected scenarios and reserves exceptions for truly unexpected errors, making the code more efficient, clearer in intent, and easier to maintain.

### 25. Command-Query Separation Principle (CQS)

The Command-Query Separation principle states that every method should be either a command that performs an action, or a query that returns data to the caller, but not both. Commands change state but don't return values, while queries return values but don't change state.

**Location:** [command-query-separation-principle](./command-query-separation-principle)

**Files:**
- [correct-implementation.js](./command-query-separation-principle/correct-implementation.js) - Shows a proper implementation of CQS using a bank account system with clear separation between commands and queries
- [violation.js](./command-query-separation-principle/violation.js) - Demonstrates a violation of CQS with methods that both change state and return values

**Key Concept:**
The Command-Query Separation principle is violated when methods both change state and return values, creating side effects that make code harder to understand, test, and maintain. In the violation example, a bank account implementation has methods that both modify the account state and return information about that state, leading to unpredictable behavior and making it difficult to reason about the code. The correct implementation clearly separates commands (deposit, withdraw) from queries (getBalance, getTransactionHistory), making the code more predictable, easier to test, and simpler to maintain.

### 26. Design by Contract Principle (DbC)

Design by Contract is a software design approach where components have formal, precise, and verifiable interface specifications in the form of preconditions, postconditions, and invariants. Preconditions specify what must be true before a method executes, postconditions specify what must be true after a method executes, and invariants specify what must remain true throughout the execution of a method.

**Location:** [design-by-contract-principle](./design-by-contract-principle)

**Files:**
- [correct-implementation.js](./design-by-contract-principle/correct-implementation.js) - Shows a proper implementation of DbC using a bank account system with explicit contracts for each method
- [violation.js](./design-by-contract-principle/violation.js) - Demonstrates a violation of DbC with missing or incomplete contracts and inconsistent error handling

**Key Concept:**
The Design by Contract principle is violated when code lacks explicit contracts, has incomplete precondition checks, fails to enforce postconditions, or doesn't maintain object invariants. In the violation example, a bank account implementation has missing or incomplete precondition checks, no postcondition verification, and allows the object to enter invalid states, leading to unpredictable behavior and data integrity issues. The correct implementation explicitly defines and enforces contracts for each method, with clear preconditions, postconditions, and invariants, making the code more reliable, self-documenting, and easier to debug when issues arise.

### 27. Single Level of Abstraction Principle (SLAP)

The Single Level of Abstraction Principle states that code within a method or function should be at the same level of abstraction. This means that high-level operations should not be mixed with low-level details in the same method. Each method should either contain high-level operations (calling other methods) or low-level operations (implementation details), but not both.

**Location:** [single-level-of-abstraction-principle](./single-level-of-abstraction-principle)

**Files:**
- [correct-implementation.js](./single-level-of-abstraction-principle/correct-implementation.js) - Shows a proper implementation of SLAP using a document processing system with clear separation between high-level and low-level operations
- [violation.js](./single-level-of-abstraction-principle/violation.js) - Demonstrates a violation of SLAP by mixing different levels of abstraction within the same methods

**Key Concept:**
The Single Level of Abstraction Principle is violated when methods mix high-level operations with low-level implementation details. In the violation example, methods combine orchestration with specific implementation details, making the code harder to read, understand, and maintain. The correct implementation separates high-level operations (that call other methods) from low-level operations (that implement specific tasks), creating a hierarchical structure that improves readability, maintainability, and testability. By following SLAP, the code becomes more coherent and reduces the cognitive load required to understand it.

### 28. Least Common Mechanism Principle (LCM)

The Least Common Mechanism Principle states that we should minimize the amount of functionality or mechanism that is shared between different parts of a system. Each component should have its own specialized mechanisms rather than relying on shared, general-purpose mechanisms.

**Location:** [least-common-mechanism-principle](./least-common-mechanism-principle)

**Files:**
- [correct-implementation.js](./least-common-mechanism-principle/correct-implementation.js) - Shows a proper implementation of LCM using a user management system with specialized mechanisms for different user types
- [violation.js](./least-common-mechanism-principle/violation.js) - Demonstrates a violation of LCM with a single, general-purpose mechanism shared across different user types

**Key Concept:**
The Least Common Mechanism Principle is violated when a system uses a single, general-purpose mechanism that is shared across different components or user types. In the violation example, a user management system implements a single User class with complex conditional logic to handle different user types (admin, regular, guest), leading to increased complexity, reduced security, and maintenance issues. The correct implementation provides specialized classes for each user type, each with its own tailored authentication mechanism and functionality, making the code more maintainable, secure, and easier to extend.

### 29. Idempotency Principle (I)

The Idempotency Principle states that an operation can be applied multiple times without changing the result beyond the initial application. In other words, if f(x) = f(f(x)), then f is idempotent. This is particularly important in distributed systems, APIs, and error recovery scenarios where operations might be repeated.

**Location:** [idempotency-principle](./idempotency-principle)

**Files:**
- [correct-implementation.js](./idempotency-principle/correct-implementation.js) - Shows a proper implementation of idempotent operations in a user profile management system
- [violation.js](./idempotency-principle/violation.js) - Demonstrates a violation of idempotency with operations that produce different results when called multiple times

**Key Concept:**
The Idempotency Principle is violated when operations produce different results when called multiple times with the same input. In the violation example, a user profile management system implements non-idempotent operations that change the result with each call, such as generating new IDs, accumulating values, toggling states, and adding duplicate entries. This leads to unpredictable behavior when operations are retried, potential data corruption, and difficulties in error handling. The correct implementation ensures that operations can be safely repeated without unintended side effects, making the system more reliable, especially in distributed environments where network failures might cause operations to be retried.

### 30. Graceful Degradation Principle (GD)

The Graceful Degradation Principle states that systems should continue to provide core functionality even when non-critical components fail, rather than completely breaking. This principle emphasizes distinguishing between essential and optional features, implementing fallback mechanisms, and ensuring that the failure of enhancement features doesn't prevent access to basic functionality.

**Contrast with Fail-Fast:**
While "fail-fast" systems immediately stop on error to prevent data corruption, "graceful degradation" prioritizes maintaining partial functionality for end users. The focus of graceful degradation is user perception: ensuring that even in partial failure, the system feels responsive and trustworthy, supporting business continuity by keeping core services operational.

**Location:** [graceful-degradation-principle](./graceful-degradation-principle)

**Files:**
- [correct-implementation.js](./graceful-degradation-principle/correct-implementation.js) - Shows a proper implementation of graceful degradation using an e-commerce system that continues working even when analytics, cache, or recommendation services fail
- [violation.js](./graceful-degradation-principle/violation.js) - Demonstrates a violation of graceful degradation where the system completely fails when any dependency is unavailable

**Key Concept:**
A system violates this principle when all dependencies are treated as critical, causing complete failure when any component goes down. Proper design isolates optional features (e.g., analytics, caching, recommendations), allowing core operations to continue through controlled fallbacks. In the violation example, an e-commerce system fails entirely when any service is unavailable, even though core product data remains accessible. The correct implementation wraps non-critical operations in try-catch blocks with appropriate fallbacks, ensuring users can access essential functionality while optional services degrade gracefully. This approach improves system resilience, enhances user experience during partial outages, and maintains business continuity in real-world conditions where dependencies may be temporarily unavailable. Implementing graceful degradation is not just a coding pattern—it's a mindset of building software that respects real-world imperfection.

### 31. Observability-First Principle (OFP)

Definition:
Design software so that its internal behavior can be accurately understood from its external signals—logs, metrics, and traces—at any time and under any conditions.

Description:
Observability-First means treating introspection as a first-class design goal, not an afterthought. Every component should emit structured, contextual, and consistent telemetry:
- Logs should use structured formats (JSON preferred) with correlation or trace IDs propagated end-to-end.
- Metrics should expose operation timings, success/failure counts, and key resource indicators. Where feasible, instrument SLIs/SLOs to make reliability goals explicit and measurable.
- Traces should link events across services to reveal causal chains and performance bottlenecks.
Together, these enable developers and operators to answer not only “what happened?” but “why did it happen?”—even without direct code access.

Implementing OFP improves diagnosability, accelerates incident resolution (reducing MTTR), and allows scalable, resilient operations with confidence.

**Location:** [observability-first-principle](./observability-first-principle)

**Files:**
- [correct-implementation.js](./observability-first-principle/correct-implementation.js) - Demonstrates OFP with structured JSON logs, correlation ID propagation, normalized error codes, and simple metrics/timers across services
- [violation.js](./observability-first-principle/violation.js) - Shows a lack of observability with ad-hoc console logs, no correlation IDs, vague errors, and no metrics

**Key Concept:**
The principle is violated when:
- Logs are ad-hoc, unstructured, or lack contextual identifiers.
- Errors are generic or swallowed.
- Metrics are absent or inconsistent across services.
- Correlation/trace propagation is missing—making incidents opaque and unreproducible.

The principle is upheld when:
- Every operation emits structured, context-rich events with stable schemas.
- Errors carry diagnostic codes and actionable context.
- Correlation/trace IDs are propagated across boundaries.
- Metrics expose key performance and reliability signals.
- Observability is verified as part of CI/CD and operational readiness.
- Observability is part of the system’s design contract—software isn’t “done” unless it can explain itself.

By avoiding unstructured logs and missing correlation IDs, teams prevent real-world pain during multi-service debugging under pressure—issues that can otherwise multiply MTTR by hours.


### 32. Backpressure-First Principle (BFP)

Definition:
Safeguard stability before maximizing throughput: design software so it never accepts more work than it can safely complete. Apply backpressure at every boundary using bounded buffers, rate limits, maximum concurrency, timeouts, and use explicit shedding only as a last resort—so overload is controlled and visible instead of hidden in unbounded queues.

Description:
Backpressure-First is a mindset, not just a bag of mechanisms. Shift the default from “optimize throughput” to “protect stability.” Like a dam controlling water flow, release only what downstream can safely handle and let the rest wait or spill in a controlled, intentional way.

To practice this, components should:
- Bound all queues and caches. If a buffer is full, fail fast with a clear, actionable signal.
- Limit ingress using rate limiting or admission control (e.g., token bucket, leaky bucket).
- Cap concurrency to protect critical resources (thread pools, DB connections).
- Use timeouts and cancellation to prevent long-tail latencies from starving the system.
- Propagate overload signals upstream (429/503-like responses) so callers can retry, back off, or degrade.

Backpressure vs. Shedding:
- Backpressure asks producers to slow down (queue limits, 429 with Retry-After, windowed quotas, connection-level flow control).
- Shedding drops work that cannot be safely accepted (503, dropping lowest-priority or non-critical tasks).
- Preferred order: try backpressure first; when callers can’t or won’t slow down, shed explicitly and predictably. A simple decision rule: “If queue is full or tokens exhausted, reject quickly with a clear signal.”

Team practices (organizational alignment):
- Define SLOs and capacity envelopes; protect error budgets under load.
- Load test regularly (burst and soak) to validate limits, timeouts, and shedding paths.
- Make overload explicit in APIs/contracts: return 429/503 with machine-parseable bodies and Retry-After; document client backoff expectations.
- Tier traffic and features: deprioritize or degrade non-critical work first; keep core paths fast.
- Maintain runbooks and circuit-breaker policies so operators know when to tighten limits or shed more aggressively.

Observability tie-in:
Backpressure works only if signals are visible and acted upon. Instrument and dashboard:
- Queue depth, token bucket levels, active concurrency, wait times, and timeout counts.
- Overload responses by type (429 vs 503) and drop reasons.
- Tail-latency percentiles for protected resources.
- Trace annotations when requests are throttled, queued, or shed.
See also: 33. Observability-First Principle (OFP) for telemetry practices that make these signals reliable.

**Location:** [backpressure-first-principle](./backpressure-first-principle)

**Files:**
- [correct-implementation.js](./backpressure-first-principle/correct-implementation.js) - Shows proper backpressure with a bounded queue, token-bucket ingress limiter, max concurrency, timeouts, and explicit load shedding
- [violation.js](./backpressure-first-principle/violation.js) - Demonstrates unbounded buffering and uncontrolled concurrency leading to memory growth and collapse under load

**Key Concept:**
The principle is violated when a system accepts work unconditionally, buffers it in unbounded queues, spawns unlimited asynchronous tasks, and omits timeouts—causing memory bloat, long-tail latency, and cascading failure when load spikes. The correct implementation applies backpressure at the ingress (rate limiting), within the service (bounded queues, capped concurrency), and at the egress (timeouts and cancellation). Prefer backpressure first (slow callers with clear signals), then explicit shedding when necessary, and make both observable (metrics, logs, traces) so callers and operators can react. This makes services more scalable, robust, maintainable, and easier to operate in real-world conditions where load is bursty and failures happen.

### 33. Boundary Defense Principle (BDP)

Definition:
Treat every interface between subsystems as a trust boundary—whether external (user input, APIs, files) or internal (microservices, modules, layers). All data crossing any boundary must be validated, sanitized, and normalized at the point of crossing, with each component treating incoming data as untrusted regardless of its source.

Description:
The Boundary Defense Principle embodies zero-trust architecture thinking: no component assumes data from another is safe, well-formed, or authorized. Boundaries exist not just at the system edge but between every subsystem—microservices communicating via message queues, modules exchanging objects, or layers reading from databases. Each boundary is a potential attack vector or corruption point. By validating at every interface, systems achieve defense-in-depth: a breach or bug in one component doesn't cascade throughout the architecture.

Key practices (organized by concern):

**Validation** (Ensure correctness):
- Check types, ranges, formats, and business invariants explicitly at every boundary
- Validate even "trusted" sources—databases can be corrupted, internal services can be compromised
- Fail explicitly when validation fails (reject rather than silently "fix")

**Sanitization** (Neutralize dangers):
- Remove or escape characters that enable injection attacks (SQL, command, XSS, prototype pollution)
- Use parameterized queries and prepared statements for all database operations
- Apply context-appropriate encoding (HTML escaping for web output, shell escaping for commands)

**Normalization** (Align representation):
- Convert external formats to consistent internal representations (trim whitespace, normalize case, standardize date/number formats)
- Canonicalize paths, URLs, and identifiers to prevent bypasses via alternate encodings

**Cross-cutting defensive patterns**:
- Never trust client-provided permissions—derive roles/permissions server-side from authenticated identity
- Distinguish error feedback: descriptive for developers (internal logs), generic for external consumers (prevent reconnaissance)
- Log validation failures securely for investigation without exposing system internals

Progressive hardening:
Rather than "defense in depth" as static layers, think of **progressive hardening**—each layer re-validates assumptions and narrows trust further:
- **API layer**: Validates HTTP structure, authentication, authorization
- **Service layer**: Re-validates message/event payloads even from internal services (zero-trust within the system)
- **Data layer**: Validates integrity of data read from stores, catching corruption or schema drift
- **Command layer**: Final validation before irreversible operations (payments, file deletion, privilege changes)

Data can be corrupted in transit, at rest, or between components. Validation shouldn't happen "once at the edge"—each boundary reasserts invariants independently.

Tradeoffs and practical considerations:

**Performance overhead**:
Re-validating at every layer has a cost—parsing, type checking, and sanitization consume CPU and increase latency. For high-throughput or latency-critical paths, consider:
- Validate exhaustively at the system edge (user-facing APIs), then use strong typing and internal contracts for trusted internal components
- Cache validation results when processing the same data multiple times
- Profile hot paths and optimize validation logic (e.g., compiled regex, lookup tables)
- Accept the overhead for security-critical operations (authentication, payments, privilege changes) but potentially relax for read-only, non-sensitive queries

Rule of thumb: The closer to untrusted sources and the more security-sensitive the operation, the more validation overhead is justified.

**Development velocity**:
Strict validation everywhere can slow initial development—every new field, every new service requires validation code. Pragmatic approaches:
- Use schema validation libraries (Joi, Zod, JSON Schema) to generate validators from type definitions
- Build reusable validation utilities for common patterns (email, phone, currency)
- Track "validation debt" like technical debt—mark areas where validation is deferred for prototyping but must be hardened before production
- Enforce validation in CI/CD: fail builds if public APIs lack input validation tests

The upfront cost pays dividends: validation-first design catches bugs early and prevents emergency security patches later.

**False positives and over-validation**:
Overly strict validation can reject legitimate edge cases, frustrating users and reducing system utility. Balance strictness with usability:
- Monitor rejection rates and reasons—high rejection rates may indicate rules that are too strict or poorly communicated
- Version validation rules explicitly, allowing gradual tightening without breaking existing clients
- Provide clear, actionable error messages so users understand why input was rejected and how to fix it
- Distinguish between "hard" invariants (type safety, injection prevention) and "soft" business rules (string length limits)—be strict on security, pragmatic on convenience

Example: An email validator that rejects rare-but-valid RFC-compliant addresses (like `"name with spaces"@example.com`) is overly strict. Validate format loosely, sanitize strictly.

**Contextual validation**:
What counts as "valid" often depends on context—a product ID valid in one microservice may be invalid in another. Make validation rules explicit and context-aware:
- Define validation schemas per API/service, not globally—different boundaries have different invariants
- Document assumptions: "This service accepts ISO-8601 timestamps in UTC only"
- Use type systems to encode context: `EmailAddress`, `SanitizedHTML`, `UnvalidatedUserInput` as distinct types
- When validation rules change (new field, stricter format), version APIs and provide migration paths

**When to relax validation** (carefully):
In some internal, tightly-coupled systems where components are deployed atomically and share a type system, you might validate once and trust internal boundaries:
- Monolithic applications with strong typing (TypeScript, Rust) can validate at public APIs and rely on type safety internally
- Batch processing pipelines that validate on ingestion can skip re-validation at each stage if data is immutable
- Internal admin tools operating on validated data stores may trust database constraints

However, even these cases benefit from assertions to catch bugs. Relaxing validation is an optimization—measure before optimizing, and never relax validation on external-facing or security-critical boundaries.

Contrast with related principles:
- **Design by Contract**: DbC assumes parties honor contracts within trusted code boundaries. Boundary Defense assumes no boundary is truly trusted—contracts must be enforced, not assumed.
- **Fail Fast**: Broader principle about catching errors early anywhere. Boundary Defense is a specific application: catch invalid data at interfaces before it propagates.
- **Postel's Robustness Principle**: "Be liberal in what you accept, conservative in what you send." Boundary Defense **deliberately reverses** this for security-critical paths—favoring strict validation over interoperability tolerance. The tradeoff: Postel optimizes for flexibility and resilience against benign variance; Boundary Defense optimizes against malicious or corrupted input. In modern security contexts, precision trumps permissiveness.

**Location:** [boundary-defense-principle](./boundary-defense-principle)

**Files:**
- [correct-implementation.js](./boundary-defense-principle/correct-implementation.js) - Shows proper validation, sanitization, and normalization at every system boundary (API, database, external services, files, messages)
- [violation.js](./boundary-defense-principle/violation.js) - Demonstrates vulnerabilities when data is trusted across boundaries: SQL injection, command injection, XSS, prototype pollution, privilege escalation, and data corruption

**Key Concept:**
Violation: Trusting data across boundaries without validation enables injection attacks (SQL, command, XSS), prototype pollution, privilege escalation, and data corruption. The violation example accepts raw input directly, allowing malicious payloads to compromise the system.

Correct: Every boundary (API, database, file, service-to-service) validates types/ranges/formats, sanitizes dangerous characters, normalizes representations, and derives security-sensitive fields server-side. Progressive hardening means each layer re-validates independently—one breach doesn't cascade. This zero-trust approach prevents attacks, ensures data integrity, and makes systems resilient to both malicious actors and buggy components.

### 34. Virtuous Intolerance Principle (VIP)

Definition:
Maintain zero-indifference toward code quality issues, warnings, deprecated APIs, technical debt, and deviations from established standards. Through disciplined intolerance—consistent small acts of care and cleanup—prevent quality erosion from the start and create systems that resist entropy.

Description:
The Virtuous Intolerance Principle embodies continuous integrity rather than punishing imperfection. It's about respecting the system and one another through sustained discipline: addressing warnings promptly, replacing deprecated patterns proactively, and treating quality issues with the care they deserve. This principle prevents the gradual decay of codebases that occurs when teams adopt a "we'll fix it later" mentality. Like maintaining a clean workspace, it's easier to sustain high standards through daily practice than to recover from years of accumulated neglect.

**Psychological Safety Note:**
This principle targets **code, not coders**. The goal is not to shame individuals who introduce issues, but to create a system so clean that mistakes are easy to see, easy to fix, and rarely repeated. Disciplined intolerance means being unyielding toward problematic patterns while remaining compassionate and supportive toward people. Everyone writes imperfect code—virtuous systems make imperfection visible and correction effortless.

**Defining "Quality Issues" — Three Tiers:**

To prevent overburdening developers with non-critical blockers, categorize quality issues by severity and response:

**Tier 1 — Critical Integrity Issues (Never Tolerated)**:
- Security vulnerabilities and injection risks
- Failing tests or broken builds
- Deprecated APIs with known security or correctness flaws
- Memory leaks, race conditions, undefined behavior
- **Response**: Block merges immediately; fix before proceeding

**Tier 2 — Code Hygiene Issues (Resolved Promptly)**:
- Compiler/linter warnings
- Unused variables, imports, or dead code
- Magic numbers without named constants
- TODO/FIXME comments without tracked issues
- **Response**: Auto-fix where possible; address within current PR or next sprint; trend toward zero

**Tier 3 — Stylistic Divergences (Automated)**:
- Formatting inconsistencies (indentation, line breaks)
- Naming convention deviations
- Import ordering, whitespace rules
- **Response**: Enforce via automated formatters (Prettier, Black, gofmt); no manual intervention needed

This tiered approach focuses human attention on integrity and hygiene while letting tooling handle style, preventing "missing semicolon blocks hotfix" scenarios.

Key practices:

**Disciplined Quality Enforcement**:
- Apply consistent standards across the codebase—no "legacy exemptions" that become permanent
- Address Tier 1 issues immediately and unconditionally
- Resolve Tier 2 issues promptly; make them visible so they can't be ignored
- Automate Tier 3 enforcement completely, removing it from code review discussions

**Continuous Integrity Through Small Acts**:
- Fix issues immediately rather than deferring—small fixes now prevent large refactorings later
- Leave code cleaner than you found it (the "boy scout rule")
- Replace deprecated patterns proactively as you encounter them
- Prefer incremental cleanup over allowing entropy to accumulate

**Cultural Commitment**:
- Celebrate clean, maintainable code as a core team value
- Educate team members on why standards matter, not just what they are
- View quality enforcement as an act of respect for future maintainers (including future you)
- Distinguish consistency (matters) from personal preference (doesn't)

**Ratcheting Approach for Legacy Systems**:

Inheriting a messy codebase doesn't mean accepting permanent mess. Use a **ratcheting strategy** to improve incrementally without overwhelming the team:

1. **Define a Clean Baseline**: Establish that no *new* issues are added (e.g., "zero new warnings")
   - Configure linters to baseline existing issues, fail only on new violations
   - Track issue count trending downward, not demanding instant perfection

2. **Fix Opportunistically**: As code is touched for features or bugs, clean surrounding areas
   - If modifying a function, fix its warnings and nearby dead code
   - Apply "touch it, clean it" as a norm—no separate "cleanup sprints" needed

3. **Tighten Standards Over Time**: Gradually raise the bar as debt decreases
   - Start lenient (block critical issues only), then add hygiene rules as baseline improves
   - Celebrate milestones: "First module with zero warnings," "Deprecated API fully removed"

4. **Avoid Big-Bang Rewrites**: Large upfront cleanup costs are rarely justified
   - Spread improvements across regular development cycles
   - Fix high-traffic or high-risk areas first for maximum impact

This approach aligns with continuous improvement, avoids disrupting delivery, and still reaches pristine standards—just incrementally.

**Making Quality Observable — Metrics and Measurement**:

Virtuous intolerance works best when progress is visible and celebrated. Track these metrics to prove value and reinforce the feedback loop:

- **Compiler/linter warning count**: Should trend toward zero; alert if increasing
- **Static analysis issue count**: Track by severity; measure reduction over time
- **TODO/FIXME ratio**: Closed vs. added; goal is net-negative (closing more than adding)
- **Mean time to fix warnings**: How quickly issues are addressed after introduction
- **Build health score**: Percentage of builds passing all quality gates without overrides
- **Deprecation lag**: Time between API deprecation and removal from codebase
- **Code coverage trend**: If tests are part of hygiene, track coverage as a health signal

Dashboard these metrics; make them visible to the team. When warning counts drop from 200 to 20 to 0, that's a victory worth celebrating. Measurement turns abstract discipline into concrete progress.

Contrast with indifferent approaches:
Systems that tolerate quality issues ("it's just a warning," "we'll fix it later," "it works for now") experience gradual degradation:
- Technical debt accumulates exponentially as each tolerated issue makes the next easier to accept
- Important warnings get lost in noise, causing real bugs to go unnoticed
- Standards erode as new developers copy existing patterns, including bad ones
- Eventually requires expensive rewrites instead of continuous improvement
- Team velocity decreases as developers navigate around accumulated issues

The "broken windows theory" applies to code: visible neglect (tolerated warnings, outdated patterns, ignored TODOs) encourages more neglect. Conversely, maintaining pristine standards creates positive momentum where quality begets quality—excellence becomes the path of least resistance.

Practical considerations:

**Balancing Discipline with Pragmatism**:
- Focus intolerance on issues that degrade maintainability, security, or correctness (Tiers 1-2)
- Automate style enforcement completely (Tier 3) so it's not a cognitive burden
- Apply strict standards for long-lived production code; may relax for throwaway prototypes (but never merge to main)
- Distinguish between objective quality issues (unused code, deprecated APIs) and subjective preferences (tabs vs. spaces)

**Avoiding False Positives**:
- Configure tools carefully to avoid overly strict rules that block legitimate patterns
- Provide escape hatches for rare, well-justified exceptions (with required explanations)
- Review and update standards as languages and best practices evolve
- Balance tool strictness with team productivity—aim for helpful, not obstructive

**When to Apply**:
- All production codebases that will be maintained over time
- Shared libraries and frameworks where quality directly impacts consumers
- Codebases with multiple contributors where standards prevent divergence
- Systems where bugs are expensive (financial, healthcare, safety-critical)

**When to Relax (Carefully)**:
- Throwaway prototypes or spikes (but mark clearly as experimental and don't merge)
- Emergency hotfixes under active incident (but immediately follow up with proper fixes and review)
- Experiments in isolated branches (but clean before merging or discard)
- Never relax for convenience or deadline pressure—that's how entropy wins

Relationship to other principles (synergy):

- **Fail Fast (FF)**: VIP extends FF to development time—detect quality issues at authoring/build, not runtime. Both emphasize early detection; FF catches logic errors, VIP catches process/standards violations.

- **Boundary Defense (BDP)**: VIP enforces quality at the code level (linting, deprecation, hygiene); BDP enforces trust boundaries at runtime (validation, sanitization). Together they create defense-in-depth: clean code *and* safe execution.

- **Observability-First (OFP)**: VIP can be *observed*—track warning counts, TODO ratios, build health. OFP patterns (metrics, dashboards) make VIP tangible and measurable, enabling data-driven quality improvement.

- **Backpressure-First (BFP)**: Apply backpressure to processes—don't accept low-quality PRs beyond system capacity. If code review bandwidth is limited, hold PRs with hygiene issues until cleaned, preventing quality overload.

- **Design by Contract (DbC)**: Both enforce invariants; DbC does so at runtime via preconditions/postconditions, VIP does so at build time via linting and standards. DbC guards correctness, VIP guards maintainability.

- **Meaningful Naming (MN)**: VIP ensures naming standards are enforced automatically, not just recommended. Without VIP, MN remains aspiration; with VIP, MN becomes practice.

This synergy shows VIP as a force multiplier—it doesn't replace other principles but enables their consistent application.

**Location:** [virtuous-intolerance-principle](./virtuous-intolerance-principle)

**Files:**
- [correct-implementation.js](./virtuous-intolerance-principle/correct-implementation.js) - Shows disciplined quality enforcement with a build system that treats warnings as errors, blocks on deprecated code, prevents technical debt accumulation, and includes auto-fix capabilities for immediate issue resolution
- [violation.js](./virtuous-intolerance-principle/violation.js) - Demonstrates indifferent validation that tolerates warnings, ignores deprecated patterns, suppresses issues instead of fixing them, and tracks the gradual degradation from 5 warnings to 500+ over time

**Key Concept:**
Violation: Indifference toward quality issues ("it's just a warning," "we'll fix it later") leads to exponential technical debt accumulation, degraded standards, hidden bugs, and eventual unmaintainability. The violation example shows a lenient build system that passes builds despite warnings, suppresses issues instead of addressing them, and accumulates debt over time—mirroring the real-world descent from "5 warnings we'll fix next sprint" to "500+ warnings nobody looks at anymore." This illustrates entropy in action: each tolerated issue makes the next easier to tolerate until quality consciousness erodes completely.

Correct: Disciplined intolerance—consistently addressing quality issues through small, immediate acts—prevents degradation from the start. The correct implementation applies a three-tier approach: blocks critical integrity issues immediately (security, failing tests), resolves hygiene issues promptly (warnings, unused code), and automates style enforcement completely. It uses metrics to make quality visible (warning trends, TODO ratios, build health scores) and applies a ratcheting strategy for legacy systems (no new issues, fix opportunistically, tighten over time). This approach maintains pristine code quality continuously rather than requiring expensive cleanup later, embodying continuous integrity over punitive perfectionism. The principle recognizes that sustaining high standards through daily discipline is easier than recovering from years of neglect—preventing the "broken windows" effect where visible neglect encourages more neglect. By practicing virtuous intolerance toward code (not coders), teams build codebases that remain maintainable, secure, and pleasant to work with over their entire lifetime.

### 35. Explicit Dependencies Principle (EDP)

Definition:
Every dependency a component requires must be explicitly declared and provided at the point of use. Components should never reach out to obtain their own dependencies through global state, ambient context, service locators, or implicit environment coupling—except for controlled, cross-cutting concerns where explicitness provides diminishing returns.

Description:
The Explicit Dependencies Principle makes the "what does this need to work?" question answerable by looking at a component's interface alone. When dependencies are explicit, code becomes self-documenting, testable in isolation, and safe to refactor. When dependencies are hidden, components appear simpler than they are—until they fail mysteriously in tests, break during refactoring, or behave differently across environments.

**Core practices:**

**Constructor/Parameter Injection:**
- Pass all *structural* dependencies through constructors or function parameters
- A function's signature should reveal everything it needs to operate
- If you can't construct a component without external setup, dependencies are hidden

**No Global State Access:**
- Avoid `global`, module-level mutable state, or ambient singletons for business logic
- Environment variables, configuration, and current time are dependencies—inject them where testability matters
- Database connections, HTTP clients, and external services must be passed in

**No Service Locators in Business Logic:**
- Avoid "ask the container for X" patterns inside domain/business code
- Service locators hide dependencies behind a single, opaque dependency
- Composition roots should wire dependencies; components should receive them

**The Honesty Test:**
A component passes the honesty test if: (1) its constructor/parameters fully describe what it needs, (2) it can be instantiated and tested with only those declared dependencies, (3) it makes no calls to obtain additional dependencies at runtime, and (4) it doesn't retain unused dependencies from past refactors.

**Dependency Weight—Not All Dependencies Are Equal:**

Apply EDP rigor proportionally:

*Heavy Dependencies (Always Explicit):*
- Database repositories and connections
- External service clients (HTTP, gRPC, message queues)
- Business service interfaces
- Payment processors, third-party integrations

*Medium Dependencies (Usually Explicit):*
- Configuration objects
- Clock/time providers (when time-sensitive logic needs testing)
- ID generators (when determinism matters for tests)

*Lightweight Cross-Cutting Concerns (Pragmatic Flexibility):*
- Loggers and metrics collectors
- Distributed tracing context

For lightweight concerns, strict injection everywhere can create noise without proportional benefit. Consider controlled ambient patterns for these.

**When to Group Dependencies:**

Parameter explosion is a code smell—but EDP doesn't cause it; EDP *exposes* it. A constructor with 15 parameters indicates a component with too many responsibilities.

However, grouping is appropriate when:
- Dependencies are *cohesive* (represent a single concept)
- The group is *immutable* (no hidden mutation)
- Grouping *reduces noise* without hiding important information

Example: Group `taxRate`, `cacheTtlMs`, and `maxItemsPerOrder` into an immutable `OrderConfig` object.

**Tradeoffs and practical considerations:**

*Verbosity vs. Clarity:*
Explicit dependencies mean more parameters, longer constructors, and more wiring code. This is a feature, not a bug—it makes complexity visible. If a component has 10 dependencies, that's important information.

*Composition Roots:*
All the wiring has to happen somewhere. Designate clear "composition roots" (application entry points, request handlers) where dependencies are assembled. Keep business logic free of assembly concerns.

*Legacy Migration:*
Transitioning from hidden to explicit dependencies can be done incrementally:
1. Identify components with hidden dependencies (they're hard to test)
2. Add explicit parameters alongside existing hidden access
3. Update callers to pass dependencies explicitly
4. Remove hidden dependency access once all callers are updated

*Design Smells Exposed by EDP:*
- Low cohesion (too many dependencies) → Split into smaller components
- Same dependencies everywhere → Missing abstraction or infrastructure pattern
- Dependency only used in one method → Method may belong elsewhere
- Unused dependencies after refactor → Remove them (dependency drift)

**Contrast with related principles:**

- **Dependency Inversion (DIP)**: DIP says *what* to depend on (abstractions, not concretions). EDP says *how* to receive dependencies (explicitly, not implicitly). You can follow DIP while violating EDP.
- **Design for Testability (DfT)**: EDP is arguably the single most impactful practice for testability. Explicit dependencies can be replaced with test doubles trivially.
- **High Cohesion/Low Coupling (HCLC)**: EDP makes coupling *visible*. A component with many explicit dependencies has high coupling—now you can see it and address it.

**Location:** [explicit-dependencies-principle](./explicit-dependencies-principle)

**Files:**
- [correct-implementation.js](./explicit-dependencies-principle/correct-implementation.js) - Shows proper explicit dependencies with constructor injection, dependency interfaces, composition roots, grouped configuration, deterministic time/IDs, and comprehensive test doubles enabling trivial unit testing
- [violation.js](./explicit-dependencies-principle/violation.js) - Demonstrates hidden dependencies through global state, singletons, service locators, environment coupling, and implicit time/randomness—making code untestable, non-deterministic, and dangerous to refactor

**Key Concept:**
Violation: Hidden dependencies through global state, singletons, service locators, and implicit environment access make code appear simple while hiding massive complexity. The violation example's `OrderService` constructor takes no parameters but secretly depends on a database singleton, global cache, service locator, environment variables, current time, and random number generation—making it impossible to test deterministically and dangerous to refactor. Tests require complex mocking frameworks, suffer from global state pollution, and behave differently across environments.

Correct: Explicit dependencies declared in constructors and parameters make code honest about its requirements. The correct implementation's constructor clearly states all dependencies (repositories, services, config, infrastructure context). Tests easily substitute fake implementations—time and IDs are deterministic, interactions are verifiable, and no global state pollution occurs. The composition root centralizes wiring while keeping business logic clean. Apply EDP rigor proportionally: heavy business dependencies always explicit, lightweight cross-cutting concerns may use controlled ambient patterns. When EDP reveals parameter explosion, address the underlying cohesion problem. This approach enables true unit testing, safe refactoring, and clear understanding of component requirements—fundamental enablers for scalable, robust, maintainable, high-quality software.

### 36. Locality of Behavior Principle (LoBP)

Definition:
Design systems so that understanding "what happens when X" requires minimal navigational distance within well-defined boundaries. Optimize for traceability and cognitive proximity—the ability to follow cause to effect through a clear, explicit path—not for minimal file count or maximal colocation.

Description:
As systems grow, behavior naturally fragments across files through abstraction layers, event handlers, decorators, middleware, interceptors, and framework conventions. While separation of concerns and abstraction have their place, taken too far they create "action at a distance"—understanding a simple button click requires tracing through controllers, services, event buses, listeners, aspect-oriented interceptors, and framework magic scattered across dozens of files.

The Locality of Behavior Principle pushes back: optimize for comprehension. When a developer asks "what happens when a user places an order?", they should be able to follow a clear, traceable path—not grep through the entire codebase hoping to find all the pieces. Code is read far more often than it's written, and debugging scattered behavior is one of the most time-consuming activities in software maintenance.

**Critical constraint:** Locality applies within well-defined boundaries—a module, bounded context, or feature. LoBP is not permission to collapse domain boundaries or create god objects. Think of locality as reducing navigational distance within a neighborhood, not eliminating neighborhoods entirely.

**The Locality Gradient:**

Rather than binary "local vs scattered," think in terms of a spectrum:

| Level | Characteristics | When Appropriate |
|-------|-----------------|------------------|
| **High Locality** | Direct call chains, explicit orchestration, behavior visible at call site | Core business flows, frequently-debugged code, onboarding-critical paths |
| **Medium Locality** | Clear indirection with visible registries, documented extension points | Plugin systems, well-bounded cross-cutting concerns, stable abstractions |
| **Low Locality** | Implicit framework-driven behavior, convention-based discovery, unbounded event fan-out | Infrastructure internals, genuinely generic frameworks (use sparingly) |

Key practices:

**Colocate by Feature, Not Layer:**
- Group code by business capability rather than technical layer
- Keep handlers, validation, and business logic for a feature together
- Prefer feature folders (`/orders/`, `/users/`) over layer folders (`/controllers/`, `/services/`)

**Minimize Indirection Layers:**
- Each layer of abstraction should provide proportional value
- Question whether generic base classes and factories earn their cognitive cost
- Direct code is often clearer than clever architecture

**Explicit Over Implicit:**
- Prefer explicit code paths over framework magic (auto-wiring, annotation processing, convention-based routing)
- Make dependencies and side effects visible at the call site
- When behavior is triggered implicitly, document it prominently

**Trace-Friendly Design:**
- A developer should be able to trace from user action to database write through a clear path
- Avoid deep event chains where A triggers B triggers C triggers D for core flows
- When indirection is necessary, maintain visible registries and documentation

**Events: A Nuanced View:**

Events are powerful tools that trade locality for decoupling. Distinguish event types by their impact:

- **Control-flow events** (event triggers next business step): Severely damages locality—avoid for core business flows; prefer explicit orchestration
- **Notification events** (event publishes completed fact): Moderate impact—acceptable for cross-boundary communication; keep handlers discoverable
- **Integration events** (event crosses bounded contexts): Expected indirection—appropriate for decoupling domains; document contracts clearly

Rule of thumb: Events are most damaging to locality when they control core business flow rather than publish completed facts.

**Acceptable vs Dangerous Duplication:**

LoBP exists in tension with DRY, but not all duplication is equal:

- **Orchestration and flow** (how steps are sequenced): Low risk—often acceptable; flows may evolve independently
- **Business rules and policies**: High risk—dangerous; divergence causes bugs; centralize
- **Security checks and authorization**: Critical risk—never duplicate; single source of truth required

The duplication test: Ask "if this logic changes, must it change everywhere?" If yes, centralize it.

**Test Strategy Alignment:**

Tests should follow locality:
- Feature tests should live near the code that implements the feature
- When locality is high, fewer mocks are needed—the real collaborators are right there
- If testing requires mocking 15 scattered dependencies, locality has degraded

**The Comprehension Test:**

A codebase exhibits healthy locality if:
1. A new developer can answer "what happens when X?" by following a clear path through a reasonable number of files (~5 as a warning signal, not a hard rule)
2. A stack trace from production maps clearly to business logic
3. Adding a feature doesn't require touching files across many unrelated directories
4. Core business flows can be traced without framework expertise

**Common Misapplications:**

| Misapplication | Why It's Wrong |
|----------------|----------------|
| **Feature blobs** (3000-line files) | Locality is about traceability, not cramming everything together |
| **God objects** | Violates encapsulation and single responsibility |
| **Collapsing domain boundaries** | Destroys domain isolation; creates coupling nightmares |
| **Duplicating invariants** | Creates correctness bugs when logic diverges |

Contrast with related principles:

| Principle | Relationship to LoBP |
|-----------|---------------------|
| **Separation of Concerns** | SoC defines boundaries; LoBP optimizes within them |
| **High Cohesion** | Cohesion is about focus; locality is about navigational proximity |
| **DRY** | LoBP may accept orchestration duplication; never duplicate invariants |
| **Single Level of Abstraction** | SLAP is about vertical consistency; LoBP is about horizontal traceability |

**Location:** [locality-of-behavior-principle](./locality-of-behavior-principle)

**Files:**
- [correct-implementation.js](./locality-of-behavior-principle/correct-implementation.js) - Shows proper locality with explicit orchestration in OrderService.placeOrder() where all steps are visible, dependencies are injected and traceable, side effects are explicit at call sites, and testing requires only simple dependency substitution
- [violation.js](./locality-of-behavior-principle/violation.js) - Demonstrates scattered behavior where placing an order triggers hidden event cascades across 5+ listeners, decorators add invisible logging/caching/validation, base classes contain hidden lifecycle hooks, and understanding the flow requires reading 15+ locations

**Key Concept:**
Violation: Scattered behavior through event spaghetti, decorator/aspect overuse, framework magic, and inheritance fog makes the "what happens when X?" question require archaeological investigation. The violation example's `placeOrder()` looks simple but triggers hidden event handlers (InventoryListener, PaymentListener, NotificationListener, AuditListener, AnalyticsListener), invisible decorators (logging, caching, validation, retry), base class lifecycle hooks, and cascading secondary events—requiring 14+ files to understand one user action. Debugging becomes nightmarish, onboarding slow, and changes risky because modifying any piece might break unknown handlers.

Correct: Explicit orchestration keeps all behavior visible and traceable. The correct implementation's `placeOrder()` method shows all 7 steps inline: validation, order creation, inventory reservation, payment processing (with visible compensation on failure), persistence, notifications, and event publishing for analytics. Dependencies are injected and visible in the constructor. Testing is trivial—just pass mock objects, no framework magic to configure. Events are used only for cross-boundary notifications (facts published to analytics/audit) where decoupling is intentional, not for core business flow control. The locality gradient is respected: high locality for business logic, medium locality for service interfaces, acceptable indirection for fire-and-forget notifications. This approach enables rapid onboarding, safe changes, clear debugging, and the ability to answer "what happens when X?" by reading, not archaeology.

### 37. Incremental Validity Principle (IVP)

Definition:
Design multi-step and long-running operations so that interruption at any point leaves the system in a **locally valid, invariant-respecting state for the scope of completed work**, with partial progress preserved and recoverable rather than lost.

Description:
The Incremental Validity Principle addresses a fundamental challenge in software: operations that span multiple steps, take significant time, or cross system boundaries can fail partway through. When they do, the system must not be left in a corrupted or inconsistent state, and completed work should not be lost.

Too often, developers design operations as monolithic units that either succeed completely or fail completely—discarding all progress on failure. This "all-or-nothing" approach is simple conceptually but creates:
- **Lost work**: Hours of processing vanish on a crash
- **User frustration**: Large uploads restart from zero
- **Resource waste**: Reprocessing already-completed items
- **Recovery complexity**: Unknown state after failures
- **Operational burden**: Manual intervention to fix partial states

IVP inverts the default: design for interruption as the normal case. Assume operations WILL be interrupted, and ensure the system remains valid when they are.

**Critical prerequisite:** IVP is difficult to implement correctly without **Idempotency** (for safe re-execution) and **Observability-First** (for progress visibility and debugging). These principles should be in place before applying IVP to complex workflows.

**Should I Apply IVP? — Decision Heuristic:**

Before investing in IVP infrastructure, answer these questions:

| Question | If YES | If NO |
|----------|--------|-------|
| Does the operation take longer than 30 seconds? | Strong candidate for IVP | Simple retry may suffice |
| Is recomputation expensive (CPU, $, user time)? | IVP likely worth the cost | Restart-from-zero acceptable |
| Is partial progress meaningful to preserve? | IVP adds real value | All-or-nothing may be correct |
| Will failure require manual cleanup without checkpoints? | IVP prevents operational pain | Automatic cleanup possible |
| Is the operation user-facing with visible progress? | IVP improves UX significantly | Internal ops may not need it |

**When progress preservation is NOT desirable:**
- Financial operations where partial success has legal/audit implications
- Security-sensitive flows where partial state could leak information
- Workflows where partial completion creates false user confidence
- Operations where "all succeeded" is a required business invariant

In these cases, all-or-nothing with proper compensation may be more appropriate than incremental checkpointing.

**Core practices:**

**Checkpoint at Meaningful Boundaries:**
- Persist progress at logical boundaries (per-record, per-batch, per-step)
- Choose checkpoint granularity based on recovery cost vs. overhead
- Ensure checkpoints are atomic—a half-written checkpoint is as bad as none
- Store enough context to resume, not just "step 3 of 5"

**Design Atomic Units of Work:**
- Break large operations into independently-committable units
- Each unit should leave the system in a **locally valid** state when complete
- Order units so dependencies are satisfied incrementally
- Prefer many small commits over one large transaction

**Local vs Global Validity:**

IVP requires **local validity**—invariants hold for completed work—not necessarily **global validity** at every moment:
- Entity-level invariants (single record consistency): Must always hold
- Aggregate-level invariants (totals, counts): May be temporarily inconsistent, must be restorable
- System-level invariants (cross-service consistency): May require eventual consistency patterns

Example: A batch job updating account balances may have individual accounts valid while the system-wide total is temporarily inconsistent. This is acceptable if the checkpoint includes enough information to complete or roll back the aggregate update.

**Recovery Strategies — Resume vs Compensate vs Reconcile:**

IVP supports three recovery patterns, each appropriate for different situations:

| Strategy | When to Use | Complexity | Example |
|----------|-------------|------------|---------|
| **Resume Forward** | Progress is valuable, remaining work is independent | Low | Batch processing from cursor position |
| **Compensate Backward** | Partial state is invalid, must undo completed steps | High | Saga pattern for distributed transactions |
| **Reconcile Later** | Partial state is tolerable, fix asynchronously | Medium | Mark failed + background job to resolve |

Choose the simplest strategy that meets your consistency requirements:
- **Resume** when you can: cheapest, simplest, most common
- **Compensate** when you must: expensive but necessary for strong consistency
- **Reconcile** when you can tolerate delay: pragmatic middle ground

**Enable Resumption, Not Just Retry:**
- Track which work is completed vs. pending
- Skip completed work on resume (don't just restart from beginning)
- Handle resume from any checkpoint, not just the last one
- Distinguish "resume after crash" from "retry after error"

**Make Progress Observable:**
- Expose progress metrics (items processed, percentage complete, current phase)
- Log checkpoint events for operational visibility
- Enable progress inspection without disrupting the operation
- Provide estimated time to completion where feasible

**The Interruption Test:**

A system exhibits incremental validity if:
1. Killing the process at any moment leaves the system in a locally valid state
2. Restarting the operation continues from the last checkpoint, not the beginning
3. Completed work is never duplicated or lost
4. External observers (users, operators) can see how far the operation progressed
5. The operation can be paused and resumed intentionally, not just accidentally

**Patterns by domain:**

| Domain | IVP Pattern |
|--------|-------------|
| **Batch processing** | Process in chunks, commit per chunk, track cursor position |
| **File uploads** | Chunked uploads with resume tokens, verify chunk integrity |
| **Database migrations** | Per-table or per-batch commits, migration state table, forward-only |
| **Workflow orchestration** | Saga pattern with compensation, persistent step state, idempotent steps |
| **Form wizards** | Save draft per step, validate incrementally, allow backward navigation |
| **Data pipelines** | Exactly-once semantics, offset tracking, dead-letter handling |
| **Distributed transactions** | Prepare/commit phases, timeout handling, coordinator recovery |

**Checkpoint granularity tradeoffs:**

| Granularity | Pros | Cons |
|-------------|------|------|
| **Per-item** | Minimal lost work | High I/O overhead, slower throughput |
| **Per-batch** | Balanced overhead | Some rework on failure, batch size tuning needed |
| **Per-phase** | Simple implementation | Significant rework possible, coarse progress visibility |

Choose based on: item processing cost, acceptable rework on failure, I/O capacity, and progress visibility requirements.

**Cost awareness — Checkpointing isn't free:**

IVP trades simplicity and throughput for recoverability. Be aware of:
- **I/O amplification**: Every checkpoint is a write; frequent checkpoints multiply storage I/O
- **Lock contention**: Checkpoints may require locks or transactions that block other operations
- **Schema complexity**: Checkpoint tables, state machines, and recovery logic add code
- **Write amplification**: Cloud storage often charges per write; checkpointing increases cost

Measure the cost of checkpointing against the cost of lost work. For a 10-second operation, per-item checkpointing is probably overkill. For a 10-hour operation, it's essential.

**Saga pattern — powerful but complex:**

Sagas are the go-to pattern for distributed transaction recovery, but they carry significant complexity:
- Compensation logic must be correct for every possible failure point
- Partial compensation failures require additional handling (dead-letter, manual intervention)
- Testing all failure paths is exponentially harder than testing the happy path
- Debugging failed sagas requires excellent observability

**Before reaching for sagas, consider simpler alternatives:**
- Can the operation be made idempotent so simple retry suffices?
- Can failure be handled by "mark failed + reconcile later" instead of immediate compensation?
- Is the operation actually distributed, or can it be consolidated?

Use sagas when you genuinely need distributed transaction semantics. Don't use them as a default pattern for all multi-step operations.

**Testing implications:**

IVP dramatically affects testing strategy. Proper IVP testing requires:

- **Crash-at-every-point tests**: Simulate interruption between each checkpoint and verify valid state
- **Restart verification**: Confirm resumed operations complete correctly without duplication
- **Idempotency verification**: Re-running from any checkpoint produces consistent results
- **Partial-state invariant checks**: Validate that local invariants hold at every checkpoint
- **Compensation path testing**: For sagas, test every compensation path, not just the happy path
- **Progress observability tests**: Verify metrics and logs correctly reflect actual progress

Without this testing, IVP implementations often fail in production at the exact moments they're supposed to help.

**Handling dependencies between steps:**

When step N depends on step N-1's output:
- Persist intermediate results, not just progress markers
- Design steps to read from persisted state, not in-memory state
- Consider whether dependent steps can be made independent through denormalization

**Relationship to other principles:**

- **Idempotency (I)**: **Required foundation.** IVP assumes resumed steps are safe to re-execute. Without idempotency, resumption causes duplication or corruption.
- **Observability-First (OFP)**: **Required foundation.** IVP benefits from checkpoint events, progress metrics, and resumption logs. Without observability, debugging partial failures is guesswork.
- **Fail Fast (FF)**: IVP doesn't contradict FF—fail fast when detecting errors, but preserve completed work before failing.
- **Graceful Degradation (GD)**: GD keeps services running despite failures; IVP keeps *progress* safe despite interruptions. Complementary.
- **Design by Contract (DbC)**: DbC invariants should hold at every checkpoint, not just at operation start/end.
- **Explicit Dependencies (EDP)**: State required for resumption is a dependency—make it explicit and injectable for testing.

**When NOT to apply IVP:**

- Operations completing in milliseconds (overhead exceeds benefit)
- Truly atomic operations that can't meaningfully checkpoint
- Read-only operations with no persistent side effects
- Operations where recomputation is cheap and simple retry suffices
- Exploratory/experimental code where simplicity trumps robustness
- Operations where partial success is semantically invalid (use all-or-nothing + compensation instead)

**Common violations:**

- In-memory-only state for multi-step operations
- "Begin transaction... many operations... commit" patterns spanning minutes
- Progress tracking that resets on restart
- Assuming the happy path: "it'll probably finish"
- Checkpoints that don't include enough context to resume
- Ignoring partial failure in distributed operations
- Over-engineering: applying IVP to operations where simple retry would suffice

**Location:** [incremental-validity-principle](./incremental-validity-principle)

**Files:**
- [correct-implementation.js](./incremental-validity-principle/correct-implementation.js) - Shows proper IVP patterns: checkpoint-based batch processing with resume capability, chunked file uploads with resume tokens, draft-saving form wizards, offset-tracked stream processing, and saga pattern for distributed operations with compensation
- [violation.js](./incremental-validity-principle/violation.js) - Demonstrates violations: monolithic batch processing where crash loses all work, file uploads without resume capability, forms without draft saving, stream processing without offset tracking, and distributed operations without saga/compensation

**Key Concept:**
Violation: The system treats operations as monolithic—either everything succeeds, or all progress is lost. A batch job processing 10,000 records keeps everything in memory and commits only at the end; a crash at record 9,999 loses all work. File uploads have no resume capability; a network hiccup at 95% means starting over. Database migrations run as single transactions that lock tables for hours and must restart completely on any failure. Multi-step order processing leaves the system in inconsistent state when payment succeeds but shipment fails—inventory reserved, money charged, but no order recorded. Users lose unsaved form data when sessions expire.

Correct: Operations are designed for interruption from the start—but only where the cost-benefit justifies it. Batch jobs commit every N records and track the last-processed cursor; a crash at record 9,999 loses only records since the last checkpoint. File uploads use chunked protocols with resume tokens; reconnecting continues from the last confirmed chunk. Database migrations run per-table with a migration state tracker; failures affect only the current table. Order processing uses the saga pattern with compensation: each step records its completion, and failure triggers rollback of completed steps (release inventory, refund payment), returning the system to a valid state. Simpler workflows may use "mark failed + reconcile later" instead of full saga complexity. Forms auto-save drafts per field; session expiration loses nothing. Progress is observable, recovery strategy matches the consistency requirements, and the implementation cost is justified by the value of preserved progress. This approach trades implementation complexity for reliability—apply it where interruption is likely and lost work is expensive, not as a universal default.
