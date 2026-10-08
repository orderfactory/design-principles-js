/**
 * Liskov Substitution Principle - Correct Implementation
 *
 * The Liskov Substitution Principle states that objects of a superclass should be
 * replaceable with objects of a subclass without affecting the correctness of the program.
 *
 * In this example, we have a Rectangle class and a Square class that both extend from a common Shape class.
 * Both classes correctly implement the behavior expected from a Shape,
 * ensuring that they can be used wherever a Shape is expected.
 *
 * Resizing is offered only in a form each type can honor: a Rectangle changes its width
 * and height independently, while a Square changes its single side.
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

  // A rectangle's width and height are independent, so each can change on its own
  setWidth(width) {
    this.width = width;
  }

  setHeight(height) {
    this.height = height;
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

  // A square has a single side, so resizing changes that side and all four sides stay equal
  setSide(side) {
    this.side = side;
  }
}

// Function that expects a Rectangle's behavior
// It is only given rectangles (a Square is not a Rectangle here),
// so it depends only on what every Rectangle can actually do
function resizeRectangle(rectangle) {
  rectangle.setWidth(10);
  rectangle.setHeight(20);

  // For a Rectangle, we expect the area to be 10 * 20 = 200, and every Rectangle delivers it
  return rectangle.calculateArea();
}

// Function that works with any Shape
// It relies only on calculateArea(), which every Shape provides
function printArea(shape) {
  console.log(`Area: ${shape.calculateArea()}`);
}

// Usage
const rectangle = new Rectangle(5, 5);
const square = new Square(5);

console.log('Rectangle area after resize:', resizeRectangle(rectangle)); // Output: 200 (as expected)

// A square is resized through its own contract instead. It has no setWidth() or setHeight()
// that could break its equal sides, so passing it to resizeRectangle would fail loudly
// rather than silently return the wrong area.
square.setSide(10);
console.log('Square area after resize:', square.calculateArea()); // Output: 100 (as expected)

// Both objects can be used interchangeably where a Shape is expected
printArea(rectangle); // Output: Area: 200
printArea(square);    // Output: Area: 100

// This demonstrates LSP because:
// 1. Square is not trying to be a Rectangle - both Rectangle and Square are types of Shape
// 2. Both correctly implement calculateArea, so either one can be used wherever a Shape is expected
// 3. The client code (resizeRectangle) depends only on what every Rectangle can do, so its expectation (200) always holds
// 4. A square is resized only through setSide, so it is never silently treated as a resizable rectangle
