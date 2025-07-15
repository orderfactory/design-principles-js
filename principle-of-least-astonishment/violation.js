// Principle of Least Astonishment (PoLA) - Violation
// This file demonstrates violations of the principle by implementing functions and methods
// that behave in surprising or counterintuitive ways.

// Example: A string utility with inconsistent and surprising behavior

class StringUtil {
  // Inconsistent parameter ordering across methods
  // Misleading method names
  // Unexpected return values

  // Name suggests capitalization but it actually reverses the string
  capitalize(str) {
    if (typeof str !== 'string') return null; // Inconsistent error handling
    return str.split('').reverse().join('');
  }

  // Parameter order is reversed from what you'd expect
  // (modifier first, then the string)
  truncate(maxLength, str) {
    if (typeof str !== 'string') return 0; // Unexpected return type
    return str.substring(0, maxLength);
  }

  // Name suggests padding but it actually removes characters
  pad(str, length) {
    if (typeof str !== 'string') return undefined; // Another different error return
    return str.substring(0, Math.min(str.length, length));
  }

  // Inconsistent with other methods - takes options object instead of parameters
  format(options) {
    const { text, uppercase } = options || {};
    if (uppercase) {
      return text.toUpperCase();
    }
    return text;
  }
}

// Array utilities with surprising behavior
const arrayHelpers = {
  // Inconsistent parameter ordering compared to standard array methods
  // (callback first, then array)
  filter(predicate, array) {
    return array.filter(predicate);
  },

  // Name suggests it returns the first element, but it modifies the array
  first(array) {
    if (array.length > 0) {
      const first = array[0];
      array.shift(); // Side effect: modifies the original array!
      return first;
    }
    return null;
  },

  // Name suggests it adds elements, but it actually replaces the array
  add(array, element) {
    array.length = 0; // Empties the original array
    array.push(element);
    return array;
  },

  // Inconsistent return value - sometimes returns array, sometimes a single value
  process(array) {
    if (array.length === 0) return [];
    if (array.length === 1) return array[0]; // Returns element instead of array
    return array.map(x => x * 2);
  }
};

// Date formatter with counterintuitive behavior
function formatDate(format, date) {
  // Unexpected parameter order (format first, then date)

  if (!format) {
    // Silently uses current date if no date provided
    date = date || new Date();
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  if (!date) {
    // Returns a function instead of an error when date is missing
    return (newDate) => formatDate(format, newDate);
  }

  // Inconsistent format strings compared to common conventions
  if (format === 'short') {
    // 'short' unexpectedly uses European format
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } else if (format === 'long') {
    // 'long' unexpectedly uses ISO format
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // Default case returns unexpected format
  return date.toString();
}

// Usage examples that demonstrate the surprising behavior
const util = new StringUtil();
console.log(util.capitalize('hello world')); // "dlrow olleh" (reverses instead of capitalizing)
console.log(util.truncate(5, 'This is a long text')); // "This " (note reversed parameters)
console.log(util.pad('hello', 3)); // "hel" (truncates instead of padding)
console.log(util.format({ text: 'hello', uppercase: true })); // "HELLO" (inconsistent parameter style)

const numbers = [1, 2, 3, 4, 5];
const numbersCopy = [...numbers];
console.log(arrayHelpers.first(numbers)); // 1
console.log(numbers); // [2, 3, 4, 5] (original array was modified!)

const moreNumbers = [10, 20];
console.log(arrayHelpers.add(moreNumbers, 30)); // [30] (original array was emptied!)
console.log(arrayHelpers.process([42])); // 42 (returns element instead of array)

// Date formatting with surprising behavior
console.log(formatDate('short', new Date(2023, 0, 15))); // "15/1/2023" (European format)
console.log(formatDate(null, new Date(2023, 0, 15))); // "1/15/2023"
console.log(formatDate('long')); // Returns a function instead of an error