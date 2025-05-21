import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view your feed" },
        { status: 401 }
      );
    }

    // Get all pets that the user follows
    const followedPets = await prisma.follow.findMany({
      where: { userId: session.user.id },
      select: { petId: true },
    });

    const followedPetIds = followedPets.map((follow) => follow.petId);

    // Get posts from followed pets
    const posts = await prisma.post.findMany({
      where: {
        petId: { in: followedPetIds },
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
} 