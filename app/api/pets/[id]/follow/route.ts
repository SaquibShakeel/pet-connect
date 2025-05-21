import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pets/[id]/follow - Check if user follows the pet
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const follow = await prisma.follow.findUnique({
      where: {
        userId_petId: {
          userId: session.user.id,
          petId: params.id,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}

// POST /api/pets/[id]/follow - Follow a pet
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to follow pets" },
        { status: 401 }
      );
    }

    // Check if pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: params.id },
    });

    if (!pet) {
      return NextResponse.json(
        { error: "Pet not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        userId_petId: {
          userId: session.user.id,
          petId: params.id,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "You are already following this pet" },
        { status: 400 }
      );
    }

    const follow = await prisma.follow.create({
      data: {
        userId: session.user.id,
        petId: params.id,
      },
    });

    return NextResponse.json({ follow });
  } catch (error) {
    console.error("Error following pet:", error);
    return NextResponse.json(
      { error: "Failed to follow pet" },
      { status: 500 }
    );
  }
}

// DELETE /api/pets/[id]/follow - Unfollow a pet
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to unfollow pets" },
        { status: 401 }
      );
    }

    await prisma.follow.delete({
      where: {
        userId_petId: {
          userId: session.user.id,
          petId: params.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing pet:", error);
    return NextResponse.json(
      { error: "Failed to unfollow pet" },
      { status: 500 }
    );
  }
} 