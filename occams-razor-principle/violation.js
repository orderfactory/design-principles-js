/**
 * Occam's Razor (OR) Principle - Violation
 *
 * Occam's Razor states that "entities should not be multiplied without necessity" or more simply,
 * "the simplest solution is usually the best one." In programming, this means choosing the simplest
 * solution that meets the requirements, avoiding unnecessary complexity, and not adding features
 * or abstractions unless they're needed.
 *
 * This file demonstrates a violation of this principle by implementing a text formatter with
 * unnecessary complexity, over-engineering, and excessive abstraction.
 */

// Abstract formatter interface
class FormatterStrategy {
  constructor(name) {
    this.name = name;
    this.formatCount = 0;
  }

  format(input) {
    this.formatCount++;
    throw new Error('Method not implemented');
  }

  getStatistics() {
    return {
      name: this.name,
      formatCount: this.formatCount,
      lastUsed: new Date()
    };
  }
}

// Concrete formatter implementations
class CapitalizationFormatter extends FormatterStrategy {
  constructor() {
    super('Capitalization');
  }

  format(text) {
    super.format();
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

class NameFormatter extends FormatterStrategy {
  constructor(capitalizationFormatter) {
    super('Name');
    this.capitalizationFormatter = capitalizationFormatter;
  }

  format(firstName, lastName) {
    super.format();
    return `${this.capitalizationFormatter.format(firstName)} ${this.capitalizationFormatter.format(lastName)}`;
  }
}

class AddressFormatter extends FormatterStrategy {
  constructor() {
    super('Address');
    this.addressCache = new Map();
  }

  format(street, city, state, zip) {
    super.format();

    // Unnecessary caching mechanism
    const cacheKey = `${street}|${city}|${state}|${zip}`;
    if (this.addressCache.has(cacheKey)) {
      console.log('Using cached address format');
      return this.addressCache.get(cacheKey);
    }

    const formattedAddress = `${street}, ${city}, ${state} ${zip}`;
    this.addressCache.set(cacheKey, formattedAddress);
    return formattedAddress;
  }
}

class PhoneNumberFormatter extends FormatterStrategy {
  constructor() {
    super('Phone');
    this.supportedFormats = ['US', 'International'];
    this.currentFormat = 'US';
  }

  setFormat(format) {
    if (!this.supportedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
    this.currentFormat = format;
  }

  format(phone) {
    super.format();

    // Unnecessary validation and format switching
    if (!/^\d+$/.test(phone)) {
      throw new Error('Phone number must contain only digits');
    }

    if (this.currentFormat === 'US') {
      if (phone.length !== 10) {
        throw new Error('US phone numbers must be 10 digits');
      }
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    } else {
      // International format not even used in this example
      return `+${phone}`;
    }
  }
}

// Formatter factory
class FormatterFactory {
  static createFormatter(type, dependencies = {}) {
    switch (type.toLowerCase()) {
      case 'capitalization':
        return new CapitalizationFormatter();
      case 'name':
        return new NameFormatter(dependencies.capitalizationFormatter);
      case 'address':
        return new AddressFormatter();
      case 'phone':
        return new PhoneNumberFormatter();
      default:
        throw new Error(`Unknown formatter type: ${type}`);
    }
  }
}

// Over-engineered text formatter manager
class TextFormatterManager {
  constructor() {
    this.formatters = {};
    this.formattingHistory = [];
    this.initializeFormatters();
  }

  initializeFormatters() {
    // Create capitalization formatter first as it's a dependency
    this.formatters.capitalization = FormatterFactory.createFormatter('capitalization');

    // Create other formatters with dependencies
    this.formatters.name = FormatterFactory.createFormatter('name', {
      capitalizationFormatter: this.formatters.capitalization
    });
    this.formatters.address = FormatterFactory.createFormatter('address');
    this.formatters.phone = FormatterFactory.createFormatter('phone');
  }

  formatName(firstName, lastName) {
    const result = this.formatters.name.format(firstName, lastName);
    this.logFormatting('name', { firstName, lastName }, result);
    return result;
  }

  formatAddress(street, city, state, zip) {
    const result = this.formatters.address.format(street, city, state, zip);
    this.logFormatting('address', { street, city, state, zip }, result);
    return result;
  }

  formatPhoneNumber(phone) {
    try {
      const result = this.formatters.phone.format(phone);
      this.logFormatting('phone', { phone }, result);
      return result;
    } catch (error) {
      this.logError('phone', error.message);
      return phone; // Fall back to original input
    }
  }

  // Unnecessary logging and analytics
  logFormatting(type, input, output) {
    this.formattingHistory.push({
      timestamp: new Date(),
      type,
      input,
      output,
      success: true
    });
  }

  logError(type, errorMessage) {
    this.formattingHistory.push({
      timestamp: new Date(),
      type,
      errorMessage,
      success: false
    });
  }

  getFormattingHistory() {
    return this.formattingHistory;
  }

  getFormattingStatistics() {
    const stats = {};
    Object.entries(this.formatters).forEach(([name, formatter]) => {
      stats[name] = formatter.getStatistics();
    });
    return stats;
  }

  // Unnecessary configuration options
  setPhoneFormat(format) {
    this.formatters.phone.setFormat(format);
  }
}

// Usage example
const formatterManager = new TextFormatterManager();

// Format some text
const formattedName = formatterManager.formatName('john', 'doe');
const formattedAddress = formatterManager.formatAddress('123 Main St', 'Anytown', 'CA', '12345');
const formattedPhone = formatterManager.formatPhoneNumber('1234567890');

console.log(`Formatted name: ${formattedName}`);
console.log(`Formatted address: ${formattedAddress}`);
console.log(`Formatted phone: ${formattedPhone}`);

// Use unnecessary features
formatterManager.setPhoneFormat('US'); // Already the default
console.log('Formatting history:', formatterManager.getFormattingHistory());
console.log('Formatting statistics:', formatterManager.getFormattingStatistics());

/**
 * This violates Occam's Razor because:
 * 1. It uses an unnecessary class hierarchy and inheritance for simple text formatting
 * 2. It implements a factory pattern that adds complexity without real benefit
 * 3. It includes unnecessary features like formatting history and statistics
 * 4. It adds error handling and caching mechanisms that aren't needed for the requirements
 * 5. It creates abstractions (like the international phone format) that aren't used
 * 6. The code is much harder to understand, maintain, and debug
 *
 * All of this complexity is unnecessary for a simple text formatter that just needs to format
 * names, addresses, and phone numbers. The solution is over-engineered and violates Occam's Razor
 * by adding complexity that doesn't provide any real benefit for the current requirements.
 */