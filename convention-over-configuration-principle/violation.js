/**
 * Convention over Configuration Principle - Violation Example
 *
 * This example demonstrates a violation of the Convention over Configuration principle
 * where every aspect of the system requires explicit configuration, even when following
 * common patterns that could be inferred through conventions.
 *
 * This violates the principle because it creates unnecessary complexity, requires more code,
 * and forces developers to make many decisions that could be automated through conventions.
 */

// A form validation library that violates Convention over Configuration
class FormValidator {
  constructor() {
    // No default conventions - every validation rule must be explicitly configured
    this.validationRules = {};
  }

  // Every field requires explicit configuration
  addValidationRule(fieldName, validationType, options = {}) {
    if (!this.validationRules[fieldName]) {
      this.validationRules[fieldName] = [];
    }

    // Each validation type needs its own implementation
    switch (validationType) {
      case 'required':
        this.validationRules[fieldName].push({
          type: 'required',
          validate: (value) => value !== null && value !== undefined && value.trim() !== '',
          message: options.message || 'This field is required'
        });
        break;

      case 'email':
        this.validationRules[fieldName].push({
          type: 'email',
          validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: options.message || 'Please enter a valid email address'
        });
        break;

      case 'phone':
        this.validationRules[fieldName].push({
          type: 'phone',
          validate: (value) => /^\d{10}$/.test(value),
          message: options.message || 'Please enter a valid 10-digit phone number'
        });
        break;

      case 'password':
        const minLength = options.minLength || 8;
        const requireUppercase = options.requireUppercase !== undefined ? options.requireUppercase : true;
        const requireNumber = options.requireNumber !== undefined ? options.requireNumber : true;

        this.validationRules[fieldName].push({
          type: 'password',
          validate: (value) => {
            let valid = value.length >= minLength;
            if (requireUppercase) valid = valid && /[A-Z]/.test(value);
            if (requireNumber) valid = valid && /\d/.test(value);
            return valid;
          },
          message: options.message || `Password must be at least ${minLength} characters long${requireUppercase ? ', contain an uppercase letter' : ''}${requireNumber ? ', and contain a number' : ''}`
        });
        break;

      case 'custom':
        if (!options.validator || typeof options.validator !== 'function') {
          throw new Error('Custom validator requires a validator function');
        }
        this.validationRules[fieldName].push({
          type: 'custom',
          validate: options.validator,
          message: options.message || 'Invalid value'
        });
        break;

      default:
        throw new Error(`Unknown validation type: ${validationType}`);
    }
  }

  // Validate a field
  validateField(fieldName, value) {
    // If no rules are configured, we can't validate
    if (!this.validationRules[fieldName]) {
      console.warn(`No validation rules configured for field: ${fieldName}`);
      return { valid: true, errors: [] };
    }

    const errors = [];

    // Check each configured rule
    for (const rule of this.validationRules[fieldName]) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate an entire form
  validateForm(formData) {
    const results = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(formData)) {
      const fieldResult = this.validateField(fieldName, value);
      results[fieldName] = fieldResult;
      if (!fieldResult.valid) isValid = false;
    }

    return {
      isValid,
      results
    };
  }
}

// Usage example
const validator = new FormValidator();

// Every field requires explicit configuration, even for common patterns
validator.addValidationRule('name', 'required');
validator.addValidationRule('email', 'required');
validator.addValidationRule('email', 'email');
validator.addValidationRule('phone', 'required');
validator.addValidationRule('phone', 'phone');
validator.addValidationRule('password', 'required');
validator.addValidationRule('password', 'password', {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true
});

// Even for a simple special case, we need verbose configuration
validator.addValidationRule('specialField', 'custom', {
  validator: (value) => value.startsWith('special_'),
  message: 'Special field must start with "special_"'
});

// Validate a form
const formData = {
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  password: "Password123",
  specialField: "special_value"
};

const validationResult = validator.validateForm(formData);
console.log("Form validation result:", validationResult);

// This violates the Convention over Configuration principle because:
// 1. Every field requires explicit configuration, even for common patterns
// 2. There are no sensible defaults or conventions based on field names
// 3. Developers must make many decisions that could be automated
// 4. The code is more verbose and harder to maintain
// 5. Adding new fields requires significant configuration effort
// 6. Changes to validation logic require updating many configuration points