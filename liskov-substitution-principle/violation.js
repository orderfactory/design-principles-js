/**
 * Liskov Substitution Principle - Violation Example
 *
 * This example demonstrates a common violation of the Liskov Substitution Principle
 * where a Square is implemented as a subclass of Rectangle.
 *
 * The problem occurs because a Square has a constraint that a Rectangle doesn't have:
 * all sides must be equal. This means that a Square cannot be substituted for a Rectangle
 * in all cases without breaking the program's correctness.
 */

// Rectangle class
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  setWidth(width) {
    this.width = width;
  }

  setHeight(height) {
    this.height = height;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  calculateArea() {
    return this.width * this.height;
  }
}

// Square class - violates LSP by extending Rectangle
class Square extends Rectangle {
  constructor(side) {
    super(side, side);
  }

  // Square must override setWidth to maintain the square property
  setWidth(width) {
    super.setWidth(width);
    super.setHeight(width); // This is the violation - changing width also changes height
  }

  // Square must override setHeight to maintain the square property
  setHeight(height) {
    super.setHeight(height);
    super.setWidth(height); // This is the violation - changing height also changes width
  }
}

// Function that expects a Rectangle's behavior
function resizeRectangle(rectangle) {
  rectangle.setWidth(10);
  rectangle.setHeight(20);

  // For a Rectangle, we expect the area to be 10 * 20 = 200
  // But for a Square, due to the overridden methods, the area will be 20 * 20 = 400
  return rectangle.calculateArea();
}

// Usage
const rectangle = new Rectangle(5, 5);
const square = new Square(5);

console.log("Rectangle area after resize:", resizeRectangle(rectangle)); // Output: 200 (as expected)
console.log("Square area after resize:", resizeRectangle(square));       // Output: 400 (unexpected!)

// This demonstrates a violation of LSP because:
// 1. Square is a subtype of Rectangle
// 2. When we use Square in place of Rectangle, the program behaves unexpectedly
// 3. The client code (resizeRectangle) expects Rectangle behavior but gets different behavior with Square