import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public route - no authentication required
export async function GET(
  request: Request,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params;
    const pet = await prisma.pet.findUnique({
      where: { qrCode },
      select: {
        id: true,
        name: true,
        type: true,
        image: true,
        description: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
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