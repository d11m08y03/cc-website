import { db } from "@/db/client";
import { AppLogRepository } from "@/repositories/app-logs.repository";
import type { NewLog } from "@/repositories/app-logs.repository";
import { LogLevel, type LogData } from "@/lib/types/app-logs.types";

export class AppLogService {
  private readonly logRepository: AppLogRepository;

  constructor() {
    this.logRepository = new AppLogRepository(db);
  }

  /**
   * Logs an informational message.
   * @param message The main log message.
   * @param data The contextual data for the log entry.
   */
  public info(message: string, data: LogData): void {
    this.log(LogLevel.Info, message, data);
  }

  /**
   * Logs a warning message.
   * @param message The main log message.
   * @param data The contextual data for the log entry.
   */
  public warn(message: string, data: LogData): void {
    this.log(LogLevel.Warn, message, data);
  }

  /**
   * Logs an error message.
   * @param message The main log message.
   * @param data The contextual data for the log entry.
   */
  public error(message: string, data: LogData): void {
    this.log(LogLevel.Error, message, data);
  }

  /**
   * Logs a debug message.
   * @param message The main log message.
   * @param data The contextual data for the log entry.
   */
  public debug(message: string, data: LogData): void {
    if (process.env.NODE_ENV !== "production") {
      this.log(LogLevel.Debug, message, data);
    }
  }

  /**
   * Private helper method to construct and save the log entry.
   * It now uses the LogLevel enum for type safety.
   */
  private log(level: LogLevel, message: string, data: LogData): void {
    const logEntry: NewLog = {
      level,
      message,
      correlationId: data.correlationId,
      context: data.context,
      userId: data.userId,
      meta: data.meta ? JSON.stringify(data.meta) : undefined,
    };

    this.logRepository.create(logEntry).catch((dbError) => {
      console.error("CRITICAL: Failed to write log to database.", {
        dbError,
        originalLog: logEntry,
      });
    });
  }
}

// Singleton instance
export const logger = new AppLogService();
