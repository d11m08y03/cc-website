import { AppError } from "./user.errors";

/**
 * Thrown when an operation is attempted on an organiser that does not exist.
 */
export class OrganiserNotFoundError extends AppError {
  constructor(message = "Organiser not found.") {
    super(message);
  }
}
