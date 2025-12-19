/**
 * INCREMENTAL VALIDITY PRINCIPLE - CORRECT IMPLEMENTATION
 *
 * This file demonstrates correct implementation of the Incremental Validity
 * Principle (IVP).
 *
 * The Incremental Validity Principle states that multi-step and long-running
 * operations should be designed so that interruption at any point leaves the
 * system in a valid, consistent state, with partial progress preserved and
 * resumable rather than lost.
 *
 * CORRECT PATTERNS DEMONSTRATED:
 * 1. Checkpoint-based batch processing - commit after each batch (RESUME strategy)
 * 2. Resumable file uploads - chunked with resume tokens (RESUME strategy)
 * 3. Incremental migrations - per-table commits with state tracking (RESUME strategy)
 * 4. Draft-saving form wizard - persist progress after each step (RESUME strategy)
 * 5. Offset-tracked stream processing - resumable from any position (RESUME strategy)
 * 6. Saga pattern for distributed operations - compensation on failure (COMPENSATE strategy)
 * 7. Mark-and-reconcile pattern - async resolution of partial failures (RECONCILE strategy)
 *
 * RECOVERY STRATEGIES:
 * - RESUME: Continue forward from last checkpoint (simplest, most common)
 * - COMPENSATE: Undo completed steps on failure (complex, strong consistency)
 * - RECONCILE: Mark failed, resolve asynchronously (pragmatic middle ground)
 *
 * These patterns provide:
 * - Minimal lost work on interruption
 * - Clear progress visibility
 * - Automatic or easy resumption
 * - System remains in valid state at all times
 * - Intentional pause/resume capability
 */

// ==================== INFRASTRUCTURE ====================

/**
 * Persistent storage that commits immediately and survives "crashes"
 */
class PersistentDatabase {
  constructor() {
    this.records = new Map();
    this.checkpoints = new Map();
    this.metadata = new Map();
  }

  // Immediate, atomic write
  save(collection, id, data) {
    if (!this.records.has(collection)) {
      this.records.set(collection, new Map());
    }
    this.records.get(collection).set(id, { ...data, savedAt: Date.now() });
  }

  get(collection, id) {
    return this.records.get(collection)?.get(id) || null;
  }

  getAll(collection) {
    return Array.from(this.records.get(collection)?.values() || []);
  }

  count(collection) {
    return this.records.get(collection)?.size || 0;
  }

  // Checkpoint management
  saveCheckpoint(operationId, checkpoint) {
    this.checkpoints.set(operationId, { ...checkpoint, savedAt: Date.now() });
  }

  getCheckpoint(operationId) {
    return this.checkpoints.get(operationId) || null;
  }

  clearCheckpoint(operationId) {
    this.checkpoints.delete(operationId);
  }

  // Metadata for tracking operation state
  setMetadata(key, value) {
    this.metadata.set(key, value);
  }

  getMetadata(key) {
    return this.metadata.get(key);
  }
}

/**
 * Progress reporter for observability
 */
class ProgressReporter {
  constructor(operationId) {
    this.operationId = operationId;
    this.startTime = Date.now();
    this.updates = [];
  }

  report(current, total, phase = 'processing') {
    const update = {
      operationId: this.operationId,
      phase,
      current,
      total,
      percentComplete: Math.round((current / total) * 100),
      elapsedMs: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
    this.updates.push(update);
    console.log(`[Progress] ${this.operationId}: ${update.percentComplete}% (${current}/${total}) - ${phase}`);
    return update;
  }

  complete() {
    console.log(`[Progress] ${this.operationId}: 100% COMPLETE in ${Date.now() - this.startTime}ms`);
  }
}

// ==================== PATTERN 1: CHECKPOINT-BASED BATCH PROCESSING ====================

/**
 * Batch processor that commits after each batch and can resume from checkpoints.
 *
 * Key IVP characteristics:
 * - Commits every N records (configurable batch size)
 * - Saves cursor position to checkpoint store
 * - Can resume from last checkpoint on restart
 * - Progress is observable throughout
 */
class CheckpointBatchProcessor {
  constructor(database, options = {}) {
    this.database = database;
    this.batchSize = options.batchSize || 10;
    this.operationId = options.operationId || `batch-${Date.now()}`;
    this.progress = new ProgressReporter(this.operationId);
  }

  async processRecords(records) {
    // Check for existing checkpoint - enables resume
    const checkpoint = this.database.getCheckpoint(this.operationId);
    let startIndex = checkpoint?.lastProcessedIndex + 1 || 0;

    if (startIndex > 0) {
      console.log(`\nResuming from checkpoint: starting at index ${startIndex}`);
      console.log(`Previously processed: ${startIndex} records`);
    }

    console.log(`Processing ${records.length - startIndex} remaining records in batches of ${this.batchSize}...`);

    try {
      for (let i = startIndex; i < records.length; i += this.batchSize) {
        const batch = records.slice(i, Math.min(i + this.batchSize, records.length));
        await this.processBatch(batch, i);

        // CHECKPOINT: Save progress after each batch
        this.database.saveCheckpoint(this.operationId, {
          lastProcessedIndex: Math.min(i + this.batchSize - 1, records.length - 1),
          totalRecords: records.length,
          batchesCompleted: Math.floor((i + this.batchSize) / this.batchSize),
        });

        this.progress.report(
          Math.min(i + this.batchSize, records.length),
          records.length
        );
      }

      // Clear checkpoint on successful completion
      this.database.clearCheckpoint(this.operationId);
      this.progress.complete();

      return {
        success: true,
        processedCount: records.length,
        resumedFrom: startIndex,
      };

    } catch (error) {
      // Checkpoint already saved - can resume from last successful batch
      const savedCheckpoint = this.database.getCheckpoint(this.operationId);
      console.error(`\nProcessing failed: ${error.message}`);
      console.log(`Progress saved at index ${savedCheckpoint?.lastProcessedIndex}`);
      console.log(`Restart will resume from index ${(savedCheckpoint?.lastProcessedIndex || -1) + 1}`);
      throw error;
    }
  }

  async processBatch(batch, batchStartIndex) {
    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];
      const processedRecord = await this.processRecord(record);

      // Each record is committed individually within the batch
      this.database.save('processed_records', record.id, processedRecord);
    }
  }

  async processRecord(record) {
    // Simulate processing work
    await new Promise((resolve) => setTimeout(resolve, 5));
    return {
      id: record.id,
      data: record.data.toUpperCase(),
      processedAt: new Date().toISOString(),
    };
  }
}

// ==================== PATTERN 2: RESUMABLE FILE UPLOAD ====================

/**
 * Chunked file uploader with resume capability.
 *
 * Key IVP characteristics:
 * - Breaks file into chunks
 * - Server confirms each chunk
 * - Resume token tracks position
 * - Can continue from any chunk on reconnection
 */
class ResumableFileUploader {
  constructor(storage, options = {}) {
    this.storage = storage;
    this.chunkSize = options.chunkSize || 100;
  }

  async upload(fileData, uploadId) {
    // Check for existing upload session
    const existingSession = this.storage.getCheckpoint(`upload-${uploadId}`);
    let startChunk = 0;

    if (existingSession) {
      startChunk = existingSession.completedChunks;
      console.log(`\nResuming upload from chunk ${startChunk}`);
      console.log(`Previously uploaded: ${startChunk * this.chunkSize} bytes`);
    }

    const totalChunks = Math.ceil(fileData.length / this.chunkSize);
    const progress = new ProgressReporter(`upload-${uploadId}`);

    console.log(`Uploading ${fileData.length} bytes in ${totalChunks} chunks...`);

    try {
      for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(start + this.chunkSize, fileData.length);
        const chunk = fileData.slice(start, end);

        // Upload chunk
        await this.uploadChunk(uploadId, chunkIndex, chunk);

        // CHECKPOINT: Save progress after each chunk
        this.storage.saveCheckpoint(`upload-${uploadId}`, {
          completedChunks: chunkIndex + 1,
          totalChunks,
          bytesUploaded: end,
          totalBytes: fileData.length,
        });

        progress.report(chunkIndex + 1, totalChunks, 'uploading');
      }

      // Finalize upload
      await this.finalizeUpload(uploadId);
      this.storage.clearCheckpoint(`upload-${uploadId}`);
      progress.complete();

      return {
        success: true,
        uploadId,
        bytesUploaded: fileData.length,
        resumedFrom: startChunk * this.chunkSize,
      };

    } catch (error) {
      const checkpoint = this.storage.getCheckpoint(`upload-${uploadId}`);
      console.error(`\nUpload failed: ${error.message}`);
      console.log(`Progress saved: ${checkpoint?.bytesUploaded || 0} bytes uploaded`);
      console.log(`Resume will continue from byte ${checkpoint?.bytesUploaded || 0}`);
      throw error;
    }
  }

  async uploadChunk(uploadId, chunkIndex, chunkData) {
    // Simulate chunk upload with server confirmation
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Server would confirm chunk receipt here
  }

  async finalizeUpload(uploadId) {
    // Simulate finalization (server assembles chunks)
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

// ==================== PATTERN 3: INCREMENTAL DATABASE MIGRATION ====================

/**
 * Database migration that commits per-table and tracks state.
 *
 * Key IVP characteristics:
 * - Each table migration is a separate transaction
 * - Migration state is tracked in database
 * - Can resume from failed table
 * - Partial migration is valid (some tables migrated)
 */
class IncrementalMigration {
  constructor(database) {
    this.database = database;
    this.migrationId = `migration-${Date.now()}`;
  }

  async runMigration(tables) {
    // Check for existing migration state
    const state = this.database.getCheckpoint(this.migrationId) || {
      completedTables: [],
      status: 'not_started',
    };

    const pendingTables = tables.filter(
      (t) => !state.completedTables.includes(t.name)
    );

    if (state.completedTables.length > 0) {
      console.log(`\nResuming migration from table ${state.completedTables.length + 1}`);
      console.log(`Already migrated: ${state.completedTables.join(', ')}`);
    }

    console.log(`Migrating ${pendingTables.length} remaining tables...`);
    const progress = new ProgressReporter(this.migrationId);

    // Update state to in_progress
    state.status = 'in_progress';
    this.database.saveCheckpoint(this.migrationId, state);

    try {
      for (const table of pendingTables) {
        console.log(`\nMigrating table: ${table.name}`);

        // Migrate single table (atomic operation)
        await this.migrateTable(table);

        // CHECKPOINT: Save state after each table
        state.completedTables.push(table.name);
        state.lastMigratedAt = new Date().toISOString();
        this.database.saveCheckpoint(this.migrationId, state);

        // Record migration in permanent log
        this.database.save('migration_log', `${this.migrationId}-${table.name}`, {
          migrationId: this.migrationId,
          tableName: table.name,
          migratedAt: new Date().toISOString(),
        });

        progress.report(
          state.completedTables.length,
          tables.length,
          `migrated ${table.name}`
        );
      }

      // Mark migration complete
      state.status = 'completed';
      state.completedAt = new Date().toISOString();
      this.database.saveCheckpoint(this.migrationId, state);
      progress.complete();

      return {
        success: true,
        migratedTables: state.completedTables,
        totalTables: tables.length,
      };

    } catch (error) {
      // State is already saved - migration can resume
      state.status = 'failed';
      state.failedAt = new Date().toISOString();
      state.error = error.message;
      this.database.saveCheckpoint(this.migrationId, state);

      console.error(`\nMigration failed: ${error.message}`);
      console.log(`Completed tables: ${state.completedTables.join(', ')}`);
      console.log(`Resume will continue from table ${state.completedTables.length + 1}`);
      throw error;
    }
  }

  async migrateTable(table) {
    // Simulate table migration
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// ==================== PATTERN 4: DRAFT-SAVING FORM WIZARD ====================

/**
 * Form wizard that persists drafts after each step.
 *
 * Key IVP characteristics:
 * - Each step is saved to persistent storage
 * - Can load existing draft on page reload
 * - Progress is never lost
 * - Supports backward navigation
 */
class DraftSavingFormWizard {
  constructor(storage, formId) {
    this.storage = storage;
    this.formId = formId;
    this.totalSteps = 5;
  }

  // Load existing draft or create new
  loadOrCreate() {
    const existing = this.storage.getCheckpoint(`form-${this.formId}`);
    if (existing) {
      console.log(`Loaded existing draft at step ${existing.currentStep}`);
      return existing;
    }
    const newDraft = {
      formId: this.formId,
      currentStep: 1,
      data: {},
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
    };
    this.storage.saveCheckpoint(`form-${this.formId}`, newDraft);
    return newDraft;
  }

  // Save step data - CHECKPOINT after each step
  saveStep(step, data) {
    const draft = this.storage.getCheckpoint(`form-${this.formId}`);

    draft.data[`step${step}`] = data;
    draft.currentStep = step + 1;
    draft.lastModifiedAt = new Date().toISOString();

    // CHECKPOINT: Persist immediately
    this.storage.saveCheckpoint(`form-${this.formId}`, draft);

    console.log(`Step ${step} saved to draft (persisted)`);
    return this.getProgress();
  }

  // Navigate backward without losing data
  goBack(toStep) {
    const draft = this.storage.getCheckpoint(`form-${this.formId}`);
    draft.currentStep = toStep;
    draft.lastModifiedAt = new Date().toISOString();
    this.storage.saveCheckpoint(`form-${this.formId}`, draft);
    console.log(`Navigated back to step ${toStep} (data preserved)`);
    return draft;
  }

  getProgress() {
    const draft = this.storage.getCheckpoint(`form-${this.formId}`);
    return {
      formId: this.formId,
      currentStep: draft.currentStep,
      totalSteps: this.totalSteps,
      percentComplete: Math.round(((draft.currentStep - 1) / this.totalSteps) * 100),
      hasData: Object.keys(draft.data).length > 0,
      lastModified: draft.lastModifiedAt,
    };
  }

  async submit() {
    const draft = this.storage.getCheckpoint(`form-${this.formId}`);

    try {
      console.log('Submitting form...');
      await this.sendToServer(draft.data);

      // Clear draft only after successful submission
      this.storage.clearCheckpoint(`form-${this.formId}`);
      console.log('Form submitted successfully, draft cleared');

      return { success: true, formId: this.formId };

    } catch (error) {
      // Draft is preserved - user can retry
      console.error(`Submission failed: ${error.message}`);
      console.log('Draft preserved - user can retry submission');
      throw error;
    }
  }

  async sendToServer(data) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// ==================== PATTERN 5: OFFSET-TRACKED STREAM PROCESSOR ====================

/**
 * Stream processor that tracks offset for resumable processing.
 *
 * Key IVP characteristics:
 * - Tracks current position/offset
 * - Commits offset after processing each item
 * - Can resume from any offset
 * - Supports exactly-once semantics
 */
class OffsetTrackedStreamProcessor {
  constructor(storage, streamId) {
    this.storage = storage;
    this.streamId = streamId;
  }

  async processStream(items) {
    // Get committed offset
    const state = this.storage.getCheckpoint(`stream-${this.streamId}`) || {
      offset: 0,
      processedCount: 0,
    };

    const startOffset = state.offset;
    if (startOffset > 0) {
      console.log(`\nResuming from offset ${startOffset}`);
      console.log(`Previously processed: ${state.processedCount} items`);
    }

    const progress = new ProgressReporter(`stream-${this.streamId}`);
    console.log(`Processing ${items.length - startOffset} remaining items...`);

    try {
      for (let offset = startOffset; offset < items.length; offset++) {
        const item = items[offset];

        // Process item
        const result = await this.processItem(item, offset);

        // CHECKPOINT: Commit offset after each item
        // (Could batch for performance, but single-item shown for clarity)
        this.storage.saveCheckpoint(`stream-${this.streamId}`, {
          offset: offset + 1,
          processedCount: state.processedCount + (offset - startOffset) + 1,
          lastProcessedAt: new Date().toISOString(),
        });

        // Store result
        this.storage.save('stream_results', `${this.streamId}-${offset}`, result);

        if ((offset + 1) % 10 === 0 || offset === items.length - 1) {
          progress.report(offset + 1, items.length);
        }
      }

      progress.complete();

      return {
        success: true,
        processedCount: items.length,
        resumedFrom: startOffset,
      };

    } catch (error) {
      const checkpoint = this.storage.getCheckpoint(`stream-${this.streamId}`);
      console.error(`\nStream processing failed: ${error.message}`);
      console.log(`Committed offset: ${checkpoint?.offset || 0}`);
      console.log(`Resume will continue from offset ${checkpoint?.offset || 0}`);
      throw error;
    }
  }

  async processItem(item, offset) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return {
      ...item,
      processed: true,
      offset,
      processedAt: new Date().toISOString(),
    };
  }
}

// ==================== PATTERN 6: SAGA PATTERN FOR DISTRIBUTED OPERATIONS ====================

/**
 * Order processor using the Saga pattern with compensation.
 *
 * Key IVP characteristics:
 * - Each step is a separate, compensatable transaction
 * - State is tracked throughout
 * - Failure triggers compensation for completed steps
 * - System returns to valid state on failure
 */
class SagaOrderProcessor {
  constructor(storage) {
    this.storage = storage;
  }

  async processOrder(order) {
    const sagaId = `saga-${order.id}-${Date.now()}`;
    const progress = new ProgressReporter(sagaId);

    // Initialize saga state
    const sagaState = {
      sagaId,
      orderId: order.id,
      status: 'started',
      completedSteps: [],
      compensatedSteps: [],
      startedAt: new Date().toISOString(),
    };
    this.storage.saveCheckpoint(sagaId, sagaState);

    const steps = [
      {
        name: 'reserveInventory',
        execute: () => this.reserveInventory(order),
        compensate: () => this.releaseInventory(order),
      },
      {
        name: 'chargePayment',
        execute: () => this.chargePayment(order),
        compensate: () => this.refundPayment(order),
      },
      {
        name: 'createShipment',
        execute: () => this.createShipment(order),
        compensate: () => this.cancelShipment(order),
      },
      {
        name: 'sendConfirmation',
        execute: () => this.sendConfirmation(order),
        compensate: () => this.sendCancellation(order),
      },
    ];

    console.log(`Processing order ${order.id} using Saga pattern...`);

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`\nExecuting step: ${step.name}`);

        await step.execute();

        // CHECKPOINT: Record completed step
        sagaState.completedSteps.push(step.name);
        sagaState.lastStepAt = new Date().toISOString();
        this.storage.saveCheckpoint(sagaId, sagaState);

        progress.report(i + 1, steps.length, step.name);
      }

      // Mark saga as complete
      sagaState.status = 'completed';
      sagaState.completedAt = new Date().toISOString();
      this.storage.saveCheckpoint(sagaId, sagaState);
      progress.complete();

      return {
        success: true,
        orderId: order.id,
        sagaId,
        completedSteps: sagaState.completedSteps,
      };

    } catch (error) {
      console.error(`\nStep failed: ${error.message}`);
      console.log('Initiating compensation for completed steps...');

      // Compensate in reverse order
      sagaState.status = 'compensating';
      this.storage.saveCheckpoint(sagaId, sagaState);

      for (let i = sagaState.completedSteps.length - 1; i >= 0; i--) {
        const stepName = sagaState.completedSteps[i];
        const step = steps.find((s) => s.name === stepName);

        try {
          console.log(`Compensating: ${stepName}`);
          await step.compensate();
          sagaState.compensatedSteps.push(stepName);
          this.storage.saveCheckpoint(sagaId, sagaState);
        } catch (compError) {
          console.error(`Compensation failed for ${stepName}: ${compError.message}`);
          // Log for manual intervention but continue compensating other steps
        }
      }

      // Mark saga as compensated
      sagaState.status = 'compensated';
      sagaState.compensatedAt = new Date().toISOString();
      sagaState.error = error.message;
      this.storage.saveCheckpoint(sagaId, sagaState);

      console.log(`\nSaga completed compensation`);
      console.log(`Compensated steps: ${sagaState.compensatedSteps.join(', ')}`);
      console.log('System returned to valid state');

      throw error;
    }
  }

  // Step implementations
  async reserveInventory(order) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    console.log(`  Inventory reserved for order ${order.id}`);
  }

  async releaseInventory(order) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    console.log(`  Inventory released for order ${order.id}`);
  }

  async chargePayment(order) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    console.log(`  Payment charged: $${order.total}`);
  }

  async refundPayment(order) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    console.log(`  Payment refunded: $${order.total}`);
  }

  async createShipment(order) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    console.log(`  Shipment created for order ${order.id}`);
  }

  async cancelShipment(order) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    console.log(`  Shipment cancelled for order ${order.id}`);
  }

  async sendConfirmation(order) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    console.log(`  Confirmation sent for order ${order.id}`);
  }

  async sendCancellation(order) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    console.log(`  Cancellation notice sent for order ${order.id}`);
  }
}

// ==================== PATTERN 7: MARK-AND-RECONCILE PATTERN ====================

/**
 * Data sync processor using the "mark failed, reconcile later" pattern.
 *
 * This is the RECONCILE strategy - a pragmatic middle ground between
 * resume-forward and immediate compensation.
 *
 * Key characteristics:
 * - Failed items are marked, not immediately compensated
 * - Processing continues for remaining items
 * - A separate reconciliation process handles failures asynchronously
 * - Simpler than sagas, more robust than ignore-and-retry
 *
 * Use when:
 * - Immediate compensation isn't critical
 * - Some delay in consistency is acceptable
 * - Failure rate is low enough that async handling is practical
 * - Full saga complexity isn't justified
 */
class ReconcileLaterProcessor {
  constructor(storage) {
    this.storage = storage;
  }

  async syncRecords(records) {
    const syncId = `sync-${Date.now()}`;
    const progress = new ProgressReporter(syncId);

    // Initialize sync state
    const syncState = {
      syncId,
      status: 'in_progress',
      totalRecords: records.length,
      successfulIds: [],
      failedRecords: [], // Store failed records for reconciliation
      startedAt: new Date().toISOString(),
    };
    this.storage.saveCheckpoint(syncId, syncState);

    console.log(`Syncing ${records.length} records (reconcile-later strategy)...`);

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        await this.syncRecord(record);
        syncState.successfulIds.push(record.id);

      } catch (error) {
        // RECONCILE STRATEGY: Mark failed, don't stop processing
        console.log(`  Record ${record.id} failed: ${error.message} (marked for reconciliation)`);

        syncState.failedRecords.push({
          record,
          error: error.message,
          failedAt: new Date().toISOString(),
          reconciled: false,
        });
      }

      // CHECKPOINT: Save state after each record
      this.storage.saveCheckpoint(syncId, syncState);

      if ((i + 1) % 5 === 0 || i === records.length - 1) {
        progress.report(i + 1, records.length);
      }
    }

    // Determine final status
    if (syncState.failedRecords.length === 0) {
      syncState.status = 'completed';
    } else if (syncState.successfulIds.length === 0) {
      syncState.status = 'failed';
    } else {
      syncState.status = 'partial_success'; // Needs reconciliation
    }

    syncState.completedAt = new Date().toISOString();
    this.storage.saveCheckpoint(syncId, syncState);

    // Queue reconciliation job if needed
    if (syncState.failedRecords.length > 0) {
      this.storage.save('reconciliation_queue', syncId, {
        syncId,
        failedCount: syncState.failedRecords.length,
        queuedAt: new Date().toISOString(),
      });
      console.log(`\nQueued ${syncState.failedRecords.length} records for reconciliation`);
    }

    progress.complete();

    return {
      syncId,
      status: syncState.status,
      successCount: syncState.successfulIds.length,
      failedCount: syncState.failedRecords.length,
      needsReconciliation: syncState.failedRecords.length > 0,
    };
  }

  async syncRecord(record) {
    // Simulate sync that sometimes fails
    await new Promise((resolve) => setTimeout(resolve, 20));
    if (record.willFail) {
      throw new Error('External service unavailable');
    }
    console.log(`  Synced record ${record.id}`);
  }

  /**
   * Reconciliation job - runs asynchronously to resolve failures.
   * Could be triggered by a cron job, queue worker, or manual intervention.
   */
  async runReconciliation(syncId) {
    const syncState = this.storage.getCheckpoint(syncId);
    if (!syncState) {
      throw new Error(`Sync ${syncId} not found`);
    }

    const unreconciledRecords = syncState.failedRecords.filter((f) => !f.reconciled);
    if (unreconciledRecords.length === 0) {
      console.log('No records need reconciliation');
      return { reconciled: 0, stillFailed: 0 };
    }

    console.log(`\nReconciling ${unreconciledRecords.length} failed records...`);

    let reconciledCount = 0;
    let stillFailedCount = 0;

    for (const failedRecord of unreconciledRecords) {
      try {
        // Retry the sync
        await this.syncRecord(failedRecord.record);
        failedRecord.reconciled = true;
        failedRecord.reconciledAt = new Date().toISOString();
        reconciledCount++;
        console.log(`  Reconciled record ${failedRecord.record.id}`);

      } catch (error) {
        // Still failing - leave for next reconciliation attempt or manual review
        failedRecord.lastRetryAt = new Date().toISOString();
        failedRecord.retryCount = (failedRecord.retryCount || 0) + 1;
        stillFailedCount++;
        console.log(`  Record ${failedRecord.record.id} still failing (attempt ${failedRecord.retryCount})`);
      }
    }

    // Update sync state
    this.storage.saveCheckpoint(syncId, syncState);

    // Update status if all reconciled
    const remainingFailed = syncState.failedRecords.filter((f) => !f.reconciled);
    if (remainingFailed.length === 0) {
      syncState.status = 'completed';
      syncState.reconciledAt = new Date().toISOString();
      this.storage.saveCheckpoint(syncId, syncState);
      console.log('\nAll records reconciled - sync complete!');
    }

    return { reconciled: reconciledCount, stillFailed: stillFailedCount };
  }
}

// ==================== DEMONSTRATION ====================

async function demonstrateCorrectImplementation() {
  console.log('='.repeat(60));
  console.log('INCREMENTAL VALIDITY PRINCIPLE - CORRECT IMPLEMENTATION');
  console.log('='.repeat(60));

  const storage = new PersistentDatabase();

  // --- Pattern 1: Checkpoint-Based Batch Processing ---
  console.log('\n--- PATTERN 1: Checkpoint-Based Batch Processing ---\n');

  const records = Array.from({ length: 50 }, (_, i) => ({
    id: `record-${i + 1}`,
    data: `data for record ${i + 1}`,
  }));

  // First run - simulate crash at record 35
  const processor1 = new CheckpointBatchProcessor(storage, {
    operationId: 'batch-demo',
    batchSize: 10,
  });

  // Simulate crash
  let processCount = 0;
  const originalProcess = processor1.processRecord.bind(processor1);
  processor1.processRecord = async function (record) {
    processCount++;
    if (processCount === 35) {
      throw new Error('Simulated crash at record 35!');
    }
    return originalProcess(record);
  };

  try {
    await processor1.processRecords(records);
  } catch (error) {
    console.log(`\nFirst run crashed, but progress is saved!`);
    console.log(`Records in database: ${storage.count('processed_records')}`);
  }

  // Second run - resume from checkpoint
  console.log('\n--- Resuming batch processing ---\n');
  const processor2 = new CheckpointBatchProcessor(storage, {
    operationId: 'batch-demo',
    batchSize: 10,
  });

  const result = await processor2.processRecords(records);
  console.log(`\nFinal result: ${storage.count('processed_records')} records processed`);
  console.log(`Resumed from index: ${result.resumedFrom}`);

  // --- Pattern 2: Resumable File Upload ---
  console.log('\n\n--- PATTERN 2: Resumable File Upload ---\n');

  const fileData = new Uint8Array(500);
  const uploader = new ResumableFileUploader(storage, { chunkSize: 50 });

  // Simulate network failure at chunk 7
  let chunkCount = 0;
  const originalUploadChunk = uploader.uploadChunk.bind(uploader);
  uploader.uploadChunk = async function (uploadId, chunkIndex, chunk) {
    chunkCount++;
    if (chunkCount === 7) {
      throw new Error('Network connection lost!');
    }
    return originalUploadChunk(uploadId, chunkIndex, chunk);
  };

  try {
    await uploader.upload(fileData, 'upload-demo');
  } catch (error) {
    console.log(`\nUpload interrupted, but progress is saved!`);
  }

  // Resume upload
  console.log('\n--- Resuming file upload ---\n');
  const uploader2 = new ResumableFileUploader(storage, { chunkSize: 50 });
  const uploadResult = await uploader2.upload(fileData, 'upload-demo');
  console.log(`\nUpload complete! Resumed from byte: ${uploadResult.resumedFrom}`);

  // --- Pattern 3: Draft-Saving Form Wizard ---
  console.log('\n\n--- PATTERN 3: Draft-Saving Form Wizard ---\n');

  const wizard = new DraftSavingFormWizard(storage, 'form-demo');
  wizard.loadOrCreate();

  wizard.saveStep(1, { name: 'John Doe', email: 'john@example.com' });
  wizard.saveStep(2, { address: '123 Main St', city: 'Anytown' });
  wizard.saveStep(3, { cardNumber: '****-1234' });

  console.log('\n[Simulating page refresh / session timeout...]\n');

  // Simulate reload - create new wizard instance
  const wizard2 = new DraftSavingFormWizard(storage, 'form-demo');
  const draft = wizard2.loadOrCreate();

  console.log(`Draft recovered! Current step: ${draft.currentStep}`);
  console.log(`Saved data: ${JSON.stringify(draft.data, null, 2)}`);

  // Continue where we left off
  wizard2.saveStep(4, { preferences: { newsletter: true } });
  wizard2.saveStep(5, { termsAccepted: true });
  await wizard2.submit();

  // --- Pattern 4: Saga Pattern for Orders ---
  console.log('\n\n--- PATTERN 4: Saga Pattern for Orders ---\n');

  const orderProcessor = new SagaOrderProcessor(storage);

  // First, show successful order
  console.log('Processing successful order:\n');
  await orderProcessor.processOrder({ id: 'ORDER-001', total: 99.99 });

  // Now show order with failure and compensation
  console.log('\n\nProcessing order that will fail at shipment:\n');

  const failingProcessor = new SagaOrderProcessor(storage);
  failingProcessor.createShipment = async () => {
    throw new Error('Shipping service unavailable!');
  };

  try {
    await failingProcessor.processOrder({ id: 'ORDER-002', total: 149.99 });
  } catch (error) {
    const sagaState = storage.checkpoints.get(
      Array.from(storage.checkpoints.keys()).find((k) => k.includes('ORDER-002'))
    );
    console.log(`\nFinal saga state: ${sagaState.status}`);
    console.log('System is back in valid state - no orphaned charges or reservations!');
  }

  // --- Pattern 5: Reconcile Later Strategy ---
  console.log('\n\n--- PATTERN 5: Mark-and-Reconcile Strategy ---\n');

  const syncProcessor = new ReconcileLaterProcessor(storage);

  // Create records where some will fail
  const syncRecords = [
    { id: 'sync-1', data: 'record 1' },
    { id: 'sync-2', data: 'record 2' },
    { id: 'sync-3', data: 'record 3', willFail: true }, // Will fail
    { id: 'sync-4', data: 'record 4' },
    { id: 'sync-5', data: 'record 5', willFail: true }, // Will fail
    { id: 'sync-6', data: 'record 6' },
    { id: 'sync-7', data: 'record 7' },
  ];

  console.log('Initial sync with some failing records:\n');
  const syncResult = await syncProcessor.syncRecords(syncRecords);

  console.log(`\nSync result: ${syncResult.status}`);
  console.log(`  Successful: ${syncResult.successCount}`);
  console.log(`  Failed: ${syncResult.failedCount}`);
  console.log(`  Needs reconciliation: ${syncResult.needsReconciliation}`);

  // Run reconciliation (simulate external service is now available)
  console.log('\n--- Running reconciliation job (service now available) ---\n');

  // Fix the failing records for reconciliation
  syncRecords.forEach((r) => { r.willFail = false; });

  const reconcileResult = await syncProcessor.runReconciliation(syncResult.syncId);
  console.log(`\nReconciliation result:`);
  console.log(`  Reconciled: ${reconcileResult.reconciled}`);
  console.log(`  Still failed: ${reconcileResult.stillFailed}`);

  // --- Summary ---
  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY OF CORRECT IMPLEMENTATION');
  console.log('='.repeat(60));
  console.log(`
These examples demonstrate the THREE recovery strategies of IVP:

RESUME STRATEGY (continue forward):
1. BATCH PROCESSING: Crashed at record 35, resumed at record 31
   - Progress saved every 10 records, only 4 needed re-processing

2. FILE UPLOAD: Network failed at chunk 7, resumed seamlessly
   - Chunked upload with position tracking

3. FORM WIZARD: "Page refresh" preserved all entered data
   - Each step saved to persistent storage

COMPENSATE STRATEGY (undo on failure):
4. SAGA PATTERN: Shipment failure triggered automatic compensation
   - Inventory reserved → Shipment failed → Inventory released, Payment refunded
   - System returns to valid state automatically
   - Use when strong consistency is required

RECONCILE STRATEGY (fix asynchronously):
5. MARK-AND-RECONCILE: Some syncs failed, queued for later resolution
   - Processing continued despite failures
   - Failed items tracked and reconciled asynchronously
   - Simpler than sagas, good when delay is acceptable

Choose strategy based on consistency requirements:
- RESUME: Simplest, for independent work items
- COMPENSATE: Complex, for transactions requiring atomicity
- RECONCILE: Pragmatic, when eventual consistency is acceptable
`);
}

// Run demonstration
demonstrateCorrectImplementation().catch(console.error);

module.exports = {
  PersistentDatabase,
  ProgressReporter,
  CheckpointBatchProcessor,
  ResumableFileUploader,
  IncrementalMigration,
  DraftSavingFormWizard,
  OffsetTrackedStreamProcessor,
  SagaOrderProcessor,
  ReconcileLaterProcessor,
};
