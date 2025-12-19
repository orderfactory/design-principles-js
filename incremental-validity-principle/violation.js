/**
 * INCREMENTAL VALIDITY PRINCIPLE - VIOLATION
 *
 * This file demonstrates violations of the Incremental Validity Principle (IVP).
 *
 * The Incremental Validity Principle states that multi-step and long-running
 * operations should be designed so that interruption at any point leaves the
 * system in a valid, consistent state, with partial progress preserved and
 * resumable rather than lost.
 *
 * VIOLATIONS DEMONSTRATED:
 * 1. All-or-nothing processing - entire batch must complete or all work is lost
 * 2. In-memory-only state - no persistence of progress
 * 3. No checkpoint mechanism - cannot resume from interruption
 * 4. Monolithic transactions - single commit spanning potentially hours of work
 * 5. No progress visibility - cannot observe how far operation has progressed
 * 6. Lost work on failure - crash at 99% means restarting from 0%
 *
 * These patterns lead to:
 * - Wasted compute resources re-processing completed items
 * - User frustration from lost progress
 * - Operational burden requiring manual intervention
 * - Unknown system state after failures
 * - Inability to pause/resume operations intentionally
 */

// Simulated database that loses uncommitted data on "crash"
class InMemoryDatabase {
  constructor() {
    this.records = new Map();
    this.pendingWrites = [];
    this.committed = false;
  }

  beginTransaction() {
    this.pendingWrites = [];
    this.committed = false;
  }

  insert(record) {
    // All writes are pending until commit
    this.pendingWrites.push(record);
  }

  commit() {
    // Only now do writes become permanent
    for (const record of this.pendingWrites) {
      this.records.set(record.id, record);
    }
    this.pendingWrites = [];
    this.committed = true;
  }

  rollback() {
    // All pending work is lost
    this.pendingWrites = [];
    this.committed = false;
  }

  getRecordCount() {
    return this.records.size;
  }

  getPendingCount() {
    return this.pendingWrites.length;
  }
}

/**
 * VIOLATION 1: Monolithic Batch Processor
 *
 * This processor treats the entire batch as a single atomic unit.
 * If processing fails at any point, ALL work is lost.
 */
class MonolithicBatchProcessor {
  constructor(database) {
    this.database = database;
    this.processedCount = 0; // In-memory only - lost on crash
  }

  async processRecords(records) {
    console.log(`Starting to process ${records.length} records...`);

    // VIOLATION: Single transaction for entire batch
    this.database.beginTransaction();

    try {
      for (const record of records) {
        // Simulate processing time
        await this.processRecord(record);
        this.processedCount++;

        // VIOLATION: No checkpointing - progress exists only in memory
        // If we crash here, all processed records are lost
      }

      // VIOLATION: Single commit at the very end
      // Hours of work depend on this one operation succeeding
      this.database.commit();
      console.log(`Successfully processed all ${records.length} records`);

    } catch (error) {
      // VIOLATION: All work is lost on any failure
      this.database.rollback();
      console.error(`Processing failed: ${error.message}`);
      console.error(`Lost ${this.processedCount} processed records`);
      throw error;
    }
  }

  async processRecord(record) {
    // Simulate some processing work
    const processedRecord = {
      id: record.id,
      data: record.data.toUpperCase(),
      processedAt: new Date().toISOString(),
    };
    this.database.insert(processedRecord);
    return processedRecord;
  }
}

/**
 * VIOLATION 2: File Upload Without Resume
 *
 * This uploader has no chunking or resume capability.
 * A network interruption means starting completely over.
 */
class MonolithicFileUploader {
  constructor() {
    this.uploadedBytes = 0; // In-memory only
  }

  async upload(fileData, destinationUrl) {
    console.log(`Starting upload of ${fileData.length} bytes to ${destinationUrl}`);

    // VIOLATION: No chunking - entire file must be sent in one go
    // VIOLATION: No resume token - cannot continue from interruption

    try {
      for (let i = 0; i < fileData.length; i++) {
        // Simulate sending byte by byte
        await this.sendByte(fileData[i]);
        this.uploadedBytes++;

        // VIOLATION: No progress persistence
        // If connection drops here, we must restart from byte 0
      }

      console.log(`Upload complete: ${this.uploadedBytes} bytes`);
      return { success: true, bytesUploaded: this.uploadedBytes };

    } catch (error) {
      // VIOLATION: All progress is lost
      console.error(`Upload failed at byte ${this.uploadedBytes} of ${fileData.length}`);
      console.error(`Must restart from beginning`);
      this.uploadedBytes = 0; // Reset - no way to resume
      throw error;
    }
  }

  async sendByte(byte) {
    // Simulate network latency
    return new Promise((resolve) => setTimeout(resolve, 1));
  }
}

/**
 * VIOLATION 3: Database Migration Without Checkpoints
 *
 * This migration runs as a single transaction.
 * Failure means the entire migration must be re-run.
 */
class MonolithicMigration {
  constructor(database) {
    this.database = database;
    this.migratedTables = []; // In-memory only
  }

  async runMigration(tables) {
    console.log(`Starting migration of ${tables.length} tables...`);

    // VIOLATION: Single transaction for entire migration
    this.database.beginTransaction();

    try {
      for (const table of tables) {
        console.log(`Migrating table: ${table.name}`);

        // Simulate table migration (could take hours for large tables)
        await this.migrateTable(table);
        this.migratedTables.push(table.name);

        // VIOLATION: No checkpoint after each table
        // If we crash, we must re-migrate all tables from scratch
      }

      this.database.commit();
      console.log(`Migration complete: ${this.migratedTables.length} tables migrated`);

    } catch (error) {
      // VIOLATION: All migration work is lost
      this.database.rollback();
      console.error(`Migration failed on table ${this.migratedTables.length + 1}`);
      console.error(`Must restart migration from first table`);
      throw error;
    }
  }

  async migrateTable(table) {
    // Simulate migration work
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { tableName: table.name, migratedAt: new Date().toISOString() };
  }
}

/**
 * VIOLATION 4: Form Wizard Without Draft Saving
 *
 * Multi-step form that keeps all data in memory.
 * Session timeout or browser crash loses all user input.
 */
class StatelessFormWizard {
  constructor() {
    // VIOLATION: All form data exists only in memory
    this.formData = {};
    this.currentStep = 1;
    this.totalSteps = 5;
  }

  setStepData(step, data) {
    // VIOLATION: No persistence - data lives only in this object
    this.formData[`step${step}`] = data;
    this.currentStep = step + 1;
    console.log(`Step ${step} data saved (in memory only)`);

    // VIOLATION: No draft saving to server or local storage
    // If user refreshes page, all data is lost
  }

  getProgress() {
    // Can report progress, but it's not persisted anywhere
    return {
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      percentComplete: ((this.currentStep - 1) / this.totalSteps) * 100,
    };
  }

  async submit() {
    // VIOLATION: Only at final submission is anything persisted
    // 4 steps of user input could be lost to a single network error
    try {
      console.log('Submitting all form data...');
      await this.sendToServer(this.formData);
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Submission failed - all form data lost');
      // VIOLATION: No way to recover - user must re-enter everything
      throw error;
    }
  }

  async sendToServer(data) {
    // Simulate network request
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * VIOLATION 5: Data Pipeline Without Offset Tracking
 *
 * Stream processor that has no concept of position.
 * Cannot resume from where it left off.
 */
class StatelessStreamProcessor {
  constructor() {
    this.processedCount = 0; // In-memory only
    this.results = []; // Lost on crash
  }

  async processStream(dataStream) {
    console.log('Starting stream processing...');

    // VIOLATION: No offset tracking - cannot resume
    // VIOLATION: No checkpointing of processed items

    try {
      for await (const item of dataStream) {
        const result = await this.processItem(item);
        this.results.push(result);
        this.processedCount++;

        // VIOLATION: Results accumulate only in memory
        // Crash means re-processing entire stream
      }

      console.log(`Processed ${this.processedCount} items`);
      return this.results;

    } catch (error) {
      // VIOLATION: No way to know which items were successfully processed
      console.error(`Failed after processing ${this.processedCount} items`);
      console.error('Must restart from beginning of stream');
      throw error;
    }
  }

  async processItem(item) {
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { ...item, processed: true };
  }
}

/**
 * VIOLATION 6: Order Processing Without Saga/Compensation
 *
 * Distributed operation with no recovery mechanism.
 * Partial failure leaves system in inconsistent state.
 */
class MonolithicOrderProcessor {
  constructor() {
    this.completedSteps = []; // In-memory only
  }

  async processOrder(order) {
    console.log(`Processing order ${order.id}...`);

    // VIOLATION: No saga pattern - no compensation on failure
    // VIOLATION: No checkpoint between steps

    try {
      // Step 1: Reserve inventory
      await this.reserveInventory(order);
      this.completedSteps.push('inventory');
      // VIOLATION: If we crash here, inventory is reserved but order not placed

      // Step 2: Charge payment
      await this.chargePayment(order);
      this.completedSteps.push('payment');
      // VIOLATION: If we crash here, payment is charged but order not recorded

      // Step 3: Create shipment
      await this.createShipment(order);
      this.completedSteps.push('shipment');
      // VIOLATION: If we crash here, shipment created but order status unknown

      // Step 4: Send confirmation
      await this.sendConfirmation(order);
      this.completedSteps.push('confirmation');

      console.log(`Order ${order.id} completed`);

    } catch (error) {
      // VIOLATION: No compensation logic - system left in partial state
      console.error(`Order ${order.id} failed at step: ${this.completedSteps.length + 1}`);
      console.error(`Completed steps: ${this.completedSteps.join(', ')}`);
      console.error('System may be in inconsistent state!');
      // VIOLATION: Manual intervention required to fix partial state
      throw error;
    }
  }

  async reserveInventory(order) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async chargePayment(order) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async createShipment(order) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async sendConfirmation(order) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// ==================== DEMONSTRATION ====================

async function demonstrateViolations() {
  console.log('='.repeat(60));
  console.log('INCREMENTAL VALIDITY PRINCIPLE - VIOLATIONS');
  console.log('='.repeat(60));

  // --- Violation 1: Monolithic Batch Processing ---
  console.log('\n--- VIOLATION 1: Monolithic Batch Processing ---\n');

  const db = new InMemoryDatabase();
  const batchProcessor = new MonolithicBatchProcessor(db);

  // Simulate 100 records to process
  const records = Array.from({ length: 100 }, (_, i) => ({
    id: `record-${i + 1}`,
    data: `data for record ${i + 1}`,
  }));

  // Simulate a crash at record 95
  const recordsWithCrash = records.map((r, i) => {
    if (i === 94) {
      return { ...r, willCrash: true };
    }
    return r;
  });

  // Patch processRecord to simulate crash
  const originalProcess = batchProcessor.processRecord.bind(batchProcessor);
  batchProcessor.processRecord = async function (record) {
    if (record.willCrash) {
      throw new Error('Simulated system crash at record 95!');
    }
    return originalProcess(record);
  };

  try {
    await batchProcessor.processRecords(recordsWithCrash);
  } catch (error) {
    console.log(`\nResult: ${db.getRecordCount()} records in database`);
    console.log(`Lost work: 94 records that were processed but not committed`);
    console.log('To retry: Must re-process all 100 records from scratch\n');
  }

  // --- Violation 2: File Upload Without Resume ---
  console.log('\n--- VIOLATION 2: File Upload Without Resume ---\n');

  const uploader = new MonolithicFileUploader();
  const fileData = new Uint8Array(1000); // 1000 byte file

  // Simulate network failure at 95%
  let byteCount = 0;
  const originalSend = uploader.sendByte.bind(uploader);
  uploader.sendByte = async function (byte) {
    byteCount++;
    if (byteCount === 950) {
      throw new Error('Network connection lost at 95%!');
    }
    return originalSend(byte);
  };

  try {
    await uploader.upload(fileData, 'https://example.com/upload');
  } catch (error) {
    console.log(`\nResult: Upload failed at byte 950 of 1000`);
    console.log('Lost work: 949 bytes already transmitted');
    console.log('To retry: Must re-upload entire file from byte 0\n');
  }

  // --- Violation 3: Form Wizard Without Drafts ---
  console.log('\n--- VIOLATION 3: Form Wizard Without Drafts ---\n');

  const wizard = new StatelessFormWizard();

  // User fills out 4 of 5 steps
  wizard.setStepData(1, { name: 'John Doe', email: 'john@example.com' });
  wizard.setStepData(2, { address: '123 Main St', city: 'Anytown' });
  wizard.setStepData(3, { cardNumber: '****-****-****-1234' });
  wizard.setStepData(4, { preferences: { newsletter: true } });

  console.log(`Progress: ${JSON.stringify(wizard.getProgress())}`);
  console.log('\n[Simulating browser crash or session timeout...]');
  console.log('\nResult: All 4 steps of data lost');
  console.log('User must re-enter everything from step 1\n');

  // --- Violation 4: Order Processing Without Saga ---
  console.log('\n--- VIOLATION 4: Order Processing Without Saga ---\n');

  const orderProcessor = new MonolithicOrderProcessor();

  // Simulate failure during shipment creation
  orderProcessor.createShipment = async () => {
    throw new Error('Shipping service unavailable!');
  };

  try {
    await orderProcessor.processOrder({ id: 'ORDER-123', total: 99.99 });
  } catch (error) {
    console.log('\nResult: System in INCONSISTENT STATE');
    console.log('- Inventory: RESERVED (not released)');
    console.log('- Payment: CHARGED (not refunded)');
    console.log('- Shipment: NOT CREATED');
    console.log('- Order status: UNKNOWN');
    console.log('Manual intervention required to fix!\n');
  }

  // --- Summary ---
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY OF VIOLATIONS');
  console.log('='.repeat(60));
  console.log(`
These examples demonstrate the cost of ignoring incremental validity:

1. BATCH PROCESSING: 94 records processed, 0 saved
   - All work lost because commit happens only at the end

2. FILE UPLOAD: 949 bytes sent, must resend 1000
   - No chunking or resume capability

3. FORM WIZARD: 4 steps completed, 0 persisted
   - User data exists only in browser memory

4. ORDER PROCESSING: Partial execution, inconsistent state
   - No saga pattern, no compensation, no recovery

The common thread: treating operations as monolithic units that must
either succeed completely or fail completely, with no middle ground.

This leads to:
- Wasted resources re-doing completed work
- Poor user experience from lost progress
- Operational burden from inconsistent states
- Inability to pause/resume intentionally
- Unknown system state after failures
`);
}

// Run demonstration
demonstrateViolations().catch(console.error);

module.exports = {
  InMemoryDatabase,
  MonolithicBatchProcessor,
  MonolithicFileUploader,
  MonolithicMigration,
  StatelessFormWizard,
  StatelessStreamProcessor,
  MonolithicOrderProcessor,
};
