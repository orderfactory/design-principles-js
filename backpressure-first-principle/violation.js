// Backpressure-First Principle (BFP) — Violation
// Problem: The system accepts work as fast as it arrives, buffers it in an unbounded queue,
// and spawns unbounded async operations with no timeouts. Under load this leads to memory growth,
// long tail latency, and eventual collapse.

class UnboundedQueue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    // Always accepts — no capacity checks
    this.items.push(item);
    return true;
  }
  dequeue() {
    return this.items.shift();
  }
  size() {
    return this.items.length;
  }
}

// Naive worker that pulls from the queue as quickly as the event loop allows.
class NaiveWorker {
  constructor(queue) {
    this.queue = queue;
    this.active = 0; // No cap — grows with load
  }

  start() {
    const pump = () => {
      const job = this.queue.dequeue();
      if (job) {
        this.active++;
        // No timeout, no cancellation — slow/blocked jobs pile up
        job()
          .catch(() => {})
          .finally(() => {
            this.active--;
            // Immediately try to pull more work
            setImmediate(pump);
          });
      }
      // Even if empty now, schedule the next tick aggressively
      setImmediate(pump);
    };
    pump();
  }
}

// Simulated work: random latency with occasional very slow tasks
function simulateWork(msMin = 5, msMax = 50, verySlowEvery = 50, verySlowMs = 5000) {
  let counter = 0;
  return () => new Promise((resolve) => {
    counter++;
    const isVerySlow = counter % verySlowEvery === 0;
    const ms = isVerySlow ? verySlowMs : (msMin + Math.floor(Math.random() * (msMax - msMin + 1)));
    setTimeout(resolve, ms);
  });
}

// Traffic generator that pushes requests as fast as possible
function generateTraffic(queue, total = 10000) {
  const makeJob = simulateWork();
  for (let i = 0; i < total; i++) {
    // Always accepted — no backpressure to the caller
    queue.enqueue(makeJob);
  }
}

// Simple observer to show pathological growth
function observe(queue, worker) {
  const interval = setInterval(() => {
    const mem = process.memoryUsage?.heapUsed || 0;
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        queueSize: queue.size(),
        active: worker.active,
        heapMB: Math.round(mem / 1024 / 1024),
      })
    );
  }, 500);
  return () => clearInterval(interval);
}

function main() {
  const queue = new UnboundedQueue();
  const worker = new NaiveWorker(queue);
  worker.start();

  // Blast the system with work — it will accept everything
  generateTraffic(queue, 20000);

  const stopObserve = observe(queue, worker);

  // Stop after some time for demo purposes
  setTimeout(() => {
    stopObserve();
    console.log('Done (violation demo). Queue size at end:', queue.size());
  }, 6000);
}

if (require.main === module) {
  main();
}

module.exports = {
  UnboundedQueue,
  NaiveWorker,
  simulateWork,
  generateTraffic,
};
