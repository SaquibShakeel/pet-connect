import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/posts/[postId]/likes - Get all likes for a post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    
    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const likes = await prisma.like.findMany({
      where: { postId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ likes });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/likes - Like a post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    
    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to like posts" },
        { status: 401 }
      );
    }

    // Check if post exists and get current likes in a single query
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        likes: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    if (post.likes.length > 0) {
      return NextResponse.json(
        { error: "You have already liked this post" },
        { status: 400 }
      );
    }

    // Create like in a transaction to ensure data consistency
    const like = await prisma.$transaction(async (tx) => {
      return await tx.like.create({
        data: {
          postId,
          userId: session.user.id,
        },
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ like });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "Failed to like post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[postId]/likes - Unlike a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    
    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to unlike posts" },
        { status: 401 }
      );
    }

    // Delete like in a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      const like = await tx.like.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: session.user.id,
          },
        },
      });

      if (!like) {
        throw new Error("Like not found");
      }

      await tx.like.delete({
        where: {
          postId_userId: {
            postId,
            userId: session.user.id,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking post:", error);
    if (error instanceof Error && error.message === "Like not found") {
      return NextResponse.json(
        { error: "You haven't liked this post" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 500 }
    );
  }
} 