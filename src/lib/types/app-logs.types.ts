/**
 * Defines the standard severity levels for application logs.
 * Using an enum provides strong type-safety.
 */
export enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug",
}

/**
 * Defines the structured data required when creating a new log entry.
 * This is the public-facing "Data Transfer Object" (DTO) for the logging service.
 */
export type LogData = {
  // The unique ID to trace a request through the system.
  correlationId: string;
  // The part of the app generating the log (e.g., 'UserService', 'API:/events').
  context?: string;
  // Any extra structured data to aid debugging.
  meta?: object;
  // The ID of the user who initiated the action, if applicable.
  userId?: string;
};
