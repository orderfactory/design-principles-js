/**
 * Convention over Configuration Principle - Correct Implementation
 *
 * The Convention over Configuration (CoC) principle suggests that software should use sensible defaults
 * and follow established conventions, reducing the need for explicit configuration.
 * This makes development faster and easier by minimizing the number of decisions developers need to make.
 *
 * In this example, we demonstrate a form validation library that follows CoC by:
 * 1. Using naming conventions to automatically determine validation rules
 * 2. Providing sensible defaults for common validation scenarios
 * 3. Allowing overrides only when the defaults don't meet specific requirements
 */

// A form validation library that follows Convention over Configuration
class FormValidator {
  constructor() {
    // Default validation rules based on field naming conventions
    this.conventionRules = {
      // Fields ending with 'email' use email validation
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

      // Fields ending with 'phone' use phone validation
      phone: (value) => /^\d{10}$/.test(value),

      // Fields containing 'password' use password validation (min 8 chars, 1 uppercase, 1 number)
      password: (value) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),

      // Fields starting with 'required' must not be empty
      required: (value) => value !== null && value !== undefined && value.trim() !== ''
    };

    // Custom rules can be added to override conventions
    this.customRules = {};
  }

  // Add a custom validation rule (only needed for exceptions to conventions)
  addCustomRule(fieldName, validationFn) {
    this.customRules[fieldName] = validationFn;
  }

  // Validate a form field based on conventions and custom rules
  validateField(fieldName, value) {
    // Check for custom rules first (explicit configuration takes precedence)
    if (this.customRules[fieldName]) {
      return this.customRules[fieldName](value);
    }

    // Apply convention-based rules based on field name patterns
    for (const [pattern, validationFn] of Object.entries(this.conventionRules)) {
      // If the field name contains the pattern, apply the corresponding validation
      if (fieldName.includes(pattern)) {
        return validationFn(value);
      }
    }

    // Default to true if no conventions match (assuming optional field)
    return true;
  }

  // Validate an entire form using conventions
  validateForm(formData) {
    const results = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(formData)) {
      const fieldValid = this.validateField(fieldName, value);
      results[fieldName] = fieldValid;
      if (!fieldValid) isValid = false;
    }

    return {
      isValid,
      results
    };
  }
}

// Usage example
const validator = new FormValidator();

// No need to configure validation rules for standard fields
// The library automatically applies rules based on field naming conventions
const formData = {
  requiredName: "John Doe",
  userEmail: "john@example.com",
  contactPhone: "1234567890",
  userPassword: "Password123"
};

// For special cases, we can add custom rules
validator.addCustomRule('specialField', (value) => value.startsWith('special_'));

// Validate the form
const validationResult = validator.validateForm(formData);
console.log("Form validation result:", validationResult);

// This demonstrates the Convention over Configuration principle because:
// 1. The library uses naming conventions to automatically determine validation rules
// 2. Developers don't need to explicitly configure each field's validation
// 3. The system provides sensible defaults based on established conventions
// 4. Custom configurations are only needed for exceptions to the conventions
// 5. This reduces boilerplate code and makes development faster and less error-prone