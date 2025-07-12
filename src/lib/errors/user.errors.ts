/**
 * Base class for application-specific errors.
 * While not strictly necessary, it can be useful for catching all custom errors.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when an operation is attempted on a user that does not exist.
 */
export class UserNotFoundError extends AppError {
  constructor(message = "User not found.") {
    super(message);
  }
}

/**
 * Thrown when attempting to register a user with an email that is already in use.
 */
export class UserAlreadyExistsError extends AppError {
  constructor(message = "Email is already in use.") {
    super(message);
  }
}

/**
 * Thrown when user authentication fails due to invalid credentials.
 */
export class AuthenticationError extends AppError {
  constructor(message = "Invalid email or password.") {
    super(message);
  }
}
