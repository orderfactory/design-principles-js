/**
 * Interface Segregation Principle - Correct Implementation
 *
 * The Interface Segregation Principle states that:
 * "Clients should not be forced to depend upon interfaces that they do not use."
 *
 * In this example, we demonstrate ISP by creating specific, focused interfaces
 * for different types of devices rather than one large, general-purpose interface.
 */

// Instead of one large interface, we define smaller, more specific interfaces
// Each interface represents a specific capability

// Document printing capability
class Printer {
  print(document) {
    throw new Error('Method print() must be implemented');
  }
}

// Document scanning capability
class Scanner {
  scan() {
    throw new Error('Method scan() must be implemented');
  }
}

// Fax sending capability
class FaxMachine {
  fax(document) {
    throw new Error('Method fax() must be implemented');
  }
}

// Devices implement only the interfaces they need

// A simple printer only implements the Printer interface
class SimplePrinter extends Printer {
  print(document) {
    console.log(`Printing document: ${document}`);
  }
}

// A scanner only implements the Scanner interface
class SimpleScanner extends Scanner {
  scan() {
    console.log('Scanning document...');
    return 'Scanned content';
  }
}

// A multifunction device implements multiple interfaces
class MultifunctionPrinter extends Printer {
  print(document) {
    console.log(`Printing document: ${document}`);
  }
}

// Using composition to create a device with multiple capabilities
class OfficeStation {
  constructor(printer, scanner, faxMachine) {
    this.printer = printer;
    this.scanner = scanner;
    this.faxMachine = faxMachine;
  }

  print(document) {
    if (this.printer) {
      this.printer.print(document);
    } else {
      console.log('Printing not supported');
    }
  }

  scan() {
    if (this.scanner) {
      return this.scanner.scan();
    } else {
      console.log('Scanning not supported');
      return null;
    }
  }

  fax(document) {
    if (this.faxMachine) {
      this.faxMachine.fax(document);
    } else {
      console.log('Faxing not supported');
    }
  }
}

// Usage examples

// Create a simple printer that only prints
const simplePrinter = new SimplePrinter();
simplePrinter.print('Annual Report');

// Create a simple scanner that only scans
const simpleScanner = new SimpleScanner();
const scannedContent = simpleScanner.scan();
console.log(`Scanned content: ${scannedContent}`);

// Create a multifunction printer
const multifunctionPrinter = new MultifunctionPrinter();
multifunctionPrinter.print('Meeting Notes');

// Create a full office station with all capabilities
const fullOfficeStation = new OfficeStation(
  new SimplePrinter(),
  new SimpleScanner(),
  new FaxMachine() // This would throw an error if used since we haven't implemented it
);

// Create a printer-scanner combo (no fax)
const printerScannerCombo = new OfficeStation(
  new SimplePrinter(),
  new SimpleScanner(),
  null // No fax capability
);

printerScannerCombo.print('Contract');
printerScannerCombo.scan();
printerScannerCombo.fax('Contract'); // Will show "Faxing not supported"

// This demonstrates ISP because:
// 1. We have segregated the interfaces based on functionality
// 2. Clients only need to implement the interfaces they actually use
// 3. Changes to one capability don't affect classes that don't use that capability
// 4. We can compose objects with exactly the capabilities they need