import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/pets/[id] - Get pet details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      locations: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
      feeds: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
    },
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return NextResponse.json({ pet });
}

// PATCH /api/pets/[id] - Update pet details
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, description, image } = await request.json();

  const pet = await prisma.pet.update({
    where: { id },
    data: { 
      name, 
      type, 
      description,
      image: image || null // Ensure image is properly handled
    },
    include: {
      locations: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
      feeds: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
    },
  });

  return NextResponse.json({ pet });
}

// DELETE /api/pets/[id] - Delete pet
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.pet.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
} 