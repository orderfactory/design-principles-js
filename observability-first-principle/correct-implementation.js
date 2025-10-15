// Observability-First Principle (OFP) — Correct Implementation
// Goal: Make the system diagnosable by design with structured logs, correlation IDs, and basic metrics.

// Simple correlation ID generator (in real systems, prefer UUIDs)
function generateCorrelationId() {
  return 'req_' + Math.random().toString(36).slice(2, 10);
}

// Minimal structured logger with context and child loggers
class Logger {
  constructor(context = {}) {
    this.context = { ...context };
  }
  child(extra = {}) {
    return new Logger({ ...this.context, ...extra });
  }
  info(message, fields = {}) {
    this.#emit('INFO', message, fields);
  }
  warn(message, fields = {}) {
    this.#emit('WARN', message, fields);
  }
  error(message, fields = {}) {
    this.#emit('ERROR', message, fields);
  }
  #emit(level, message, fields) {
    const event = {
      ts: new Date().toISOString(),
      level,
      msg: message,
      ...this.context,
      ...fields,
    };
    // Emit one line of JSON per event for easy ingestion by log pipelines
    console.log(JSON.stringify(event));
  }
}

// Minimal metrics recorder (stubbed; in real life integrate Prometheus, StatsD, etc.)
class Metrics {
  constructor() {
    this.counters = new Map();
    this.histograms = new Map();
  }
  inc(name, labels = {}) {
    const key = name + JSON.stringify(labels);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }
  time(name, labels = {}) {
    const start = Date.now();
    return () => {
      const ms = Date.now() - start;
      const key = name + JSON.stringify(labels);
      const bucket = this.histograms.get(key) || [];
      bucket.push(ms);
      this.histograms.set(key, bucket);
      return ms;
    };
  }
  snapshot() {
    return {
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(this.histograms),
    };
  }
}

// Domain services prepared for observability
class PaymentService {
  constructor(logger, metrics) {
    this.log = logger.child({ svc: 'payment' });
    this.metrics = metrics;
  }
  async charge(userId, amountCents) {
    const stopTimer = this.metrics.time('payment_charge_ms');
    this.log.info('charge.start', { userId, amountCents });
    // Simulate latency and occasional failure
    await new Promise(r => setTimeout(r, 25));
    if (amountCents > 50000) {
      const err = new Error('Credit limit exceeded');
      err.code = 'CREDIT_LIMIT';
      this.metrics.inc('payment_charge_error_total', { code: err.code });
      this.log.error('charge.fail', { userId, amountCents, code: err.code });
      throw err;
    }
    const ms = stopTimer();
    this.metrics.inc('payment_charge_success_total');
    this.log.info('charge.ok', { userId, amountCents, ms });
    return { txId: 'tx_' + Math.random().toString(36).slice(2, 8) };
  }
}

class InventoryService {
  constructor(logger, metrics) {
    this.log = logger.child({ svc: 'inventory' });
    this.metrics = metrics;
  }
  async reserve(sku, qty) {
    const stopTimer = this.metrics.time('inventory_reserve_ms');
    this.log.info('reserve.start', { sku, qty });
    await new Promise(r => setTimeout(r, 10));
    const ms = stopTimer();
    this.metrics.inc('inventory_reserve_success_total');
    this.log.info('reserve.ok', { sku, qty, ms });
    return { reservationId: 'res_' + Math.random().toString(36).slice(2, 8) };
  }
}

// Application layer that propagates correlation ID and emits consistent logs/metrics
async function processOrder(ctx, { userId, sku, qty, amountCents }) {
  const log = ctx.logger.child({ op: 'processOrder' });
  const metrics = ctx.metrics;
  const stopTimer = metrics.time('process_order_ms');

  log.info('order.start', { userId, sku, qty, amountCents });
  try {
    const inv = await ctx.inventory.reserve(sku, qty);
    const payment = await ctx.payment.charge(userId, amountCents);
    const ms = stopTimer();

    metrics.inc('order_success_total');
    log.info('order.ok', { reservationId: inv.reservationId, txId: payment.txId, ms });
    return { ok: true, reservationId: inv.reservationId, txId: payment.txId, correlationId: ctx.correlationId };
  } catch (error) {
    const ms = stopTimer();
    // Normalize error and include safe context for debugging
    const code = error.code || 'UNKNOWN_ERROR';
    metrics.inc('order_error_total', { code });
    log.error('order.fail', { code, ms, err: { message: error.message, stack: error.stack?.split('\n')[0] } });

    // Return a user-safe error while preserving correlationId for support
    return { ok: false, error: { code, message: 'Unable to process order at this time.' }, correlationId: ctx.correlationId };
  }
}

// Demo runner to illustrate the principle
async function main() {
  const metrics = new Metrics();
  const correlationId1 = generateCorrelationId();
  const logger1 = new Logger({ correlationId: correlationId1, app: 'checkout' });

  const ctx1 = {
    correlationId: correlationId1,
    logger: logger1,
    metrics,
    payment: new PaymentService(logger1, metrics),
    inventory: new InventoryService(logger1, metrics),
  };

  const result1 = await processOrder(ctx1, { userId: 'u1', sku: 'SKU-1', qty: 1, amountCents: 2999 });
  console.log('RESULT', JSON.stringify(result1));

  // Simulate a failure path with a different correlation ID
  const correlationId2 = generateCorrelationId();
  const logger2 = new Logger({ correlationId: correlationId2, app: 'checkout' });
  const ctx2 = {
    correlationId: correlationId2,
    logger: logger2,
    metrics,
    payment: new PaymentService(logger2, metrics),
    inventory: new InventoryService(logger2, metrics),
  };

  const result2 = await processOrder(ctx2, { userId: 'u2', sku: 'SKU-2', qty: 2, amountCents: 99999 }); // will fail
  console.log('RESULT', JSON.stringify(result2));

  // Print a simple metrics snapshot (for illustration only)
  console.log('METRICS', JSON.stringify(metrics.snapshot()));
}

if (require.main === module) {
  main();
}

module.exports = {
  Logger,
  Metrics,
  PaymentService,
  InventoryService,
  processOrder,
};
