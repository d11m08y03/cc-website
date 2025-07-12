import { db } from "@/db/client";
import { LogData } from "@/lib/types/app-logs.types";
import { logger } from "@/services/app-logs.service";

import { OrganiserRepository } from "@/repositories/organisers.repository";
import type {
  Organiser,
  NewOrganiser,
} from "@/repositories/organisers.repository";

import { OrganiserNotFoundError } from "@/lib/errors/organiser.errors";

export class OrganiserService {
  private readonly organiserRepo: OrganiserRepository;

  constructor() {
    this.organiserRepo = new OrganiserRepository(db);
  }

  /**
   * Creates a new organiser.
   * @param organiserData The data for the new organiser.
   * @param logData Contextual data for logging.
   * @returns The newly created organiser object.
   */
  public async createOrganiser(
    organiserData: NewOrganiser,
    logData: Omit<LogData, "meta">,
  ): Promise<Organiser> {
    const context = "OrganiserService:createOrganiser";
    logger.info("Attempting to create organiser.", { ...logData, context });

    try {
      const newOrganiser = await this.organiserRepo.create(organiserData);
      logger.info("Successfully created organiser.", {
        ...logData,
        context,
        meta: { organiserId: newOrganiser.id },
      });
      return newOrganiser;
    } catch (error) {
      const e = error as Error;
      logger.error("Failed to create organiser in database.", {
        ...logData,
        context,
        meta: { errorMessage: e.message },
      });
      throw new Error("Could not create organiser due to a server issue.");
    }
  }

  /**
   * Retrieves a single organiser by their ID.
   * @param organiserId The ID of the organiser to find.
   * @param logData Contextual data for logging.
   * @returns The organiser object.
   * @throws {OrganiserNotFoundError} If no organiser with the given ID is found.
   */
  public async getOrganiserById(
    organiserId: number,
    logData: Omit<LogData, "meta">,
  ): Promise<Organiser> {
    const context = "OrganiserService:getOrganiserById";
    logger.info("Fetching organiser by ID.", {
      ...logData,
      context,
      meta: { organiserId },
    });

    const organiser = await this.organiserRepo.findById(organiserId);
    if (!organiser) {
      logger.warn("Organiser not found.", {
        ...logData,
        context,
        meta: { organiserId },
      });
      throw new OrganiserNotFoundError();
    }
    return organiser;
  }

  /**
   * Retrieves a list of all organisers.
   * @param logData Contextual data for logging.
   * @returns An array of all organiser objects.
   */
  public async getAllOrganisers(
    logData: Omit<LogData, "meta">,
  ): Promise<Organiser[]> {
    logger.info("Fetching all organisers.", {
      ...logData,
      context: "OrganiserService:getAllOrganisers",
    });
    return this.organiserRepo.findAll();
  }

  /**
   * Updates an existing organiser's data.
   * @param organiserId The ID of the organiser to update.
   * @param organiserData The data to update.
   * @param logData Contextual data for logging.
   * @returns The updated organiser object.
   * @throws {OrganiserNotFoundError} If the organiser to update is not found.
   */
  public async updateOrganiser(
    organiserId: number,
    organiserData: Partial<NewOrganiser>,
    logData: Omit<LogData, "meta">,
  ): Promise<Organiser> {
    const context = "OrganiserService:updateOrganiser";
    logger.info("Attempting to update organiser.", {
      ...logData,
      context,
      meta: { organiserId },
    });

    const updatedOrganiser = await this.organiserRepo.update(
      organiserId,
      organiserData,
    );
    if (!updatedOrganiser) {
      logger.warn("Update failed: organiser not found.", {
        ...logData,
        context,
        meta: { organiserId },
      });
      throw new OrganiserNotFoundError();
    }

    logger.info("Successfully updated organiser.", {
      ...logData,
      context,
      meta: { organiserId },
    });
    return updatedOrganiser;
  }

  /**
   * Deletes an organiser from the system.
   * @param organiserId The ID of the organiser to delete.
   * @param logData Contextual data for logging.
   * @throws {OrganiserNotFoundError} If the organiser to delete is not found.
   */
  public async deleteOrganiser(
    organiserId: number,
    logData: Omit<LogData, "meta">,
  ): Promise<void> {
    const context = "OrganiserService:deleteOrganiser";
    logger.info("Attempting to delete organiser.", {
      ...logData,
      context,
      meta: { organiserId },
    });

    const result = await this.organiserRepo.delete(organiserId);
    if (!result) {
      logger.warn("Delete failed: organiser not found.", {
        ...logData,
        context,
        meta: { organiserId },
      });
      throw new OrganiserNotFoundError();
    }

    logger.info("Successfully deleted organiser.", {
      ...logData,
      context,
      meta: { organiserId },
    });
  }
}

// Singleton instance
export const organiserService = new OrganiserService();
