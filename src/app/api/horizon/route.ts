import { NextResponse } from "next/server";
import { buildHorizonSession } from "@/lib/horizon-agent";
import { EnergyLevel, HorizonRequest } from "@/types/horizon";

const VALID_ENERGY_LEVELS: EnergyLevel[] = ["minimal", "low", "moderate"];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<HorizonRequest>;
    const yearning = body.yearning?.trim();
    const energyLevel = body.energyLevel;

    if (!yearning) {
      return NextResponse.json(
        { error: "Field 'yearning' is required." },
        { status: 400 }
      );
    }

    if (!energyLevel || !VALID_ENERGY_LEVELS.includes(energyLevel)) {
      return NextResponse.json(
        { error: "Field 'energyLevel' must be minimal, low, or moderate." },
        { status: 400 }
      );
    }

    const session = await buildHorizonSession({
      yearning,
      energyLevel,
      activeTagIds: body.activeTagIds,
      activeEntityIds: body.activeEntityIds,
      previousSignals: body.previousSignals,
    });
    return NextResponse.json(session);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}