import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pets/[id]/posts - Get all posts for a pet
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const posts = await prisma.post.findMany({
      where: { petId: params.id },
      include: {
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/pets/[id]/posts - Create a new post
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is the pet owner
    const pet = await prisma.pet.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!pet) {
      return NextResponse.json(
        { error: "Pet not found" },
        { status: 404 }
      );
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the pet owner can create posts" },
        { status: 403 }
      );
    }

    const { image, caption } = await request.json();
    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        image,
        caption,
        petId: params.id,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
} 