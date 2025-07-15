/**
 * Dependency Inversion Principle - Violation Example
 *
 * This example demonstrates a violation of the Dependency Inversion Principle
 * where high-level modules directly depend on low-level modules instead of abstractions.
 *
 * The problem occurs because the NotificationService class directly instantiates and uses
 * concrete implementations (EmailSender, SMSSender), creating tight coupling between
 * the high-level and low-level modules.
 */

// Low-level module for sending emails
class EmailSender {
  sendEmail(message, emailAddress) {
    console.log(`Sending email to ${emailAddress}: ${message}`);
    // Implementation details for sending an email
  }
}

// Low-level module for sending SMS
class SMSSender {
  sendSMS(message, phoneNumber) {
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    // Implementation details for sending an SMS
  }
}

// High-level module that directly depends on low-level modules
class NotificationService {
  constructor() {
    // Direct instantiation of concrete classes - violates DIP
    this.emailSender = new EmailSender();
    this.smsSender = new SMSSender();
  }

  // Method with direct dependency on EmailSender implementation
  notifyByEmail(message, emailAddress) {
    // Directly calls the specific method of the concrete class
    this.emailSender.sendEmail(message, emailAddress);
  }

  // Method with direct dependency on SMSSender implementation
  notifyBySMS(message, phoneNumber) {
    // Directly calls the specific method of the concrete class
    this.smsSender.sendSMS(message, phoneNumber);
  }
}

// Usage
const notificationService = new NotificationService();

// Send notifications
notificationService.notifyByEmail("Your order has been processed", "user@example.com");
notificationService.notifyBySMS("Your package has been shipped", "+1234567890");

// This demonstrates a violation of DIP because:
// 1. The high-level module (NotificationService) directly depends on low-level modules
//    (EmailSender and SMSSender) rather than abstractions
// 2. The NotificationService is tightly coupled to the concrete implementations
// 3. Adding a new notification channel requires modifying the NotificationService class

// Example of how we would need to modify the NotificationService to add a new notification channel:

/*
// New low-level module for push notifications
class PushNotificationSender {
  sendPushNotification(message, deviceToken) {
    console.log(`Sending push notification to ${deviceToken}: ${message}`);
    // Implementation details for sending a push notification
  }
}

// Modified NotificationService with new dependency
class NotificationService {
  constructor() {
    this.emailSender = new EmailSender();
    this.smsSender = new SMSSender();
    // New concrete dependency added - violates DIP
    this.pushSender = new PushNotificationSender();
  }

  notifyByEmail(message, emailAddress) {
    this.emailSender.sendEmail(message, emailAddress);
  }

  notifyBySMS(message, phoneNumber) {
    this.smsSender.sendSMS(message, phoneNumber);
  }

  // New method added - requires modifying the class
  notifyByPush(message, deviceToken) {
    this.pushSender.sendPushNotification(message, deviceToken);
  }
}
*/

// Problems with this approach:
// 1. Each new notification channel requires modifying the NotificationService class
// 2. Different notification methods have different signatures, making it hard to use them uniformly
// 3. Testing becomes difficult because we can't easily mock the dependencies
// 4. The high-level module is aware of the implementation details of the low-level modules