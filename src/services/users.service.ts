import { db } from "@/db/client";
import { UserRepository } from "@/repositories/users.repository";
import type { User, NewUser } from "@/repositories/users.repository";
import { logger } from "@/services/app-logs.service";
import { LogData } from "@/lib/types/app-logs.types";
import {
  UserAlreadyExistsError,
  AuthenticationError,
  UserNotFoundError,
} from "@/lib/errors/user.errors";

import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(db);
  }

  /**
   * Registers a new user.
   * @param userData The user's name, email, and plaintext password.
   * @param logData Contextual data for logging.
   * @returns The newly created, sanitized user object.
   * @throws {UserAlreadyExistsError} If the email is already taken.
   * @throws {Error} For unexpected database errors.
   */
  public async registerUser(
    userData: Pick<NewUser, "name" | "email"> & { password: string },
    logData: Omit<LogData, "meta" | "userId">,
  ): Promise<Omit<User, "hashedPassword">> {
    logger.info("User registration attempt started.", {
      ...logData,
      context: "UserService:registerUser",
    });

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      logger.warn("User registration failed: email already exists.", {
        ...logData,
        context: "UserService:registerUser",
        meta: { email: userData.email },
      });
      throw new UserAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    try {
      const newUser = await this.userRepository.create({
        name: userData.name,
        email: userData.email,
        hashedPassword: hashedPassword,
      });

      logger.info("User successfully registered.", {
        ...logData,
        context: "UserService:registerUser",
        userId: newUser.id,
      });
      return this._sanitizeUser(newUser);
    } catch (error) {
      logger.error("Failed to create user in database.", {
        ...logData,
        context: "UserService:registerUser:db",
        meta: { error },
      });
      throw error; // Re-throw the original database error
    }
  }

  /**
   * Authenticates a user based on email and password.
   * @param email The user's email address.
   * @param password The user's plaintext password.
   * @param logData Contextual data for logging.
   * @returns A sanitized user object if authentication is successful.
   * @throws {AuthenticationError} If credentials are invalid.
   */
  public async authenticateUser(
    email: string,
    password: string,
    logData: Omit<LogData, "meta" | "userId">,
  ): Promise<Omit<User, "hashedPassword">> {
    logger.info("User authentication attempt.", {
      ...logData,
      context: "UserService:authenticateUser",
    });

    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.hashedPassword) {
      logger.warn("Authentication failed: user not found or no password set.", {
        ...logData,
        context: "UserService:authenticateUser",
        meta: { email },
      });
      throw new AuthenticationError();
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (isMatch) {
      logger.info("User successfully authenticated.", {
        ...logData,
        context: "UserService:authenticateUser",
        userId: user.id,
      });
      return this._sanitizeUser(user);
    } else {
      logger.warn("Authentication failed: password mismatch.", {
        ...logData,
        context: "UserService:authenticateUser",
        userId: user.id,
      });
      throw new AuthenticationError();
    }
  }

  /**
   * Retrieves a user's public profile information by their ID.
   * @param id The ID of the user to find.
   * @param logData Contextual data for logging.
   * @returns A sanitized user object.
   * @throws {UserNotFoundError} If the user is not found.
   */
  public async getUserProfile(
    id: string,
    logData: Omit<LogData, "meta" | "userId">,
  ): Promise<Omit<User, "hashedPassword">> {
    logger.info("Attempting to fetch user profile.", {
      ...logData,
      context: "UserService:getUserProfile",
      meta: { targetUserId: id },
    });

    const user = await this.userRepository.findById(id);

    if (!user) {
      logger.warn("User profile not found.", {
        ...logData,
        context: "UserService:getUserProfile",
        meta: { targetUserId: id },
      });
      throw new UserNotFoundError();
    }

    return this._sanitizeUser(user);
  }

  private _sanitizeUser(user: User): Omit<User, "hashedPassword"> {
    const { hashedPassword, ...safeUser } = user;
    return safeUser;
  }
}

export const userService = new UserService();
