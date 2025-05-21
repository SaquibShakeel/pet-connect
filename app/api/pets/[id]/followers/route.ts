import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pets/[id]/followers - Get pet's followers
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const followers = await prisma.follow.findMany({
      where: { petId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      followers,
      count: followers.length 
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
} 