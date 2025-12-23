/**
 * Recoverable Change Principle (RCP) - VIOLATION
 *
 * This file demonstrates violations of the Recoverable Change Principle.
 * These patterns create "one-way doors" where changes cannot be safely
 * recovered from, leading to extended outages and data loss.
 *
 * Key violations demonstrated:
 * 1. Schema migrations without forward compatibility
 * 2. Feature flags without lifecycle management
 * 3. External effects without compensation workflows
 * 4. Recovery requiring coordination (meetings)
 * 5. Untested rollback paths
 * 6. Reversibility debt accumulation
 */

// =============================================================================
// VIOLATION 1: Schema Migrations Without Forward Compatibility
// =============================================================================

/**
 * BAD: Destructive migration that breaks the previous application version.
 * If we need to rollback the application, it will crash because the
 * column it expects no longer exists.
 */
class DestructiveMigrationManager {
  constructor(database) {
    this.database = database;
    this.migrations = [];
  }

  /**
   * BAD: Renames column directly - previous app version will crash
   */
  async migrateUserEmailToContactEmail() {
    // This breaks the previous application version immediately
    await this.database.execute(`
      ALTER TABLE users RENAME COLUMN email TO contact_email;
    `);
    console.log('Migration complete: renamed email to contact_email');
    // If we rollback the app, it will try to SELECT email and fail!
  }

  /**
   * BAD: Drops column without ensuring old code doesn't need it
   */
  async removeDeprecatedField() {
    // No check if old application version is still running
    // No dual-read period to ensure safety
    await this.database.execute(`
      ALTER TABLE orders DROP COLUMN legacy_status;
    `);
    console.log('Dropped legacy_status column');
    // Rollback is now impossible - data is gone
  }

  /**
   * BAD: Changes column type destructively
   */
  async changeStatusToEnum() {
    // Converts free-text to enum, losing any non-matching values
    await this.database.execute(`
      ALTER TABLE orders
      ALTER COLUMN status TYPE order_status_enum
      USING status::order_status_enum;
    `);
    // If old app writes 'PENDING_REVIEW', it will fail
    // If we rollback, the new enum values won't convert back
  }

  /**
   * BAD: "Down migration" that's never been tested
   */
  async rollbackEmailRename() {
    // This exists but has never been run against production data
    // It probably doesn't handle NULL values, constraints, or indexes
    await this.database.execute(`
      ALTER TABLE users RENAME COLUMN contact_email TO email;
    `);
    // Untested rollback is not a rollback - it's a hope
  }
}

// =============================================================================
// VIOLATION 2: Feature Flags Without Lifecycle Management
// =============================================================================

/**
 * BAD: Feature flags with no ownership, expiration, or removal plan.
 * These accumulate as permanent complexity in the codebase.
 */
class UnmanagedFeatureFlags {
  constructor() {
    // BAD: No metadata about ownership, creation, or expiration
    this.flags = {
      'new-checkout': true,
      'experiment-pricing-v2': true,
      'temp-fix-for-issue-1234': true,  // "Temporary" from 2019
      'use-new-api': false,
      'dark-mode': true,
      'holiday-banner-2022': true,       // Still here in 2025
      'experimental-search': true,
      'disable-feature-x': true,         // Double negative confusion
      'enable-feature-x-v2': false,      // Conflicts with above?
    };
  }

  isEnabled(flagName) {
    return this.flags[flagName] ?? false;
  }

  /**
   * BAD: Nested flag checks create combinatorial complexity
   */
  getCheckoutFlow(user) {
    if (this.isEnabled('new-checkout')) {
      if (this.isEnabled('experiment-pricing-v2')) {
        if (this.isEnabled('use-new-api')) {
          return 'new-checkout-v2-new-api';
        } else {
          return 'new-checkout-v2-old-api';
        }
      } else {
        if (this.isEnabled('temp-fix-for-issue-1234')) {
          return 'new-checkout-v1-with-hotfix';
        }
        return 'new-checkout-v1';
      }
    } else {
      // Nobody knows if this path still works
      return 'legacy-checkout';
    }
    // 8 possible code paths, most untested
    // Which combination is production? Nobody knows.
  }

  /**
   * BAD: No way to know if a flag can be removed
   */
  canRemoveFlag(flagName) {
    // We have no usage tracking
    // We have no owner to ask
    // We have no documentation of what it controls
    // We have no tests that run with it off
    console.log(`Who owns ${flagName}? What does it do? Is anyone using it?`);
    return false; // So we never remove anything
  }
}

// =============================================================================
// VIOLATION 3: External Effects Without Compensation
// =============================================================================

/**
 * BAD: Triggers irreversible external effects with no compensation path.
 * When something goes wrong, manual intervention is the only recovery.
 */
class IrreversibleOrderProcessor {
  constructor(paymentService, emailService, webhookService, inventoryService) {
    this.paymentService = paymentService;
    this.emailService = emailService;
    this.webhookService = webhookService;
    this.inventoryService = inventoryService;
  }

  /**
   * BAD: Fires multiple external effects with no compensation workflow
   */
  async processOrder(order) {
    // Step 1: Charge payment - IRREVERSIBLE
    const paymentResult = await this.paymentService.charge(order.total);
    // No refund workflow if later steps fail

    // Step 2: Send confirmation email - IRREVERSIBLE
    await this.emailService.send({
      to: order.customerEmail,
      template: 'order-confirmation',
      data: { orderId: order.id, total: order.total }
    });
    // If order fails later, customer has wrong email

    // Step 3: Fire webhook to partners - IRREVERSIBLE
    await this.webhookService.notify('order.created', {
      orderId: order.id,
      products: order.products
    });
    // Partners may have already started fulfillment

    // Step 4: Update inventory - IRREVERSIBLE
    for (const item of order.products) {
      await this.inventoryService.decrement(item.sku, item.quantity);
    }

    // Step 5: Something fails here...
    await this.saveOrderToDatabase(order);
    // DATABASE ERROR!

    // Now what?
    // - Payment was charged but order doesn't exist
    // - Customer got confirmation for a ghost order
    // - Partners think they need to ship
    // - Inventory is wrong
    // Manual cleanup required. Customer angry. Partners confused.
  }

  /**
   * BAD: "Rollback" that requires manual intervention
   */
  async attemptRecovery(orderId) {
    console.log(`
      Recovery steps for failed order ${orderId}:
      1. Contact payment team to issue refund (Slack #payment-ops)
      2. Contact customer service to send apology email
      3. Contact partner integrations to cancel webhook
      4. Manually adjust inventory in admin panel
      5. File incident report
      6. Schedule post-mortem meeting

      Estimated time: 2-4 hours
      Required approvals: 3 teams
    `);
    // This is not recovery. This is an incident.
  }
}

// =============================================================================
// VIOLATION 4: Recovery Requiring Coordination (Meetings)
// =============================================================================

/**
 * BAD: Deployment/rollback process that requires human coordination.
 * At 3 AM, this means extended outages while people are contacted.
 */
class CoordinatedDeploymentProcess {
  constructor() {
    this.deploymentState = 'idle';
    this.requiredApprovers = ['engineering-lead', 'product-owner', 'sre-oncall'];
  }

  async deploy(version) {
    console.log('Starting deployment...');

    // BAD: Deployment touches shared state that others depend on
    await this.updateSharedConfiguration();
    await this.migrateSharedDatabase();
    await this.notifyDependentServices();

    this.deploymentState = 'deployed';
    console.log(`Deployed version ${version}`);
  }

  /**
   * BAD: Rollback requires coordination and approvals
   */
  async rollback() {
    console.log('Initiating rollback...');

    // Step 1: Get approvals (at 3 AM this means waking people up)
    const approvals = await this.getApprovals();
    if (approvals.length < 2) {
      throw new Error('Rollback requires 2 approvals. Please contact on-call managers.');
    }

    // Step 2: Coordinate with dependent teams
    console.log('Notifying dependent teams of rollback...');
    const teams = ['team-payments', 'team-inventory', 'team-notifications'];
    for (const team of teams) {
      // Each team needs to acknowledge before we proceed
      await this.getTeamAcknowledgment(team);
    }

    // Step 3: Schedule rollback window
    console.log('Rollback requires maintenance window. Next available: 6 hours.');

    // Step 4: Execute rollback (finally, after hours of coordination)
    // By now, customers have been impacted for hours
    await this.executeRollback();
  }

  async getApprovals() {
    // This sends pages/calls to sleeping people
    // And waits for their response
    // Average response time at 3 AM: 15-30 minutes per person
    return [];
  }

  async getTeamAcknowledgment(team) {
    // Each team needs to stop their deployments
    // Check their dependencies
    // Confirm they're ready
    // This takes 30-60 minutes per team
    console.log(`Waiting for ${team} acknowledgment...`);
  }
}

// =============================================================================
// VIOLATION 5: API Changes Without Deprecation or Compatibility
// =============================================================================

/**
 * BAD: Breaking API changes with no transition period.
 * Consumers break immediately with no migration path.
 */
class BreakingApiEvolution {
  constructor() {
    this.version = 2;
  }

  /**
   * BAD: V1 response format removed without warning
   * V1 clients immediately break when V2 deploys
   */
  getUser(userId) {
    // V1 format (what clients expect):
    // { id, name, email, created_at }

    // V2 format (what we now return):
    return {
      data: {
        id: userId,
        attributes: {
          name: 'John Doe',
          emailAddress: 'john@example.com',  // Field renamed!
          createdAt: '2025-01-15T10:30:00Z',  // Format changed!
        },
        meta: {
          version: 2
        }
      }
    };
    // Every V1 client just broke
    // We have no idea who's using V1
    // We have no usage metrics
    // Rollback means breaking V2 clients who already adapted
  }

  /**
   * BAD: No tracking of API version usage
   */
  getApiUsageByVersion() {
    // We don't know:
    // - How many clients use V1 vs V2
    // - Who those clients are
    // - Whether it's safe to remove V1
    return { error: 'Not implemented' };
  }

  /**
   * BAD: No deprecation warnings
   */
  handleRequest(request) {
    // We don't warn clients using old patterns
    // We don't provide migration guides
    // We don't give sunset dates
    // One day we just break them
  }
}

// =============================================================================
// VIOLATION 6: Reversibility Debt Accumulation
// =============================================================================

/**
 * BAD: System that has accumulated so much reversibility debt
 * that almost no change can be safely rolled back.
 */
class LegacySystemWithReversibilityDebt {
  constructor() {
    this.technicalDebt = [];
    this.reversibilityDebt = [];
  }

  auditRecoverability() {
    // Catalog of things we can't roll back
    this.reversibilityDebt = [
      {
        component: 'user-table-migration-2021',
        issue: 'Down migration was never written',
        impact: 'Cannot rollback user service past v4.2',
        createdDate: '2021-03-15',
        owner: 'Unknown (left company)'
      },
      {
        component: 'feature-flag-new-pricing',
        issue: 'Flag has been on for 2 years, off-path is broken',
        impact: 'Cannot disable new pricing without major incident',
        createdDate: '2023-01-10',
        owner: 'Unknown'
      },
      {
        component: 'partner-api-v1-removal',
        issue: 'V1 code was deleted, some partners still call it',
        impact: 'Cannot support legacy partners without rewrite',
        createdDate: '2024-06-01',
        owner: 'Partner team (3 people left)'
      },
      {
        component: 'payment-processor-migration',
        issue: 'Old processor credentials expired and were deleted',
        impact: 'Cannot switch back to old processor',
        createdDate: '2024-09-15',
        owner: 'Payments team'
      },
      {
        component: 'config-v2-migration',
        issue: 'Old config format parser was removed',
        impact: 'Cannot rollback config service past v2.0',
        createdDate: '2022-11-20',
        owner: 'Platform team'
      }
    ];

    console.log('=== REVERSIBILITY DEBT AUDIT ===');
    console.log(`Total items: ${this.reversibilityDebt.length}`);
    console.log('Each item represents a one-way door we walked through.');
    console.log('Rollback options are severely limited.');

    // Nobody tracks this
    // Nobody prioritizes fixing this
    // It only matters during incidents
    // By then it's too late
  }

  /**
   * BAD: New deployment adds more reversibility debt
   */
  async deployNewVersion() {
    // We're about to make another irreversible change
    // But we won't document it
    // We won't test rollback
    // We'll just hope it works

    console.log('Deploying... fingers crossed we won\'t need to rollback!');

    // The list of things we can't undo grows silently
    this.reversibilityDebt.push({
      component: 'latest-deployment',
      issue: 'No rollback testing performed',
      impact: 'Unknown until we try',
      createdDate: new Date().toISOString(),
      owner: 'Current on-call'
    });
  }
}

// =============================================================================
// USAGE EXAMPLE: The 3 AM Incident
// =============================================================================

async function nightmareScenario() {
  console.log('=== 3:00 AM: ALERT! Production is down ===\n');

  // Try to rollback the feature flag
  const flags = new UnmanagedFeatureFlags();
  console.log('Checking feature flags...');
  console.log(`Can we disable new-checkout? ${flags.canRemoveFlag('new-checkout')}`);
  console.log('We don\'t know what code paths that affects.\n');

  // Try to rollback the deployment
  const deployment = new CoordinatedDeploymentProcess();
  console.log('Attempting rollback...');
  try {
    await deployment.rollback();
  } catch (e) {
    console.log(`Rollback blocked: ${e.message}`);
    console.log('Need to wake up managers and coordinate with 3 teams.\n');
  }

  // Check reversibility debt
  const legacy = new LegacySystemWithReversibilityDebt();
  legacy.auditRecoverability();

  console.log('\n=== 7:00 AM: Still in incident ===');
  console.log('MTTR: 4+ hours and counting');
  console.log('Customer impact: Significant');
  console.log('Root cause: We built one-way doors everywhere.');
}

nightmareScenario();

module.exports = {
  DestructiveMigrationManager,
  UnmanagedFeatureFlags,
  IrreversibleOrderProcessor,
  CoordinatedDeploymentProcess,
  BreakingApiEvolution,
  LegacySystemWithReversibilityDebt
};
