// Dynamic Systems Development Method (DSDM) Principle - Violation
// This file demonstrates a violation of the DSDM principle by showing an implementation
// that ignores key DSDM practices, resulting in a project that fails to deliver business value effectively.

// Example: A project management system that violates DSDM principles

// Initial implementation: A project with no clear prioritization or timeboxing
let project = {
  name: 'Customer Portal',
  description: 'A web portal for customers to manage their accounts and orders',
  requirements: [
    { id: 'REQ-001', description: 'User login and authentication' },
    { id: 'REQ-002', description: 'View account details' },
    { id: 'REQ-003', description: 'Update personal information' },
    { id: 'REQ-004', description: 'View order history' },
    { id: 'REQ-005', description: 'Track order status' },
    { id: 'REQ-006', description: 'Cancel orders' },
    { id: 'REQ-007', description: 'Save favorite products' },
    { id: 'REQ-008', description: 'Integration with social media' }
  ],
  status: 'Not Started'
};

// No prioritization of requirements (violating the MoSCoW principle)
// No timeboxing (violating the timeboxed development principle)
// No stakeholder involvement (violating the collaboration principle)

// Start the project without proper planning
function startProject() {
  console.log(`Starting project: ${project.name}`);
  project.status = 'In Progress';

  // No feasibility or foundations phase
  // Jumping straight to development without proper planning

  // Start working on all requirements at once without prioritization
  console.log('Working on all requirements simultaneously...');
}

// Track progress without clear metrics
let progress = {
  'REQ-001': 0,
  'REQ-002': 0,
  'REQ-003': 0,
  'REQ-004': 0,
  'REQ-005': 0,
  'REQ-006': 0,
  'REQ-007': 0,
  'REQ-008': 0
};

// Update progress without clear completion criteria
function updateProgress(requirementId, percentComplete) {
  if (progress[requirementId] !== undefined) {
    progress[requirementId] = percentComplete;
    console.log(`Requirement ${requirementId} is ${percentComplete}% complete`);
  } else {
    console.log(`Requirement ${requirementId} not found`);
  }
}

// Add a new requirement mid-project without proper assessment
function addRequirement(description) {
  const id = `REQ-${project.requirements.length + 1}`.padStart(7, '0');
  project.requirements.push({ id, description });
  progress[id] = 0;
  console.log(`Added new requirement: ${id} - ${description}`);

  // No reprioritization or impact assessment
  // No stakeholder consultation
}

// Change a requirement mid-project without proper change control
function changeRequirement(requirementId, newDescription) {
  const requirement = project.requirements.find(req => req.id === requirementId);
  if (requirement) {
    console.log(`Changing requirement ${requirementId} from "${requirement.description}" to "${newDescription}"`);
    requirement.description = newDescription;

    // No assessment of impact on other requirements
    // No adjustment to timeline or resources
    // No stakeholder approval
  } else {
    console.log(`Requirement ${requirementId} not found`);
  }
}

// Deploy without ensuring all critical functionality is complete
function deployProject() {
  // No verification that critical requirements are complete
  // No quality assurance process

  let totalProgress = 0;
  let requirementCount = 0;

  for (const reqId in progress) {
    totalProgress += progress[reqId];
    requirementCount++;
  }

  const averageProgress = totalProgress / requirementCount;

  console.log(`Deploying project with average completion of ${averageProgress.toFixed(1)}%`);
  project.status = 'Deployed';

  // No post-project review
  // No lessons learned
}

// Usage example demonstrating the violation of DSDM principles
function demonstrateViolation() {
  // Start the project without proper planning or prioritization
  startProject();

  // Work on random requirements without prioritization
  updateProgress('REQ-003', 30); // Working on non-critical requirement first
  updateProgress('REQ-007', 50); // Working on a feature that might not be needed
  updateProgress('REQ-008', 70); // Focusing on social media integration before core functionality

  // Stakeholder suddenly requests a change
  console.log('\n--- Week 3: Stakeholder Intervention ---');
  console.log('Stakeholder: "Why isn\'t the login working yet? That\'s the most important feature!"');

  // Start working on login belatedly
  updateProgress('REQ-001', 20);

  // Add new requirements mid-project without proper assessment
  console.log('\n--- Week 4: Scope Creep ---');
  addRequirement('Multi-factor authentication');
  addRequirement('Password reset functionality');
  addRequirement('User profile pictures');

  // Change existing requirements without proper change control
  changeRequirement('REQ-004', 'View and filter detailed order history with sorting options');

  // More progress updates showing scattered focus
  updateProgress('REQ-001', 40); // Login still not complete
  updateProgress('REQ-009', 30); // Working on new requirements before completing core ones
  updateProgress('REQ-002', 20); // Core functionality still in early stages

  // Deadline approaching
  console.log('\n--- Week 8: Deadline Approaching ---');
  console.log('Manager: "We need to deploy next week no matter what!"');

  // Rush to complete some functionality
  updateProgress('REQ-001', 90); // Almost complete login
  updateProgress('REQ-002', 60); // Partial account viewing
  updateProgress('REQ-004', 40); // Order history partially implemented

  // Deploy with incomplete and untested functionality
  console.log('\n--- Week 9: Premature Deployment ---');
  deployProject();

  // Post-deployment issues
  console.log('\n--- Week 10: Post-Deployment Issues ---');
  console.log('Customer Support: "Users can\'t log in properly and are getting errors when viewing orders"');
  console.log('Developer: "We need to push a hotfix for the login issues"');
  console.log('Manager: "Why didn\'t we catch these issues before deployment?"');

  // Project outcome
  console.log('\n--- Project Outcome ---');
  console.log('- Core functionality incomplete or buggy');
  console.log('- Resources wasted on non-essential features');
  console.log('- Stakeholders dissatisfied with results');
  console.log('- Additional time and cost needed for fixes');
}

// Run the demonstration
demonstrateViolation();

/*
Key problems with this implementation that violate DSDM principles:

1. No MoSCoW Prioritization: Requirements aren't categorized by importance (Must have, Should have,
   Could have, Won't have), leading to work on non-essential features before core functionality.

2. No Timeboxing: The project has no defined timeboxes with clear goals and deadlines, resulting in
   scattered focus and poor time management.

3. Lack of Stakeholder Involvement: Stakeholders aren't involved from the beginning, leading to
   misaligned expectations and late-stage changes.

4. No Iterative Development: Instead of delivering working functionality in iterations, the project
   attempts to develop everything at once.

5. No Foundations Phase: The project jumps straight to development without proper planning,
   architecture, or requirement analysis.

6. Poor Change Control: New requirements are added and existing ones changed without proper impact
   assessment or prioritization.

7. No Quality Control: The project is deployed without ensuring that critical functionality is
   complete and working properly.

8. No Clear Phases: The project doesn't follow DSDM's structured phases (Pre-Project, Feasibility,
   Foundations, Evolutionary Development, Deployment, Post-Project).

This approach leads to a project that fails to deliver business value effectively, wastes resources
on non-essential features, and results in poor quality deliverables that don't meet user needs.
*/