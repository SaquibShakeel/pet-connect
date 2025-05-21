import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public route - no authentication required
export async function POST(
  request: Request,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params;
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findUnique({
      where: { qrCode },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    await prisma.location.create({
      data: {
        latitude,
        longitude,
        petId: pet.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
} 