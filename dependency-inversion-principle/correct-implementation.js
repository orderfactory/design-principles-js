/**
 * Dependency Inversion Principle - Correct Implementation
 *
 * The Dependency Inversion Principle states that:
 * 1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
 * 2. Abstractions should not depend on details. Details should depend on abstractions.
 *
 * In this example, we have a notification system that follows DIP.
 * The NotificationService (high-level module) depends on the MessageSender interface (abstraction),
 * not on concrete implementations like EmailSender or SMSSender.
 */

// This is our abstraction (interface)
class MessageSender {
  send(message, recipient) {
    // This is an abstract method that should be implemented by subclasses
    throw new Error('Method send() must be implemented');
  }
}

// Low-level module implementing the abstraction
class EmailSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending email to ${recipient}: ${message}`);
    // Implementation details for sending an email
  }
}

// Another low-level module implementing the abstraction
class SMSSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending SMS to ${recipient}: ${message}`);
    // Implementation details for sending an SMS
  }
}

// Another low-level module implementing the abstraction
class PushNotificationSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending push notification to ${recipient}: ${message}`);
    // Implementation details for sending a push notification
  }
}

// High-level module that depends on the abstraction
class NotificationService {
  constructor(messageSender) {
    // Dependency is injected through constructor
    this.messageSender = messageSender;
  }

  notify(message, recipient) {
    // The high-level module uses the abstraction without knowing the concrete implementation
    this.messageSender.send(message, recipient);
  }
}

// Usage
const emailSender = new EmailSender();
const smsSender = new SMSSender();
const pushSender = new PushNotificationSender();

// Create notification services with different message senders
const emailNotificationService = new NotificationService(emailSender);
const smsNotificationService = new NotificationService(smsSender);
const pushNotificationService = new NotificationService(pushSender);

// Send notifications using different channels
emailNotificationService.notify("Your order has been processed", "user@example.com");
smsNotificationService.notify("Your package has been shipped", "+1234567890");
pushNotificationService.notify("New message received", "device_token_123");

// This demonstrates DIP because:
// 1. The high-level module (NotificationService) depends on an abstraction (MessageSender)
// 2. The low-level modules (EmailSender, SMSSender, PushNotificationSender) implement the abstraction
// 3. We can easily add new notification channels without modifying the NotificationService
// 4. The NotificationService is decoupled from the specific implementations

// Example of extending the system with a new notification channel:
class SlackSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending Slack message to ${recipient}: ${message}`);
    // Implementation details for sending a Slack message
  }
}

// Create a new notification service with the new sender
const slackNotificationService = new NotificationService(new SlackSender());

// Use the new notification channel
slackNotificationService.notify("Team meeting at 3 PM", "general-channel");