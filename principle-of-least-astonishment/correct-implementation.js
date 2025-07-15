// Principle of Least Astonishment (PoLA) - Correct Implementation
// The principle states that a component of a system should behave in a way that users expect it to behave,
// reducing surprise or astonishment when they interact with it.

// Example: A string formatting utility with intuitive behavior

class StringFormatter {
  // Methods have consistent naming and parameter ordering
  // Method names clearly describe what they do
  // Parameters are in a logical order (main string first, then modifiers)

  capitalize(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  truncate(str, maxLength) {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  }

  padLeft(str, length, char = ' ') {
    if (typeof str !== 'string') return '';
    return str.padStart(length, char);
  }

  padRight(str, length, char = ' ') {
    if (typeof str !== 'string') return '';
    return str.padEnd(length, char);
  }
}

// Array utility functions with consistent behavior
const arrayUtils = {
  // First parameter is always the array being operated on
  // Return values are predictable and consistent

  first(array) {
    if (!Array.isArray(array) || array.length === 0) return undefined;
    return array[0];
  },

  last(array) {
    if (!Array.isArray(array) || array.length === 0) return undefined;
    return array[array.length - 1];
  },

  // Consistent with Array.prototype.filter behavior
  filterPositive(array) {
    if (!Array.isArray(array)) return [];
    return array.filter(num => typeof num === 'number' && num > 0);
  },

  // Consistent with Array.prototype.map behavior
  double(array) {
    if (!Array.isArray(array)) return [];
    return array.map(num => typeof num === 'number' ? num * 2 : num);
  }
};

// Date formatter with intuitive parameter ordering and consistent return types
function formatDate(date, format = 'MM/DD/YYYY') {
  if (!(date instanceof Date) || isNaN(date)) {
    return 'Invalid Date';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Format is intuitive and follows common conventions
  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  } else if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }

  // Default fallback that still makes sense
  return `${month}/${day}/${year}`;
}

// Usage examples that demonstrate the intuitive behavior
const formatter = new StringFormatter();
console.log(formatter.capitalize('hello world')); // "Hello world"
console.log(formatter.truncate('This is a long text', 10)); // "This is a..."
console.log(formatter.padLeft('42', 5, '0')); // "00042"

const numbers = [1, 2, 3, 4, 5];
console.log(arrayUtils.first(numbers)); // 1
console.log(arrayUtils.last(numbers)); // 5
console.log(arrayUtils.filterPositive([-1, 0, 2, -3, 4])); // [2, 4]
console.log(arrayUtils.double(numbers)); // [2, 4, 6, 8, 10]

const today = new Date(2023, 0, 15); // January 15, 2023
console.log(formatDate(today)); // "01/15/2023"
console.log(formatDate(today, 'YYYY-MM-DD')); // "2023-01-15"