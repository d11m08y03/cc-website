import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { assignParticipantSchema } from "@/lib/validators/event.validators";
import { z } from "zod";
import { eventsToParticipants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { userId } = assignParticipantSchema.parse(body);

    await db.insert(eventsToParticipants).values({
      eventId: params.id,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0] }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { userId } = assignParticipantSchema.parse(body);

    await db
      .delete(eventsToParticipants)
      .where(
        eq(eventsToParticipants.eventId, params.id) &&
          eq(eventsToParticipants.userId, userId),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0] }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
