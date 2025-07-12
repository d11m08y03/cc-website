import { db } from "@/db/client";
import { LogData } from "@/lib/types/app-logs.types";
import { logger } from "@/services/app-logs.service";

import { EventRepository, Event } from "@/repositories/events.repository";
import { EventParticipantRepository } from "@/repositories/event-participants.repository";
import { EventJudgeRepository } from "@/repositories/event-judges.repository";
import { EventOrganiserRepository } from "@/repositories/event-organisers.repository";
import { EventTeamRepository } from "@/repositories/event-teams.repository";
import { UserRepository } from "@/repositories/users.repository";
import { OrganiserRepository } from "@/repositories/organisers.repository";

import { UserNotFoundError } from "@/lib/errors/user.errors";
import {
  EventNotFoundError,
  ParticipantAlreadyExistsError,
  TeamNotFoundError,
  TeamAlreadyExistsError,
  ParticipantNotFoundError,
  OrganiserNotFoundError,
  OrganiserAlreadyAssignedError,
  OrganiserNotAssignedError,
  JudgeAlreadyAssignedError,
  JudgeNotAssignedError,
} from "@/lib/errors/event.errors";

/**
 * Service for handling all business logic related to events.
 * This includes creation, retrieval, and management of participants, organisers, and teams.
 */
export class EventService {
  private eventRepo: EventRepository;
  private eventParticipantRepo: EventParticipantRepository;
  private eventOrganiserRepo: EventOrganiserRepository;
  private eventTeamRepo: EventTeamRepository;
  private userRepo: UserRepository;
  private organiserRepo: OrganiserRepository;
  private eventJudgeRepo: EventJudgeRepository;

  constructor() {
    this.eventRepo = new EventRepository(db);
    this.eventParticipantRepo = new EventParticipantRepository(db);
    this.eventOrganiserRepo = new EventOrganiserRepository(db);
    this.eventTeamRepo = new EventTeamRepository(db);
    this.userRepo = new UserRepository(db);
    this.organiserRepo = new OrganiserRepository(db);
    this.eventJudgeRepo = new EventJudgeRepository(db);
  }

  /**
   * Creates a new event.
   * @param eventData The data for the new event.
   * @param logData Contextual data for logging.
   * @returns The newly created event object.
   */
  public async createEvent(
    eventData: Omit<Event, "id" | "createdAt">,
    logData: Omit<LogData, "meta">
  ) {
    logger.info("Creating new event.", {
      ...logData,
      context: "EventService:createEvent",
    });
    const newEvent = await this.eventRepo.create(eventData);
    logger.info("Successfully created event.", {
      ...logData,
      context: "EventService:createEvent",
      meta: { eventId: newEvent.id },
    });
    return newEvent;
  }

  /**
   * Updates an existing event.
   * @param eventId The ID of the event to update.
   * @param eventData The data to update.
   * @param logData Contextual data for logging.
   * @returns The updated event object.
   * @throws {EventNotFoundError} If the event is not found.
   */
  public async updateEvent(
    eventId: string,
    eventData: Partial<Omit<Event, "id">>,
    logData: Omit<LogData, "meta">
  ) {
    logger.info("Updating event.", {
      ...logData,
      context: "EventService:updateEvent",
      meta: { eventId },
    });
    const updatedEvent = await this.eventRepo.update(eventId, eventData);

    if (!updatedEvent) {
      logger.warn("Event not found for update.", {
        ...logData,
        context: "EventService:updateEvent",
        meta: { eventId },
      });
      throw new EventNotFoundError();
    }

    logger.info("Successfully updated event.", {
      ...logData,
      context: "EventService:updateEvent",
      meta: { eventId },
    });

    return updatedEvent;
  }

  /**
   * Deletes an event.
   * @param eventId The ID of the event to delete.
   * @param logData Contextual data for logging.
   * @throws {EventNotFoundError} If the event is not found.
   */
  public async deleteEvent(eventId: string, logData: Omit<LogData, "meta">) {
    logger.info("Deleting event.", {
      ...logData,
      context: "EventService:deleteEvent",
      meta: { eventId },
    });
    const deletedEvent = await this.eventRepo.delete(eventId);

    if (!deletedEvent) {
      logger.warn("Event not found for deletion.", {
        ...logData,
        context: "EventService:deleteEvent",
        meta: { eventId },
      });
      throw new EventNotFoundError();
    }

    logger.info("Successfully deleted event.", {
      ...logData,
      context: "EventService:deleteEvent",
      meta: { eventId },
    });
  }

  /**
   * Retrieves the full details of a single event, including all relations.
   * @throws {EventNotFoundError} If no event with the given ID is found.
   */
  public async getEventDetails(
    eventId: string,
    logData: Omit<LogData, "meta">,
  ) {
    logger.info("Fetching event details.", {
      ...logData,
      context: "EventService:getEventDetails",
      meta: { eventId },
    });
    const event = await this.eventRepo.findWithDetails(eventId);

    if (!event) {
      logger.warn("Event details not found.", {
        ...logData,
        context: "EventService:getEventDetails",
        meta: { eventId },
      });
      throw new EventNotFoundError();
    }
    return event;
  }

  /**
   * Registers a user as a participant for a specific event.
   * @throws {EventNotFoundError}
   * @throws {UserNotFoundError}
   * @throws {ParticipantAlreadyExistsError}
   */
  public async registerParticipantForEvent(
    eventId: string,
    userId: string,
    logData: Omit<LogData, "meta" | "userId">,
  ) {
    const context = "EventService:registerParticipantForEvent";
    const meta = { eventId, userId };
    logger.info("Attempting to register participant for event.", {
      ...logData,
      context,
      meta,
    });

    // 1. Verify that both the event and user exist.
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new EventNotFoundError();

    const user = await this.userRepo.findById(userId);
    if (!user) throw new UserNotFoundError();

    // 2. Check if the user is already a participant
    // Note: This requires a new method in the repository for efficiency. Let's assume it exists.
    // If not, we would fetch all participants and check, which is less ideal.
    const existingParticipant =
      await this.eventParticipantRepo.findParticipantsByEvent(eventId);
    if (existingParticipant.some((p) => p.userId === userId)) {
      throw new ParticipantAlreadyExistsError();
    }

    // 3. Create the participation record
    await this.eventParticipantRepo.addParticipantToEvent(eventId, userId);
    logger.info("Successfully registered participant for event.", {
      ...logData,
      context,
      userId,
    });
  }

  /**
   * Creates a new team for a specific event.
   * @throws {EventNotFoundError}
   * @throws {TeamAlreadyExistsError}
   */
  public async createTeamForEvent(
    eventId: string,
    teamName: string,
    logData: Omit<LogData, "meta">,
  ) {
    const context = "EventService:createTeamForEvent";
    const meta = { eventId, teamName };

    logger.info("Attempting to create team for event.", {
      ...logData,
      context,
      meta,
    });

    // Verify event exists
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new EventNotFoundError();

    // Check if a team with the same name already exists for this event
    const existingTeams = await this.eventTeamRepo.findByEventId(eventId);
    if (
      existingTeams.some((t) => t.name.toLowerCase() === teamName.toLowerCase())
    ) {
      throw new TeamAlreadyExistsError();
    }

    // Create the team
    const newTeam = await this.eventTeamRepo.create({
      name: teamName,
      eventId,
    });

    logger.info("Successfully created team.", {
      ...logData,
      context,
      meta: { ...meta, teamId: newTeam.id },
    });
    return newTeam;
  }

  /**
   * Assigns an existing event participant to a team.
   * @throws {EventNotFoundError}
   * @throws {TeamNotFoundError}
   * @throws {ParticipantNotFoundError}
   */
  public async assignParticipantToTeam(
    eventId: string,
    userId: string,
    teamId: string,
    logData: Omit<LogData, "meta" | "userId">,
  ) {
    const context = "EventService:assignParticipantToTeam";
    const meta = { eventId, userId, teamId };
    logger.info("Attempting to assign participant to team.", {
      ...logData,
      context,
      meta,
    });

    // Verify the team exists and belongs to the correct event
    const team = await this.eventTeamRepo.findById(teamId);
    if (!team || team.eventId !== eventId) {
      throw new TeamNotFoundError(
        "Team not found or does not belong to this event.",
      );
    }

    // Verify the user is a participant in the event
    const participants =
      await this.eventParticipantRepo.findParticipantsByEvent(eventId);
    if (!participants.some((p) => p.userId === userId)) {
      throw new ParticipantNotFoundError();
    }

    // Assign the participant
    await this.eventParticipantRepo.assignParticipantToTeam(
      eventId,
      userId,
      teamId,
    );

    logger.info("Successfully assigned participant to team.", {
      ...logData,
      context,
      userId,
    });
  }

  /**
   * Assigns an existing organiser to a specific event.
   * @param eventId The ID of the event.
   * @param organiserId The ID of the organiser to assign.
   * @param logData Contextual data for logging.
   * @throws {EventNotFoundError} If the event does not exist.
   * @throws {OrganiserNotFoundError} If the organiser does not exist.
   * @throws {OrganiserAlreadyAssignedError} If the organiser is already assigned to the event.
   */
  public async addOrganiserToEvent(
    eventId: string,
    organiserId: string,
    logData: Omit<LogData, "meta">,
  ): Promise<void> {
    const context = "EventService:addOrganiserToEvent";
    const meta = { eventId, organiserId };
    logger.info("Attempting to assign organiser to event.", {
      ...logData,
      context,
      meta,
    });

    // Concurrently verify that both the event and organiser exist.
    const [event, organiser] = await Promise.all([
      this.eventRepo.findById(eventId),
      this.organiserRepo.findById(organiserId),
    ]);

    if (!event) {
      logger.warn("Assign failed: event not found.", {
        ...logData,
        context,
        meta,
      });
      throw new EventNotFoundError();
    }
    if (!organiser) {
      logger.warn("Assign failed: organiser not found.", {
        ...logData,
        context,
        meta,
      });
      throw new OrganiserNotFoundError();
    }

    // Check if the organiser is already assigned to this event to prevent duplicates.
    const existingAssignments =
      await this.eventOrganiserRepo.findOrganisersByEvent(eventId);
    if (
      existingAssignments.some(
        (assignment) => assignment.organiserId === organiserId,
      )
    ) {
      logger.warn("Assign failed: organiser already assigned to this event.", {
        ...logData,
        context,
        meta,
      });
      throw new OrganiserAlreadyAssignedError();
    }

    // If all checks pass, create the link in the junction table.
    await this.eventOrganiserRepo.addOrganiserToEvent(eventId, organiserId);

    logger.info("Successfully assigned organiser to event.", {
      ...logData,
      context,
      meta,
    });
  }

  /**
   * Removes an organiser's assignment from a specific event.
   * @param eventId The ID of the event.
   * @param organiserId The ID of the organiser to un-assign.
   * @param logData Contextual data for logging.
   * @throws {OrganiserNotAssignedError} If the organiser was not assigned to the event.
   */
  public async removeOrganiserFromEvent(
    eventId: string,
    organiserId: string,
    logData: Omit<LogData, "meta">,
  ): Promise<void> {
    const context = "EventService:removeOrganiserFromEvent";
    const meta = { eventId, organiserId };
    logger.info("Attempting to remove organiser from event.", {
      ...logData,
      context,
      meta,
    });

    // 1. Attempt to delete the link directly from the junction table.
    const deletedLink = await this.eventOrganiserRepo.removeOrganiserFromEvent(
      eventId,
      organiserId,
    );

    // 2. Validate that a link was actually deleted.
    // If 'deletedLink' is undefined, it means no record matched the criteria.
    if (!deletedLink) {
      logger.warn("Remove failed: organiser was not assigned to this event.", {
        ...logData,
        context,
        meta,
      });
      // Throw a specific error so the client knows the state has not changed.
      throw new OrganiserNotAssignedError();
    }

    logger.info("Successfully removed organiser from event.", {
      ...logData,
      context,
      meta,
    });
  }

  /**
   * Assigns an existing user to be a judge for a specific event.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to assign as a judge.
   * @param logData Contextual data for logging.
   * @throws {EventNotFoundError}
   * @throws {UserNotFoundError}
   * @throws {JudgeAlreadyAssignedError}
   */
  public async addJudgeToEvent(
    eventId: string,
    userId: string,
    logData: Omit<LogData, "meta" | "userId">,
  ): Promise<void> {
    const context = "EventService:addJudgeToEvent";
    const meta = { eventId, userId };
    logger.info("Attempting to assign judge to event.", {
      ...logData,
      context,
      meta,
    });

    // Concurrently verify that both the event and user exist.
    const [event, user] = await Promise.all([
      this.eventRepo.findById(eventId),
      this.userRepo.findById(userId),
    ]);

    if (!event) throw new EventNotFoundError();
    if (!user) throw new UserNotFoundError();

    // Check if the user is already a judge for this event.
    const existingJudges = await this.eventJudgeRepo.findJudgesByEvent(eventId);
    if (existingJudges.some((judge) => judge.userId === userId)) {
      throw new JudgeAlreadyAssignedError();
    }

    // Create the link.
    await this.eventJudgeRepo.addJudgeToEvent(eventId, userId);
    logger.info("Successfully assigned judge to event.", {
      ...logData,
      context,
      userId,
    });
  }

  /**
   * Removes a user's judge assignment from a specific event.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to un-assign.
   * @param logData Contextual data for logging.
   * @throws {JudgeNotAssignedError} If the user was not a judge for the event.
   */
  public async removeJudgeFromEvent(
    eventId: string,
    userId: string,
    logData: Omit<LogData, "meta" | "userId">,
  ): Promise<void> {
    const context = "EventService:removeJudgeFromEvent";
    const meta = { eventId, userId };
    logger.info("Attempting to remove judge from event.", {
      ...logData,
      context,
      meta,
    });

    // Attempt to delete the link directly.
    const deletedLink = await this.eventJudgeRepo.removeJudgeFromEvent(
      eventId,
      userId,
    );

    // Validate that a link was actually deleted.
    if (!deletedLink) {
      logger.warn("Remove failed: user was not a judge for this event.", {
        ...logData,
        context,
        meta,
      });
      throw new JudgeNotAssignedError();
    }

    logger.info("Successfully removed judge from event.", {
      ...logData,
      context,
      userId,
    });
  }

  /**
   * Removes a participant from their team, making them a solo participant.
   * This action does not un-register them from the event itself.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to remove from a team.
   * @param logData Contextual data for logging.
   * @throws {ParticipantNotFoundError} If the participant is not found in the event or team.
   */
  public async removeParticipantFromTeam(
    eventId: string,
    userId: string,
    logData: Omit<LogData, "meta" | "userId">,
  ): Promise<void> {
    const context = "EventService:removeParticipantFromTeam";
    const meta = { eventId, userId };
    logger.info("Attempting to remove participant from team.", {
      ...logData,
      context,
      meta,
    });

    const deletedLink = await this.eventParticipantRepo.removeParticipantFromTeam(
      eventId,
      userId,
    );

    if (!deletedLink) {
      logger.warn("Remove failed: participant not found in team.", {
        ...logData,
        context,
        meta,
      });
      throw new ParticipantNotFoundError("Participant not found in team.");
    }

    logger.info("Successfully removed participant from team.", {
      ...logData,
      context,
      userId,
    });
  }

  /**
   * Retrieves a list of events, ordered by most recent first.
   * @param options An object for pagination { limit, offset }.
   * @param logData Contextual data for logging.
   * @returns An array of event objects.
   */
  public async getEventList(
    options: { limit?: number; offset?: number },
    logData: Omit<LogData, "meta">,
  ): Promise<Event[]> {
    logger.info("Fetching event list.", {
      ...logData,
      context: "EventService:getEventList",
    });

    const events = await this.eventRepo.findMany(options);
    return events;
  }
}

export const eventService = new EventService();
