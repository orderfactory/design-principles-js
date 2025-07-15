/**
 * Occam's Razor (OR) Principle - Correct Implementation
 *
 * Occam's Razor states that "entities should not be multiplied without necessity" or more simply,
 * "the simplest solution is usually the best one." In programming, this means choosing the simplest
 * solution that meets the requirements, avoiding unnecessary complexity, and not adding features
 * or abstractions unless they're needed.
 *
 * In this example, we create a simple text formatter that follows Occam's Razor by using
 * the simplest approach that meets the requirements.
 */

// Simple text formatter that follows Occam's Razor
class TextFormatter {
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  formatName(firstName, lastName) {
    return `${this.capitalize(firstName)} ${this.capitalize(lastName)}`;
  }

  formatAddress(street, city, state, zip) {
    return `${street}, ${city}, ${state} ${zip}`;
  }

  formatPhoneNumber(phone) {
    // Simple formatting for a 10-digit US phone number
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      return phone; // Return as-is if not a valid 10-digit number
    }
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
}

// Usage example
const formatter = new TextFormatter();

// Format some text
const formattedName = formatter.formatName('john', 'doe');
const formattedAddress = formatter.formatAddress('123 Main St', 'Anytown', 'CA', '12345');
const formattedPhone = formatter.formatPhoneNumber('1234567890');

console.log(`Formatted name: ${formattedName}`);
console.log(`Formatted address: ${formattedAddress}`);
console.log(`Formatted phone: ${formattedPhone}`);

/**
 * This demonstrates Occam's Razor because:
 * 1. The TextFormatter class has a clear, focused purpose
 * 2. Each method does exactly what it needs to do, nothing more
 * 3. The implementation is straightforward and uses the simplest approach for each task
 * 4. There's no unnecessary abstraction, inheritance, or complexity
 * 5. The code doesn't try to anticipate future requirements that don't exist yet
 *
 * The code solves the problem (text formatting) in the simplest way possible,
 * making it easy to understand, maintain, and extend if needed. It doesn't add
 * complexity or features that aren't required by the current requirements.
 */