/**
 * Interface Segregation Principle - Violation Example
 *
 * This example demonstrates a violation of the Interface Segregation Principle
 * where clients are forced to depend on interfaces they don't use.
 *
 * The problem occurs when we create a "fat interface" that contains methods
 * for multiple responsibilities, forcing implementing classes to provide
 * implementations for methods they don't need or use.
 */

// A "fat interface" that violates ISP by combining multiple responsibilities
class MultiFunctionDevice {
  print(document) {
    throw new Error('Method print() must be implemented');
  }

  scan() {
    throw new Error('Method scan() must be implemented');
  }

  fax(document) {
    throw new Error('Method fax() must be implemented');
  }

  copy() {
    throw new Error('Method copy() must be implemented');
  }
}

// A simple printer that only needs to print, but is forced to implement all methods
class BasicPrinter extends MultiFunctionDevice {
  print(document) {
    console.log(`Printing document: ${document}`);
  }

  // Forced to implement methods it doesn't need
  scan() {
    throw new Error('Scanning not supported on BasicPrinter');
  }

  fax(document) {
    throw new Error('Faxing not supported on BasicPrinter');
  }

  copy() {
    throw new Error('Copying not supported on BasicPrinter');
  }
}

// A scanner that only needs to scan, but is forced to implement all methods
class BasicScanner extends MultiFunctionDevice {
  // Forced to implement methods it doesn't need
  print(document) {
    throw new Error('Printing not supported on BasicScanner');
  }

  scan() {
    console.log('Scanning document...');
    return 'Scanned content';
  }

  // Forced to implement methods it doesn't need
  fax(document) {
    throw new Error('Faxing not supported on BasicScanner');
  }

  copy() {
    throw new Error('Copying not supported on BasicScanner');
  }
}

// A professional all-in-one device that actually uses all methods
class ProfessionalAllInOne extends MultiFunctionDevice {
  print(document) {
    console.log(`Printing document: ${document}`);
  }

  scan() {
    console.log('Scanning document...');
    return 'Scanned content';
  }

  fax(document) {
    console.log(`Faxing document: ${document}`);
  }

  copy() {
    console.log('Copying document...');
    const scannedContent = this.scan();
    this.print(scannedContent);
  }
}

// Usage examples

// Create a basic printer
const basicPrinter = new BasicPrinter();
basicPrinter.print('Annual Report');

try {
  // This will throw an error because BasicPrinter doesn't support scanning
  basicPrinter.scan();
} catch (error) {
  console.log(`Error: ${error.message}`);
}

// Create a basic scanner
const basicScanner = new BasicScanner();
const scannedContent = basicScanner.scan();
console.log(`Scanned content: ${scannedContent}`);

try {
  // This will throw an error because BasicScanner doesn't support printing
  basicScanner.print('Document');
} catch (error) {
  console.log(`Error: ${error.message}`);
}

// Create a professional all-in-one device
const allInOne = new ProfessionalAllInOne();
allInOne.print('Meeting Notes');
allInOne.scan();
allInOne.fax('Contract');
allInOne.copy();

// This demonstrates a violation of ISP because:
// 1. The MultiFunctionDevice interface is too "fat" with multiple responsibilities
// 2. Classes like BasicPrinter and BasicScanner are forced to implement methods they don't use
// 3. Clients of these classes need to know which methods are actually supported
// 4. Changes to the MultiFunctionDevice interface affect all implementing classes, even if they don't use the changed methods
// 5. It leads to fragile code with runtime errors instead of compile-time safety

// Problems with this approach:
// 1. Code bloat - classes implement methods they don't need
// 2. Increased risk of errors - clients might call unsupported methods
// 3. Poor maintainability - changes to the interface affect all implementations
// 4. Reduced reusability - classes are tied to a large interface