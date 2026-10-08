/**
 * Interface Segregation Principle - Correct Implementation
 *
 * The Interface Segregation Principle states that:
 * "Clients should not be forced to depend upon interfaces that they do not use."
 *
 * In this example, we demonstrate ISP by splitting device capabilities into small,
 * role-specific interfaces rather than one large, general-purpose interface.
 *
 * JavaScript has no interface keyword, so an interface here is simply the set of
 * methods an object offers and a client calls. Following ISP means:
 * - Each role is small: printing, scanning, faxing, and copying are separate roles
 * - Each device offers only the roles it can actually perform
 * - Each client asks only for the one role it uses
 */

// Instead of one large interface, we define small, role-specific capabilities.
// Each role is a mixin: a function that takes a base class and returns a subclass
// with that one capability added. A device class applies only the mixins for the
// roles it supports, so it never carries a method it can't perform.

// Base class for every device: a name, and no capabilities at all
class Device {
  constructor(name) {
    this.name = name;
  }
}

// Document printing role: print(document)
const Printable = (Base) => class extends Base {
  print(document) {
    console.log(`[${this.name}] Printing document: ${document}`);
  }
};

// Document scanning role: scan() returns the scanned content
const Scannable = (Base) => class extends Base {
  scan() {
    console.log(`[${this.name}] Scanning document...`);
    return `Scanned content from ${this.name}`;
  }
};

// Fax sending role: fax(document)
const Faxable = (Base) => class extends Base {
  fax(document) {
    console.log(`[${this.name}] Faxing document: ${document}`);
  }
};

// Document copying role: copy() scans and then prints,
// so it is applied on top of the Printable and Scannable roles
const Copyable = (Base) => class extends Base {
  copy() {
    console.log(`[${this.name}] Copying document...`);
    const scannedContent = this.scan();
    this.print(scannedContent);
  }
};

// Devices combine exactly the roles they support - nothing more

// A simple printer only prints
class SimplePrinter extends Printable(Device) {}

// A scanner only scans
class SimpleScanner extends Scannable(Device) {}

// A fax machine only faxes
class SimpleFaxMachine extends Faxable(Device) {}

// A printer-scanner combo prints, scans, and copies - it has no fax() method at all
class PrinterScannerCombo extends Copyable(Scannable(Printable(Device))) {}

// A multifunction device combines all four roles
class MultifunctionDevice extends Copyable(Faxable(Scannable(Printable(Device)))) {}

// Clients ask only for the role they use. Each function below works with any
// object that has the one method it calls, whatever else that object can do.

// Needs only the printing role
function printReport(printer, report) {
  printer.print(report);
}

// Needs only the scanning role
function scanDocument(scanner) {
  return scanner.scan();
}

// Needs only the fax role
function sendFax(faxMachine, document) {
  faxMachine.fax(document);
}

// Needs only the copying role
function makeCopy(copier) {
  copier.copy();
}

// A simple, honest capability check (duck typing): an object can fax if it has a fax() method.
// The check can be trusted because no device offers a method it can't perform.
function canFax(device) {
  return typeof device.fax === 'function';
}

// Usage examples demonstrating ISP compliance

console.log('=== ISP Correct Implementation Examples ===\n');

// Create devices that take on only the roles they support
console.log('1. Simple devices with single capabilities:');
const simplePrinter = new SimplePrinter('Printer');
printReport(simplePrinter, 'Annual Report');

const simpleScanner = new SimpleScanner('Scanner');
const scannedContent = scanDocument(simpleScanner);
console.log(`Result: ${scannedContent}\n`);

const simpleFax = new SimpleFaxMachine('FaxMachine');
sendFax(simpleFax, 'Contract');

console.log('\n2. Multifunction device combining all four roles:');
const multifunctionDevice = new MultifunctionDevice('Multifunction');
printReport(multifunctionDevice, 'Meeting Notes');
scanDocument(multifunctionDevice);
sendFax(multifunctionDevice, 'Important Document');
makeCopy(multifunctionDevice);

console.log('\n3. Printer-Scanner combo (no fax capability):');
const printerScannerCombo = new PrinterScannerCombo('Combo');
printReport(printerScannerCombo, 'Project Plan');
scanDocument(printerScannerCombo);
makeCopy(printerScannerCombo);
// Note: the combo has no fax() method at all - it doesn't pretend to support faxing

console.log('\n4. A client works with any device that has the role it needs:');
// printReport asks only for print(), so all three devices are acceptable printers
[simplePrinter, printerScannerCombo, multifunctionDevice].forEach((printer) => {
  printReport(printer, 'Budget Report');
});

console.log('\n5. Choosing a device for a fax job by checking for the role:');
const officeDevices = [simplePrinter, printerScannerCombo, simpleFax];
officeDevices.forEach((device) => {
  console.log(`${device.name} can fax: ${canFax(device)}`);
});
const faxDevice = officeDevices.find(canFax);
sendFax(faxDevice, 'Proposal');

console.log('\n=== ISP Benefits Demonstrated ===');
console.log('✓ Capabilities are segregated into small, role-specific interfaces');
console.log('✓ Each device takes on only the roles it actually supports');
console.log('✓ No device offers a method it cannot perform');
console.log('✓ Each client depends only on the one role it uses');
console.log('✓ Changes to one role don\'t affect devices or clients that don\'t use it');
console.log('✓ New kinds of devices combine existing roles without changing them');

// This demonstrates ISP because:
// 1. We have segregated the capabilities into small roles (Printable, Scannable, Faxable, Copyable)
// 2. Each device class applies only the roles it actually supports
// 3. No class is forced to carry a method it can't perform - the combo simply has no fax()
// 4. Each client function depends only on the one method it calls, so it accepts any device that has it
// 5. Changes to one role don't affect devices or clients that don't use that role
// 6. Capability checks stay honest: a device can fax exactly when it has a fax() method