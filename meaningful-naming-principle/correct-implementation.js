/**
 * Meaningful Naming Principle - Correct Implementation
 *
 * The Meaningful Naming principle states that developers should use clear, descriptive names
 * for variables, functions, classes, etc. Choosing good names significantly improves code
 * readability and maintainability. Well-chosen identifiers act as documentation and reduce
 * the mental overhead for anyone reading or modifying the code later.
 *
 * Benefits of Meaningful Naming:
 * 1. Improved code readability
 * 2. Self-documenting code
 * 3. Reduced need for comments
 * 4. Easier maintenance
 * 5. Faster onboarding for new developers
 *
 * In this example, we create a task management system with clear, descriptive names.
 */

// Task class with descriptive property and method names
class Task {
  constructor(id, title, description, dueDate, priority, isCompleted = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.isCompleted = isCompleted;
    this.creationDate = new Date();
    this.completionDate = null;
  }

  markAsCompleted() {
    this.isCompleted = true;
    this.completionDate = new Date();
  }

  updateTitle(newTitle) {
    this.title = newTitle;
  }

  updateDescription(newDescription) {
    this.description = newDescription;
  }

  updateDueDate(newDueDate) {
    this.dueDate = newDueDate;
  }

  updatePriority(newPriority) {
    this.priority = newPriority;
  }

  isOverdue() {
    if (this.isCompleted) return false;
    return new Date() > this.dueDate;
  }

  getDaysUntilDue() {
    const currentDate = new Date();
    const timeDifference = this.dueDate - currentDate;
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }
}

// TaskManager class with clear method names that describe their purpose
class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextTaskId = 1;
  }

  createTask(title, description, dueDate, priority) {
    const newTask = new Task(
      this.nextTaskId++,
      title,
      description,
      dueDate,
      priority
    );
    this.tasks.push(newTask);
    return newTask;
  }

  getTaskById(taskId) {
    return this.tasks.find(task => task.id === taskId);
  }

  getAllTasks() {
    return [...this.tasks];
  }

  getCompletedTasks() {
    return this.tasks.filter(task => task.isCompleted);
  }

  getPendingTasks() {
    return this.tasks.filter(task => !task.isCompleted);
  }

  getOverdueTasks() {
    const currentDate = new Date();
    return this.tasks.filter(task => !task.isCompleted && task.dueDate < currentDate);
  }

  getTasksByPriority(priority) {
    return this.tasks.filter(task => task.priority === priority);
  }

  completeTask(taskId) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.markAsCompleted();
      return true;
    }
    return false;
  }

  deleteTask(taskId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    return this.tasks.length !== initialLength;
  }

  getTasksSortedByDueDate() {
    return [...this.tasks].sort((a, b) => a.dueDate - b.dueDate);
  }

  getTaskStatistics() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.getCompletedTasks().length;
    const pendingTasks = this.getPendingTasks().length;
    const overdueTasks = this.getOverdueTasks().length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  }
}

// TaskPriority enum with descriptive values
const TaskPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Usage example with descriptive variable names
function demonstrateTaskManager() {
  // Create a task manager
  const taskManager = new TaskManager();

  // Add some tasks with descriptive parameters
  const shoppingTask = taskManager.createTask(
    'Buy groceries',
    'Get milk, eggs, bread, and vegetables',
    new Date(2023, 6, 15), // July 15, 2023
    TaskPriority.MEDIUM
  );

  const workTask = taskManager.createTask(
    'Complete project proposal',
    'Finish the budget section and executive summary',
    new Date(2023, 6, 10), // July 10, 2023
    TaskPriority.HIGH
  );

  const exerciseTask = taskManager.createTask(
    'Go for a run',
    '30 minutes of jogging in the park',
    new Date(2023, 6, 8), // July 8, 2023
    TaskPriority.LOW
  );

  // Complete a task
  taskManager.completeTask(exerciseTask.id);

  // Display all tasks
  console.log('All Tasks:');
  taskManager.getAllTasks().forEach(task => {
    console.log(`- ${task.title} (${task.priority} priority, due: ${task.dueDate.toDateString()}, ${task.isCompleted ? 'completed' : 'pending'})`);
  });

  // Display pending tasks
  console.log('\nPending Tasks:');
  taskManager.getPendingTasks().forEach(task => {
    console.log(`- ${task.title} (${task.priority} priority, due: ${task.dueDate.toDateString()})`);
  });

  // Display high priority tasks
  console.log('\nHigh Priority Tasks:');
  taskManager.getTasksByPriority(TaskPriority.HIGH).forEach(task => {
    console.log(`- ${task.title} (due: ${task.dueDate.toDateString()}, ${task.isCompleted ? 'completed' : 'pending'})`);
  });

  // Display task statistics
  const taskStatistics = taskManager.getTaskStatistics();
  console.log('\nTask Statistics:');
  console.log(`- Total Tasks: ${taskStatistics.totalTasks}`);
  console.log(`- Completed Tasks: ${taskStatistics.completedTasks}`);
  console.log(`- Pending Tasks: ${taskStatistics.pendingTasks}`);
  console.log(`- Overdue Tasks: ${taskStatistics.overdueTasks}`);
  console.log(`- Completion Rate: ${taskStatistics.completionRate.toFixed(2)}%`);
}

// Run the demonstration
demonstrateTaskManager();

/**
 * This demonstrates good Meaningful Naming because:
 *
 * 1. Descriptive Class Names:
 *    - 'Task' and 'TaskManager' clearly indicate what these classes represent
 *    - The names reflect the domain concepts they model
 *
 * 2. Intention-Revealing Method Names:
 *    - Methods like 'markAsCompleted', 'getOverdueTasks', and 'getTasksSortedByDueDate'
 *      clearly communicate what they do
 *    - The verb-noun pattern (e.g., 'createTask', 'deleteTask') makes actions clear
 *
 * 3. Descriptive Variable Names:
 *    - Variables like 'shoppingTask', 'workTask', and 'taskStatistics' indicate their purpose
 *    - Parameters have clear names that explain what they represent
 *
 * 4. Consistent Naming Conventions:
 *    - Boolean variables and methods use 'is' prefix (e.g., 'isCompleted', 'isOverdue')
 *    - Getter methods use 'get' prefix (e.g., 'getTaskById', 'getAllTasks')
 *    - Consistent casing (camelCase for variables and methods, PascalCase for classes)
 *
 * 5. Domain-Specific Terminology:
 *    - Names like 'Task', 'priority', and 'dueDate' use terminology from the task management domain
 *    - This makes the code more understandable to anyone familiar with the domain
 *
 * 6. Avoiding Abbreviations and Cryptic Names:
 *    - No cryptic abbreviations like 'tm' for TaskManager or 't' for Task
 *    - Full words are used instead of shortened versions
 *
 * 7. Self-Documenting Code:
 *    - The names are so clear that many comments become unnecessary
 *    - The code itself explains what it's doing through its naming
 *
 * With these naming practices, the code is more readable, maintainable, and self-documenting.
 * New developers can understand the code more quickly, and even after months away from the
 * code, developers can easily understand what it does without extensive comments.
 */