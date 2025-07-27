/**
 * Interface Segregation Principle - Violation Example
 *
 * This example demonstrates a violation of the Interface Segregation Principle (ISP)
 * where clients are forced to depend on interfaces they don't use.
 *
 * The problem occurs when we create a "fat interface" that combines multiple
 * responsibilities, forcing implementing classes to provide implementations
 * for methods they don't need, don't use, or don't support.
 *
 * This leads to:
 * - Code bloat (unnecessary method implementations)
 * - Runtime errors instead of compile-time safety
 * - Poor maintainability (changes affect all implementations)
 * - Violation of the Single Responsibility Principle
 */

// ❌ BAD: A "fat interface" that violates ISP by combining multiple responsibilities
// This interface forces ALL implementing classes to implement ALL methods,
// even if they don't need or support those capabilities
class MultiFunctionDeviceInterface {
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

  email(document, recipient) {
    throw new Error('Method email() must be implemented');
  }

  cloudUpload(document, service) {
    throw new Error('Method cloudUpload() must be implemented');
  }
}

// ❌ A simple printer that only needs to print, but is forced to implement ALL methods
class BasicPrinter extends MultiFunctionDeviceInterface {
  print(document) {
    console.log(`[BasicPrinter] Printing document: ${document}`);
  }

  // ❌ FORCED to implement methods it doesn't need or support
  scan() {
    throw new Error('Scanning not supported on BasicPrinter');
  }

  fax(document) {
    throw new Error('Faxing not supported on BasicPrinter');
  }

  copy() {
    throw new Error('Copying not supported on BasicPrinter');
  }

  email(document, recipient) {
    throw new Error('Email not supported on BasicPrinter');
  }

  cloudUpload(document, service) {
    throw new Error('Cloud upload not supported on BasicPrinter');
  }
}

// ❌ A scanner that only needs to scan, but is forced to implement ALL methods
class BasicScanner extends MultiFunctionDeviceInterface {
  // ❌ FORCED to implement methods it doesn't need or support
  print(document) {
    throw new Error('Printing not supported on BasicScanner');
  }

  scan() {
    console.log('[BasicScanner] Scanning document...');
    return 'Scanned content';
  }

  fax(document) {
    throw new Error('Faxing not supported on BasicScanner');
  }

  copy() {
    throw new Error('Copying not supported on BasicScanner');
  }

  email(document, recipient) {
    throw new Error('Email not supported on BasicScanner');
  }

  cloudUpload(document, service) {
    throw new Error('Cloud upload not supported on BasicScanner');
  }
}

// ❌ A basic fax machine that only needs to fax, but is forced to implement ALL methods
class BasicFaxMachine extends MultiFunctionDeviceInterface {
  // ❌ FORCED to implement methods it doesn't need or support
  print(document) {
    throw new Error('Printing not supported on BasicFaxMachine');
  }

  scan() {
    throw new Error('Scanning not supported on BasicFaxMachine');
  }

  fax(document) {
    console.log(`[BasicFaxMachine] Faxing document: ${document}`);
  }

  copy() {
    throw new Error('Copying not supported on BasicFaxMachine');
  }

  email(document, recipient) {
    throw new Error('Email not supported on BasicFaxMachine');
  }

  cloudUpload(document, service) {
    throw new Error('Cloud upload not supported on BasicFaxMachine');
  }
}

// ✅ Only this device actually uses most of the methods (but still not all)
class ProfessionalAllInOne extends MultiFunctionDeviceInterface {
  print(document) {
    console.log(`[ProfessionalAllInOne] Printing document: ${document}`);
  }

  scan() {
    console.log('[ProfessionalAllInOne] Scanning document...');
    return 'Scanned content';
  }

  fax(document) {
    console.log(`[ProfessionalAllInOne] Faxing document: ${document}`);
  }

  copy() {
    console.log('[ProfessionalAllInOne] Copying document...');
    const scannedContent = this.scan();
    this.print(scannedContent);
  }

  email(document, recipient) {
    console.log(`[ProfessionalAllInOne] Emailing document to: ${recipient}`);
  }

  // ❌ Even this advanced device doesn't support cloud upload!
  cloudUpload(document, service) {
    throw new Error('Cloud upload not supported on this model');
  }
}

// Usage examples demonstrating ISP violation problems

console.log('=== ISP Violation Examples ===\n');

console.log('1. Basic Printer (only needs printing, forced to implement everything):');
const basicPrinter = new BasicPrinter();
basicPrinter.print('Annual Report');

// ❌ These methods exist but throw runtime errors
const unsupportedMethods = ['scan', 'fax', 'copy', 'email', 'cloudUpload'];
unsupportedMethods.forEach(method => {
  try {
    if (method === 'email') {
      basicPrinter[method]('Document', 'user@example.com');
    } else if (method === 'cloudUpload') {
      basicPrinter[method]('Document', 'GoogleDrive');
    } else if (method === 'fax') {
      basicPrinter[method]('Document');
    } else {
      basicPrinter[method]();
    }
  } catch (error) {
    console.log(`❌ ${error.message}`);
  }
});

console.log('\n2. Basic Scanner (only needs scanning, forced to implement everything):');
const basicScanner = new BasicScanner();
const scannedContent = basicScanner.scan();
console.log(`✅ Scanned content: ${scannedContent}`);

// ❌ All other methods throw errors
try {
  basicScanner.print('Document');
} catch (error) {
  console.log(`❌ ${error.message}`);
}

try {
  basicScanner.email('Document', 'user@example.com');
} catch (error) {
  console.log(`❌ ${error.message}`);
}

console.log('\n3. Basic Fax Machine (only needs faxing, forced to implement everything):');
const basicFax = new BasicFaxMachine();
basicFax.fax('Contract');

try {
  basicFax.cloudUpload('Document', 'Dropbox');
} catch (error) {
  console.log(`❌ ${error.message}`);
}

console.log('\n4. Professional All-in-One (uses most methods, but still not all):');
const allInOne = new ProfessionalAllInOne();
allInOne.print('Meeting Notes');
allInOne.scan();
allInOne.fax('Contract');
allInOne.copy();
allInOne.email('Report', 'manager@company.com');

// ❌ Even the most advanced device doesn't support everything!
try {
  allInOne.cloudUpload('Document', 'OneDrive');
} catch (error) {
  console.log(`❌ ${error.message}`);
}

console.log('\n=== Problems with ISP Violation ===');
console.log('❌ Fat interface forces unnecessary method implementations');
console.log('❌ Runtime errors instead of compile-time safety');
console.log('❌ Code bloat - classes implement methods they don\'t need');
console.log('❌ Poor maintainability - interface changes affect all classes');
console.log('❌ Clients must know which methods actually work');
console.log('❌ Violates Single Responsibility Principle');
console.log('❌ Reduced reusability and increased coupling');

console.log('\n=== Why This Violates ISP ===');
console.log('1. The MultiFunctionDeviceInterface is a "fat interface" with too many responsibilities');
console.log('2. Classes are forced to depend on methods they don\'t use');
console.log('3. Changes to unused methods still affect all implementing classes');
console.log('4. Leads to fragile code with runtime errors');
console.log('5. Makes the codebase harder to maintain and extend');

// This demonstrates a clear violation of ISP because:
// 1. The MultiFunctionDeviceInterface combines multiple unrelated responsibilities
// 2. Classes like BasicPrinter, BasicScanner, and BasicFaxMachine are forced to implement methods they don't use
// 3. Clients of these classes need to know which methods are actually supported (runtime discovery)
// 4. Changes to the interface affect all implementing classes, even if they don't use the changed methods
// 5. It leads to fragile code with runtime errors instead of compile-time safety
// 6. Even the most advanced device (ProfessionalAllInOne) doesn't use all methods