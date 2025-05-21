import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public route - no authentication required
export async function POST(
  request: Request,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params;
    const { notes } = await request.json();

    const pet = await prisma.pet.findUnique({
      where: { qrCode },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    await prisma.feed.create({
      data: {
        notes,
        petId: pet.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding feed record:", error);
    return NextResponse.json(
      { error: "Failed to add feed record" },
      { status: 500 }
    );
  }
} 