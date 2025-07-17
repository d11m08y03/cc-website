import { AppError } from "./user.errors";

/**
 * Thrown when an operation is attempted on an event that does not exist.
 */
export class EventNotFoundError extends AppError {
  constructor(message = "Event not found.") {
    super(message);
  }
}

/**
 * Thrown when an operation is attempted on an organiser that does not exist.
 */
export class OrganiserNotFoundError extends AppError {
  constructor(message = "Organiser not found.") {
    super(message);
  }
}

/**
 * Thrown when a user is already registered for an event.
 */
export class ParticipantAlreadyExistsError extends AppError {
  constructor(message = "User is already registered for this event.") {
    super(message);
  }
}

/**
 * Thrown when trying to add a participant who is not a registered user.
 */
export class ParticipantNotFoundError extends AppError {
  constructor(
    message = "Participant record not found for this user in this event.",
  ) {
    super(message);
  }
}

/**
 * Thrown when an operation is attempted on a team that does not exist.
 */
export class TeamNotFoundError extends AppError {
  constructor(message = "Team not found.") {
    super(message);
  }
}

/**
 * Thrown when a team with the same name already exists for an event.
 */
export class TeamAlreadyExistsError extends AppError {
  constructor(
    message = "A team with this name already exists for this event.",
  ) {
    super(message);
  }
}

/**
 * Thrown when attempting to assign an organiser who is already assigned to an event.
 */
export class OrganiserAlreadyAssignedError extends AppError {
  constructor(message = "This organiser is already assigned to this event.") {
    super(message);
  }
}

/**
 * Thrown when attempting to remove an organiser who is not assigned to an event.
 */
export class OrganiserNotAssignedError extends AppError {
  constructor(message = "This organiser is not assigned to this event.") {
    super(message);
  }
}

/**
 * Thrown when attempting to assign a user as a judge who is already assigned.
 */
export class JudgeAlreadyAssignedError extends AppError {
  constructor(message = 'This user is already a judge for this event.') {
    super(message);
  }
}

/**
 * Thrown when attempting to remove a judge who is not assigned to the event.
 */
export class JudgeNotAssignedError extends AppError {
  constructor(message = 'This user is not a judge for this event.') {
    super(message);
  }
}

/**
 * Thrown when an operation is attempted on a sponsor that does not exist.
 */
export class SponsorNotFoundError extends AppError {
  constructor(message = "Sponsor not found.") {
    super(message);
  }
}

/**
 * Thrown when attempting to assign a sponsor who is already assigned to an event.
 */
export class SponsorAlreadyAssignedError extends AppError {
  constructor(message = "This sponsor is already assigned to this event.") {
    super(message);
  }
}

/**
 * Thrown when attempting to remove a sponsor who is not assigned to an event.
 */
export class SponsorNotAssignedError extends AppError {
  constructor(message = "This sponsor is not assigned to this event.") {
    super(message);
  }
}
