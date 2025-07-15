/**
 * Meaningful Naming Principle - Violation
 *
 * The Meaningful Naming principle states that developers should use clear, descriptive names
 * for variables, functions, classes, etc. Choosing good names significantly improves code
 * readability and maintainability.
 *
 * This file demonstrates a violation of the Meaningful Naming principle by using unclear,
 * cryptic, and inconsistent names that make the code difficult to understand and maintain.
 */

// Unclear class name and cryptic property names
class TM {
  constructor(id, t, desc, dd, p, c = false) {
    this.id = id;
    this.t = t;          // title
    this.desc = desc;    // description
    this.dd = dd;        // due date
    this.p = p;          // priority
    this.c = c;          // completed
    this.cd = new Date(); // creation date
    this.cmpd = null;    // completion date
  }

  // Unclear method names
  mC() {
    this.c = true;
    this.cmpd = new Date();
  }

  uT(nt) {
    this.t = nt;
  }

  uD(nd) {
    this.desc = nd;
  }

  uDD(ndd) {
    this.dd = ndd;
  }

  uP(np) {
    this.p = np;
  }

  // Inconsistent naming pattern
  check() {
    if (this.c) return false;
    return new Date() > this.dd;
  }

  // Cryptic abbreviation
  gtd() {
    const cd = new Date();
    const td = this.dd - cd;
    return Math.ceil(td / (1000 * 60 * 60 * 24));
  }
}

// Ambiguous class name
class Mgr {
  constructor() {
    this.data = [];  // Vague name
    this.n = 1;      // Cryptic name for nextId
  }

  // Inconsistent naming patterns
  add(t, d, dd, p) {
    const x = new TM(
      this.n++,
      t,
      d,
      dd,
      p
    );
    this.data.push(x);
    return x;
  }

  // Single-letter parameter names
  find(i) {
    return this.data.find(x => x.id === i);
  }

  // Inconsistent naming (get vs. fetch)
  getAll() {
    return [...this.data];
  }

  // Inconsistent naming (completed vs. done)
  fetchDone() {
    return this.data.filter(x => x.c);
  }

  // Inconsistent naming (pending vs. todo)
  fetchTodo() {
    return this.data.filter(x => !x.c);
  }

  // Misleading name (late doesn't clearly indicate overdue)
  fetchLate() {
    const now = new Date();
    return this.data.filter(x => !x.c && x.dd < now);
  }

  // Inconsistent naming (by vs. with)
  fetchWithP(p) {
    return this.data.filter(x => x.p === p);
  }

  // Ambiguous name (finish could mean complete or delete)
  finish(i) {
    const x = this.find(i);
    if (x) {
      x.mC();
      return true;
    }
    return false;
  }

  // Ambiguous name (remove could mean delete or archive)
  remove(i) {
    const l = this.data.length;
    this.data = this.data.filter(x => x.id !== i);
    return this.data.length !== l;
  }

  // Cryptic name
  srt() {
    return [...this.data].sort((a, b) => a.dd - b.dd);
  }

  // Inconsistent naming (stats vs. metrics)
  metrics() {
    const a = this.data.length;
    const b = this.fetchDone().length;
    const c = this.fetchTodo().length;
    const d = this.fetchLate().length;

    return {
      a,  // total
      b,  // completed
      c,  // pending
      d,  // overdue
      e: a > 0 ? (b / a) * 100 : 0  // completion rate
    };
  }
}

// Cryptic enum names
const P = {
  H: 'h',  // high
  M: 'm',  // medium
  L: 'l'   // low
};

// Unclear function name and variable names
function demo() {
  // Cryptic variable name
  const m = new Mgr();

  // Unclear variable names
  const t1 = m.add(
    'Buy groceries',
    'Get milk, eggs, bread, and vegetables',
    new Date(2023, 6, 15),
    P.M
  );

  const t2 = m.add(
    'Complete project proposal',
    'Finish the budget section and executive summary',
    new Date(2023, 6, 10),
    P.H
  );

  const t3 = m.add(
    'Go for a run',
    '30 minutes of jogging in the park',
    new Date(2023, 6, 8),
    P.L
  );

  // Complete a task
  m.finish(t3.id);

  // Display all tasks with cryptic variable names
  console.log('All Tasks:');
  m.getAll().forEach(x => {
    console.log(`- ${x.t} (${x.p} priority, due: ${x.dd.toDateString()}, ${x.c ? 'completed' : 'pending'})`);
  });

  // Display pending tasks
  console.log('\nPending Tasks:');
  m.fetchTodo().forEach(x => {
    console.log(`- ${x.t} (${x.p} priority, due: ${x.dd.toDateString()})`);
  });

  // Display high priority tasks
  console.log('\nHigh Priority Tasks:');
  m.fetchWithP(P.H).forEach(x => {
    console.log(`- ${x.t} (due: ${x.dd.toDateString()}, ${x.c ? 'completed' : 'pending'})`);
  });

  // Display task statistics with cryptic property names
  const s = m.metrics();
  console.log('\nTask Statistics:');
  console.log(`- Total Tasks: ${s.a}`);
  console.log(`- Completed Tasks: ${s.b}`);
  console.log(`- Pending Tasks: ${s.c}`);
  console.log(`- Overdue Tasks: ${s.d}`);
  console.log(`- Completion Rate: ${s.e.toFixed(2)}%`);
}

// Run the demonstration
demo();

/**
 * This violates the Meaningful Naming principle because:
 *
 * 1. Cryptic Class Names:
 *    - 'TM' instead of 'Task' and 'Mgr' instead of 'TaskManager' obscure what these classes represent
 *    - The names don't reflect the domain concepts they model
 *
 * 2. Unclear Method Names:
 *    - Methods like 'mC', 'uT', and 'srt' don't communicate their purpose
 *    - Abbreviations like 'gtd' are cryptic and require mental translation
 *
 * 3. Single-Letter Variable Names:
 *    - Variables like 'a', 'b', 'c', 'd', 'e' in the metrics method give no indication of their purpose
 *    - Parameters like 'i', 'p', 'x' require readers to infer their meaning from context
 *
 * 4. Inconsistent Naming Conventions:
 *    - Mixing naming patterns: 'getAll' vs 'fetchDone' vs 'fetchTodo'
 *    - Inconsistent terminology: 'done' vs 'completed', 'todo' vs 'pending'
 *    - No consistent prefixes for boolean properties or methods
 *
 * 5. Ambiguous Names:
 *    - 'finish' could mean complete or delete
 *    - 'remove' could mean delete or archive
 *    - 'data' doesn't specify what kind of data is being stored
 *
 * 6. Excessive Abbreviations:
 *    - Properties like 't', 'desc', 'dd', 'p', 'c' require mental translation
 *    - Enum values 'H', 'M', 'L' don't clearly indicate their meaning
 *
 * 7. Non-Self-Documenting Code:
 *    - The names are so unclear that extensive comments are needed to understand the code
 *    - The code doesn't explain itself through its naming
 *
 * These poor naming practices make the code difficult to read, understand, and maintain.
 * New developers would need significant time to understand what the code does, and even
 * the original developers might struggle to understand their own code after some time away.
 */