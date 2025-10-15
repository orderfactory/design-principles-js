// Observability-First Principle (OFP) — Violation
// Anti-patterns: ad-hoc logs, missing correlation IDs, inconsistent errors, no metrics.

class PaymentService {
  async charge(userId, amountCents) {
    // No timing, no structured logs, no error codes
    console.log('charging user ' + userId + ' for ' + amountCents);
    await new Promise(r => setTimeout(r, 25));
    if (amountCents > 50000) {
      // Throw a generic error with no actionable information
      throw new Error('bad things happened');
    }
    console.log('charged');
    return { id: Math.random() }; // inconsistent field name/type
  }
}

class InventoryService {
  async reserve(sku, qty) {
    console.log('reserving'); // no context
    await new Promise(r => setTimeout(r, 10));
    return { id: Math.random() };
  }
}

async function processOrder({ userId, sku, qty, amountCents }) {
  // No correlation ID, logs are unstructured, messages are ambiguous
  console.log('starting');
  const inventory = new InventoryService();
  const payment = new PaymentService();
  try {
    const inv = await inventory.reserve(sku, qty);
    const pay = await payment.charge(userId, amountCents);
    console.log('done');
    // Inconsistent shape; no correlation ID returned for support
    return { success: true, inv, pay };
  } catch (e) {
    // Swallow error details; return vague message; no metrics/log enrichment
    console.log('error');
    return { success: false, error: 'something went wrong' };
  }
}

async function main() {
  const ok = await processOrder({ userId: 'u1', sku: 'SKU-1', qty: 1, amountCents: 2999 });
  console.log(ok);

  const bad = await processOrder({ userId: 'u2', sku: 'SKU-2', qty: 2, amountCents: 99999 });
  console.log(bad);
}

if (require.main === module) {
  main();
}

module.exports = {
  PaymentService,
  InventoryService,
  processOrder,
};
