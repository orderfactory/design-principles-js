/**
 * Interface Segregation Principle - Correct Implementation
 *
 * The Interface Segregation Principle states that:
 * "Clients should not be forced to depend upon interfaces that they do not use."
 *
 * In this example, we demonstrate ISP by creating specific, focused interfaces
 * for different capabilities rather than one large, general-purpose interface.
 */

// Instead of one large interface, we define smaller, more specific interfaces
// Each interface represents a specific capability

// Document printing capability
class IPrintable {
  print(document) {
    throw new Error('Method print() must be implemented');
  }
}

// Document scanning capability
class IScannable {
  scan() {
    throw new Error('Method scan() must be implemented');
  }
}

// Fax sending capability
class IFaxable {
  fax(document) {
    throw new Error('Method fax() must be implemented');
  }
}

// Document copying capability
class ICopyable {
  copy() {
    throw new Error('Method copy() must be implemented');
  }
}

// Devices implement only the interfaces they need

// A simple printer only implements the printing interface
class SimplePrinter extends IPrintable {
  print(document) {
    console.log(`Printing document: ${document}`);
  }
}

// A scanner only implements the scanning interface
class SimpleScanner extends IScannable {
  scan() {
    console.log('Scanning document...');
    return 'Scanned content';
  }
}

// A fax machine only implements the fax interface
class SimpleFaxMachine extends IFaxable {
  fax(document) {
    console.log(`Faxing document: ${document}`);
  }
}

// A multifunction device that needs multiple capabilities
// Uses multiple inheritance pattern (mixin) to implement multiple interfaces
class MultifunctionDevice {
  constructor() {
    // Mixin the required interfaces
    Object.assign(this, new IPrintable());
    Object.assign(this, new IScannable());
    Object.assign(this, new IFaxable());
    Object.assign(this, new ICopyable());
  }

  print(document) {
    console.log(`[Multifunction] Printing document: ${document}`);
  }

  scan() {
    console.log('[Multifunction] Scanning document...');
    return 'Scanned content from multifunction device';
  }

  fax(document) {
    console.log(`[Multifunction] Faxing document: ${document}`);
  }

  copy() {
    console.log('[Multifunction] Copying document...');
    const scannedContent = this.scan();
    this.print(scannedContent);
  }
}

// Alternative approach: A printer-scanner combo that only implements what it needs
class PrinterScannerCombo {
  constructor() {
    Object.assign(this, new IPrintable());
    Object.assign(this, new IScannable());
    Object.assign(this, new ICopyable());
  }

  print(document) {
    console.log(`[Combo] Printing document: ${document}`);
  }

  scan() {
    console.log('[Combo] Scanning document...');
    return 'Scanned content from combo device';
  }

  copy() {
    console.log('[Combo] Copying document...');
    const scannedContent = this.scan();
    this.print(scannedContent);
  }

  // Note: This device doesn't implement fax capability
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

// Usage examples demonstrating ISP compliance

console.log('=== ISP Correct Implementation Examples ===\n');

// Create devices that implement only what they need
console.log('1. Simple devices with single capabilities:');
const simplePrinter = new SimplePrinter();
simplePrinter.print('Annual Report');

const simpleScanner = new SimpleScanner();
const scannedContent = simpleScanner.scan();
console.log(`Result: ${scannedContent}\n`);

const simpleFax = new SimpleFaxMachine();
simpleFax.fax('Contract');

console.log('\n2. Multifunction device implementing multiple interfaces:');
const multifunctionDevice = new MultifunctionDevice();
multifunctionDevice.print('Meeting Notes');
multifunctionDevice.scan();
multifunctionDevice.fax('Important Document');
multifunctionDevice.copy();

console.log('\n3. Printer-Scanner combo (no fax capability):');
const printerScannerCombo = new PrinterScannerCombo();
printerScannerCombo.print('Project Plan');
printerScannerCombo.scan();
printerScannerCombo.copy();
// Note: printerScannerCombo.fax() would cause an error since it doesn't implement IFaxable

console.log('\n4. Composition approach with OfficeStation:');
// Create a full office station with all capabilities
const fullOfficeStation = new OfficeStation(
  new SimplePrinter(),
  new SimpleScanner(),
  new SimpleFaxMachine()
);

fullOfficeStation.print('Budget Report');
fullOfficeStation.scan();
fullOfficeStation.fax('Proposal');

// Create a printer-scanner only station (no fax)
const basicOfficeStation = new OfficeStation(
  new SimplePrinter(),
  new SimpleScanner(),
  null // No fax capability
);

console.log('\n5. Office station without fax capability:');
basicOfficeStation.print('Invoice');
basicOfficeStation.scan();
basicOfficeStation.fax('Document'); // Will show "Faxing not supported"

console.log('\n=== ISP Benefits Demonstrated ===');
console.log('✓ Interfaces are segregated by specific capabilities');
console.log('✓ Classes implement only the interfaces they actually need');
console.log('✓ No forced implementation of unused methods');
console.log('✓ Changes to one interface don\'t affect unrelated classes');
console.log('✓ Composition allows flexible capability combinations');
console.log('✓ Code is more maintainable and follows single responsibility');

// This demonstrates ISP because:
// 1. We have segregated the interfaces based on specific functionality (IPrintable, IScannable, IFaxable, ICopyable)
// 2. Each class implements only the interfaces it actually needs and uses
// 3. No class is forced to implement methods it doesn't support
// 4. Changes to one interface don't affect classes that don't use that capability
// 5. We can compose objects with exactly the capabilities they need
// 6. The code is more maintainable, testable, and follows the single responsibility principle