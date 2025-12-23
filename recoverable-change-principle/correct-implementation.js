/**
 * Recoverable Change Principle (RCP) - CORRECT IMPLEMENTATION
 *
 * This file demonstrates proper implementation of the Recoverable Change Principle.
 * Every significant change has a defined, tested recovery path - whether that's
 * rollback, compensation, or forward-fix.
 *
 * Key patterns demonstrated:
 * 1. Expand-contract schema migrations (forward-compatible)
 * 2. Feature flags with lifecycle management
 * 3. Compensating workflows for external effects
 * 4. Self-service recovery (no coordination required)
 * 5. Tested recovery paths
 * 6. Reversibility debt tracking and management
 *
 * Core invariant: At any point after deployment, the previous production version
 * must be able to run safely, OR a documented compensation path must exist.
 */

// =============================================================================
// PATTERN 1: Expand-Contract Schema Migrations
// =============================================================================

/**
 * GOOD: Schema migrations that maintain forward compatibility.
 * The previous application version can always run safely against the new schema.
 */
class ForwardCompatibleMigrationManager {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
    this.migrationState = new Map();
  }

  /**
   * GOOD: Expand-contract migration for renaming a column
   * Phase 1: Add new column (both old and new code work)
   * Phase 2: Dual-write to both columns
   * Phase 3: Migrate reads to new column
   * Phase 4: (Optional, later) Remove old column
   */
  async migrateEmailToContactEmail() {
    const migrationId = 'user-email-to-contact-email';

    // Phase 1: EXPAND - Add new column
    await this.phase1_addNewColumn(migrationId);

    // Phase 2: DUAL-WRITE - Application writes to both
    // (This is a code change, not a migration)
    await this.phase2_enableDualWrite(migrationId);

    // Phase 3: BACKFILL - Copy existing data
    await this.phase3_backfillData(migrationId);

    // Phase 4: MIGRATE READS - Application reads from new column
    // (This is a code change, not a migration)

    // Phase 5: CONTRACT - Remove old column (optional, much later)
    // Only after confirming no old application versions are running
  }

  async phase1_addNewColumn(migrationId) {
    this.logger.info({ migrationId, phase: 1 }, 'Adding new column');

    await this.database.execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
    `);

    // Old app version: still works, doesn't know about contact_email
    // New app version: can start using contact_email
    // Rollback: trivial - old app just ignores the new column

    this.migrationState.set(migrationId, {
      phase: 1,
      startedAt: new Date(),
      rollbackPath: 'Old application version works without changes'
    });
  }

  async phase2_enableDualWrite(migrationId) {
    // This is tracked but happens in application code
    this.logger.info({ migrationId, phase: 2 }, 'Dual-write enabled in application');

    // Application now writes: UPDATE users SET email = ?, contact_email = ?
    // Old app: reads email column (still populated)
    // New app: reads contact_email column (now populated)
    // Rollback: disable dual-write flag, old app works fine
  }

  async phase3_backfillData(migrationId) {
    this.logger.info({ migrationId, phase: 3 }, 'Backfilling data');

    // Backfill in batches to avoid locking
    const batchSize = 1000;
    let processed = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await this.database.execute(`
        UPDATE users
        SET contact_email = email
        WHERE contact_email IS NULL
          AND email IS NOT NULL
        LIMIT ${batchSize};
      `);

      processed += result.rowCount;
      hasMore = result.rowCount === batchSize;

      this.logger.info({
        migrationId,
        phase: 3,
        processed,
        batchComplete: true
      }, 'Backfill progress');

      // Checkpoint - if we crash, we resume from here
    }

    this.migrationState.set(migrationId, {
      phase: 3,
      startedAt: this.migrationState.get(migrationId).startedAt,
      completedAt: new Date(),
      rowsProcessed: processed,
      rollbackPath: 'Data exists in both columns - either version works'
    });
  }

  /**
   * GOOD: Recovery verification before proceeding
   */
  async verifyRollbackSafety(migrationId) {
    const state = this.migrationState.get(migrationId);

    return {
      canRollback: true,
      previousVersionCompatible: true,
      dataPreserved: true,
      rollbackSteps: [
        '1. Deploy previous application version',
        '2. Application reads from email column (still populated)',
        '3. No data migration required',
        '4. New contact_email column can be dropped later if needed'
      ],
      estimatedRollbackTime: '< 5 minutes',
      coordinationRequired: false
    };
  }
}

// =============================================================================
// PATTERN 2: Feature Flags with Lifecycle Management
// =============================================================================

/**
 * GOOD: Feature flags with ownership, expiration, and removal tracking.
 * Flags are temporary by design, not permanent complexity.
 */
class ManagedFeatureFlags {
  constructor(logger, metricsCollector) {
    this.logger = logger;
    this.metrics = metricsCollector;

    // Each flag has full lifecycle metadata
    this.flags = new Map([
      ['checkout-v2', {
        enabled: true,
        owner: 'checkout-team',
        ownerEmail: 'checkout-team@company.com',
        createdAt: new Date('2025-01-15'),
        expiresAt: new Date('2025-04-15'),  // 90 days max
        removalTicket: 'JIRA-4521',
        description: 'New checkout flow with improved UX',
        rollbackCriteria: {
          errorRateThreshold: 0.01,  // 1%
          p99LatencyMs: 500,
          conversionDropPercent: 5
        },
        lastEvaluated: null,
        evaluationCount: 0
      }],
      ['payment-retry-logic', {
        enabled: true,
        owner: 'payments-team',
        ownerEmail: 'payments-team@company.com',
        createdAt: new Date('2025-02-01'),
        expiresAt: new Date('2025-05-01'),
        removalTicket: 'JIRA-4789',
        description: 'Improved payment retry with exponential backoff',
        rollbackCriteria: {
          paymentFailureRateThreshold: 0.02,
          duplicateChargeCount: 0
        },
        lastEvaluated: null,
        evaluationCount: 0
      }]
    ]);
  }

  /**
   * GOOD: Flag evaluation with usage tracking
   */
  isEnabled(flagName, context = {}) {
    const flag = this.flags.get(flagName);

    if (!flag) {
      this.logger.warn({ flagName }, 'Unknown feature flag requested');
      return false;
    }

    // Track usage for removal safety analysis
    flag.lastEvaluated = new Date();
    flag.evaluationCount++;

    // Check expiration warning
    const now = new Date();
    const daysUntilExpiry = (flag.expiresAt - now) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry < 0) {
      this.logger.error({
        flagName,
        owner: flag.owner,
        expiredDaysAgo: Math.abs(Math.floor(daysUntilExpiry))
      }, 'EXPIRED feature flag still in use!');
      this.metrics.increment('feature_flag.expired_usage', { flag: flagName });
    } else if (daysUntilExpiry < 14) {
      this.logger.warn({
        flagName,
        owner: flag.owner,
        daysUntilExpiry: Math.floor(daysUntilExpiry)
      }, 'Feature flag approaching expiration');
    }

    // Record evaluation for metrics
    this.metrics.increment('feature_flag.evaluated', {
      flag: flagName,
      enabled: flag.enabled
    });

    return flag.enabled;
  }

  /**
   * GOOD: Instant rollback capability - no deployment required
   */
  async disableFlag(flagName, reason) {
    const flag = this.flags.get(flagName);

    if (!flag) {
      throw new Error(`Unknown flag: ${flagName}`);
    }

    const previousState = flag.enabled;
    flag.enabled = false;

    this.logger.info({
      flagName,
      previousState,
      newState: false,
      reason,
      timestamp: new Date().toISOString()
    }, 'Feature flag disabled (instant rollback)');

    this.metrics.increment('feature_flag.rollback', { flag: flagName });

    return {
      flagName,
      previousState,
      newState: false,
      rollbackTime: new Date(),
      noDeploymentRequired: true
    };
  }

  /**
   * GOOD: Safe removal check with usage data
   */
  canRemoveFlag(flagName) {
    const flag = this.flags.get(flagName);

    if (!flag) {
      return { canRemove: false, reason: 'Flag not found' };
    }

    // Check if flag has been stable (always on or always off)
    const isStable = flag.evaluationCount > 1000; // Sufficient sample size
    const hasRemovalTicket = !!flag.removalTicket;
    const isExpired = new Date() > flag.expiresAt;

    return {
      canRemove: isStable && hasRemovalTicket,
      flagName,
      owner: flag.owner,
      ownerEmail: flag.ownerEmail,
      createdAt: flag.createdAt,
      expiresAt: flag.expiresAt,
      isExpired,
      evaluationCount: flag.evaluationCount,
      lastEvaluated: flag.lastEvaluated,
      removalTicket: flag.removalTicket,
      removalSteps: [
        `1. Verify ${flag.removalTicket} is approved`,
        `2. Confirm with ${flag.owner} that removal is safe`,
        `3. Remove flag checks from code`,
        `4. Remove flag from this registry`,
        `5. Deploy and monitor`
      ]
    };
  }

  /**
   * GOOD: Audit of all flags approaching expiration
   */
  getExpiringFlags(daysThreshold = 14) {
    const now = new Date();
    const expiring = [];

    for (const [name, flag] of this.flags) {
      const daysUntilExpiry = (flag.expiresAt - now) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < daysThreshold) {
        expiring.push({
          name,
          owner: flag.owner,
          ownerEmail: flag.ownerEmail,
          daysUntilExpiry: Math.floor(daysUntilExpiry),
          removalTicket: flag.removalTicket,
          evaluationCount: flag.evaluationCount
        });
      }
    }

    return expiring;
  }
}

// =============================================================================
// PATTERN 3: Compensating Workflows for External Effects
// =============================================================================

/**
 * GOOD: Order processing with compensation for every external effect.
 * If any step fails, we can compensate for completed steps.
 */
class RecoverableOrderProcessor {
  constructor(services, logger) {
    this.paymentService = services.paymentService;
    this.emailService = services.emailService;
    this.webhookService = services.webhookService;
    this.inventoryService = services.inventoryService;
    this.orderRepository = services.orderRepository;
    this.logger = logger;

    // Track completed steps for compensation
    this.completedSteps = [];
  }

  /**
   * GOOD: Process order with compensation tracking
   */
  async processOrder(order) {
    const correlationId = this.generateCorrelationId();
    this.completedSteps = [];

    try {
      // Step 1: Reserve inventory (reversible)
      await this.reserveInventory(order, correlationId);

      // Step 2: Process payment (compensatable via refund)
      const paymentResult = await this.processPayment(order, correlationId);

      // Step 3: Save order to database (reversible)
      await this.saveOrder(order, paymentResult, correlationId);

      // Step 4: Send confirmation email (compensatable via correction email)
      await this.sendConfirmation(order, correlationId);

      // Step 5: Notify partners (compensatable via cancellation event)
      await this.notifyPartners(order, correlationId);

      this.logger.info({ correlationId, orderId: order.id }, 'Order processed successfully');

      return { success: true, orderId: order.id, correlationId };

    } catch (error) {
      this.logger.error({
        correlationId,
        orderId: order.id,
        error: error.message,
        completedSteps: this.completedSteps
      }, 'Order processing failed, initiating compensation');

      // Compensate all completed steps in reverse order
      await this.compensate(order, correlationId);

      throw error;
    }
  }

  async reserveInventory(order, correlationId) {
    for (const item of order.products) {
      await this.inventoryService.reserve(item.sku, item.quantity, correlationId);
    }

    this.completedSteps.push({
      step: 'inventory_reserved',
      data: { products: order.products },
      compensate: async () => {
        for (const item of order.products) {
          await this.inventoryService.releaseReservation(item.sku, item.quantity, correlationId);
        }
        this.logger.info({ correlationId }, 'Inventory reservation released');
      }
    });
  }

  async processPayment(order, correlationId) {
    const result = await this.paymentService.charge({
      amount: order.total,
      customerId: order.customerId,
      correlationId,
      metadata: { orderId: order.id }
    });

    this.completedSteps.push({
      step: 'payment_charged',
      data: { transactionId: result.transactionId, amount: order.total },
      compensate: async () => {
        await this.paymentService.refund({
          transactionId: result.transactionId,
          amount: order.total,
          reason: 'Order processing failed',
          correlationId
        });
        this.logger.info({
          correlationId,
          transactionId: result.transactionId
        }, 'Payment refunded');
      }
    });

    return result;
  }

  async saveOrder(order, paymentResult, correlationId) {
    await this.orderRepository.create({
      ...order,
      paymentTransactionId: paymentResult.transactionId,
      status: 'confirmed',
      correlationId
    });

    this.completedSteps.push({
      step: 'order_saved',
      data: { orderId: order.id },
      compensate: async () => {
        await this.orderRepository.updateStatus(order.id, 'cancelled', correlationId);
        this.logger.info({ correlationId, orderId: order.id }, 'Order marked as cancelled');
      }
    });
  }

  async sendConfirmation(order, correlationId) {
    const emailId = await this.emailService.send({
      to: order.customerEmail,
      template: 'order-confirmation',
      data: { orderId: order.id, total: order.total },
      correlationId
    });

    this.completedSteps.push({
      step: 'confirmation_sent',
      data: { emailId },
      compensate: async () => {
        // Send correction email
        await this.emailService.send({
          to: order.customerEmail,
          template: 'order-cancelled',
          data: {
            orderId: order.id,
            reason: 'We encountered an issue processing your order. ' +
                    'Any charges have been refunded. We apologize for the inconvenience.'
          },
          correlationId
        });
        this.logger.info({ correlationId }, 'Cancellation email sent');
      }
    });
  }

  async notifyPartners(order, correlationId) {
    const webhookId = await this.webhookService.notify('order.created', {
      orderId: order.id,
      products: order.products,
      correlationId
    });

    this.completedSteps.push({
      step: 'partners_notified',
      data: { webhookId },
      compensate: async () => {
        // Send cancellation event with same correlation ID
        await this.webhookService.notify('order.cancelled', {
          orderId: order.id,
          originalWebhookId: webhookId,
          correlationId,
          reason: 'Order processing failed after initial notification'
        });
        this.logger.info({ correlationId }, 'Partner cancellation sent');
      }
    });
  }

  /**
   * GOOD: Compensate all completed steps in reverse order
   */
  async compensate(order, correlationId) {
    this.logger.info({
      correlationId,
      stepsToCompensate: this.completedSteps.length
    }, 'Starting compensation');

    // Process in reverse order (LIFO)
    const stepsToCompensate = [...this.completedSteps].reverse();

    for (const step of stepsToCompensate) {
      try {
        await step.compensate();
        this.logger.info({
          correlationId,
          step: step.step
        }, 'Compensation step completed');
      } catch (compensationError) {
        // Log but continue - best effort compensation
        this.logger.error({
          correlationId,
          step: step.step,
          error: compensationError.message
        }, 'Compensation step failed - manual intervention may be required');

        // Record for manual follow-up
        await this.recordCompensationFailure(order, step, compensationError, correlationId);
      }
    }
  }

  async recordCompensationFailure(order, step, error, correlationId) {
    // This goes to a dead-letter queue for manual processing
    await this.orderRepository.recordCompensationFailure({
      orderId: order.id,
      step: step.step,
      stepData: step.data,
      error: error.message,
      correlationId,
      timestamp: new Date(),
      requiresManualIntervention: true
    });
  }

  generateCorrelationId() {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =============================================================================
// PATTERN 4: Self-Service Recovery (No Coordination Required)
// =============================================================================

/**
 * GOOD: Deployment system where any on-call engineer can recover.
 * No approvals, no coordination, no meetings at 3 AM.
 */
class SelfServiceDeploymentSystem {
  constructor(logger, metrics) {
    this.logger = logger;
    this.metrics = metrics;
    this.deploymentHistory = [];
    this.currentVersion = null;
    this.previousVersion = null;
  }

  /**
   * GOOD: Deploy with automatic rollback capability
   */
  async deploy(version, options = {}) {
    // Save current as previous for instant rollback
    this.previousVersion = this.currentVersion;
    this.currentVersion = version;

    const deployment = {
      version,
      deployedAt: new Date(),
      deployedBy: options.deployedBy || 'system',
      previousVersion: this.previousVersion,
      rollbackAvailable: true,
      healthChecksPassed: false
    };

    this.deploymentHistory.push(deployment);

    this.logger.info({
      version,
      previousVersion: this.previousVersion
    }, 'Deployment started');

    // Run health checks
    const healthy = await this.runHealthChecks(version);
    deployment.healthChecksPassed = healthy;

    if (!healthy && options.autoRollbackOnFailure !== false) {
      this.logger.warn({ version }, 'Health checks failed, auto-rolling back');
      await this.rollback('Automatic: health checks failed');
      return { success: false, rolledBack: true };
    }

    return {
      success: true,
      version,
      previousVersion: this.previousVersion,
      rollbackCommand: `deploy.rollback("${this.previousVersion}")`,
      canRollbackWithoutApproval: true
    };
  }

  /**
   * GOOD: Instant rollback - any engineer can execute
   */
  async rollback(reason) {
    if (!this.previousVersion) {
      throw new Error('No previous version available for rollback');
    }

    const rollbackStart = Date.now();

    // No approvals needed
    // No coordination needed
    // No meetings needed
    // Just do it

    const rolledBackFrom = this.currentVersion;
    this.currentVersion = this.previousVersion;
    this.previousVersion = rolledBackFrom;

    const rollbackDuration = Date.now() - rollbackStart;

    this.logger.info({
      rolledBackFrom,
      rolledBackTo: this.currentVersion,
      reason,
      durationMs: rollbackDuration
    }, 'Rollback completed');

    this.metrics.timing('deployment.rollback_duration_ms', rollbackDuration);
    this.metrics.increment('deployment.rollback_count');

    return {
      success: true,
      rolledBackFrom,
      rolledBackTo: this.currentVersion,
      durationMs: rollbackDuration,
      approvalRequired: false,
      coordinationRequired: false,
      meetingRequired: false
    };
  }

  /**
   * GOOD: Recovery decision guide for on-call
   */
  getRecoveryPlaybook() {
    return {
      title: 'Production Recovery Playbook',
      whenToRollback: [
        'Error rate > 1% (check dashboard)',
        'P99 latency > 500ms',
        'Any 5xx errors from critical paths',
        'Customer-reported issues confirmed'
      ],
      howToRollback: [
        '1. Run: kubectl rollout undo deployment/app',
        '   OR: deploy.rollback() in admin console',
        '2. Monitor error rate for 5 minutes',
        '3. Post in #incidents that rollback was executed',
        '4. Create incident ticket for follow-up'
      ],
      approvalsRequired: 'NONE - any on-call engineer can rollback',
      coordinationRequired: 'NONE - rollback is self-contained',
      estimatedTime: '< 5 minutes',
      whoCanExecute: 'Any engineer with on-call access'
    };
  }

  async runHealthChecks(version) {
    // Simulate health checks
    return true;
  }
}

// =============================================================================
// PATTERN 5: API Evolution with Deprecation and Usage Tracking
// =============================================================================

/**
 * GOOD: API versioning with usage tracking and clear deprecation.
 * We know when it's safe to remove old versions.
 */
class VersionedApiManager {
  constructor(logger, metrics) {
    this.logger = logger;
    this.metrics = metrics;

    this.versions = new Map([
      ['v1', {
        status: 'deprecated',
        deprecatedAt: new Date('2025-01-01'),
        sunsetAt: new Date('2025-07-01'),
        usageCount: 0,
        lastUsed: null
      }],
      ['v2', {
        status: 'current',
        introducedAt: new Date('2024-10-01'),
        usageCount: 0,
        lastUsed: null
      }]
    ]);
  }

  /**
   * GOOD: Route request with version tracking
   */
  async handleRequest(request) {
    const version = this.extractVersion(request);
    const versionInfo = this.versions.get(version);

    if (!versionInfo) {
      return { error: 'Unknown API version', supportedVersions: ['v1', 'v2'] };
    }

    // Track usage
    versionInfo.usageCount++;
    versionInfo.lastUsed = new Date();
    this.metrics.increment('api.request', { version });

    // Add deprecation warning to response
    const response = await this.processRequest(request, version);

    if (versionInfo.status === 'deprecated') {
      response.headers = response.headers || {};
      response.headers['Deprecation'] = versionInfo.deprecatedAt.toISOString();
      response.headers['Sunset'] = versionInfo.sunsetAt.toISOString();
      response.headers['Link'] = '</api/v2>; rel="successor-version"';

      this.logger.warn({
        version,
        clientId: request.clientId,
        sunsetAt: versionInfo.sunsetAt
      }, 'Deprecated API version used');
    }

    return response;
  }

  /**
   * GOOD: Check if old version can be safely removed
   */
  canRemoveVersion(version) {
    const versionInfo = this.versions.get(version);

    if (!versionInfo) {
      return { canRemove: false, reason: 'Version not found' };
    }

    const now = new Date();
    const daysSinceLastUse = versionInfo.lastUsed
      ? (now - versionInfo.lastUsed) / (1000 * 60 * 60 * 24)
      : Infinity;

    const isPastSunset = versionInfo.sunsetAt && now > versionInfo.sunsetAt;
    const hasNoRecentUsage = daysSinceLastUse > 30;

    return {
      version,
      canRemove: isPastSunset && hasNoRecentUsage,
      status: versionInfo.status,
      sunsetAt: versionInfo.sunsetAt,
      daysSinceLastUse: Math.floor(daysSinceLastUse),
      usageCount: versionInfo.usageCount,
      recommendation: isPastSunset && hasNoRecentUsage
        ? 'Safe to remove - no recent usage after sunset date'
        : isPastSunset
          ? `Wait for usage to stop (last used ${Math.floor(daysSinceLastUse)} days ago)`
          : `Wait until sunset date: ${versionInfo.sunsetAt}`
    };
  }

  /**
   * GOOD: Provide v1 response with compatibility
   */
  async processRequest(request, version) {
    // Simulated user data
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2025-01-15T10:30:00Z')
    };

    if (version === 'v1') {
      // V1 format: flat structure
      return {
        body: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          created_at: userData.createdAt.toISOString()
        }
      };
    }

    // V2 format: wrapped structure
    return {
      body: {
        data: {
          id: userData.id,
          attributes: {
            name: userData.name,
            emailAddress: userData.email,
            createdAt: userData.createdAt.toISOString()
          },
          meta: { version: 2 }
        }
      }
    };
  }

  extractVersion(request) {
    return request.headers?.['Accept-Version'] || 'v2';
  }
}

// =============================================================================
// PATTERN 6: Reversibility Debt Tracking
// =============================================================================

/**
 * GOOD: Explicit tracking and management of reversibility debt.
 * We know what we can't roll back and actively work to fix it.
 */
class ReversibilityDebtTracker {
  constructor(logger, alerting) {
    this.logger = logger;
    this.alerting = alerting;
    this.debtItems = new Map();
  }

  /**
   * GOOD: Record when we create reversibility debt
   */
  recordDebt(item) {
    const id = `debt-${Date.now()}`;

    this.debtItems.set(id, {
      id,
      component: item.component,
      issue: item.issue,
      impact: item.impact,
      createdAt: new Date(),
      createdBy: item.createdBy,
      owner: item.owner,
      remediationPlan: item.remediationPlan,
      remediationTicket: item.remediationTicket,
      priority: item.priority || 'medium',
      status: 'open'
    });

    this.logger.warn({
      debtId: id,
      component: item.component,
      issue: item.issue
    }, 'Reversibility debt recorded');

    // Alert if high priority
    if (item.priority === 'high') {
      this.alerting.warn(`High-priority reversibility debt: ${item.component} - ${item.issue}`);
    }

    return id;
  }

  /**
   * GOOD: Get audit report of all reversibility debt
   */
  getAuditReport() {
    const items = Array.from(this.debtItems.values());

    const byPriority = {
      high: items.filter(i => i.priority === 'high'),
      medium: items.filter(i => i.priority === 'medium'),
      low: items.filter(i => i.priority === 'low')
    };

    const byStatus = {
      open: items.filter(i => i.status === 'open'),
      inProgress: items.filter(i => i.status === 'in-progress'),
      resolved: items.filter(i => i.status === 'resolved')
    };

    return {
      generatedAt: new Date(),
      summary: {
        total: items.length,
        open: byStatus.open.length,
        inProgress: byStatus.inProgress.length,
        highPriority: byPriority.high.length
      },
      byPriority,
      byStatus,
      oldestOpenItem: items
        .filter(i => i.status === 'open')
        .sort((a, b) => a.createdAt - b.createdAt)[0],
      recommendations: this.generateRecommendations(items)
    };
  }

  generateRecommendations(items) {
    const recommendations = [];

    const openHighPriority = items.filter(i => i.status === 'open' && i.priority === 'high');
    if (openHighPriority.length > 0) {
      recommendations.push({
        priority: 'urgent',
        message: `${openHighPriority.length} high-priority reversibility issues need immediate attention`,
        items: openHighPriority.map(i => i.component)
      });
    }

    const staleItems = items.filter(i => {
      const age = (new Date() - i.createdAt) / (1000 * 60 * 60 * 24);
      return i.status === 'open' && age > 90;
    });
    if (staleItems.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `${staleItems.length} reversibility debt items are over 90 days old`,
        items: staleItems.map(i => i.component)
      });
    }

    return recommendations;
  }

  /**
   * GOOD: Check if a component has recovery capability
   */
  canRecover(component) {
    const debt = Array.from(this.debtItems.values())
      .filter(d => d.component === component && d.status !== 'resolved');

    if (debt.length === 0) {
      return {
        component,
        canRecover: true,
        restrictions: []
      };
    }

    return {
      component,
      canRecover: false,
      restrictions: debt.map(d => ({
        issue: d.issue,
        impact: d.impact,
        remediationPlan: d.remediationPlan
      }))
    };
  }

  /**
   * GOOD: Mark debt as resolved
   */
  resolveDebt(id, resolution) {
    const item = this.debtItems.get(id);

    if (!item) {
      throw new Error(`Debt item not found: ${id}`);
    }

    item.status = 'resolved';
    item.resolvedAt = new Date();
    item.resolution = resolution;

    this.logger.info({
      debtId: id,
      component: item.component,
      resolution
    }, 'Reversibility debt resolved');

    return item;
  }
}

// =============================================================================
// USAGE EXAMPLE: The 3 AM Incident - But This Time We're Ready
// =============================================================================

async function wellPreparedScenario() {
  // Simple mock implementations
  const logger = {
    info: (data, msg) => console.log(`[INFO] ${msg}`, JSON.stringify(data)),
    warn: (data, msg) => console.log(`[WARN] ${msg}`, JSON.stringify(data)),
    error: (data, msg) => console.log(`[ERROR] ${msg}`, JSON.stringify(data))
  };

  const metrics = {
    increment: (name, tags) => {},
    timing: (name, value) => {}
  };

  console.log('=== 3:00 AM: ALERT! Error rate spike detected ===\n');

  // Step 1: Check feature flags - can we disable the new feature?
  const flags = new ManagedFeatureFlags(logger, metrics);
  console.log('Checking if we can disable the problematic feature...');

  const disableResult = await flags.disableFlag('checkout-v2', 'Error rate spike at 3 AM');
  console.log('Feature flag disabled:', {
    flagName: disableResult.flagName,
    noDeploymentRequired: disableResult.noDeploymentRequired
  });
  console.log('');

  // Step 2: If flag doesn't help, can we rollback the deployment?
  const deployment = new SelfServiceDeploymentSystem(logger, metrics);
  deployment.currentVersion = 'v2.3.1';
  deployment.previousVersion = 'v2.3.0';

  console.log('Getting recovery playbook...');
  const playbook = deployment.getRecoveryPlaybook();
  console.log('Approvals required:', playbook.approvalsRequired);
  console.log('Coordination required:', playbook.coordinationRequired);
  console.log('');

  // Execute rollback
  console.log('Executing rollback...');
  const rollbackResult = await deployment.rollback('Error rate spike after deploy');
  console.log('Rollback completed:', {
    rolledBackTo: rollbackResult.rolledBackTo,
    durationMs: rollbackResult.durationMs,
    meetingRequired: rollbackResult.meetingRequired
  });
  console.log('');

  // Step 3: Check reversibility debt - any surprises?
  const debtTracker = new ReversibilityDebtTracker(logger, { warn: () => {} });
  console.log('Checking reversibility debt...');
  const recoveryCheck = debtTracker.canRecover('checkout-service');
  console.log('Can recover checkout-service:', recoveryCheck.canRecover);
  console.log('');

  console.log('=== 3:15 AM: Incident resolved ===');
  console.log('MTTR: 15 minutes');
  console.log('No managers woken up');
  console.log('No coordination meetings required');
  console.log('Customer impact: Minimal');
}

wellPreparedScenario();

module.exports = {
  ForwardCompatibleMigrationManager,
  ManagedFeatureFlags,
  RecoverableOrderProcessor,
  SelfServiceDeploymentSystem,
  VersionedApiManager,
  ReversibilityDebtTracker
};
