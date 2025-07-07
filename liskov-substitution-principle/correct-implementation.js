/**
 * Liskov Substitution Principle - Correct Implementation
 *
 * The Liskov Substitution Principle states that objects of a superclass should be
 * replaceable with objects of a subclass without affecting the correctness of the program.
 *
 * In this example, we have a Rectangle class and a Square class that both extend from a common Shape class.
 * Both classes correctly implement the behavior expected from a Shape,
 * ensuring that they can be used wherever a Shape is expected.
 */

// Base class
class Shape {
  calculateArea() {
    // This is an abstract method that should be implemented by subclasses
    throw new Error('Method calculateArea() must be implemented');
  }
}

// Rectangle class
class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  calculateArea() {
    return this.width * this.height;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }
}

// Square class - correctly implements LSP
class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  calculateArea() {
    return this.side * this.side;
  }

  getSide() {
    return this.side;
  }
}

// Function that works with any Shape
function printArea(shape) {
  console.log(`Area: ${shape.calculateArea()}`);
}

// Usage
const rectangle = new Rectangle(5, 10);
const square = new Square(5);

// Both objects can be used interchangeably where a Shape is expected
printArea(rectangle); // Output: Area: 50
printArea(square);    // Output: Area: 25

// This demonstrates LSP because Square is not trying to be a Rectangle
// Instead, both Rectangle and Square are types of Shape
// and they both correctly implement the calculateArea method
