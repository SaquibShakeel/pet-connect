import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public route - no authentication required
export async function GET(
  request: Request,
  { params }: { params: { qrCode: string } }
) {
  try {
    const pet = await prisma.pet.findUnique({
      where: { qrCode: params.qrCode },
      select: {
        id: true,
        name: true,
        type: true,
        image: true,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    return NextResponse.json({ pet });
  } catch (error) {
    console.error("Error fetching pet:", error);
    return NextResponse.json(
      { error: "Failed to fetch pet information" },
      { status: 500 }
    );
  }
} 