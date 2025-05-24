import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// GET /api/pets - List all pets for the current user
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { pets: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ pets: user.pets });
}

// POST /api/pets - Create a new pet
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, description } = await req.json();
  if (!name || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const pet = await prisma.pet.create({
    data: {
      name,
      type,
      description,
      qrCode: uuidv4(),
      userId: user.id,
      followers: {
        create: {
          userId: user.id
        }
      }
    },
  });

  return NextResponse.json({ pet });
} 