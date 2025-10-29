/**
 * Virtuous Intolerance Principle - Correct Implementation
 *
 * The Virtuous Intolerance Principle states that codebases should maintain zero-indifference
 * toward quality issues like warnings, deprecated APIs, code smells, and technical debt.
 * Through disciplined intolerance—consistent small acts of care and cleanup—you prevent
 * issues from accumulating and causing bigger problems later.
 *
 * This implementation demonstrates:
 * - Disciplined validation where warnings are treated as actionable signals
 * - Immediate resolution of deprecated patterns
 * - Failing fast on quality issues (targets code, not coders)
 * - Enforcing standards consistently through automation
 * - Preventing technical debt accumulation through continuous integrity
 */

class DisciplinedCodeValidator {
  constructor() {
    this.rules = {
      noDeprecatedAPIs: true,
      noUnusedVariables: true,
      noMagicNumbers: true,
      requireTypeAnnotations: true,
      noTodoComments: true,
      strictNaming: true
    };

    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validates code with disciplined intolerance
   * Warnings are treated as errors (actionable signals that must be addressed)
   * This targets code quality, not developer worth
   */
  validateCode(code) {
    this.errors = [];
    this.warnings = [];

    // Check for deprecated patterns
    this.checkDeprecatedAPIs(code);

    // Check for unused variables
    this.checkUnusedVariables(code);

    // Check for magic numbers
    this.checkMagicNumbers(code);

    // Check for TODO comments (technical debt)
    this.checkTodoComments(code);

    // Disciplined: Convert all warnings to errors (zero-indifference)
    if (this.warnings.length > 0) {
      this.warnings.forEach(warning => {
        this.errors.push({
          type: 'ERROR',
          message: `Promoted warning to error: ${warning.message}`,
          line: warning.line,
          severity: 'blocking'
        });
      });
      this.warnings = [];
    }

    // Fail fast if any errors exist
    if (this.errors.length > 0) {
      throw new ValidationError('Code validation failed', this.errors);
    }

    return {
      valid: true,
      message: 'Code meets all quality standards'
    };
  }

  checkDeprecatedAPIs(code) {
    const deprecatedPatterns = [
      { pattern: /var\s+\w+/g, message: 'Use const or let instead of var' },
      { pattern: /new Date\(\)\.getYear\(\)/g, message: 'getYear() is deprecated, use getFullYear()' },
      { pattern: /eval\(/g, message: 'eval() is deprecated and dangerous' }
    ];

    deprecatedPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        this.errors.push({
          type: 'DEPRECATED_API',
          message,
          severity: 'blocking'
        });
      }
    });
  }

  checkUnusedVariables(code) {
    // Simplified check - in real implementation would use AST parsing
    const declaredVars = (code.match(/const\s+(\w+)/g) || [])
      .map(match => match.replace('const ', ''));

    declaredVars.forEach(varName => {
      // Count occurrences (once for declaration)
      const occurrences = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
      if (occurrences === 1) {
        this.warnings.push({
          type: 'UNUSED_VARIABLE',
          message: `Variable '${varName}' is declared but never used`,
          severity: 'warning'
        });
      }
    });
  }

  checkMagicNumbers(code) {
    // Check for hard-coded numbers (except 0, 1, -1)
    const magicNumberPattern = /(?<!\w)(?<!const\s\w+\s=\s)(?<![01])[2-9]\d+(?!\w)/g;
    const matches = code.match(magicNumberPattern);

    if (matches && matches.length > 0) {
      this.warnings.push({
        type: 'MAGIC_NUMBER',
        message: `Found ${matches.length} magic number(s). Use named constants instead.`,
        severity: 'warning'
      });
    }
  }

  checkTodoComments(code) {
    const todoPattern = /\/\/\s*TODO|\/\*\s*TODO/gi;
    const matches = code.match(todoPattern);

    if (matches && matches.length > 0) {
      this.errors.push({
        type: 'TECHNICAL_DEBT',
        message: `Found ${matches.length} TODO comment(s). Complete the work or create a ticket.`,
        severity: 'blocking'
      });
    }
  }
}

class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  toString() {
    const errorList = this.errors
      .map((e, i) => `  ${i + 1}. [${e.type}] ${e.message}`)
      .join('\n');
    return `${this.message}:\n${errorList}`;
  }
}

/**
 * Build system that enforces disciplined quality standards
 */
class DisciplinedBuildSystem {
  constructor() {
    this.validator = new DisciplinedCodeValidator();
    this.failOnWarnings = true; // Zero-indifference: warnings are actionable
  }

  build(codeFiles) {
    console.log('Starting build with disciplined quality enforcement...\n');

    const results = [];

    for (const file of codeFiles) {
      console.log(`Validating ${file.name}...`);

      try {
        const result = this.validator.validateCode(file.content);
        results.push({
          file: file.name,
          status: 'PASSED',
          result
        });
        console.log(`✓ ${file.name} passed validation\n`);
      } catch (error) {
        results.push({
          file: file.name,
          status: 'FAILED',
          error: error.toString()
        });
        console.error(`✗ ${file.name} failed validation:`);
        console.error(error.toString() + '\n');

        // Fail fast - stop build immediately
        throw new Error(`Build failed: ${file.name} does not meet quality standards`);
      }
    }

    console.log('✓ Build completed successfully - all files meet quality standards');
    return results;
  }

  /**
   * Automated refactoring to fix deprecated code
   * Better to fix than to tolerate
   */
  autoFix(code) {
    let fixed = code;

    // Replace var with const/let
    fixed = fixed.replace(/var\s+(\w+)\s*=/g, 'const $1 =');

    // Replace deprecated getYear with getFullYear
    fixed = fixed.replace(/\.getYear\(\)/g, '.getFullYear()');

    console.log('Auto-fixed deprecated patterns');
    return fixed;
  }
}

// Usage Example
console.log('=== Virtuous Intolerance Principle - Correct Implementation ===\n');

// Example 1: Clean code that passes strict validation
const cleanCode = `
const MAX_USERS = 100;
const users = [];

function addUser(user) {
  if (users.length < MAX_USERS) {
    users.push(user);
    return true;
  }
  return false;
}

const result = addUser({ name: 'Alice' });
console.log(result);
`;

// Example 2: Code with quality issues
const problematicCode = `
const MAX_USERS = 100;
const users = [];
const unusedVariable = 'not used anywhere';

function addUser(user) {
  if (users.length < 50) {
    users.push(user);
    return true;
  }
  return false;
}
`;

// Example 3: Code with TODO comments
const codeWithDebt = `
const users = [];
// TODO: Add validation here
function addUser(user) {
  users.push(user);
}
`;

const buildSystem = new DisciplinedBuildSystem();

try {
  console.log('--- Test 1: Clean code ---');
  buildSystem.build([{ name: 'clean.js', content: cleanCode }]);
  console.log('');
} catch (error) {
  console.error('Build failed:', error.message, '\n');
}

try {
  console.log('--- Test 2: Code with warnings (treated as errors) ---');
  buildSystem.build([{ name: 'problematic.js', content: problematicCode }]);
  console.log('');
} catch (error) {
  console.error('Build failed:', error.message);
  console.log('Disciplined intolerance: Warnings are treated as errors, build stops immediately.\n');
}

try {
  console.log('--- Test 3: Code with technical debt ---');
  buildSystem.build([{ name: 'debt.js', content: codeWithDebt }]);
  console.log('');
} catch (error) {
  console.error('Build failed:', error.message);
  console.log('Disciplined intolerance: Technical debt is addressed immediately, not deferred.\n');
}

console.log('--- Test 4: Auto-fixing deprecated code ---');
const deprecatedCode = 'var x = 10; var y = new Date().getYear();';
console.log('Before:', deprecatedCode);
const fixedCode = buildSystem.autoFix(deprecatedCode);
console.log('After:', fixedCode);
console.log('Better to fix issues immediately than to tolerate them.\n');

/**
 * Benefits of Disciplined Intolerance (Virtuous Intolerance):
 *
 * 1. Prevents Technical Debt Through Continuous Integrity
 *    - Issues are addressed immediately through small acts of care
 *    - Codebase stays clean and maintainable through daily discipline
 *    - "Later" becomes "never" less often
 *
 * 2. Sustains High Quality Standards
 *    - Consistent enforcement across the entire codebase
 *    - Excellence becomes the path of least resistance
 *    - Standards create positive momentum, not friction
 *
 * 3. Makes Problems Visible and Fixable
 *    - Warnings are treated as actionable signals, not noise
 *    - Failing fast prevents issues from spreading
 *    - Clean systems make mistakes obvious and correction effortless
 *
 * 4. Builds a Culture of Care for Code
 *    - Team learns to respect the system and one another
 *    - Discipline targets code quality, not developer worth
 *    - Psychological safety with high standards
 *
 * 5. Reduces Long-term Costs Through Incremental Improvement
 *    - Small fixes now prevent big refactorings later
 *    - Ratcheting approach allows legacy systems to improve gradually
 *    - Code remains easy to modify and extend
 *
 * 6. Creates Observable Progress
 *    - Metrics make quality improvement visible and celebratable
 *    - Teams can see warning counts drop from 200 to 20 to 0
 *    - Measurement reinforces the virtuous feedback loop
 */
