/**
 * Virtuous Intolerance Principle - Violation
 *
 * This implementation demonstrates what happens when quality issues are tolerated:
 * - Warnings are ignored or suppressed
 * - Deprecated code is allowed to remain "temporarily"
 * - Technical debt accumulates over time
 * - "It works for now" mentality
 * - Quality standards are inconsistently applied
 *
 * The result is a codebase that gradually degrades, becoming harder to maintain,
 * more bug-prone, and eventually requiring expensive rewrites.
 */

class LenientCodeValidator {
  constructor() {
    this.rules = {
      allowDeprecated: true, // "We'll fix it later"
      tolerateWarnings: true, // "It's just a warning"
      ignoreTodos: true, // "We know about them"
      relaxedStandards: true // "It works, doesn't it?"
    };

    this.errors = [];
    this.warnings = [];
    this.suppressedWarnings = [];
  }

  /**
   * Lenient validation that tolerates issues
   * Only fails on critical errors, everything else is "acceptable"
   */
  validateCode(code) {
    this.errors = [];
    this.warnings = [];
    this.suppressedWarnings = [];

    // Check for problems but be lenient about them
    this.checkDeprecatedAPIs(code);
    this.checkUnusedVariables(code);
    this.checkMagicNumbers(code);
    this.checkTodoComments(code);

    // Suppress warnings if there are too many (tolerance creep)
    if (this.warnings.length > 10) {
      console.log(`⚠ ${this.warnings.length} warnings (suppressed for readability)`);
      this.suppressedWarnings = this.warnings;
      this.warnings = [];
    }

    // Only fail on "critical" errors (everything else is tolerated)
    if (this.errors.length > 0) {
      // But even then, maybe we can ignore some...
      const criticalErrors = this.errors.filter(e => e.severity === 'critical');

      if (criticalErrors.length === 0) {
        console.log('⚠ Non-critical errors found, but proceeding anyway...');
        return {
          valid: true, // "Good enough"
          warnings: this.warnings.length,
          suppressedWarnings: this.suppressedWarnings.length
        };
      }
    }

    return {
      valid: true,
      warnings: this.warnings.length,
      message: 'Code is acceptable (ignoring warnings)'
    };
  }

  checkDeprecatedAPIs(code) {
    const deprecatedPatterns = [
      { pattern: /var\s+\w+/g, message: 'var is deprecated' },
      { pattern: /new Date\(\)\.getYear\(\)/g, message: 'getYear() is deprecated' },
      { pattern: /eval\(/g, message: 'eval() is dangerous' }
    ];

    deprecatedPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        // Just a warning, not an error - we'll fix it "eventually"
        this.warnings.push({
          type: 'DEPRECATED',
          message: `${message} (but it still works)`,
          severity: 'low'
        });
      }
    });
  }

  checkUnusedVariables(code) {
    const declaredVars = (code.match(/(?:const|let|var)\s+(\w+)/g) || [])
      .map(match => match.replace(/(?:const|let|var)\s+/, ''));

    declaredVars.forEach(varName => {
      const occurrences = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
      if (occurrences === 1) {
        // Unused variables are common, just ignore them
        this.warnings.push({
          type: 'UNUSED',
          message: `'${varName}' is unused (might use it later)`,
          severity: 'info'
        });
      }
    });
  }

  checkMagicNumbers(code) {
    // We see magic numbers everywhere, it's fine
    // "Everyone knows what 86400 means" (seconds in a day - but do they?)
    const magicNumberPattern = /\b\d{2,}\b/g;
    const matches = code.match(magicNumberPattern);

    if (matches && matches.length > 5) {
      // Only warn if there are MANY magic numbers
      this.warnings.push({
        type: 'MAGIC_NUMBERS',
        message: 'Consider using named constants (but not required)',
        severity: 'suggestion'
      });
    }
  }

  checkTodoComments(code) {
    const todoPattern = /\/\/\s*TODO|\/\*\s*TODO/gi;
    const matches = code.match(todoPattern);

    if (matches && matches.length > 0) {
      // TODOs are just reminders, not blockers
      console.log(`ℹ Found ${matches.length} TODO(s) - known technical debt`);
      // Don't even add them to warnings, just acknowledge and move on
    }
  }

  /**
   * "Temporary" suppression of warnings
   * Spoiler: It becomes permanent
   */
  suppressWarning(warningType) {
    console.log(`Suppressing ${warningType} warnings globally`);
    // This is how quality standards erode over time
  }
}

/**
 * Lenient build system that tolerates quality issues
 */
class LenientBuildSystem {
  constructor() {
    this.validator = new LenientCodeValidator();
    this.failOnWarnings = false; // "Warnings don't matter"
    this.buildCount = 0;
    this.accumulatedDebt = [];
  }

  build(codeFiles) {
    this.buildCount++;
    console.log(`\nBuild #${this.buildCount} (lenient mode - tolerating issues)...\n`);

    const results = [];
    let totalWarnings = 0;

    for (const file of codeFiles) {
      console.log(`Checking ${file.name}...`);

      const result = this.validator.validateCode(file.content);
      results.push({
        file: file.name,
        status: 'PASSED', // Everything passes!
        warnings: result.warnings || 0
      });

      totalWarnings += result.warnings || 0;

      if (result.warnings > 0) {
        console.log(`  ⚠ ${result.warnings} warning(s) - but build continues`);
        this.accumulatedDebt.push({
          file: file.name,
          warnings: result.warnings,
          buildNumber: this.buildCount
        });
      }
    }

    console.log(`\n✓ Build succeeded (with ${totalWarnings} warnings)`);
    console.log(`  Technical debt items accumulated: ${this.accumulatedDebt.length}`);
    console.log('  "We\'ll fix these later..." (famous last words)\n');

    return results;
  }

  /**
   * Adding suppressions instead of fixing problems
   */
  addSuppression(rule) {
    console.log(`Adding suppression for: ${rule}`);
    console.log('Problem solved! (by ignoring it)\n');
  }

  getDebtReport() {
    console.log('\n=== Technical Debt Report ===');
    console.log(`Total debt items: ${this.accumulatedDebt.length}`);
    console.log('Age of oldest debt:', this.accumulatedDebt[0]?.buildNumber || 0, 'builds ago');
    console.log('Status: Gradually becoming unmaintainable\n');
  }
}

// Usage Example - Demonstrating the violation
console.log('=== Virtuous Intolerance Principle - VIOLATION ===\n');

// Code with multiple quality issues that are tolerated
const messyCode1 = `
var x = 10; // Deprecated var, but "it works"
var unusedValue = 100; // Unused, but maybe we'll need it later?

function calculate() {
  // TODO: Add proper validation
  return x * 86400; // Magic number - what does 86400 mean?
}

var result = calculate();
`;

const messyCode2 = `
var userName = 'admin';
var tempDebugVar = 'test'; // Left from debugging session
var anotherUnused = null;

function login() {
  // TODO: Implement proper authentication
  // TODO: Add error handling
  // TODO: Add logging
  if (userName.length > 0) {
    return true;
  }
}

var loginResult = login();
`;

const messyCode3 = `
// This file has been here for 6 months with these issues...
var globalConfig = {}; // Should be const

function processData(data) {
  // TODO: This is a hack, refactor later
  var temp1 = data;
  var temp2 = temp1; // Unnecessary variable
  var unusedTemp3 = null;

  // Magic numbers everywhere
  if (temp2.length > 100) {
    return temp2.slice(0, 50);
  }

  return temp2;
}
`;

const buildSystem = new LenientBuildSystem();

// Build 1: Initial warnings appear
console.log('--- Build 1: First signs of technical debt ---');
buildSystem.build([
  { name: 'module1.js', content: messyCode1 }
]);

// Build 2: More debt accumulates
console.log('--- Build 2: Debt accumulates ---');
buildSystem.build([
  { name: 'module1.js', content: messyCode1 },
  { name: 'module2.js', content: messyCode2 }
]);

// Build 3: Even more issues, but build still passes
console.log('--- Build 3: Debt grows further ---');
buildSystem.build([
  { name: 'module1.js', content: messyCode1 },
  { name: 'module2.js', content: messyCode2 },
  { name: 'module3.js', content: messyCode3 }
]);

// Instead of fixing, add suppressions
console.log('--- "Solution": Add suppressions instead of fixing ---');
buildSystem.addSuppression('no-var');
buildSystem.addSuppression('no-unused-vars');
buildSystem.addSuppression('no-magic-numbers');

buildSystem.getDebtReport();

console.log(`
/**
 * Problems with Tolerating Quality Issues:
 *
 * 1. Technical Debt Accumulation
 *    - "We'll fix it later" becomes "We'll never fix it"
 *    - Each tolerated issue makes the next one easier to tolerate
 *    - Debt compounds like interest on a loan
 *
 * 2. Degraded Code Quality
 *    - Standards erode over time
 *    - New developers copy existing patterns (including bad ones)
 *    - "Broken windows" effect - visible neglect encourages more neglect
 *
 * 3. Hidden Bugs and Issues
 *    - Warnings often indicate real problems
 *    - Important issues get lost in noise
 *    - Critical warnings are overlooked among numerous "acceptable" ones
 *
 * 4. Increased Maintenance Cost
 *    - Future changes become risky and expensive
 *    - Refactoring becomes a major project instead of continuous improvement
 *    - Eventually requires complete rewrites
 *
 * 5. Reduced Team Velocity
 *    - Developers spend time navigating around issues
 *    - Fear of "breaking something" slows development
 *    - Context switching to understand deprecated patterns
 *
 * 6. Cultural Impact
 *    - "Good enough" becomes the standard
 *    - Quality consciousness diminishes
 *    - Professional pride erodes
 *
 * The Virtuous Intolerance Principle prevents these problems by maintaining
 * strict standards from the start. It's easier to keep a codebase clean than
 * to clean up after years of tolerance.
 */
`);

/**
 * Real-world example: The Gradual Descent
 *
 * Month 1: "We have 5 warnings, but the deadline is tight. We'll fix them next sprint."
 * Month 3: "We have 23 warnings now. Let's prioritize new features first."
 * Month 6: "We have 147 warnings. We need to suppress some to see real issues."
 * Month 12: "We have 500+ warnings. Nobody looks at warnings anymore."
 * Month 18: "Our build is slow, our code is brittle, and we need a rewrite."
 *
 * Virtuous Intolerance breaks this cycle by maintaining zero tolerance from day one.
 */
