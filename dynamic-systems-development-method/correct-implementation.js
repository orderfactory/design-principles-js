// Dynamic Systems Development Method (DSDM) Principle - Correct Implementation
// The DSDM is an agile project delivery framework that focuses on delivering the right solution at the right time.
// It emphasizes active user involvement, empowered teams, frequent delivery, integrated testing, and stakeholder collaboration.

// Example: A project management system developed using DSDM principles

// Key DSDM principles demonstrated:
// 1. Focus on business needs
// 2. Deliver on time
// 3. Collaborate
// 4. Never compromise quality
// 5. Build incrementally from firm foundations
// 6. Develop iteratively
// 7. Communicate continuously and clearly
// 8. Demonstrate control

// First, we define our MoSCoW prioritization system
// MoSCoW stands for Must have, Should have, Could have, Won't have
class RequirementPriority {
  static MUST = 'Must have';
  static SHOULD = 'Should have';
  static COULD = 'Could have';
  static WONT = 'Won\'t have this time';
}

// Define a requirement class with priority
class Requirement {
  constructor(id, description, priority) {
    this.id = id;
    this.description = description;
    this.priority = priority;
    this.completed = false;
  }

  complete() {
    this.completed = true;
  }
}

// Define a Timeboxed iteration
class Timebox {
  constructor(name, duration, startDate) {
    this.name = name;
    this.duration = duration; // in days
    this.startDate = startDate;
    this.requirements = [];
    this.status = 'Not Started';
  }

  addRequirement(requirement) {
    this.requirements.push(requirement);
  }

  start() {
    this.status = 'In Progress';
    console.log(`Starting timebox: ${this.name}`);
  }

  complete() {
    // Check if all MUST have requirements are completed
    const mustHaves = this.requirements.filter(req =>
      req.priority === RequirementPriority.MUST);

    const allMustHavesCompleted = mustHaves.every(req => req.completed);

    if (!allMustHavesCompleted) {
      console.error('Cannot complete timebox: Not all MUST have requirements are completed');
      return false;
    }

    this.status = 'Completed';
    console.log(`Completed timebox: ${this.name}`);
    return true;
  }

  getCompletionStatus() {
    const total = this.requirements.length;
    const completed = this.requirements.filter(req => req.completed).length;
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

// Define a DSDM Project
class DSDMProject {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.timeboxes = [];
    this.requirements = [];
    this.stakeholders = [];
    this.currentPhase = 'Pre-Project';
  }

  addStakeholder(name, role) {
    this.stakeholders.push({ name, role });
  }

  addRequirement(requirement) {
    this.requirements.push(requirement);
  }

  createTimebox(name, duration, startDate) {
    const timebox = new Timebox(name, duration, startDate);
    this.timeboxes.push(timebox);
    return timebox;
  }

  moveToFeasibilityPhase() {
    this.currentPhase = 'Feasibility';
    console.log(`Project ${this.name} moved to Feasibility phase`);
  }

  moveToFoundationsPhase() {
    // Ensure we have stakeholders before moving to foundations
    if (this.stakeholders.length === 0) {
      console.error('Cannot move to Foundations: No stakeholders defined');
      return false;
    }

    this.currentPhase = 'Foundations';
    console.log(`Project ${this.name} moved to Foundations phase`);
    return true;
  }

  moveToEvolutionaryDevelopmentPhase() {
    // Ensure we have requirements before moving to evolutionary development
    if (this.requirements.length === 0) {
      console.error('Cannot move to Evolutionary Development: No requirements defined');
      return false;
    }

    // Ensure we have at least one timebox
    if (this.timeboxes.length === 0) {
      console.error('Cannot move to Evolutionary Development: No timeboxes defined');
      return false;
    }

    this.currentPhase = 'Evolutionary Development';
    console.log(`Project ${this.name} moved to Evolutionary Development phase`);
    return true;
  }

  moveToDeploymentPhase() {
    // Check if all timeboxes are completed
    const allTimeboxesCompleted = this.timeboxes.every(tb => tb.status === 'Completed');

    if (!allTimeboxesCompleted) {
      console.error('Cannot move to Deployment: Not all timeboxes are completed');
      return false;
    }

    this.currentPhase = 'Deployment';
    console.log(`Project ${this.name} moved to Deployment phase`);
    return true;
  }

  completeProject() {
    if (this.currentPhase !== 'Deployment') {
      console.error('Cannot complete project: Not in Deployment phase');
      return false;
    }

    this.currentPhase = 'Post-Project';
    console.log(`Project ${this.name} completed successfully`);
    return true;
  }

  getProjectStatus() {
    const totalRequirements = this.requirements.length;
    const completedRequirements = this.requirements.filter(req => req.completed).length;

    return {
      name: this.name,
      phase: this.currentPhase,
      timeboxes: this.timeboxes.length,
      completedTimeboxes: this.timeboxes.filter(tb => tb.status === 'Completed').length,
      requirementsProgress: {
        total: totalRequirements,
        completed: completedRequirements,
        percentage: totalRequirements > 0 ?
          Math.round((completedRequirements / totalRequirements) * 100) : 0
      }
    };
  }
}

// Usage example demonstrating DSDM principles
function demonstrateDSDM() {
  // Create a new DSDM project
  const project = new DSDMProject(
    'Customer Portal',
    'A web portal for customers to manage their accounts and orders'
  );

  // Add stakeholders (Principle: Collaborate)
  project.addStakeholder('John Smith', 'Business Ambassador');
  project.addStakeholder('Sarah Johnson', 'Technical Coordinator');
  project.addStakeholder('Mike Brown', 'Business Visionary');
  project.addStakeholder('Lisa Davis', 'Business Analyst');

  // Move to Feasibility phase
  project.moveToFeasibilityPhase();
  console.log('Conducting feasibility workshops with stakeholders...');

  // Move to Foundations phase
  project.moveToFoundationsPhase();

  // Define requirements with MoSCoW prioritization (Principle: Focus on business needs)
  const requirements = [
    new Requirement('REQ-001', 'User login and authentication', RequirementPriority.MUST),
    new Requirement('REQ-002', 'View account details', RequirementPriority.MUST),
    new Requirement('REQ-003', 'Update personal information', RequirementPriority.SHOULD),
    new Requirement('REQ-004', 'View order history', RequirementPriority.MUST),
    new Requirement('REQ-005', 'Track order status', RequirementPriority.SHOULD),
    new Requirement('REQ-006', 'Cancel orders', RequirementPriority.COULD),
    new Requirement('REQ-007', 'Save favorite products', RequirementPriority.COULD),
    new Requirement('REQ-008', 'Integration with social media', RequirementPriority.WONT)
  ];

  // Add requirements to the project
  requirements.forEach(req => project.addRequirement(req));

  // Create timeboxes (Principle: Develop iteratively, Build incrementally)
  const timebox1 = project.createTimebox('Authentication & Basic Account', 10, new Date('2023-01-15'));
  const timebox2 = project.createTimebox('Order Management', 15, new Date('2023-01-25'));
  const timebox3 = project.createTimebox('Additional Features', 10, new Date('2023-02-10'));

  // Assign requirements to timeboxes
  timebox1.addRequirement(requirements[0]); // Login
  timebox1.addRequirement(requirements[1]); // View account
  timebox1.addRequirement(requirements[2]); // Update info

  timebox2.addRequirement(requirements[3]); // View orders
  timebox2.addRequirement(requirements[4]); // Track orders

  timebox3.addRequirement(requirements[5]); // Cancel orders
  timebox3.addRequirement(requirements[6]); // Favorites

  // Move to Evolutionary Development phase
  project.moveToEvolutionaryDevelopmentPhase();

  // Start and complete timeboxes (Principle: Deliver on time)
  console.log('\n--- Starting Evolutionary Development ---');

  // Timebox 1
  timebox1.start();
  console.log('Developing and testing authentication features...');
  requirements[0].complete(); // Complete login requirement
  requirements[1].complete(); // Complete view account requirement
  // Note: We're not completing the SHOULD have requirement yet

  // Daily stand-up (Principle: Communicate continuously and clearly)
  console.log('Daily stand-up: Discussing progress and challenges...');

  // Complete the SHOULD have requirement
  requirements[2].complete();

  // Try to complete the timebox
  timebox1.complete();

  // Show progress (Principle: Demonstrate control)
  console.log(`Timebox 1 completion: ${timebox1.getCompletionStatus().percentage}%`);

  // Timebox 2
  timebox2.start();
  console.log('Developing and testing order management features...');
  requirements[3].complete(); // Complete view orders requirement
  requirements[4].complete(); // Complete track orders requirement
  timebox2.complete();

  // Timebox 3
  timebox3.start();
  console.log('Developing additional features...');
  requirements[5].complete(); // Complete cancel orders requirement
  // Note: We're not completing the "favorites" feature as it's a COULD have
  timebox3.complete();

  // Move to Deployment phase
  project.moveToDeploymentPhase();

  // Deploy the solution
  console.log('\n--- Deployment Activities ---');
  console.log('Training users...');
  console.log('Finalizing documentation...');
  console.log('Deploying to production...');

  // Complete the project
  project.completeProject();

  // Final project status
  console.log('\n--- Final Project Status ---');
  const status = project.getProjectStatus();
  console.log(`Project: ${status.name}`);
  console.log(`Phase: ${status.phase}`);
  console.log(`Requirements completed: ${status.requirementsProgress.completed}/${status.requirementsProgress.total} (${status.requirementsProgress.percentage}%)`);
  console.log(`Timeboxes completed: ${status.completedTimeboxes}/${status.timeboxes}`);
}

// Run the demonstration
demonstrateDSDM();

/*
Key aspects of this DSDM implementation:

1. MoSCoW Prioritization: Requirements are categorized as Must have, Should have, Could have, or Won't have,
   ensuring focus on delivering the most important features first.

2. Timeboxed Development: Work is organized into fixed-duration timeboxes with clear goals and priorities,
   ensuring timely delivery.

3. Iterative and Incremental: The system is built incrementally through multiple timeboxes, with each
   timebox delivering working functionality.

4. Stakeholder Involvement: Business stakeholders are identified and involved throughout the project lifecycle.

5. Phased Approach: The project follows DSDM's phases (Feasibility, Foundations, Evolutionary Development, Deployment).

6. Quality Control: Timeboxes can only be completed when all "Must have" requirements are fulfilled.

7. Continuous Communication: Regular stand-ups and progress tracking ensure clear communication.

This approach works well for projects where business value needs to be delivered quickly and
requirements may evolve, as it ensures that the most critical functionality is always prioritized
and delivered, even if time constraints require some less critical features to be deferred.
*/