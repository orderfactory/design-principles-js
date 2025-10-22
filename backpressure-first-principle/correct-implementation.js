// Backpressure-First Principle (BFP) — Correct Implementation
// Goal: Prevent overload by applying flow control at every boundary. Prefer bounded queues,
// explicit load shedding, rate limiting, max concurrency, and timeouts/cancellation.

// Simple token-bucket rate limiter
class TokenBucket {
  constructor({ ratePerSec, burst }) {
    this.rate = ratePerSec;
    this.capacity = burst;
    this.tokens = burst;
    this.lastRefill = Date.now();
  }
  allow() {
    const now = Date.now();
    const delta = Math.max(0, now - this.lastRefill);
    const toAdd = (delta / 1000) * this.rate;
    if (toAdd >= 1) {
      this.tokens = Math.min(this.capacity, this.tokens + toAdd);
      this.lastRefill = now;
    }
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

// Bounded queue with non-blocking offer() semantics
class BoundedQueue {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = [];
  }
  offer(item) {
    if (this.items.length >= this.capacity) return false;
    this.items.push(item);
    return true;
  }
  poll() {
    return this.items.shift();
  }
  size() {
    return this.items.length;
  }
}

// Semaphore to limit concurrent tasks
class Semaphore {
  constructor(max) {
    this.max = max;
    this.current = 0;
    this.waiters = [];
  }
  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise(resolve => this.waiters.push(resolve));
  }
  release() {
    if (this.waiters.length > 0) {
      const next = this.waiters.shift();
      next();
    } else {
      this.current = Math.max(0, this.current - 1);
    }
  }
}

// Helper: wrap a promise with a timeout to prevent long tail buildup
function withTimeout(promiseFactory, ms, onTimeout) {
  let timer;
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      onTimeout?.();
      reject(new Error('TIMEOUT'));
    }, ms);
    Promise.resolve()
      .then(promiseFactory)
      .then(v => resolve(v), e => reject(e))
      .finally(() => clearTimeout(timer));
  });
}

// Simulated bounded worker with explicit backpressure and shedding
class Worker {
  constructor({ queue, maxConcurrency, taskTimeoutMs }) {
    this.queue = queue;
    this.sem = new Semaphore(maxConcurrency);
    this.taskTimeoutMs = taskTimeoutMs;
    this.running = false;
    this.completed = 0;
    this.failed = 0;
    this.timedOut = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;

    const pump = async () => {
      if (!this.running) return;
      const job = this.queue.poll();
      if (job) {
        await this.sem.acquire();
        withTimeout(() => job(), this.taskTimeoutMs, () => this.timedOut++)
          .then(() => this.completed++)
          .catch(() => this.failed++)
          .finally(() => {
            this.sem.release();
            setImmediate(pump);
          });
      } else {
        // No work — poll again soon
        setTimeout(pump, 1);
      }
    };

    // Start a few pump loops to utilize concurrency
    for (let i = 0; i < Math.max(1, this.sem.max); i++) setImmediate(pump);
  }

  stop() {
    this.running = false;
  }
}

// Simulated work with occasional slowness
function simulateWork(msMin = 5, msMax = 30, verySlowEvery = 40, verySlowMs = 500) {
  let counter = 0;
  return () => new Promise((resolve) => {
    counter++;
    const isVerySlow = counter % verySlowEvery === 0;
    const ms = isVerySlow ? verySlowMs : (msMin + Math.floor(Math.random() * (msMax - msMin + 1)));
    setTimeout(resolve, ms);
  });
}

// API boundary: apply rate limit and bounded queue. Return explicit signals on overload.
function acceptRequest({ queue, limiter }) {
  if (!limiter.allow()) {
    return { ok: false, error: { code: 429, message: 'Too Many Requests' } };
  }
  const accepted = queue.offer(simulateWork());
  if (!accepted) {
    // Shed load explicitly when buffers are full
    return { ok: false, error: { code: 503, message: 'Overloaded, try later' } };
  }
  return { ok: true };
}

function observe(queue, worker, limiter) {
  const interval = setInterval(() => {
    const mem = process.memoryUsage?.heapUsed || 0;
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        queueSize: queue.size(),
        inFlight: worker.sem.current,
        completed: worker.completed,
        failed: worker.failed,
        timedOut: worker.timedOut,
        heapMB: Math.round(mem / 1024 / 1024),
        tokens: Math.round(limiter.tokens ?? 0),
      })
    );
  }, 500);
  return () => clearInterval(interval);
}

function main() {
  const queue = new BoundedQueue(200); // bounded buffer
  const limiter = new TokenBucket({ ratePerSec: 300, burst: 150 }); // limit ingress
  const worker = new Worker({ queue, maxConcurrency: 16, taskTimeoutMs: 400 }); // cap concurrency + timeouts
  worker.start();

  // Generate traffic: the system will not accept more than it can handle
  let accepted = 0, shed = 0;
  const sendBurst = (n) => {
    for (let i = 0; i < n; i++) {
      const res = acceptRequest({ queue, limiter });
      if (res.ok) accepted++; else shed++;
    }
  };
  const traffic = setInterval(() => sendBurst(500), 50); // aggressive bursts

  const stopObserve = observe(queue, worker, limiter);

  setTimeout(() => {
    clearInterval(traffic);
    setTimeout(() => {
      stopObserve();
      worker.stop();
      console.log('Done (correct demo).', { accepted, shed, queueSize: queue.size(), completed: worker.completed });
    }, 1500);
  }, 4000);
}

if (require.main === module) {
  main();
}

module.exports = {
  TokenBucket,
  BoundedQueue,
  Semaphore,
  withTimeout,
  Worker,
  simulateWork,
  acceptRequest,
};
