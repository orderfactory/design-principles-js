/**
 * You Ain't Gonna Need It (YAGNI) Principle - Violation
 *
 * The YAGNI principle suggests that you shouldn't add functionality until it's actually needed.
 * This file demonstrates a violation of this principle by implementing many speculative features
 * that aren't currently required.
 *
 * In this example, we create an over-engineered UserProfile class with many features
 * that aren't needed for the current requirements, adding unnecessary complexity.
 */

// UserProfile class - violates YAGNI by implementing many speculative features
class UserProfile {
  constructor(name, email) {
    this.name = name;
    this.email = email;

    // Speculative properties that aren't currently needed
    this.createdAt = new Date();
    this.lastLogin = null;
    this.loginCount = 0;
    this.profilePictureUrl = null;
    this.preferences = {
      theme: 'light',
      notifications: true,
      language: 'en'
    };
    this.address = null;
    this.phoneNumber = null;
    this.socialMediaLinks = [];
    this.verificationStatus = 'unverified';
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  // Speculative methods that aren't currently needed
  updateProfilePicture(url) {
    this.profilePictureUrl = url;
    return true;
  }

  setPreference(key, value) {
    if (this.preferences.hasOwnProperty(key)) {
      this.preferences[key] = value;
      return true;
    }
    return false;
  }

  addSocialMediaLink(platform, url) {
    this.socialMediaLinks.push({ platform, url });
  }

  updateAddress(street, city, state, zip, country) {
    this.address = { street, city, state, zip, country };
  }

  updatePhoneNumber(phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  verifyAccount() {
    this.verificationStatus = 'verified';
  }

  recordLogin() {
    this.lastLogin = new Date();
    this.loginCount++;
  }

  getAccountAge() {
    return (new Date() - this.createdAt) / (1000 * 60 * 60 * 24); // in days
  }
}

// Over-engineered authentication service with speculative features
class AuthenticationService {
  constructor() {
    this.users = [];
    this.sessions = {};
    this.verificationCodes = {};
    this.passwordResetTokens = {};
    this.failedLoginAttempts = {};
    this.blockedAccounts = [];
  }

  registerUser(name, email, password) {
    // Overly complex validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      throw new Error('Password must contain uppercase, number, and special character');
    }

    const user = new UserProfile(name, email);
    const userId = Date.now().toString();

    this.users.push({
      id: userId,
      profile: user,
      password: this.hashPassword(password),
      roles: ['user'],
      twoFactorEnabled: false
    });

    // Generate verification code
    this.sendVerificationEmail(email);

    return user;
  }

  login(email, password) {
    // Check for too many failed attempts
    if (this.failedLoginAttempts[email] && this.failedLoginAttempts[email] >= 5) {
      throw new Error('Account temporarily blocked due to too many failed login attempts');
    }

    const userAccount = this.users.find(u => u.profile.getEmail() === email);

    if (!userAccount || !this.verifyPassword(password, userAccount.password)) {
      // Track failed login attempts
      if (!this.failedLoginAttempts[email]) {
        this.failedLoginAttempts[email] = 0;
      }
      this.failedLoginAttempts[email]++;

      return null;
    }

    // Reset failed login attempts
    this.failedLoginAttempts[email] = 0;

    // Record login
    userAccount.profile.recordLogin();

    // Create session
    const sessionId = this.generateSessionId();
    this.sessions[sessionId] = {
      userId: userAccount.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    return {
      profile: userAccount.profile,
      sessionId: sessionId
    };
  }

  // Speculative methods
  hashPassword(password) {
    // In a real app, this would use a proper hashing algorithm
    return `hashed_${password}`;
  }

  verifyPassword(inputPassword, hashedPassword) {
    // In a real app, this would use a proper verification method
    return `hashed_${inputPassword}` === hashedPassword;
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15);
  }

  sendVerificationEmail(email) {
    const code = Math.floor(100000 + Math.random() * 900000);
    this.verificationCodes[email] = code;
    console.log(`Sending verification code ${code} to ${email}`);
  }

  verifyEmail(email, code) {
    if (this.verificationCodes[email] === code) {
      const userAccount = this.users.find(u => u.profile.getEmail() === email);
      if (userAccount) {
        userAccount.profile.verifyAccount();
        delete this.verificationCodes[email];
        return true;
      }
    }
    return false;
  }

  requestPasswordReset(email) {
    const token = Math.random().toString(36).substring(2, 15);
    this.passwordResetTokens[email] = {
      token: token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    };
    console.log(`Sending password reset token ${token} to ${email}`);
  }

  resetPassword(email, token, newPassword) {
    const resetData = this.passwordResetTokens[email];
    if (!resetData || resetData.token !== token || resetData.expiresAt < new Date()) {
      return false;
    }

    const userAccount = this.users.find(u => u.profile.getEmail() === email);
    if (userAccount) {
      userAccount.password = this.hashPassword(newPassword);
      delete this.passwordResetTokens[email];
      return true;
    }
    return false;
  }

  enableTwoFactorAuth(userId) {
    const userAccount = this.users.find(u => u.id === userId);
    if (userAccount) {
      userAccount.twoFactorEnabled = true;
      return true;
    }
    return false;
  }

  logout(sessionId) {
    if (this.sessions[sessionId]) {
      delete this.sessions[sessionId];
      return true;
    }
    return false;
  }
}

// Usage example
const auth = new AuthenticationService();

// Register a new user
try {
  const user = auth.registerUser('John Doe', 'john@example.com', 'Password123!');
  console.log(`User registered: ${user.getName()}`);

  // Add unnecessary information right away
  user.updateAddress('123 Main St', 'Anytown', 'State', '12345', 'Country');
  user.updatePhoneNumber('555-123-4567');
  user.addSocialMediaLink('twitter', 'https://twitter.com/johndoe');
  user.setPreference('theme', 'dark');
} catch (error) {
  console.error(`Registration error: ${error.message}`);
}

// Login
try {
  const loginResult = auth.login('john@example.com', 'Password123!');
  if (loginResult) {
    console.log(`Login successful: ${loginResult.profile.getName()}`);
    console.log(`Session ID: ${loginResult.sessionId}`);

    // Verify email (not needed for basic login)
    auth.verifyEmail('john@example.com', auth.verificationCodes['john@example.com']);
  } else {
    console.log('Login failed');
  }
} catch (error) {
  console.error(`Login error: ${error.message}`);
}

/**
 * This violates YAGNI because:
 * 1. The UserProfile class contains many properties and methods that aren't needed for the current requirements
 * 2. The AuthenticationService implements complex features like:
 *    - Password reset functionality
 *    - Session management
 *    - Email verification
 *    - Two-factor authentication
 *    - Account blocking after failed attempts
 *    - User roles
 *
 * All of these features add complexity, increase development time, and make the code harder to maintain,
 * without providing immediate value. According to YAGNI, these features should only be added
 * when they become an actual requirement, not speculatively.
 */