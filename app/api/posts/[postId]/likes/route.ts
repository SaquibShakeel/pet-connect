import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/posts/[postId]/likes - Get all likes for a post
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const likes = await prisma.like.findMany({
      where: { postId: params.postId },
      include: {
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
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST /likes:", session);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to like posts" },
        { status: 401 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "You have already liked this post" },
        { status: 400 }
      );
    }

    const like = await prisma.like.create({
      data: {
        postId: params.postId,
        userId: session.user.id,
      },
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
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in DELETE /likes:", session);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to unlike posts" },
        { status: 401 }
      );
    }

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 500 }
    );
  }
} 